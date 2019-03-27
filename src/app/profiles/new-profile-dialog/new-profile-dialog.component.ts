import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile, ProfileComplete } from '../../shared/models/profile.model';
import { transitionTrigger } from '../../shared/animations';
import { ProfileEditFormComponent } from '../profile-edit-form/profile-edit-form.component';
import { CollectionComplete } from '@app/shared/models/collection.model';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { Subscription } from 'rxjs';
import { ColorGeneratorService } from '../../shared/services/color-gen.service';
import { titleCase, Guid, timeStamp } from '../../shared/global-functions';
import * as libraryActions from '@shared/library/library.actions';
import { remoteCollection } from '@app/shared/library/library.model';
import * as collectionActions from '@app/collections/store/collections.actions';
import * as packableActions from '@app/packables/store/packables.actions';
import { BulkActionsService } from '@app/shared/services/bulk-actions.service';

type profileCreationMethod = 'template' | 'copy' | 'new'
@Component({
  selector: 'app-new-profile-dialog',
  templateUrl: './new-profile-dialog.component.html',
  styleUrls: ['../../shared/css/dialog.css', './new-profile-dialog.component.css'],
  animations: [transitionTrigger]
})
export class NewProfileDialogComponent implements OnInit, OnDestroy {
  subscriptions: Subscription;
  step: number = 1;
  method: profileCreationMethod;
  profile = new ProfileComplete();
  @ViewChild('profileForm') profileForm: ProfileEditFormComponent;
  profileFormValid: boolean;
  searchString = '';
  collections: CollectionComplete[];
  selectedCollections: string[] = [];
  selectedEssentialCollections: string[] = [];

  allProfiles: ProfileComplete[];
  templateProfiles: ProfileComplete[]
  profileCollectionStrings: {id:string,list:string[]}[] = [];
  remoteCollections: remoteCollection[];
  subs: Subscription;
  loadingCollections: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {},
    public dialogRef: MatDialogRef<NewProfileDialogComponent>,
    private store: Store<fromApp.appState>,
    private proFac: ProfileFactory,
    private colFac: CollectionFactory,
    private storeSelector: StoreSelectorService,
    private colorGen: ColorGeneratorService,
    private bulkActions:BulkActionsService,
  ) { }

  ngOnInit() {
    this.subs = this.storeSelector.libraryState_obs.subscribe((state)=>{
      if(state.loading){
        this.loadingCollections = true
      } else {
        this.init()
        this.loadingCollections = false
      }
    })
    this.store.dispatch(new libraryActions.loadLibrary())
  }
  init(){
    this.collections = this.colFac.getImportCollectionList()
    this.allProfiles = this.proFac.getAllProfilesAndMakeComplete()
    console.log('NEWPROFILE DIALOG: allProfiles', this.allProfiles)
    this.templateProfiles = this.proFac.makeComplete(this.storeSelector.getRemoteProfiles()) 
    console.log('NEWPROFILE DIALOG: templateProfiles', this.templateProfiles)
    this.profileCollectionStrings = [...this.allProfiles, ...this.templateProfiles].map(p=>{
      return {
        id: p.id,
        list: p.collections.map(c=> titleCase(c.name))
      }
    })
  }
  getCollectionListById(id:string):string[]{
    return this.profileCollectionStrings.findId(id).list
  }
  ngOnDestroy() {
  }
  backStep() {
    this.step--
  }
  profileEditFormValidation(e: boolean) {
    this.profileFormValid = e;
    console.log(`profile edit form validation = ${e}`)
  }
  stepHeading(): string {
    switch (this.step) {
      case 1: return 'New Traveler'; break;
      case 2:
      case 3:
        return '';
    }
  }

  // when complete step  1: 
  // check validity of profile
  // set method
  //this.step++
  onChooseMethod(method: profileCreationMethod) {
    this.method = method;
    this.profile.avatar.color = this.colorGen.getUnused()
    if (this.profileForm.valid) {
      this.step++
    }
    this.dialogRef.addPanelClass('dialog-full-height')
  }

  /* when complete step 2: 
    get collections and apply to this.profile
    this.step++
  */
  onChooseProfile(profile: ProfileComplete) {
    this.selectedCollections = profile.collections.map(c=>c.id)
    this.onChooseOriginalCollections()
  }
  onChooseOriginalCollections() {
    let localCollections = this.colFac.getAllComplete().filter(c=>this.selectedCollections.includes(c.id))
    let localCollectionsIds = localCollections.map(c=>c.id)
    //GET REMOTE COLLECTIONS -> filter only selected ones -> filter ones already being used in local library
    this.remoteCollections =  this.storeSelector.getRemoteCollections().filter(c=> 
      this.selectedCollections.includes(c.id) && !localCollectionsIds.includes(c.id)) 
    let completeRemoteCollections = this.colFac.makeCompleteArray(this.remoteCollections)
    this.onChooseCollections(localCollections, completeRemoteCollections)
  }
  onChooseCollections(collections: CollectionComplete[] = [], remoteCollections: CollectionComplete[] = []) {
    // store remote collections in profile, and save for processing before final step
    this.profile.collections = [...collections,...remoteCollections]
    this.selectedEssentialCollections = this.profile.collections.filter(c=>c.essential).map(c=>c.id)
    this.step++
    console.log(this.profile);
  }

  /* when complete step 3: 
  set selected collections to essential in this.profile 
  save remote collections to local storage
  give profile an id
  save profile in store
  close modal
*/
  onComplete() {
    
    // SAVE REMOTE REMOTE COLLECTIONS IN STORAGE
    this.bulkActions.processImportCollections(this.remoteCollections.map(c=>c.id))
    // Set Essential Collections in profile
    this.selectedEssentialCollections.forEach(id=>{
      this.profile.collections.findId(id).essential = true
    })
    this.profile.id = Guid.newGuid()
    this.profile.dateModified = timeStamp()
    let newProfile = this.proFac.completeToPrivate(this.profile)
    this.store.dispatch(new profileActions.addProfile(newProfile))
    this.onClose(newProfile)
  }
  onClose(profile: Profile = null) {
    this.dialogRef.close(profile)
  }

  log(any){
    console.log(any);
  }
}
