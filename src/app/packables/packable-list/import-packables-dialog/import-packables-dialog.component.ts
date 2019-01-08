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
  completeList: filterItem[] = [];
  usedList: filterItem[] = [];
  selected: filterItem[] = [];
  selectedRemotePackables: PackableOriginal[] = [];
  header: string;
  collectionName: string;
  collection: CollectionComplete;
  step:number = 1;
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
    // ONCE WE HAVE REMOTE PACKABLES, ADD:
    // let remotePackables = this.storeSelector.remotePackables
    // let remoteList = this.createFilterObject(remotePackables,'remote')
    let originalPackables= this.storeSelector.originalPackables
    let storeList = this.createFilterObject(originalPackables,'local')
    this.completeList = [...storeList] // <--- add remoteList to completeList
    this.usedList = this.createFilterObject(this.data.usedPackables, 'local')
  }
  updateSelected(filterItems:filterItem[]){
    this.selected = filterItems;
    console.log(`selected:\n`+filterItems.map(x=>x.name).join(', '));
  }

  createFilterObject(inputObjects:{id:string,name:string}[],locality:filterItemLocality):filterItem[]{
    return inputObjects.map((obj) => {
      return {
        id: obj.id,
        name: obj.name,
        type: !!obj['userCreated'] ? 'user' : locality
      }
    })
  }

  onConfirm(){
    if(this.step == 1){
      this.storeRemotePackables()
      if(this.collection){
        let localPackableIDs = this.selected.filter(x=> x.type == 'local').map(x=>x.id)
        this.selectedOriginalPackables = this.storeSelector.getPackablesByIds(localPackableIDs)
        this.selectedOriginalPackables.unshift(...this.selectedRemotePackables)
        this.step++
      } else {
        this.onClose(this.selectedRemotePackables) // send new remotePackables to onClose
      }
    } else if (this.step == 2 && this.profilesValid()){
      let CPs = this.selectedProfiles.map(pId => {
        return {pId: pId, cId: this.collection.id}
      })
      this.bulkActions.pushOriginalPackablesByCP(this.selectedOriginalPackables,CPs)
      let completePackables = this.pacFac.makeCompleteFromArray(this.selectedOriginalPackables)
      this.onClose(completePackables, CPs)
    }
  }
  storeRemotePackables(){
    // ONCE WE HAVE REMOTE PACKABLES, ADD:
      // let remotePackableIDs = this.selected.filter(x=> x.type == 'remote').map(x=>x.id)
      // this.selectedRemotePackables = this.storeSelector.getRemotePackablesByIds(remotePackableIDs)
      // let packables = this.storeSelector.originalPackables
      // packables.unshift(...selectedRemotePackables)
      // this.store.dispatch(new packableActions.setPackableState(packables))
  }

  onClose(packables:PackableComplete[] = [], CPs:CollectionProfile[] = []){
    this.dialogRef.close({packables: packables, CPs: CPs})
  }
  profilesValid():boolean{
    return this.selectedProfiles.length>0
  }

}
