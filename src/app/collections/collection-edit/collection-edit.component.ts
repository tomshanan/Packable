import { Component, OnInit, Renderer2, OnDestroy, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { Store} from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { PackableOriginal, PackablePrivate, PackableBlueprint, PackableFactory } from '../../shared/models/packable.model';
import * as fromApp from '../../shared/app.reducers';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionOriginal, CollectionComplete, CollectionFactory } from '../../shared/models/collection.model';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Guid } from '../../shared/global-functions';
import * as collectionActions from '../store/collections.actions';
import { ListEditorService, listEditorParams, item } from '../../shared/list-editor/list-editor.service';
import { MemoryService } from '../../shared/memory.service';
import { ProfileComplete } from '../../shared/models/profile.model';
import { StoreSelectorService } from '../../shared/store-selector.service';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { ModalComponent, modalConfig } from '../../modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './collection-edit.component.css']
})
export class CollectionEditComponent implements OnInit, OnDestroy {
  collectionsState_obs: Observable<{ collections: CollectionOriginal[] }>;
  originalPackables_obs: Observable<{ packables: PackableOriginal[] | null }>;
  originalPackables: PackableOriginal[];
  originalCollections: CollectionOriginal[];
  routesAndStates_sub: Subscription;
  editingId: string = null;
  editingCollection: CollectionComplete = new CollectionComplete('','', false, [], [], []);
  editMode: boolean = false;
  profile: ProfileComplete;
  advanceForm: boolean = false;
  collectionForm: FormGroup;
  selectPackables = false;
  usedPackables: PackableBlueprint[] = [];
  usedNames = [];
  listSelectorParams: listEditorParams;
  navParams:navParams;

  constructor(private store: Store<fromApp.appState>,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private listEditorService: ListEditorService,
    private memoryService: MemoryService,
    private storeSelectorService: StoreSelectorService,
    private packableFactory:PackableFactory,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.collectionForm = new FormGroup({
      'name': new FormControl('', [Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), Validators.required, this.validate_usedName.bind(this)]),
      'activity': new FormControl(false),
      'activityRules': new FormArray([]),
      'weatherRules': new FormArray([]),
    }, this.validate_min_packables.bind(this))

    this.profile = this.memoryService.getProfile();
    this.collectionsState_obs = this.store.select('collections');
    this.originalPackables_obs = this.store.select('packables');
    let params = this.activeRoute.params;

