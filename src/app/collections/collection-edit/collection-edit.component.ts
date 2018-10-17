import { Component, OnInit, Renderer2, OnDestroy, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';

import { PackableOriginal, PackablePrivate, PackableComplete } from '@models/packable.model';
import * as fromApp from '@shared/app.reducers';
import * as collectionActions from '../store/collections.actions';
import * as profileActions from '../../profiles/store/profile.actions'
import * as tripActions from '../../trips/store/trip.actions'

import { Router, ActivatedRoute } from '@angular/router';
import { CollectionOriginal, CollectionComplete, CollectionPrivate, CollectionAny, isCollectionOriginal } from '@models/collection.model';
import { Guid, slugName } from '@shared/global-functions';
import { ListEditorService, listEditorParams, item } from '@shared/services/list-editor.service';
import { MemoryService, memoryObject } from '@shared/services/memory.service';
import { ProfileComplete, Profile } from '@shared/models/profile.model';
import { StoreSelectorService } from '@services/store-selector.service';
import { navParams } from '@shared-comps/mobile-nav/mobile-nav.component';
import { ModalComponent, modalConfig } from '@shared-comps/modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WeatherRule } from '@models/weather.model';
import { MatSlideToggleChange } from '@angular/material';
import { absoluteMax, absoluteMin } from '@services/weather.service';
import { take } from 'rxjs/operators';
import { PackableFactory } from '@factories/packable.factory';
import { CollectionFactory } from '@factories/collection.factory';
import { weatherFactory } from '@factories/weather.factory';

@Component({
  selector: 'app-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './collection-edit.component.css']
})
export class CollectionEditComponent implements OnInit, OnDestroy {
  state_subscription: Subscription;
  collectionsState_obs: Observable<{ collections: CollectionOriginal[] }>;
  originalPackables_obs: Observable<{ packables: PackableOriginal[] | null }>;
  originalPackables: PackableOriginal[];
  originalCollections: CollectionOriginal[];

  originalCollection = new CollectionComplete();
  editingId: string = null;
  memory: memoryObject;
  profile: Profile; //used in template

  editMode: boolean = false;
  collectionForm: FormGroup;
  advancedForm: boolean = false;
  selectPackables = false;
  customPackables: PackableComplete[] = [];
  usedNames = [];
  customWeatherRules = new WeatherRule();
  absoluteMax = absoluteMax;
  absoluteMin = absoluteMin;

  navParams: navParams;
  listSelectorParams: listEditorParams;



  getSubscribeToOriginal():boolean { return this.collectionForm.get('subscribeToOriginal').value }
  getPackables():PackableComplete[] { return (this.advancedForm && this.getSubscribeToOriginal()) ?  this.originalCollection.packables :this.customPackables }
  getWeatherRules():WeatherRule { return (this.advancedForm && this.getSubscribeToOriginal()) ? this.originalCollection.weatherRules :  this.customWeatherRules }

  constructor(private store: Store<fromApp.appState>,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private listEditorService: ListEditorService,
    private memoryService: MemoryService,
    private storeSelectorService: StoreSelectorService,
    private packableFactory: PackableFactory,
    private collectionFactory: CollectionFactory,
    private weatherFactory:weatherFactory,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.collectionForm = new FormGroup({
      'name': new FormControl('', [Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), Validators.required, this.validate_usedName.bind(this)]),
      'activity': new FormControl(false),
      'subscribeToOriginal': new FormControl(true),
    })

    this.memory = this.memoryService.getAll;
    this.collectionsState_obs = this.store.select('collections');
    this.originalPackables_obs = this.store.select('packables');
    let params = this.activeRoute.params;
    this.state_subscription = combineLatest(
      params,
      this.collectionsState_obs,
      this.originalPackables_obs
    ).pipe(take(1)).subscribe(([params, collectionState, packableState]) => {
      this.originalPackables = packableState.packables;
      this.originalCollections = collectionState.collections;
      let memoryCollection = this.memory.privateCollection || this.memory.originalCollection;
      console.log(memoryCollection)
      if (params['collection'] && params['collection'] != "new" && memoryCollection) {
        this.editMode = true;
        this.processEditMode(memoryCollection)
      } else {
        this.editMode = false;
        if (params['collection'] || !memoryCollection) {
          this.router.navigate(['../new'], { relativeTo: this.activeRoute })
        }
      }
      if (this.memory.profile) {
        this.profile = this.memory.profile
        if (this.editMode && this.memory.privateCollection){
          this.advancedForm = true;
        }
      }
      console.log(`editMode: ${this.editMode} | advancedForm: ${this.advancedForm} | memoryCollection Type: ${memoryCollection && memoryCollection.type}`)
      this.navSetup();
      this.formInit();
    })
  }

  processEditMode(collection: CollectionAny) {
    this.editingId = collection.id
    this.collectionForm.setValidators(this.validate_min_packables.bind(this))
    let original = this.storeSelectorService.getCollectionById(collection.id);
    this.originalCollection = this.collectionFactory.makeComplete(original);
  }
  navSetup() {
    let header = this.editMode ? this.originalCollection.name : 'New Collection'
    this.navParams = {
      header: header,
      left: { enabled: true, text: 'Cancel', iconClass: 'fas fa-times' },
      right: { enabled: this.collectionForm.valid, text: this.editMode ? 'Save' : 'Next', iconClass: 'fas fa-check' },
      options: []
    }
    this.editMode
      && this.navParams.options.push({
        name: (this.advancedForm ? 'Remove' : 'Delete') + ' Collection',
        actionName: 'delete'
      })
      && this.advancedForm
      && this.navParams.options.push({ name: 'Restore Default Settings', actionName: 'restore' });
  }
  onOption(action: string) {
    switch (action) {
      case 'delete':
        this.onDelete();
        break;
      case 'restore':
        //restore;
        console.log('restore');
        break;
      default:
        break;
    }
  }
  formInit() {
    this.usedNames = this.storeSelectorService.getUsedCollectionNames();
    this.collectionForm.patchValue({
      name: this.originalCollection.name,
      activity: this.originalCollection.activity,
      subscribeToOriginal: this.advancedForm ? this.memory.privateCollection.subscribeToOriginal : true
    })
    if (this.advancedForm){
      this.customPackables = this.packableFactory.makeCompleteFromArray(this.memory.privateCollection.packables)
      this.customWeatherRules = this.memory.privateCollection.weatherRules
    } else if (this.editMode){
      let originalPackables = this.storeSelectorService.getPackablesByIds(this.memory.originalCollection.packables)
      this.customPackables = this.packableFactory.makeCompleteFromArray(originalPackables)
      this.customWeatherRules = this.memory.originalCollection.weatherRules;
    }
    this.collectionForm.statusChanges.subscribe(status => {
      this.navParams.right.enabled = status == 'VALID' ? true : false;
      console.log('form is '+status)
    })
    if(this.memory.unsaved_collection){
      this.collectionForm.markAsDirty();
      this.collectionForm.updateValueAndValidity();
      console.log('memory is unsaved')
    } else {
      console.log('unsaved_collection:'+this.memory.unsaved_collection);
      
    }
  }
  
  toggleSubscribeToOriginal(changeEvent: MatSlideToggleChange) {
    this.collectionForm.patchValue({
      'subscribeToOriginal': !changeEvent.checked
    })
  }

  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.indexOf(input) !== -1 && (this.editMode === false || input !== this.originalCollection.name.toLowerCase())) {
      return { 'nameUsed': true };
    }
    return null;
  }
  validate_min_packables(): { [s: string]: boolean } {
    if (this.customPackables && this.customPackables.length === 0) {
      return { 'noPackables': true };
    }
    return null;
  }
  packables_warning_style() {
    return this.customPackables.length == 0 && (this.collectionForm.get('name').touched || this.collectionForm.get('name').value != "");
  }
  showAdvanceOptions(): boolean {
    return this.editMode && (!this.advancedForm || !this.getSubscribeToOriginal())
  }
  removePackableFromCollection(id: number) {
    this.customPackables.splice(id, 1);
    this.collectionForm.updateValueAndValidity();
    this.collectionForm.markAsDirty()
  }
  editSelection() {
    let itemSelectorParams: listEditorParams = {
      originalList: this.originalPackables,
      usedList: this.customPackables,
      itemName: 'Packables',
      listType: this.advancedForm ? 'PRIVATE_PACKABLES' : 'ORIGINAL_PACKABLES'
    }
    this.saveCollectionToMemory()
    if(this.collectionForm.dirty){
      this.memoryService.set('UNSAVED_COLLECTION', true)
    }
    this.listEditorService.setParams(itemSelectorParams);
    this.router.navigate(['packables'], { relativeTo: this.activeRoute })
  }

  setWeatherRules(weatherRule: WeatherRule) {
    this.customWeatherRules = this.weatherFactory.deepCopy(weatherRule)
    this.collectionForm.updateValueAndValidity();
    this.collectionForm.markAsDirty()
  }
  // add weather conditions to memory

  onDelete() {
    if (this.advancedForm) {
      let profile = this.memory.profile
      let config: modalConfig = {
        right: { name: 'Remove', class: 'btn-outline-danger' },
        header: 'Remove ' + this.originalCollection.name + '?',
        content: 'Are you sure you want to remove the collection from this profile? You would also be losing all the settings you changed in your Packables.'
      }
      let remove= () => {
        let index = profile.collections.findIndex(c => c.id == this.editingId);
        profile.collections.splice(index, 1);
        this.memoryService.set('PROFILE',profile);
        this.return();
      }
      if (this.getSubscribeToOriginal()) {
        remove()
      } else {
        this.openConfirmModal(null, config, remove)
      }
    } else {
      let config: modalConfig = {
        right: { name: 'Delete', class: 'btn-outline-danger' },
        header: 'Delete ' + this.originalCollection.name + '?',
        content: 'Are you sure you wish to delete this collection?'
      }
      this.openConfirmModal(null, config, () => {
        this.store.dispatch(new tripActions.removeTripActivity(this.editingId));
        this.store.dispatch(new profileActions.deleteProfileCollection(this.editingId))
        this.store.dispatch(new collectionActions.removeOriginalCollection(this.editingId));
        this.return();
      })
    }

  }
  editPackable(packableId: string) {
    if (this.memory.profile) {
      this.saveCollectionToMemory();
      let originalName = this.storeSelectorService.getPackableById(packableId).name
      let privatePackable = this.memory.privateCollection.packables.find(p => p.id == packableId)
      this.memoryService.set('PRIVATE_PACKABLE',privatePackable);
      this.router.navigate(['packables', slugName(originalName)], { relativeTo: this.activeRoute });
    }
  }

  onNext() {
    let originalCol = this.createOriginalFromForm()
    let privateCol = this.createPrivateFromForm(originalCol)
    console.log('created PrivateCol:',privateCol);
    
    if (this.editMode) {
      if (this.memory.profile) {
        this.saveToParentMemory(privateCol)
      } 
      if (!this.advancedForm){
        this.saveToStore(originalCol)
      }
      this.return()
    } else {
      this.saveToStore(originalCol);
      let editingCol: CollectionAny = this.advancedForm ? privateCol : originalCol;
      this.saveCollectionToMemory(editingCol);
      this.memoryService.set('UNSAVED_COLLECTION', true)
      let itemSelectorParams: listEditorParams = {
        originalList: this.originalPackables,
        usedList: [],
        itemName: 'Packables',
        listType: this.advancedForm ? 'PRIVATE_PACKABLES' : 'ORIGINAL_PACKABLES'
      }
      this.listEditorService.setParams(itemSelectorParams);
      this.router.navigate(['../' + slugName(originalCol.name),'packables'], { relativeTo: this.activeRoute })
    }
  }

  createOriginalFromForm(): CollectionOriginal {
    let formData = this.collectionForm.value;
    let id: string = this.editMode ? this.originalCollection.id : Guid.newGuid();
    return new CollectionOriginal(
      id,
      formData.name,
      formData.activity,
      this.advancedForm ? this.originalCollection.packables.map(p => p.id) : this.customPackables.map(p => p.id),
      this.advancedForm ? this.originalCollection.weatherRules : this.customWeatherRules,
    )
  }
  createPrivateFromForm(original?:CollectionOriginal): CollectionPrivate {
    let originalCollection = original || this.createOriginalFromForm()
    return new CollectionPrivate(
      originalCollection.id,
      this.customPackables.map(p=> this.packableFactory.makePrivate(p.parent)),
      this.customWeatherRules,
      this.getSubscribeToOriginal()
    )
  }
  saveToStore(originalCollection: CollectionOriginal) {
    if (this.editMode) {
      this.store.dispatch(new collectionActions.editOriginalCollection(originalCollection));
    } else {
      this.store.dispatch(new collectionActions.addOriginalCollection(originalCollection));
    }
  }
  saveToParentMemory(privateCollection: CollectionPrivate) {
    let profile = this.memory.profile;
    if (this.editMode) {
      let index = profile.collections.findIndex(c => c.id == privateCollection.id);
      profile.collections.splice(index, 1, privateCollection);
    } else {
      profile.collections.push(privateCollection)
    }
    this.memoryService.set('PROFILE',profile);
  }

  saveCollectionToMemory(collection: CollectionAny = null): CollectionAny {
    if (!collection) {
      let newCollection = this.createOriginalFromForm();
      if (this.advancedForm) {
        collection = this.createPrivateFromForm(newCollection)
      } else {
        collection = newCollection
      }
      if(this.collectionForm.dirty){
        this.memoryService.set('UNSAVED_COLLECTION',true)
      }
    }
    console.log('collection type:' + collection.type);
    
    if (isCollectionOriginal(collection)) {
      this.memoryService.set('ORIGINAL_COLLECTION',collection)
    } else {
      this.memoryService.set('PRIVATE_COLLECTION',collection)
    }
    return collection;
  }

  return() {
    this.memoryService.reset('PRIVATE_COLLECTION');
    this.memoryService.reset('ORIGINAL_COLLECTION');
    let profile = <Profile>this.memoryService.get('PROFILE');
    if (profile) {
      console.log('attempting to make complete collection from profile:\n',profile)
      let listEditorParams: listEditorParams = {
        itemName: "Collections",
        listType: "PRIVATE_COLLECTIONS",
        usedList: this.collectionFactory.makeCompleteArray(profile.collections),
        originalList: this.originalCollections
      }
      console.log('result usedList:\n',listEditorParams.usedList);
      
      this.listEditorService.setParams(listEditorParams);
    } if (profile && this.editMode && this.advancedForm) {
      this.router.navigate(['../../'], { relativeTo: this.activeRoute });
    } else {
      this.router.navigate(['../'], { relativeTo: this.activeRoute });
    }
  }
  openModal(tempRef: TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
  openConfirmModal(tempRef: TemplateRef<any>, config: modalConfig, callback: ()=>void) {
    config.left = { name: 'Cancel', class: 'btn-outline-secondary' }
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
    modal.componentInstance.config = config;
    let leftSubscribe = modal.componentInstance.leftAction.subscribe((action) => {
      leftSubscribe.unsubscribe();
      rightSubscribe.unsubscribe();
      modal.close();
    })
    let rightSubscribe = modal.componentInstance.rightAction.subscribe((action) => {
      callback();
      leftSubscribe.unsubscribe();
      rightSubscribe.unsubscribe();
      modal.close();
    })
  }


  ngOnDestroy() {
    this.state_subscription.unsubscribe();
  }

}
