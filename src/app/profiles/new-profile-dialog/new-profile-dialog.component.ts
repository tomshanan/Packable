import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile, ProfileComplete, ProfileCompleteWithMetadata } from '../../shared/models/profile.model';
import { transitionTrigger } from '../../shared/animations';
import { ProfileEditFormComponent } from '../profile-edit-form/profile-edit-form.component';
import { CollectionComplete, CollectionWithMetadata } from '@app/shared/models/collection.model';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { Subscription } from 'rxjs';
import { ColorGeneratorService } from '../../shared/services/color-gen.service';
import { titleCase, Guid, timeStamp, sortByMostRecent, sortByMetaScore } from '@shared/global-functions';
import * as libraryActions from '@shared/library/library.actions';
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
  color: string;
  @ViewChild('profileForm') profileForm: ProfileEditFormComponent;
  profileFormValid: boolean;
  searchString = '';
  collections: CollectionComplete[];
  selectedCollections: string[] = [];
  selectedEssentialCollections: string[] = [];
  selectedProfile: string = null;
  allProfiles: ProfileComplete[];
  templateProfiles: ProfileCompleteWithMetadata[]
  profileCollectionStrings: { id: string, list: string[] }[] = [];
  remoteCollections: CollectionWithMetadata[];
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
    private bulkActions: BulkActionsService,
  ) { }

  ngOnInit() {
    this.subs = this.storeSelector.libraryState$.subscribe((state) => {
      if (state.loading) {
        this.loadingCollections = true
      } else {
        this.init()
        this.loadingCollections = false
      }
    })
    this.store.dispatch(new libraryActions.loadLibrary())
  }
  init() {
    this.collections = this.colFac.getImportCollectionList();
    this.allProfiles = this.proFac.getAllProfilesAndMakeComplete().sort(sortByMostRecent);
    console.log('NEWPROFILE DIALOG: allProfiles', this.allProfiles);
    this.templateProfiles = this.proFac.getAllRemoteAndMakeComplete();
    this.templateProfiles.sort(sortByMetaScore);
  }

  ngOnDestroy() {
  }
  backStep() {
    this.step--
    if (this.step === 1) {
      this.dialogRef.removePanelClass('dialog-tall')
    }
  }
  profileEditFormValidation(e: boolean) {
    this.profileFormValid = e;
    console.log(`profile edit form validation = ${e}`)
  }

  // when complete step  1: 
  // check validity of profile
  // set method
  //this.step++
  onNextStep() {
    if (this.storeSelector.isLibraryStore) {
      this.onComplete()
    } else {
      this.onChooseMethod('template')
    }
  }
  onChooseMethod(method: profileCreationMethod) {
    this.method = method;
    this.selectedProfile = null;
    if (!this.color) {
      this.color = this.colorGen.getUnused()
      this.profile.avatar.color = this.color
    }
    if (this.step === 1) {
      this.dialogRef.addPanelClass('dialog-tall')
      this.step++
    }

  }

  /* when complete step 2: 
    get collections and apply to this.profile
    then complete
  */
  chooseCopy() {
    this.onChooseProfile(this.allProfiles.findId(this.selectedProfile))
  }
  chooseTemplate() {
    this.onChooseProfile(this.templateProfiles.findId(this.selectedProfile))
  }
  onChooseProfile(profile: ProfileComplete) {
    this.selectedCollections = profile.collections.map(c => c.id)
    this.profile.collections = profile.collections
    this.onComplete()
  }

  onComplete() {
    if (this.selectedCollections.length > 0) {
      // SAVE REMOTE REMOTE COLLECTIONS IN STORAGE
      this.bulkActions.processImportCollections(this.selectedCollections)
    }

    this.profile.id = Guid.newGuid()
    this.profile.dateModified = timeStamp()
    let newProfile = this.proFac.completeToPrivate(this.profile)
    this.store.dispatch(new profileActions.addProfile(newProfile))
    this.onClose(newProfile)
  }
  onClose(profile: Profile = null) {
    this.dialogRef.close(profile)
  }

  log(any) {
    console.log(any);
  }
}