    this.routesAndStates_sub = combineLatest(
      params,
      this.collectionsState_obs,
      this.originalPackables_obs
    ).subscribe(([params, collectionState, packableState]) => {
      this.originalPackables = packableState.packables;
      this.originalCollections = collectionState.collections;
      this.usedNames = this.storeSelectorService.getUsedCollectionNames();
      let collection = this.memoryService.getCollection();
      if (params['collection'] && params['collection'] != "new") {
        if (collection) {
          this.editingId = collection.id
          this.editMode = true;
          if (this.profile){
            this.advanceForm = true;
          }
          console.log("edit mode = true");
        } else {
          this.router.navigate(['../new'], { relativeTo: this.activeRoute })
        }
      } else {
        this.editMode = false;
        console.log("edit mode = false");
        if (params['collection']) {
          this.router.navigate(['../new'], { relativeTo: this.activeRoute })
        }
      }
      if (collection) {
        console.log("collection:",collection)
        this.editingCollection = collection;
        this.usedPackables = this.editingCollection.packables;
      }
      this.navSetup();
      this.formInit();
    })
  }
  navSetup(){
    this.navParams = {
      header:this.editingCollection && this.editingCollection.name !=''  ? this.editingCollection.name : 'New Collection',
      left: {
        enabled: true,
        text: 'Cancel',
        iconClass:'fas fa-times'
      },
      right: {
        enabled: false,
        text: this.editMode ? 'Save' : 'Create',
        iconClass:'fas fa-check'
      },
      options: []
    }
    this.editMode
      && this.navParams.options.push({
        name: (this.advanceForm ? 'Remove' : 'Delete') +' Collection', 
        actionName: 'delete'
      })
      && this.advanceForm
      && this.navParams.options.push({ name: 'Restore Default Settings', actionName: 'restore' });

    this.collectionForm.statusChanges.subscribe(status => {
      this.navParams.right.enabled = status == 'VALID'? true : false;
    })
  }
  onOption(action:string){
    console.log(action);
    switch (action){
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

    let name = this.editingCollection.name;
    let activity = this.editingCollection.activity;
    this.collectionForm.patchValue({
      name: name,
      activity: activity
    })
    console.log(this.usedPackables);

    //check if it has activity rules. if there is, loop and push to rules formArray
    //check if it has weather rules. if there is, loop and push to rules formArray
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.indexOf(input) !== -1 && (this.editMode === false || input !== this.editingCollection.name.toLowerCase())) {
      return { 'nameUsed': true };
    }
    return null;
  }

  validate_min_packables(): { [s: string]: boolean } {
    if (this.usedPackables && this.usedPackables.length === 0) {
      return { 'noPackables': true };
    }
    return null;
  }

  packables_warning_style(){
    return this.usedPackables.length==0 && (this.collectionForm.get('name').touched || this.collectionForm.get('name').value !="");
  }

  removePackableFromCollection(id: number) {
    this.usedPackables.splice(id, 1);
    this.collectionForm.updateValueAndValidity();
  }

  editSelection() {
    let itemSelectorParams = {
      originalList: this.originalPackables,
      usedList: this.usedPackables,
      itemName: 'Packables',
      listType: 'packables'
    }
    this.saveFormToMemory()
    this.listEditorService.setParams(itemSelectorParams);
    this.router.navigate(['packables'], { relativeTo: this.activeRoute })
  }

  saveFormToMemory(){
    this.editingCollection.name = this.collectionForm.get('name').value;
    this.editingCollection.activity = this.collectionForm.get('activity').value
    // add conditions
    this.editingCollection.packables = this.usedPackables;
    this.memoryService.setCollection(this.editingCollection);
  }

  
  onDelete() {
    if(this.advanceForm){
      let config: modalConfig = {
        right: { name: 'Remove', class: 'btn-outline-danger' },
        header: 'Remove ' + this.editingCollection.name + '?',
        content: 'Are you sure you want to remove the collection from this profile? You would also be losing all the settings you changed in your Packables.'
      }
      this.openConfirmModal(null, config, () => {
        let index = this.profile.collections.findIndex(c => c.id == this.editingId);
        this.profile.collections.splice(index,1);
        this.memoryService.setProfile(this.profile);
        this.return();
      })
    } else {
      let config: modalConfig = {
        right: { name: 'Delete', class: 'btn-outline-danger' },
        header: 'Delete ' + this.editingCollection.name + '?',
        content: 'Are you sure you wish to delete this collection?'
      }
      this.openConfirmModal(null, config, () => {
        this.store.dispatch(new collectionActions.removeOriginalCollection(this.editingId));
        this.return();
      })
    }
    
  }
  editPackable(packable:PackablePrivate, id:number){
    if(this.profile){
      this.saveFormToMemory();
      let packableComplete = this.packableFactory.makeComplete(packable);
      this.memoryService.setPackable(packableComplete);
      this.router.navigate(['packables', id], { relativeTo: this.activeRoute });  
    }
  }

  onSubmit() {
    let formData = this.collectionForm.value;
    let PackableRefs = this.usedPackables.map(p => p.id);
    let id:string = this.editMode ? this.editingCollection.id : Guid.newGuid();
    let newOriginalCollection: CollectionOriginal = {
      id: id,
      name: formData.name,
      activity: formData.activity,
      packables: PackableRefs,
      activityRules: formData.activityRules,
      weatherRules: formData.weatherRules
    }
    let newCompleteCollection: CollectionComplete = {
      ...newOriginalCollection,
      packables: this.usedPackables
    }

    console.log("newOriginalCollection:",newOriginalCollection); // for state
    console.log("newCompleteCollection:",newCompleteCollection); // for memory
    
    let profile = this.profile;
    if (!this.editMode) {
      // --> do we need to make sure newOriginalCollection has only original packables?
      this.store.dispatch(new collectionActions.addOriginalCollection(newOriginalCollection));
      if (profile) {
        profile.collections.push(newCompleteCollection)
        this.memoryService.setProfile(profile);
      }
    } else {
      if (profile){
        let index = this.profile.collections.findIndex(c => c.id == this.editingId);
        profile.collections.splice(index,1,newCompleteCollection);
        this.memoryService.setProfile(profile);
      } else {
        this.store.dispatch(new collectionActions.editOriginalCollection(newOriginalCollection));
      }
    }
    this.return();
  }

  

  return() {
    this.memoryService.resetCollection();
    let profile = this.memoryService.getProfile();
    if (profile) {
      let listEditorParams: listEditorParams = {
        itemName: "Collections",
        listType: "collections",
        usedList: profile.collections,
        originalList: this.originalCollections
      }
      this.listEditorService.setParams(listEditorParams);
    } if (profile && this.editMode){
      this.router.navigate(['../../'], { relativeTo: this.activeRoute });
    } else {
      this.router.navigate(['../'], { relativeTo: this.activeRoute });
    }
  }
  openModal(tempRef:TemplateRef<any>) {
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


  ngOnDestroy() {
    this.routesAndStates_sub.unsubscribe();
  }

}
