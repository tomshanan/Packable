import { Component, OnInit, Inject } from '@angular/core';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { NameInputChangeEvent } from '../../../shared-comps/name-input/name-input.component';
import { ContextService } from '../../../shared/services/context.service';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';
import { CollectionFactory } from '../../../shared/factories/collection.factory';
import { MAT_DIALOG_DATA, MatDialogRef, MatSlideToggleChange } from '@angular/material';
import { Profile } from '@app/shared/models/profile.model';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { timeStamp } from '@app/shared/global-functions';

export interface editCollectionDialog_data {
  collection: CollectionComplete,
  profileGroup: Profile[]
}

@Component({
  selector: 'edit-collection-dialog',
  templateUrl: './edit-collection-dialog.component.html',
  styleUrls: ['./edit-collection-dialog.component.css']
})
export class EditCollectionDialogComponent implements OnInit {
  profileId: string;
  collection: CollectionComplete;
  usedNames: string[]
  nameValid: boolean = true
  showProfileSelector: boolean;
  profileGroup: Profile[]
  selectedProfiles: string[] = []

  formValid(): boolean{
    return this.nameValid
  }
  constructor(
    private storeSelector: StoreSelectorService,
    private context:ContextService,
    private bulkActions: BulkActionsService,
    private colFac: CollectionFactory,
    @Inject(MAT_DIALOG_DATA) public data:editCollectionDialog_data,
    public dialogRef: MatDialogRef<EditCollectionDialogComponent>,
    private store: Store<fromApp.appState>,

  ) { 
    this.profileId = this.context.profileId
    this.collection = this.data.collection
    this.showProfileSelector = this.data.profileGroup ? this.data.profileGroup.length > 0 : false;
    this.profileGroup = this.data.profileGroup
    if(this.profileId){
      this.selectedProfiles = [this.profileId]
    }
    console.log(`EDIT COL DIALOG:`,'data',data);
    this.dialogRef.addPanelClass('dialog-form')
  }

  ngOnInit() {
    this.usedNames = this.storeSelector.originalCollections.map(c=>c.name)
  }
  getUsedNames():string[]{
    return this.storeSelector.getUsedCollectionNames()
  }
  changeNameEvent(e:NameInputChangeEvent){
    this.nameValid = e.valid
    if(e.valid){
      this.collection.name = e.value
    } else {
      console.log('Collection Name invalid', e);
    }
  }
  toggleEssential(e:MatSlideToggleChange){
    this.collection.essential = e.checked
  }
  onConfirm(){
    if(this.formValid){
      this.collection.dateModified = timeStamp()
      if(!this.profileId){
        let originalCollection = this.storeSelector.getCollectionById(this.collection.id)
        originalCollection.weatherRules = this.collection.weatherRules
        if(originalCollection.userCreated){
          originalCollection.name = this.collection.name
        } 
        if(this.storeSelector.isLibraryStore){
          originalCollection.locations = this.collection.locations
        }
        originalCollection.dateModified = this.collection.dateModified
        this.store.dispatch(new collectionActions.updateOriginalCollections([originalCollection]))
      } 
      if(this.selectedProfiles.length>0){
        this.bulkActions.pushCollectionsToProfiles([this.collection],this.selectedProfiles)
      }
      this.onClose(this.collection)
    } else {
      console.warn('Could not save collection - form is invalid');
    }
  }
  onClose(collection:CollectionComplete){
    this.dialogRef.close(collection)
  }
}
