import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { PackableOriginal, PackableComplete, PackableAny, QuantityRule, PackablePrivate, isPackablePrivate } from '../../shared/models/packable.model';
import * as packableActions from '../store/packables.actions';
import * as collectionActions from '../../collections/store/collections.actions'
import * as profileActions from '../../profiles/store/profile.actions'
import * as fromApp from '../../shared/app.reducers';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ProfileComplete, Profile } from '../../shared/models/profile.model';
import { CollectionComplete, CollectionAny, isCollectionPrivate, isCollectionOriginal } from '../../shared/models/collection.model';
import { MemoryService, memoryObject } from '../../shared/memory.service';
import { ListEditorService } from '../../shared/list-editor.service';
import { StoreSelectorService } from '../../shared/store-selector.service';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent, modalConfig } from '../../modal/modal.component';
import { WindowService } from '../../shared/window.service';
import { WeatherRule, weatherOptions } from '../../shared/models/weather.model';
import { Guid, slugName } from '../../shared/global-functions';
import { PackableFactory } from '../../shared/factories/packable.factory';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'app-packable-edit',
  templateUrl: './packable-edit.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packable-edit.component.css']
})
export class PackableEditComponent implements OnInit, OnDestroy {
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  params: Params;
  navParams: navParams;
  packableForm: FormGroup;
  editingId: string;
  originalPackable: PackableComplete;
  editMode = false;
  advancedForm = false;
  profileName: string; // for template;
  CollectionName: string;
  usedNames = [];
  memory: memoryObject;
  packablesState_obs: Observable<{ packables: PackableOriginal[] }>;
  RoutesAndPackablesSub: Subscription;
  customWeatherRules = new WeatherRule();
  customQuantityRules: QuantityRule[] = [];

  constructor(
    private store: Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService: MemoryService,
    private listService: ListEditorService,
    private storeService: StoreSelectorService,
    private packableFactory: PackableFactory,
    private modalService: NgbModal,
    private windowService: WindowService // used by template
  ) {

  }

  getSubscribeToOriginal(): boolean { return this.advancedForm ? this.packableForm.get('subscribeToOriginal').value : true }
  getWeatherRules(): WeatherRule { return (this.advancedForm && this.getSubscribeToOriginal()) ? this.originalPackable.weatherRules : this.customWeatherRules }

  ngOnInit() {
    this.packableForm = new FormGroup({
      'name': new FormControl({ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), this.validate_usedName.bind(this)]),
      'icon': new FormControl({ value: 'baseball-ball', disabled: false }, [Validators.required]), // has default
      'quantityRules': new FormArray([]),
      'subscribeToOriginal': new FormControl(true)
    });
    this.memory = this.memoryService.getAll;
    this.packablesState_obs = this.store.select('packables');
    const RouteParams = this.activatedRoute.params;
    const RoutesAndPackables = combineLatest(RouteParams, this.packablesState_obs);

