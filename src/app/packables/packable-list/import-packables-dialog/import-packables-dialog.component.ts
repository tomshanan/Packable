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

export interface importPackables_data {
  header:string,
  usedPackables: PackableComplete[]
}
export interface importPackables_result {
  packables: PackableComplete[],
  CPs: CollectionProfile[]
}

@Component({
  selector: 'app-import-packables-dialog',
  templateUrl: './import-packables-dialog.component.html',
  styleUrls: ['./import-packables-dialog.component.css'],
  animations: [transitionTrigger],
})
export class ImportPackablesDialogComponent implements OnInit {
  collection: CollectionComplete;
  step:number = 1;
  header: string;
  collectionName: string;
  selectedRemotePackables: PackableOriginal[] = [];
  selectedOriginalPackables: PackableOriginal[];
  profileGroup: Profile[];
  selectedProfiles:string[] = []

  constructor(
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>,
    private pacFac:PackableFactory,
    private context:ContextService,
    private bulkActions: BulkActionsService,
    @Inject(MAT_DIALOG_DATA) public data:importPackables_data,
    public dialogRef: MatDialogRef<ImportPackablesDialogComponent>,
  ) { 
    this.header = this.data.header || 'Add Packables'
    if(!!context.collectionId){
      this.collection = context.getCollection();
      this.collectionName = this.collection.name
    }
    
  }

  ngOnInit() {
    if(this.context.collectionId){
      this.profileGroup = this.storeSelector.getProfilesWithCollectionId(this.context.collectionId)
      if(this.context.profileId){
        this.selectedProfiles= [this.context.profileId]
      }
    }
    
  }

  confirmPackables(e:importPackables_selection){
    if(this.step == 1){ 
      this.selectedRemotePackables = e.remoteItems
      this.storeRemotePackables()
      if(this.collection){
        this.selectedOriginalPackables = [...e.localItems,...e.remoteItems]
        this.step++
      } else {
        let completeRemote = this.pacFac.makeCompleteFromArray(this.selectedRemotePackables)
        this.onClose(completeRemote) // send new remotePackables to onClose
      }
    }
  }

  confirmProfiles(){
     if (this.step == 2 && this.profilesValid()){
      let CPs = this.selectedProfiles.map(pId => {
        return {pId: pId, cId: this.collection.id}
      })
      this.bulkActions.pushOriginalPackablesByCP(this.selectedOriginalPackables.map(p=>p.id),CPs)
      let completePackables = this.pacFac.makeCompleteFromArray(this.selectedOriginalPackables)
      this.onClose(completePackables, CPs)
    }
  }
  storeRemotePackables(){
    // ONCE WE HAVE REMOTE PACKABLES, ADD:
      // let packables = this.storeSelector.originalPackables
      // packables.unshift(...this.selectedRemotePackables)
      // this.store.dispatch(new packableActions.setPackableState(packables))
  }

  onClose(packables:PackableComplete[] = [], CPs:CollectionProfile[] = []){
    this.dialogRef.close({packables: packables, CPs: CPs})
  }
  profilesValid():boolean{
    return this.selectedProfiles.length>0
  }

}
