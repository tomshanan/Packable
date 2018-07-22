import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers';
import * as profileActions from '../store/profile.actions';

import { Observable } from 'rxjs/Observable';
import { PackableOriginal, PackablePrivate, PackableFactory } from '../../shared/models/packable.model';
import { CollectionPrivate, CollectionOriginal, CollectionFactory } from '../../shared/models/collection.model';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Profile, ProfileComplete } from '../../shared/models/profile.model';
import { ListEditorService, listEditorParams } from '../../shared/list-editor/list-editor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MemoryService } from '../../shared/memory.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StoreSelectorService } from '../../shared/store-selector.service';
import { Guid } from '../../shared/global-functions';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { modalConfig, ModalComponent } from '../../modal/modal.component';
import { NgbModal } from '../../../../node_modules/@ng-bootstrap/ng-bootstrap';

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
    private packableFactory: PackableFactory,
    private collectionFactory: CollectionFactory,
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
  editingProfile: ProfileComplete = new ProfileComplete('','', [], []);
  editingProfileId: string;

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
        let memoryProfile = this.memoryService.getProfile();
        console.log(memoryProfile);
        
        this.usedNames = [];
        for (let profile of this.profiles) {
          this.usedNames.push(profile.name.toLowerCase());
        }
        if (routeParams['profile']) {
          if(memoryProfile){
            this.editMode = true;
          } else {
            this.router.navigate(['/new'],{relativeTo:this.activatedRoute})
          }
        } else {
          this.editMode = false;
        }
        if(memoryProfile){
          this.editingProfile = this.selector.getCompleteProfiles([memoryProfile])[0];
          this.editingProfileId = this.editingProfile.id;
        }
        console.log("editingProfile:",this.editingProfile)
        this.navSetup();
        this.initForm();
      }
      )
  }
  navSetup(){
    this.navParams = {
      header:this.editingProfile && this.editingProfile.name !=''  ? this.editingProfile.name : 'New Profile',
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
    this.profileForm.patchValue({ 'name': this.editingProfile.name })
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.indexOf(input) !== -1 && (this.editMode === false || input !== this.editingProfile.name.toLowerCase())) {
      return { 'usedName': true };
    }
    return null;
  }

  editPackables() {
    let listEditorParams: listEditorParams = {
      itemName: "Packables",
      listType: "packables",
      usedList: this.editingProfile.packables,
      originalList: this.originalPackables
    }
    this.saveFormStateToMemory();
    this.listEditorService.setParams(listEditorParams);
    this.router.navigate(['packables'], { relativeTo: this.activatedRoute });

  }
  editCollections() {
    let listEditorParams: listEditorParams = {
      itemName: "Collections",
      listType: "collections",
      usedList: this.editingProfile.collections,
      originalList: this.originalCollections
    }
    this.saveFormStateToMemory();
    this.listEditorService.setParams(listEditorParams);
    this.router.navigate(['collections'], { relativeTo: this.activatedRoute });
  }
  saveFormStateToMemory() {
    this.editingProfile.name = this.profileForm.get('name').value;
    this.memoryService.setProfile(this.editingProfile);
  }
  onEditPackable(packable:PackablePrivate, id:number){
    this.saveFormStateToMemory();
    let packableComplete = this.packableFactory.makeComplete(packable);
    this.memoryService.setPackable(packableComplete);
    this.router.navigate(['packables', id], { relativeTo: this.activatedRoute });
  }
  onEditCollection(collection:CollectionPrivate, id:number){
    this.saveFormStateToMemory();
    let collectionComplete = this.collectionFactory.makeComplete(collection);
    this.memoryService.setCollection(collectionComplete);
    this.router.navigate(['collections', id], { relativeTo: this.activatedRoute });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      let name = this.profileForm.get('name').value;
      let id = this.editingProfileId ? this.editingProfile.id : Guid.newGuid();
      let newPackables = this.editingProfile.packables.map(p=>{
        return this.packableFactory.newPrivatePackable(p);
      })
      let newCollections = this.editingProfile.collections.map(c => {
        c.packables = c.packables.map(p=>{
          return this.packableFactory.newPrivatePackable(p);
        })
        return c;
      })
      let newProfile = new Profile(id,name,newPackables,newCollections)
      
      if (!this.editMode) {
        this.store.dispatch(new profileActions.addProfile(newProfile))
      } else {
        this.store.dispatch(new profileActions.editProfile(newProfile))
      }
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
