import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers';
import * as profileActions from '../store/profile.actions';
import * as tripActions from '../../trips/store/trip.actions'

import { Observable ,  Subscription ,  combineLatest } from 'rxjs';
import { PackableOriginal, PackableComplete } from '../../shared/models/packable.model';
import { CollectionPrivate, CollectionOriginal, CollectionComplete } from '../../shared/models/collection.model';
import { Profile, ProfileComplete } from '../../shared/models/profile.model';
import { ListEditorService, listEditorParams } from '../../shared/services/list-editor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MemoryService, memoryObject } from '../../shared/services/memory.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Guid, slugName } from '../../shared/global-functions';
import { navParams } from '../../shared-comps/mobile-nav/mobile-nav.component';
import { modalConfig, ModalComponent } from '../../shared-comps/modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PackableFactory } from '../../shared/factories/packable.factory';
import { ProfileFactory } from '../../shared/factories/profile.factory';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './profile-edit.component.css'],
  providers: []
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.appState>,
    private listEditorService: ListEditorService,
    private memoryService: MemoryService,
    private selector: StoreSelectorService,
    private profileFactory: ProfileFactory,
    private modalService: NgbModal
  ) { }
  openItemSelector: boolean = false;
  listEditor: boolean = false;

  originalPackablesState_obs: Observable<{ packables: PackableOriginal[] }>;
  collectionsState_obs: Observable<{ collections: CollectionOriginal[] }>;
  profilesState_obs: Observable<{ profiles: Profile[] }>;

  state_subscription: Subscription;

  originalPackables: PackableOriginal[];
  originalCollections: CollectionOriginal[];
  profiles: Profile[];

  editMode: boolean = false;
  editingProfile: ProfileComplete = new ProfileComplete('','', []);
  editingProfileId: string;
  memory: memoryObject;

  usedNames: string[] = [];
  profileForm: FormGroup;
  navParams:navParams;

  ngOnInit() {
    this.profileForm = new FormGroup({
      'name': new FormControl('hi', [Validators.required, this.validate_usedName.bind(this), Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/)])
    })

    this.originalPackablesState_obs = this.store.select('packables');
    this.collectionsState_obs = this.store.select('collections');
    this.profilesState_obs = this.store.select('profiles');
    let routeParams = this.activatedRoute.params;


    this.state_subscription = combineLatest
      (
      this.originalPackablesState_obs,
      this.collectionsState_obs,
      this.profilesState_obs,
      routeParams
      ).subscribe(([
        packablesState,
        collectionState,
        profileState,
        routeParams
      ]) => {
        this.originalPackables = packablesState.packables;
        this.originalCollections = collectionState.collections;
        this.profiles = profileState.profiles;
        this.memory = this.memoryService.getAll
        let memoryProfile = this.memory.profile;
        console.log(memoryProfile);
        if (routeParams['profile']) {
          if(memoryProfile){
            this.prepareEditMode(memoryProfile)
          } else {
            this.router.navigate(['/new'],{relativeTo:this.activatedRoute})
          }
        } else {
          this.editMode = false;
        }
        this.navSetup();
        this.initForm();
      }
      )
  }

  prepareEditMode(memoryProfile:Profile){
    this.editMode = true;
    this.editingProfile = this.profileFactory.makeComplete([memoryProfile])[0];
    this.editingProfileId = this.editingProfile.id;
  }
  navSetup(){
    let header = (this.editMode && this.editingProfile) ? this.editingProfile.name : 'New Profile';
    this.navParams = {
      header: header,
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
      options:[]
    }
    this.editMode && this.navParams.options.push({name: 'Delete Profile', actionName:'delete'});
    this.profileForm.statusChanges.subscribe(status => {
      this.navParams.right.enabled = status == 'VALID'? true : false;
    })
  }
  onOption(action:string){
    console.log(action);
    switch (action){
      case 'delete':
      this.onDelete();
      break;
      default:
      break;
    }
  }
  initForm() {
    this.usedNames = [];
    for (let profile of this.profiles) {
      this.usedNames.push(profile.name.toLowerCase());
    }
    this.profileForm.patchValue({ 'name': this.editingProfile.name })
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.indexOf(input) !== -1 && (this.editMode === false || input !== this.editingProfile.name.toLowerCase())) {
      return { 'usedName': true };
    }
    return null;
  }

  editCollections() {
    let listEditorParams: listEditorParams = {
      itemName: "Collections",
      listType: "PRIVATE_COLLECTIONS",
      usedList: this.editingProfile.collections,
      originalList: this.originalCollections
    }
    this.saveProfileToMemory();
    this.listEditorService.setParams(listEditorParams);
    this.router.navigate(['collections'], { relativeTo: this.activatedRoute });
  }

  onEditCollection(collection:CollectionComplete){
    let profile = this.saveProfileToMemory();
    let privateCollection = profile.collections.find(c=>c.id == collection.id)
    this.memoryService.set('PRIVATE_COLLECTION',privateCollection);
    this.memoryService.reset('UNSAVED_COLLECTION')
    this.router.navigate(['collections', slugName(collection.name)], { relativeTo: this.activatedRoute });
  }


  createProfileFromForm():Profile{
    let name = this.profileForm.get('name').value;
    let id = this.editMode ? this.editingProfile.id : Guid.newGuid();
    let collections = this.editMode ? this.memory.profile.collections : [];
    return new Profile(id,name,collections)
  }

  saveProfileToMemory(profile:Profile =null):Profile{
    if(!profile){
      profile = this.createProfileFromForm();
    }
    this.memoryService.set('PROFILE',profile);
    return profile
  }

  onNext() {
    let newProfile = this.createProfileFromForm();
    if(!this.editMode){
      this.store.dispatch(new profileActions.addProfile(newProfile))
      this.saveProfileToMemory(newProfile)
      this.router.navigate(['../'+slugName(newProfile.name)], {relativeTo:this.activatedRoute})
    } else {
      this.store.dispatch(new profileActions.editProfile(newProfile))
      this.return();
    }
  }
  
  onDelete() {
    let config: modalConfig = {
      right: { name: 'Delete', class: 'btn-outline-danger' },
      header: 'Delete ' + this.editingProfile.name + '?',
      content: "Are you sure you want to delete this profile? All your custom settings will be gone for EVER!"
    }
    this.openConfirmModal(null, config, () => {
      this.store.dispatch(new profileActions.removeProfile(this.editingProfileId))
      this.store.dispatch(new tripActions.removeTripProfile(this.editingProfileId));
      this.return();
    })
  }
  return() {
    this.memoryService.resetAll();
    this.router.navigate(['profiles']);
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
    this.state_subscription.unsubscribe();
  }
}
