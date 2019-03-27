import { Component, OnInit, Inject } from '@angular/core';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';

import { isDefined, Guid } from '@shared/global-functions';
import { FormControl, Validators } from '@angular/forms';
import { CollectionComplete } from '@shared/models/collection.model';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { importPackables_selection } from '@app/packables/packable-list/import-packables-dialog/import-packables-selector/import-packables-selector.component';
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

@Component({
  selector: 'app-new-collection-dialog',
  templateUrl: './new-collection-dialog.component.html',
  styleUrls: ['../../../shared/css/dialog.css','./new-collection-dialog.component.css'],
  animations: [transitionTrigger]
})
export class NewCollectionDialogComponent implements OnInit {
  collectionName: string;
  collection:CollectionComplete;
  usedCollectionNames: string[];
  collectionNameValid: boolean = true;
  step: number = 1;
  remotePackables: PackableOriginal[];

  profileGroup: Profile[];
  selectedProfiles: string[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {},
    public dialogRef: MatDialogRef<NewCollectionDialogComponent>,
    private store: Store<fromApp.appState>,
    private bulkActions: BulkActionsService,
    private storeSelector: StoreSelectorService,
    private pacFac:PackableFactory,
    private proFac:ProfileFactory,
    private colFac:CollectionFactory,
    private context: ContextService,
  ) { }

  ngOnInit() {
    this.usedCollectionNames = this.storeSelector.getUsedCollectionNames()
    this.collectionName = ''
    this.collection = new CollectionComplete(Guid.newGuid());
    this.collection.userCreated = true;
    this.profileGroup = this.storeSelector.profiles
    if(this.context.profileId){
      this.selectedProfiles=[this.context.profileId]
    }
    this.stepSettings()
  }

  setName(e:NameInputChangeEvent){
    this.collectionNameValid = e.valid
    if(e.valid){
      this.collectionName = e.value
    }
  }
  onClose(collection: CollectionComplete = null) {
    this.dialogRef.close(collection)
  }
  confirmName(){
    if(this.collectionNameValid){
      this.collection.name = this.collectionName
      this.nextStep()
    }
  }
  confirmPackables(e:importPackables_selection){
    this.remotePackables = e.remoteItems
    let compeletePackables = this.pacFac.makeCompleteFromArray([...e.remoteItems,...e.localItems])
    this.collection.packables = compeletePackables
    this.nextStep()
    
  }
  confirmProfiles(){
    let originalCollection = this.colFac.completeToOriginal(this.collection)
    this.store.dispatch(new packableActions.addMissingPackables(this.remotePackables))
    this.store.dispatch(new collectionActions.updateOriginalCollections([originalCollection]))
    this.bulkActions.pushCollectionsToProfiles([this.collection], this.selectedProfiles)
    this.onClose(this.collection);
  }
  nextStep(){
    this.step++
    this.stepSettings()
  }
  returnStep(){
    this.step--
    this.stepSettings()
  }
  stepSettings(){
    if(this.step==1 || this.step==3){
      this.dialogRef.addPanelClass('dialog-form')
      this.dialogRef.removePanelClass('dialog-full-height')
    } else {
      this.dialogRef.addPanelClass('dialog-full-height')
      this.dialogRef.removePanelClass('dialog-form')
    }
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedCollectionNames.indexOf(input) > -1) {
      return { 'usedName': true };
    }
    return null;
  }

  profileSelect(select:'all'|'none'){
    if (select == 'all'){
      this.selectedProfiles = this.profileGroup.map(p=>p.id)
    } else {
      this.selectedProfiles = [];
    }
  }

  stepTitle():string{
    switch(this.step){
      case 1: return 'New Collection'; break;
      case 2: return 'Choose Packables'; break;
      case 3: return 'Add To Profiles'; break;
    }
  }

}
