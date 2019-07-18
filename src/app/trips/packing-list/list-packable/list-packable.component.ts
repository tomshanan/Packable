import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { PackingListPackable, PackingListSettings, pass } from '@shared/models/packing-list.model';
import { WindowService } from '@shared/services/window.service';
import { AppColors } from '../../../shared/app-colors';
import { isDefined, allowedNameRegEx, usedNamesValidator, comparableName, MatchImmediately, titleCase, timeStamp } from '../../../shared/global-functions';
import { PackingListService } from '../packing-list.service';
import { StoreSelectorService } from '@app/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as packableActions from '@app/packables/store/packables.actions';
import * as fromApp from '@shared/app.reducers';

@Component({
  selector: 'list-packable',
  templateUrl: './list-packable.component.html',
  styleUrls: ['./list-packable.component.css']
})
export class ListPackableComponent implements OnInit, OnChanges {
  @Input('packable') inputPackable: PackingListPackable;
  packable: PackingListPackable;
  @Output('toggleCheck') ToggleCheckEmitter = new EventEmitter<PackingListPackable>();
  @Output('addInvalid') addInvalidEmitter = new EventEmitter<PackingListPackable>();
  @Output('updatePackable') updatePackableEmitter = new EventEmitter<PackingListPackable>();
  @Output('editRules') editRulesEmitter = new EventEmitter<void>();
  @Output('toggleEdit') toggleEditEmitter = new EventEmitter<boolean>();
  @Input() listSettings: PackingListSettings = new PackingListSettings();

  editToggle = false;
  editMode = false;
  spinnerQuantity: number;
  packableNameInput: FormControl;
  usedNames: string[] = []
  matcher = new MatchImmediately()
  formValid: boolean = true;
  formChanged: boolean = false;

  constructor(
    public windowService: WindowService, // used by template
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    public appColors: AppColors,
    private packingListService: PackingListService,
    private eRef: ElementRef,
    private fb: FormBuilder,
  ) {

  }

  ngOnInit() {
    this.packable = this.inputPackable
    this.spinnerQuantity = this.packable.quantity
    this.editMode = this.listSettings.editMode
    this.packableNameInput = this.fb.control(this.packable.name, [
      Validators.required,
      Validators.pattern(allowedNameRegEx),
    ])
    this.packingListService.importPackableList.pipe(first(list => isDefined(list))).subscribe(list => {
      this.usedNames = list.map(p => comparableName(p.name))
      this.packableNameInput.setValidators([
        usedNamesValidator(this.usedNames, this.inputPackable.name),
        Validators.required,
        Validators.pattern(allowedNameRegEx),
      ])
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.packable && changes['inputPackable']) {
      Object.assign(this.packable, this.inputPackable)
    }
    if (changes['listSettings'] && isDefined(this.editToggle)) {
      this.editMode = this.listSettings.editMode
    }
  }
  checkChange() {
    if (comparableName(this.packableNameInput.value) !== comparableName(this.packable.name) || this.spinnerQuantity !== this.packable.quantity) {
      this.formChanged = true
    } else {
      this.formChanged = false

    }
  }
  pass(): boolean {
    return pass(this.packable)
  }
  toggleCheck() {
    this.ToggleCheckEmitter.emit(this.packable)
  }
  removePackable() {
    this.packable.checked = false
    this.packable.forcePass = false
    this.packable.passChecks = false
    this.packable.forceRemove = true
    this.updatePackableEmitter.emit(this.packable)
  }
  addInvalid() {
    this.packable.forcePass = true;
    this.packable.forceRemove = false;
    if (this.packable.quantity > 0) {
      this.addInvalidEmitter.emit(this.packable)
    } else {
      this.toggleEditing(true)
    }
  }
  toggleEditing(state?: boolean) {
    if (this.editMode) {
      this.editToggle = isDefined(state) ? state : !this.editToggle;
      if (this.editToggle) {
        this.spinnerQuantity = this.packable.quantity
        this.packableNameInput.setValue(this.packable.name)
        this.formChanged = false;
      }
      this.toggleEditEmitter.emit(this.editToggle);
      console.log('✏️'+(this.editToggle?'started':'stopped')+" editting "+this.packable.name,this.packable)
    }
  }
  onConfirmChanges() {
    if (this.formChanged) {
      if (this.packableNameInput.dirty && this.packable.userCreated) {
        this.setName()
      }
      if (this.packable.quantity != this.spinnerQuantity) {
        this.setQuantity()
      }
      this.updatePackableEmitter.emit(this.packable)
    }
    this.toggleEditing(false)
  }
  setName() {
    let originalPackable = this.storeSelector.getPackableById(this.packable.id)
    originalPackable.name = titleCase(this.packableNameInput.value.trim())
    originalPackable.dateModified = timeStamp()
    this.store.dispatch(new packableActions.updateOriginalPackables([originalPackable]))
    this.packable.name = originalPackable.name
  }
  setQuantity() {
    this.packable.forceQuantity = true;
    this.packable.quantity = this.spinnerQuantity
  }
  editRules() {
    this.editRulesEmitter.emit()
  }


}
