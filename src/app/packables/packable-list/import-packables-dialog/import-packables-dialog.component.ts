import { Component, OnInit, Inject } from '@angular/core';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PackableComplete, PackablePrivate, PackableOriginal } from '../../../shared/models/packable.model';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { ContextService } from '../../../shared/services/context.service';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';
import { Profile } from '../../../shared/models/profile.model';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import { transitionTrigger } from '../../../shared/animations';
import { CollectionFactory } from '@app/shared/factories/collection.factory';
import { WindowService } from '../../../shared/services/window.service';
import { isDefined } from '../../../shared/global-functions';

export interface importPackables_data {
  header: string,
  usedPackables: PackableComplete[],
  selected?:string[]
}
export interface importPackables_result {
  packables: string[],
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
  selectedIds:string[] = []
  profileGroup: Profile[];
  selectedProfiles: string[] = []

  constructor(
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>,
    private pacFac: PackableFactory,
    private colFac: CollectionFactory,
    private context: ContextService,
    private bulkActions: BulkActionsService,
    public windowService: WindowService,
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
      } else {
        this.selectedProfiles = this.profileGroup.ids()
      }
    }
    console.log( `imported-packable-diaglog selected:`,this.data.selected)
    if(isDefined(this.data.selected)){
      this.onUpdateSelected(this.data.selected)
      this.onConfirm()
    } else {
      this.dialogRef.addPanelClass('dialog-tall')
    }
  }
  onUpdateSelected(selected:string[]){
    this.selectedIds = selected;
  }
  valid():boolean{
    switch(this.step){
      case 1:
          return this.selectedIds.length>0
      case 2:
          return this.profilesValid()
      default:
        return false;
    }
  }
  onConfirm(){
    switch(this.step){
      case 1:
          this.dialogRef.removePanelClass('dialog-tall')
          this.confirmPackables() 
        break;
      case 2:
          this.confirmProfiles()
        break;
    }
  }
  updatePackabels(){

  }
  confirmPackables() {
    if (this.step == 1) {
      if (this.collection) {
        this.step++
        /*  if profile group is empty, or if we are working inside a profile,
            then skip profile selection*/
        if(this.profileGroup.length === 0 || (this.context.profileId && this.profileGroup.length < 2)){
          this.confirmProfiles()
        } 
      } else {
        this.bulkActions.addMissingPackableIdsFromRemote(this.selectedIds)
        this.onClose({ packables: this.selectedIds, selectedProfiles: [] }) // send new remotePackables to onClose
      }
    }
  }
  
  confirmProfiles() {
    if (this.step == 2 && this.profilesValid()) {
      let local = this.storeSelector.originalPackables.filter(p => this.selectedIds.includes(p.id))
      let remote = this.bulkActions.addMissingPackableIdsFromRemote(this.selectedIds)
      let all = [...local,...remote]
      let CPs:{pId: string,cId: string}[] = []
      if(this.selectedProfiles.length>0){
        this.selectedProfiles.forEach(pId => {
          CPs.push({ pId: pId, cId: this.collection.id }) 
        })
      }
       if(!this.context.profileId){
        CPs.push({ pId: null, cId: this.collection.id }) 
      }
      this.bulkActions.pushOriginalPackablesByCP(all, CPs)
      this.onClose({ packables: this.selectedIds, selectedProfiles: this.selectedProfiles })
    }
  }


  onClose(result: importPackables_result) {
    this.dialogRef.close(result)
  }
  profilesValid(): boolean {
    return this.selectedProfiles.length > 0 || !this.context.profileId
  }

}
