import { Component, OnInit, Inject } from '@angular/core';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';

import { isDefined, Guid } from '@shared/global-functions';
import { FormControl, Validators } from '@angular/forms';
import { CollectionComplete } from '@shared/models/collection.model';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { PackableOriginal } from '@shared/models/packable.model';
import { PackableFactory } from '@shared/factories/packable.factory';
import { Profile } from '@shared/models/profile.model';
import { ContextService } from '@shared/services/context.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProfileFactory } from '@shared/factories/profile.factory';
import { BulkActionsService } from '@shared/services/bulk-actions.service';
import { CollectionFactory } from '@app/shared/factories/collection.factory';
import { transitionTrigger } from '@shared/animations';
import * as packableActions from '@app/packables/store/packables.actions';
import { NameInputChangeEvent } from '@app/shared-comps/name-input/name-input.component';
import { filter } from 'rxjs/operators';
import { WindowService } from '../../../shared/services/window.service';

export interface newCollectionDialog_data {
  profileGroup?: Profile[];
}
export interface newCollectionDialog_result {
  collection: CollectionComplete,
  profiles: Profile[]
}

@Component({
  selector: 'app-new-collection-dialog',
  templateUrl: './new-collection-dialog.component.html',
  styleUrls: ['../../../shared/css/dialog.css', './new-collection-dialog.component.css'],
  animations: [transitionTrigger]
})
export class NewCollectionDialogComponent implements OnInit {
  collectionName: string;
  collection: CollectionComplete;
  usedCollectionNames: string[];
  collectionNameValid: boolean = true;
  step: number = 1;
  remotePackableIds: string[] = [];

  profileGroup: Profile[];
  selectedProfiles: string[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: newCollectionDialog_data,
    public dialogRef: MatDialogRef<NewCollectionDialogComponent>,
    private store: Store<fromApp.appState>,
    private bulkActions: BulkActionsService,
    private storeSelector: StoreSelectorService,
    private pacFac: PackableFactory,
    private proFac: ProfileFactory,
    private colFac: CollectionFactory,
    private context: ContextService,
    private windowService: WindowService,
  ) {
    this.profileGroup = (data && data.profileGroup) || this.storeSelector.profiles
  }

  ngOnInit() {
    this.usedCollectionNames = this.storeSelector.getUsedCollectionNames()
    this.collectionName = ''
    this.collection = new CollectionComplete(Guid.newGuid());
    this.collection.userCreated = true;
    if (this.context.profileId) {
      this.selectedProfiles = [this.context.profileId]
    } else {
      this.selectedProfiles = this.profileGroup.ids()
    }
  }

  setName(e: NameInputChangeEvent) {
    this.collectionNameValid = e.valid
    if (e.valid) {
      this.collectionName = e.value
    }
  }
  onClose(collection: CollectionComplete = null, profiles: Profile[] = []) {
    let result: newCollectionDialog_result = {
      collection: collection,
      profiles: profiles
    }
    this.dialogRef.close(result)
  }
  confirmName() {
    if (this.collectionNameValid) {
      this.collection.name = this.collectionName
      this.nextStep()
    }
  }
  updatePackables(ids: string[]) {
    this.remotePackableIds = ids
  }
  valid(){
    switch (this.step) {
      case 1:
          return this.collectionNameValid
      case 2:
          return this.remotePackableIds.length>0
      case 3:
          return true
      default:
        break;
    }
  }
  onConfirm() {
    switch (this.step) {
      case 1:
        this.confirmName()
        break;
      case 2:
        this.confirmPackables()
        break;
      case 3:
        this.confirmProfiles()
        break;
      default:
        break;
    }
  }

  confirmPackables() {
    let remotePackables = this.storeSelector.getRemotePackables(this.remotePackableIds)
    let completePackables = this.pacFac.makeCompleteFromArray(remotePackables)
    this.collection.packables = completePackables
    this.nextStep()

  }
  confirmProfiles() {
    let originalCollection = this.colFac.completeToOriginal(this.collection)
    this.bulkActions.addMissingPackableIdsFromRemote(this.remotePackableIds)
    this.store.dispatch(new collectionActions.updateOriginalCollections([originalCollection]))
    this.bulkActions.pushCompleteCollectionsToProfiles([this.collection], this.selectedProfiles)
    const profiles = this.profileGroup.filter(p => this.selectedProfiles.includes(p.id))
    this.onClose(this.collection, profiles);
  }
  nextStep() {
    this.step++
    //this.stepSettings()
  }
  returnStep() {
    this.step--
    //this.stepSettings()
  }
  // stepSettings() {
  //   if (this.step == 1 || this.step == 3) {
  //     this.dialogRef.addPanelClass('dialog-form')
  //     this.dialogRef.removePanelClass('dialog-full-height')
  //   } else {
  //     this.dialogRef.addPanelClass('dialog-full-height')
  //     this.dialogRef.removePanelClass('dialog-form')
  //   }
  // }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedCollectionNames.indexOf(input) > -1) {
      return { 'usedName': true };
    }
    return null;
  }

  profileSelect(select: 'all' | 'none') {
    if (select == 'all') {
      this.selectedProfiles = this.profileGroup.map(p => p.id)
    } else {
      this.selectedProfiles = [];
    }
  }

  stepTitle(): string {
    switch (this.step) {
      case 1: return 'New Collection'; 
      case 2: return 'Choose Packables'; 
      case 3: return 'Add To Profiles'; 
    }
  }

}
