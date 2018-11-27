import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output, ViewChild, OnChanges, SimpleChange, SimpleChanges, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { PackableOriginal, QuantityRule } from '@shared/models/packable.model';
import { WeatherRule } from '@models/weather.model';
import { PackableComplete } from '@shared/models/packable.model';
import { ProfileComplete } from '@shared/models/profile.model';
import { isDefined } from '../../shared/global-functions';
import { Profile } from '../../shared/models/profile.model';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { CollectionComplete } from '../../shared/models/collection.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { QuantityRuleListComponent } from './quantity-rule-list/quantity-rule-list.component';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-packable-edit-form',
  templateUrl: './packable-edit-form.component.html',
  styleUrls: ['./packable-edit-form.component.css'],
  encapsulation: ViewEncapsulation.None,
  
})
export class PackableEditFormComponent implements OnInit, OnChanges {
  constructor(
    private storeSelector: StoreSelectorService,
  ) {
  }

  @Input() packable: PackableComplete = new PackableComplete()
  @Input() profileGroup: Profile[] = [];
  @Input() selectedProfiles: Profile[] = [];
  @Input() collection: CollectionComplete;
  @Input() isNew: boolean = false;
  @Input() editName: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{
    packable: PackableComplete,
    selectedProfiles: Profile[]
  }>()

  @ViewChild('editNameInput') editNameInput:ElementRef;
  @ViewChild(QuantityRuleListComponent) QuantityRuleList:QuantityRuleListComponent;
  
  showProfileSelector: boolean = false;
  storePackables: PackableOriginal[];
  isDefined = isDefined;
  usedPackableNames: string[] =[];
  packableName: FormControl;



  ngOnInit() {
      this.resetForm()
  }

  resetForm() {
    this.packableName = new FormControl('',[
      Validators.required, 
      Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), 
      this.validate_usedName.bind(this)
    ])
    this.storePackables = this.storeSelector.originalPackables
    if (this.isNew) {
      this.packable = new PackableComplete();
      this.showProfileSelector = false;
      this.packableName.setValue('');
    } else {
      this.packableName.setValue(this.packable.name)
      this.showProfileSelector = (this.profileGroup && this.profileGroup.length > 0) ? true : false
    }
    if (this.editName){
      this.usedPackableNames = this.storeSelector.getUsedPackableNames()
    }

  }
  ngOnChanges(changes:SimpleChanges):void {
    if(changes['isNew']){
      this.resetForm();
    }
    if(changes['editName']){
      if (this.editName == true && this.editNameInput){
        this.editNameInput.nativeElement.focus();
      }
    }
  }

  onClose() {
    this.close.emit();
  }
  onConfirm() {
    if (this.editName) {
      this.packable.name = this.packableName.value
    }
    if(this.valid()){
      this.confirm.emit({
        packable: this.packable,
        selectedProfiles: this.selectedProfiles
      })
    }
  }

  onEditName(state: boolean = true) {
    this.packableName.setValue(this.packable.name)
    this.editName = state;
  }
  log(e) {
    console.log(e);
  }

  /*--------- FORM VALIDATION ---------*/
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedPackableNames.indexOf(input) > -1 && (this.isNew || input !== this.packable.name.toLowerCase())) {
      return { 'usedName': true };
    }
    return null;
  }


  valid():boolean{
    let valid = true;
    if(this.showProfileSelector && this.selectedProfiles.length == 0){
      valid = false;
    } else if( this.editName && !this.packableName.valid){
      valid = false
    } else if( this.packable.quantityRules.length == 0 || !this.QuantityRuleList.valid){
      valid = false;
    }
    return valid
  }

}
