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

@Component({
  selector: 'app-new-collection-dialog',
  templateUrl: './new-collection-dialog.component.html',
  styleUrls: ['./new-collection-dialog.component.css'],
  animations: [transitionTrigger]
})
export class NewCollectionDialogComponent implements OnInit {
  collectionName: string;
  collectionNameInput: FormControl;
  collection:CollectionComplete;
  usedCollectionNames: string[];

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
    this.collectionNameInput = new FormControl('',[
      Validators.required, 
      Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), 
      this.validate_usedName.bind(this)
    ])
    this.collection = new CollectionComplete(Guid.newGuid());
    this.collection.userCreated = true;
    this.profileGroup = this.storeSelector.profiles
    if(this.context.profileId){
      this.selectedProfiles=[this.context.profileId]
    }
  }


  onClose(collection: CollectionComplete = null) {
    this.dialogRef.close(collection)
  }
  confirmName(){
    if(this.collectionNameInput.valid){
      this.collection.name = this.collectionName = this.collectionNameInput.value;
      this.step++
    }
  }
  confirmPackables(e:importPackables_selection){
    this.remotePackables = e.remoteItems
    let compeletePackables = this.pacFac.makeCompleteFromArray([...e.remoteItems,...e.localItems])
    this.collection.packables = compeletePackables
    this.step++
  }
  confirmProfiles(){
    let originalCollection = this.colFac.completeToOriginal(this.collection)
    this.store.dispatch(new collectionActions.addOriginalCollection(originalCollection))
    this.bulkActions.pushCollectionsToProfiles([this.collection], this.selectedProfiles)
    this.onClose(this.collection);
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
