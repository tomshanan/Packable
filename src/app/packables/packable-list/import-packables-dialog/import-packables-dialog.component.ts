import { Component, OnInit, Inject } from '@angular/core';
import { filterItem, filterItemLocality } from '@app/shared-comps/item-selector/item-selector.component';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PackableComplete, PackablePrivate, PackableOriginal } from '../../../shared/models/packable.model';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { ContextService } from '../../../shared/services/context.service';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';
import { Profile } from '../../../shared/models/profile.model';
import { Store } from '@ngrx/store';
import * as packableActions from '@app/packables/store/packables.actions';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { setPackableState } from '../../store/packables.actions';
import { transitionTrigger } from '../../../shared/animations';
import { CollectionProfile } from '../edit-packable-dialog/choose-collections-dialog/choose-collections-dialog.component';
import { importPackables_selection } from './import-packables-selector/import-packables-selector.component';
import { timeStamp } from '../../../shared/global-functions';
import { CollectionFactory } from '@app/shared/factories/collection.factory';

export interface importPackables_data {
  header: string,
  usedPackables: PackableComplete[]
}
export interface importPackables_result {
  packables: PackableComplete[],
  selectedProfiles: string[]
}

@Component({
  selector: 'app-import-packables-dialog',
  templateUrl: './import-packables-dialog.component.html',
  styleUrls: ['../../../shared/css/dialog.css','./import-packables-dialog.component.css'],
  animations: [transitionTrigger],
})
export class ImportPackablesDialogComponent implements OnInit {
  collection: CollectionComplete;
  step: number = 1;
  header: string;
  collectionName: string;
  selectedRemotePackables: PackableOriginal[] = [];
  selectedOriginalPackables: PackableOriginal[];
  profileGroup: Profile[];
  selectedProfiles: string[] = []

  constructor(
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>,
    private pacFac: PackableFactory,
    private colFac: CollectionFactory,
    private context: ContextService,
    private bulkActions: BulkActionsService,
    @Inject(MAT_DIALOG_DATA) public data: importPackables_data,
    public dialogRef: MatDialogRef<ImportPackablesDialogComponent>,
  ) {
    this.header = this.data.header || 'Add Packables'
    if (!!this.context.collectionId) {
      this.collection = context.getCollection();
      this.collectionName = this.collection.name
    }

  }

  ngOnInit() {
    if (this.context.collectionId) {
      this.profileGroup = this.storeSelector.getProfilesWithCollectionId(this.context.collectionId)
      if (this.context.profileId) {
        this.selectedProfiles = [this.context.profileId]
      }
    }
    this.dialogRef.addPanelClass('dialog-full-height')

  }

  confirmPackables(e: importPackables_selection) {
    if (this.step == 1) {
      this.selectedRemotePackables = e.remoteItems
      if (this.collection) {
        this.selectedOriginalPackables = [...e.localItems, ...e.remoteItems]
        this.step++
        if(this.profileGroup.length < 2){
          this.confirmProfiles()
        } else {
          this.dialogRef.removePanelClass('dialog-full-height')
          this.dialogRef.addPanelClass('dialog-form')
        }
      } else {
        this.storeRemotePackables()
        let completeRemote = this.pacFac.makeCompleteFromArray(this.selectedRemotePackables)
        this.onClose({ packables: completeRemote, selectedProfiles: [] }) // send new remotePackables to onClose
      }
    }
  }

  confirmProfiles() {
    if (this.step == 2 && this.profilesValid()) {
      this.storeRemotePackables()
      if(this.selectedProfiles.length>0){
        let CPs = this.selectedProfiles.map(pId => {
          return { pId: pId, cId: this.collection.id }
        })
        this.bulkActions.pushOriginalPackablesByCP(this.selectedOriginalPackables, CPs)
      }
       if(!this.context.profileId){
        let privatePackables = this.selectedOriginalPackables.map(p => this.pacFac.makePrivate(p)) 
        console.log('IMPORT PACKABLES -> COMFIRM PROFILES -> new private packables')
        let collection = this.storeSelector.getCollectionById(this.collection.id)
        collection = this.colFac.addEditPackables(collection,privatePackables)
        collection.dateModified = timeStamp()
        this.store.dispatch(new collectionActions.updateOriginalCollections([collection]))
      }
      let completePackables = this.pacFac.makeCompleteFromArray(this.selectedOriginalPackables)
      this.onClose({ packables: completePackables, selectedProfiles: this.selectedProfiles })
    }
  }

  storeRemotePackables() {
    this.selectedRemotePackables.forEach(p => {
      p.dateModified = timeStamp()
    })
    this.store.dispatch(new packableActions.updateOriginalPackables(this.selectedRemotePackables))
  }

  onClose(result: importPackables_result) {
    this.dialogRef.close(result)
  }
  profilesValid(): boolean {
    return this.selectedProfiles.length > 0 || !this.context.profileId
  }

}
