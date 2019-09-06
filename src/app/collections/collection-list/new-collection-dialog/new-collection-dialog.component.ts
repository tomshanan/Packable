import { Component, OnInit, Inject } from '@angular/core';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';

import { isDefined, Guid, hasNameAndId } from '@shared/global-functions';
import { FormControl, Validators } from '@angular/forms';
import { CollectionComplete } from '@shared/models/collection.model';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { PackableOriginal } from '@shared/models/packable.model';
import { PackableFactory } from '@shared/factories/packable.factory';
import { Profile } from '@shared/models/profile.model';
import { ContextService } from '@shared/services/context.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ProfileFactory } from '@shared/factories/profile.factory';
import { BulkActionsService } from '@shared/services/bulk-actions.service';
import { CollectionFactory } from '@app/shared/factories/collection.factory';
import { transitionTrigger } from '@shared/animations';
import * as packableActions from '@app/packables/store/packables.actions';
import { NameInputChangeEvent } from '@app/shared-comps/name-input/name-input.component';
import { filter } from 'rxjs/operators';
import { WindowService } from '../../../shared/services/window.service';
import { hasOrigin, comparableName } from '../../../shared/global-functions';
import { ImportCollectionDialogComponent, importCollections_data } from '../import-collection-dialog/import-collection-dialog.component';

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
  usedCollections: Array<hasNameAndId & hasOrigin>;
  usedCollectionNames: Array<string>;
  collectionNameValid: boolean = false;
  step: number = 1;
  remotePackableIds: string[] = [];
  allowImport:boolean = false
  profileGroup: Profile[];
  selectedProfiles: string[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: newCollectionDialog_data,
    public dialogRef: MatDialogRef<NewCollectionDialogComponent>,
    private dialog:MatDialog,
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
    this.usedCollections = this.storeSelector.getUsedCollectionNames()
    this.usedCollectionNames = this.usedCollections.map(c=>c.name)
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
    this.collectionName = e.value
    if (!e.valid) {
      let col = this.usedCollections.find(c=>comparableName(c.name)===comparableName(e.value))
      if(col && (col.origin === 'remote' || this.context.profileId)){
        this.allowImport = true
      }
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
  valid() {
    switch (this.step) {
      case 1:
        return this.collectionNameValid
      case 2:
        return true
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
  importRequest(name:string){
    name = comparableName(name)
    let col = this.usedCollections.find(p=>comparableName(p.name)===name)
    if(col){
      let data:importCollections_data={
        selectedCollections: [col.id],
        profileName:this.context.profileId ? this.context.getProfile().name : '',
      }
      this.dialog.open(ImportCollectionDialogComponent, {
        disableClose: true,
        data: data
      });
      this.dialogRef.close(null)
    }
  }
  confirmPackables() {
    if (this.remotePackableIds.length > 0) {
      let remotePackables = this.storeSelector.getRemotePackablesWithMetaData(this.remotePackableIds)
      let completePackables = this.pacFac.makeCompleteFromArray(remotePackables)
      this.collection.packables = completePackables
    }
    this.nextStep()

  }
  confirmProfiles() {
    let originalCollection = this.colFac.completeToOriginal(this.collection)
    if (this.remotePackableIds.length > 0) {
      this.bulkActions.addMissingPackableIdsFromRemote(this.remotePackableIds)
    }
    this.store.dispatch(new collectionActions.updateOriginalCollections([originalCollection]))
    this.bulkActions.pushCompleteCollectionsToProfiles([this.collection], this.selectedProfiles)
    const profiles = this.profileGroup.filter(p => this.selectedProfiles.includes(p.id))
    this.onClose(this.collection, profiles);
  }
  nextStep() {
    this.step++
    this.stepSettings()
  }
  returnStep() {
    this.step--
    this.stepSettings()
  }
  stepSettings() {
    if (this.step == 1 || this.step == 3) {
      this.dialogRef.removePanelClass('dialog-tall')
    } else {
      this.dialogRef.addPanelClass('dialog-tall')
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