    this.RoutesAndPackablesSub = RoutesAndPackables.subscribe(
      ([params, packablesState]) => {
        this.params = params;
        this.usedNames = [];
        for (let packable of packablesState.packables) {
          this.usedNames.push(packable.name.toLowerCase());
        }
        let memoryPackable = this.memory.originalPackable || this.memory.privatePackable;
        if (params['packable'] && params['packable'] != 'new') {
          if (memoryPackable) {
            this.proccessEditMode(memoryPackable)
          } else {
            this.router.navigate(['../'], { relativeTo: this.activatedRoute })
          }
        } else {
          this.editMode = false;
        }
        if (this.editMode && this.memory.privatePackable) {
          this.advancedForm = true;
        }
        this.navSetup();
        this.initForm();
      }
    )
  }

  proccessEditMode(memoryPackable: PackableAny) {
    this.editMode = true;
    let originalFromStore = this.storeService.getPackableById(memoryPackable.id)
    this.originalPackable = this.packableFactory.makeComplete(originalFromStore)
    this.editingId = this.originalPackable.id;
  }
  navSetup() {
    this.navParams = {
      header: this.editMode ? this.originalPackable.name : 'New Packable',
      left: {
        enabled: true,
        text: 'Cancel',
        iconClass: 'fas fa-times'
      },
      right: {
        enabled: false,
        text: this.editMode ? 'Save' : 'Create',
        iconClass: 'fas fa-check'
      },
      options: []
    }
    this.editMode
      && this.navParams.options.push({
        name: (this.advancedForm ? 'Remove' : 'Delete') + ' Packable',
        actionName: 'delete'
      })
      && this.advancedForm
      && this.navParams.options.push({ name: 'Restore Default Settings', actionName: 'restore' });
    if(this.memory.profile){
      this.profileName = this.memory.profile.name
      let collection = (this.memory.originalCollection || this.memory.privateCollection)
      this.CollectionName = collection ? this.storeService.getCollectionById(collection.id).name : null;
    }
  }
  onOption(action: string) {
    console.log(action);
    switch (action) {
      case 'delete':
        this.delete();
        break;
      case 'restore':
        //restore;
        console.log('restore');
        break;
      default:
        break;
    }
  }
  initForm() {
    if (this.editMode) {
      this.packableForm.patchValue({
        name: this.originalPackable.name,
        icon: this.originalPackable.icon,
        subscribeToOriginal: this.advancedForm ? this.memory.privatePackable.subscribeToOriginal : true,
      })
      this.customWeatherRules = this.advancedForm ? this.memory.privatePackable.weatherRules : this.originalPackable.weatherRules;
      this.customQuantityRules = this.advancedForm ? this.memory.privatePackable.quantityRules : this.originalPackable.quantityRules;
    }
    if (this.editMode && this.customQuantityRules.length > 0) {
      for (let rule of this.customQuantityRules) {
        this.addNewRule(rule.amount, rule.type, rule.repAmount);
      }
    } else {
      this.addNewRule();
    }
    this.packableForm.statusChanges.subscribe(status => {
      this.navParams.right.enabled = status == 'VALID' ? true : false;
      console.log('form is ' + status);
    })
    if (this.memory.unsaved_packable) {
      this.packableForm.updateValueAndValidity();
      this.packableForm.markAsDirty();
      console.log('memory is unsaved')
    }
  }

  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.indexOf(input) !== -1 && (this.editMode === false || input !== this.originalPackable.name.toLowerCase())) {
      return { 'usedName': true };
    }
    return null;
  }

  validate_quantity_repAmount2(control: FormControl): { [s: string]: boolean } {
    let parent = control.parent;
    if (parent) {
      let controlValue = control.value;
      let type = parent.get('type');
      if (type.value == 'period' && controlValue == null) {
        return { 'repAmountMissing': true };
      }
    }
    return null;
  }


  addNewRule(amount: number = 1, period: string = 'period', repAmount: number = 1) {
    (<FormArray>this.packableForm.get('quantityRules')).push(this.newQRuleFormGroup(amount, period, repAmount));
  }

  newQRuleFormGroup = (amount: number, period: string, repAmount: number = 1) => {
    return new FormGroup({
      'amount': new FormControl(amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
      'type': new FormControl(period, [Validators.required]),
      'repAmount': new FormControl(repAmount, [this.validate_quantity_repAmount2.bind(this), Validators.pattern(/^[1-9]+[0-9]*$/)])
    })
  }
  removeQuantityRule(i: number) {
    (<FormArray>this.packableForm.get('quantityRules')).removeAt(i);
  }
  toggleSubscribeToOriginal(changeEvent: MatSlideToggleChange) {
    this.packableForm.patchValue({
      'subscribeToOriginal': !changeEvent.checked
    })
  }

  createOriginalPackableFromForm(): PackableOriginal {
    let formData = this.packableForm.value;
    return new PackableOriginal(
      this.editMode ? this.originalPackable.id : Guid.newGuid(),
      formData.name,
      formData.icon,
      this.advancedForm ? this.originalPackable.quantityRules : formData.quantityRules,
      this.advancedForm ? this.originalPackable.weatherRules : this.customWeatherRules
    )
  }
  createPrivatePackableFromForm(original?: PackableOriginal): PackablePrivate {
    let formData = this.packableForm.value;
    let originalFromForm = original || this.createOriginalPackableFromForm();
    return new PackablePrivate(
      originalFromForm.id,
      formData.quantityRules,
      this.customWeatherRules,
      this.getSubscribeToOriginal()
    )
  }
  savePackableToParentMemory(original?: PackableOriginal) {
    let newPackableOriginal = original || this.createOriginalPackableFromForm()
    let newPackablePrivate = this.createPrivatePackableFromForm(newPackableOriginal)
    let profile = this.memory.profile;
    let collection = this.memory.originalCollection || this.memory.privateCollection;
    let packableIndex: number;
    if (profile) {
      if (!collection) {
        // Editing Profile
        packableIndex = profile.packables.findIndex(p => p.id == this.editingId);
        profile.packables.splice(packableIndex, 1, newPackablePrivate)
        this.memoryService.set('PROFILE', profile);
        this.memoryService.set('UNSAVED_PROFILE', true)
      } else if (isCollectionPrivate(collection)) {
        // Editing Private Collection
        packableIndex = collection.packables.findIndex(p => p.id == this.editingId);
        collection.packables.splice(packableIndex, 1, newPackablePrivate)
        this.memoryService.set('PRIVATE_COLLECTION', collection)
        this.memoryService.set('UNSAVED_COLLECTION',true)
      } else if (isCollectionOriginal(collection)) {
        // Editing Original Collection
        packableIndex = collection.packables.findIndex(p => p == this.editingId);
        collection.packables.splice(packableIndex, 1, newPackableOriginal.id)
        this.memoryService.set('ORIGINAL_COLLECTION', collection)
        this.memoryService.set('UNSAVED_COLLECTION',true)
      }
    } else {
      console.warn('cannot save packable to parent memory because profile is not set in memory.\n', this.memory)
    }
  }
  savePackableToMemory(original?: PackableOriginal) {
    let originalFromForm = original || this.createOriginalPackableFromForm();
    if (this.advancedForm) {
      let privateFromForm = this.createPrivatePackableFromForm(originalFromForm)
      this.memoryService.set('PRIVATE_PACKABLE', privateFromForm)
    } else {
      this.memoryService.set('ORIGINAL_PACKABLE', originalFromForm)
    }
    if (this.packableForm.dirty) {
      this.memoryService.set('UNSAVED_PACKABLE', true)
    }
  }
  onSubmit() {
    let newPackableOriginal = this.createOriginalPackableFromForm()
    if (this.editMode) {
      if (this.memory.profile || this.memory.originalCollection) {
        this.savePackableToParentMemory(newPackableOriginal)
      }
      if (!this.advancedForm) {
        this.store.dispatch(new packableActions.editOriginalPackable(newPackableOriginal));
      }
      this.return();
    } else {
      this.store.dispatch(new packableActions.addOriginalPackable(newPackableOriginal));
      this.savePackableToMemory(newPackableOriginal)
      if (this.params['profile'] || this.params['collection']) {
        let listParams = this.listService.params;
        listParams.originalList.push(newPackableOriginal)
        this.listService.setParams(listParams);
        this.listService.addNewItems([newPackableOriginal]);
      }
      this.memoryService.set('UNSAVED_PACKABLE', true)
      this.router.navigate(['../', slugName(newPackableOriginal.name)], { relativeTo: this.activatedRoute });
    }

  }
  delete() {
    if (this.advancedForm) {
      let profile = this.memory.profile;
      let collection = this.memory.privateCollection;
      if (profile) {
        if (collection) {
          let config: modalConfig = {
            right: { name: 'Remove', class: 'btn-outline-danger' },
            header: 'Remove ' + this.originalPackable.name + '?',
            content: 'If you remove this Packable you will lose the changes you made to its settings and conditions. You will be able to add it back with its default settings.'
          }
          this.openConfirmModal(null, config, () => {
            let packableIndex = collection.packables.findIndex(p => p.id == this.editingId);
            collection.packables.splice(packableIndex, 1);
            this.memoryService.set('PRIVATE_COLLECTION', collection);
            this.return();
          });
        } else {
          let config: modalConfig = {
            right: { name: 'Remove', class: 'btn-outline-danger' },
            header: 'Remove ' + this.originalPackable.name + '?',
            content: 'If you remove this Packable you will lose the changes you made to its settings and conditions. You will be able to add it back with its default settings.'
          }
          this.openConfirmModal(null, config, () => {
            let packableIndex = profile.packables.findIndex(p => p.id == this.editingId);
            profile.packables.splice(packableIndex, 1)
            this.memoryService.set('PROFILE', profile);
            this.return();
          });
        }
      }
    } else {
      let config: modalConfig = {
        right: { name: 'Delete', class: 'btn-outline-danger' },
        header: 'Delete ' + this.originalPackable.name + '?'
      }
      this.openConfirmModal(this.deleteModal, config, () => {
        this.store.dispatch(new packableActions.removeOriginalPackable(this.originalPackable.id));
        this.store.dispatch(new collectionActions.deletePackable(this.originalPackable.id));
        this.store.dispatch(new profileActions.deletePackable(this.originalPackable.id));
        this.return();
      })
    }
  }
  setWeatherRules(weatherRule: WeatherRule) {
    this.customWeatherRules = weatherRule.deepCopy();
    this.packableForm.updateValueAndValidity();
    this.packableForm.markAsDirty();
  }
  return() {
    this.memoryService.reset('PRIVATE_PACKABLE');
    this.memoryService.reset('ORIGINAL_PACKABLE');
    if (this.memory.privatePackable && this.editMode) {
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }
  }
  openModal(tempRef: TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

  openConfirmModal(tempRef: TemplateRef<any>, config: modalConfig, callback: () => void) {
    config.left = { name: 'Cancel', class: 'btn-outline-secondary' }
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
    modal.componentInstance.config = config;
    modal.componentInstance.leftAction.subscribe((action) => {
      modal.close();
    })
    modal.componentInstance.rightAction.subscribe((action) => {
      callback();
      modal.close();
    })
  }

  ngOnDestroy(): void {
    this.RoutesAndPackablesSub.unsubscribe();
  }
}
