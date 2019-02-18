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
import { titleCase, Guid } from '../../shared/global-functions';

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
  profileCollectionStrings: {id:string,list:string[]}[] = [];
  remoteCollections: CollectionComplete[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {},
    public dialogRef: MatDialogRef<NewProfileDialogComponent>,
    private store: Store<fromApp.appState>,
    private proFac: ProfileFactory,
    private colFac: CollectionFactory,
    private storeSelector: StoreSelectorService,
    private colorGen: ColorGeneratorService,
  ) { }

  ngOnInit() {
    this.collections = this.colFac.getOriginalsFromStoreAndMakeComplete()
    this.allProfiles = this.proFac.getAllProfilesAndMakeComplete()
    this.profileCollectionStrings = this.allProfiles.map(p=>{
      return {
        id: p.id,
        list: p.collections.map(c=> titleCase(c.name))
      }
    })
    // ADD COLLECTIONS FROM REMOTE DATABASE

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
  onChooseProfile(profile: Profile) {
    let collections = profile.collections
    let completeCollections = this.colFac.makeCompleteArray(collections)
    this.onChooseCollections(completeCollections)
  }
  onChooseOriginalCollections() {
    let collections = this.colFac.getCompleteByIdArray(this.selectedCollections)
    let removeCollections = [] //GET REMOTE COLLECTIONS -> make complete
    this.onChooseCollections(collections, removeCollections)
  }
  onChooseCollections(collections: CollectionComplete[] = [], remoteCollections: CollectionComplete[] = []) {
    // store remote collections in profile, and save for processing before final step
    this.remoteCollections = remoteCollections
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
    this.selectedEssentialCollections.forEach(id=>{
      this.profile.collections.findId(id).essential = true
    })
    // SAVE REMOTE REMOTE COLLECTIONS IN STORAGE
    this.profile.id = Guid.newGuid()
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
