import { Component, OnInit, Inject } from '@angular/core';
import { PackableComplete, PackableOriginal } from '@shared/models/packable.model';
import { Profile } from '@app/shared/models/profile.model';
import { CollectionComplete, CollectionOriginal } from '../../../shared/models/collection.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { isPackableOriginal } from '../../../shared/models/packable.model';
import { CollectionFactory } from '@shared/factories/collection.factory';
import { ProfileFactory } from '../../../shared/factories/profile.factory';
import { CollectionProfile, CollectionSelectorConfirmEvent } from './choose-collections-dialog/choose-collections-dialog.component';
import { weatherFactory } from '@factories/weather.factory';
import { Store } from '@ngrx/store';
import * as packableActions from '@app/packables/store/packables.actions';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { WindowService } from '../../../shared/services/window.service';
import { expandAndFadeTrigger, transitionTrigger } from '../../../shared/animations';
import { indexOfId, timeStamp } from '../../../shared/global-functions';
import { ContextService } from '../../../shared/services/context.service';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';

export interface DialogData_EditPackable {
  pakable?: PackableComplete,
  isNew?: boolean
}
@Component({
  selector: 'app-edit-packable-dialog',
  templateUrl: './edit-packable-dialog.component.html',
  styleUrls: ['./edit-packable-dialog.component.css'],
  animations: [transitionTrigger]
})
export class EditPackableDialogComponent implements OnInit {
  /*
   RECEIVE PACKABLE-COMPLETE
   SEND BACK UPDATED PACKABLE COMPLETE

  */


  packable: PackableComplete;
  newPackable: PackableOriginal;
  profileGroup: Profile[];
  selectedProfiles: string[];
  CollectionProfileGroup: CollectionProfile[];
  collectionAction: 'ADD' | 'UPDATE';
  selectedCollections: CollectionProfile[] = [];
  collectionId: string;
  collectionName: string;
  isNew: boolean;
  editName: boolean;
  step: number = 1;

  constructor(
    private storeSelector: StoreSelectorService,
    private proFac: ProfileFactory,
    private pacFac: PackableFactory,
    private colFac: CollectionFactory,
    @Inject(MAT_DIALOG_DATA) public data: DialogData_EditPackable,
    public dialogRef: MatDialogRef<EditPackableDialogComponent>,
    private wFactory: weatherFactory,
    private store: Store<fromApp.appState>,
    public windowService: WindowService,
    private context: ContextService,
    private bulkActions: BulkActionsService
  ) {
    this.packable = data.pakable || new PackableComplete();
    this.isNew = data.isNew || false;
    this.editName = this.isNew || this.packable.userCreated || false;
  }


  ngOnInit() {
    this.updateWidth()
    this.windowService.change.subscribe(width => {
      this.updateWidth()
    })
    this.selectedProfiles = !!this.context.profileId ? [this.context.profileId] : [];
    this.collectionId = this.context.collectionId || null;
    if(this.collectionId){
      if(this.isNew){
        this.profileGroup = this.storeSelector.getProfilesWithCollectionId(this.collectionId)
      } else {
        this.profileGroup = this.storeSelector.getProfilesWithCollectionAndPackable(this.collectionId, this.packable.id)
      }
    } else {
      this.profileGroup = this.storeSelector.getProfilesWithPackableId(this.packable.id)
    }
    this.collectionName = this.collectionId ? this.storeSelector.getCollectionById(this.collectionId).name : null;
  }

  updateWidth() {
    this.dialogRef.updateSize(this.windowService.max('xs') ? '99vw' : '500px')
  }
  onClose(packable?:PackableComplete) {
    this.dialogRef.close(packable ? [packable] : null);
  }
  onConfirmPackable(data: {
    packable: PackableComplete,
    selectedProfiles: string[]
  }) {
    this.packable = data.packable;
    this.selectedProfiles = data.selectedProfiles;
    // save original packable
    this.newPackable = new PackableOriginal(
      this.packable.id,
      this.packable.name,
      this.packable.quantityRules.slice(),
      this.wFactory.deepCopy(this.packable.weatherRules),
      this.isNew || this.packable.userCreated,
      timeStamp()
    )
    
    this.store.dispatch(new packableActions.updateOriginalPackables([this.newPackable]))
    
    if (this.collectionId && this.selectedProfiles.length > 0) {
      // UPDATE SELECTED PROFILES WITH NEW PRIVATE PACKABLE
      let profiles = this.storeSelector.profiles
      let CPs: CollectionProfile[] = []
      this.selectedProfiles.forEach((pId) => {
        CPs.push({pId: pId,cId: this.collectionId})
      })
      this.bulkActions.pushOriginalPackablesByCP([this.newPackable.id],CPs)
      this.onClose(this.packable);
    } else {
      this.step = 2;
    }
  }
  onConfirmCollections(confirm: CollectionSelectorConfirmEvent) {
    this.bulkActions.pushOriginalPackablesByCP([this.newPackable.id],confirm.selectedIds)
    this.onClose(this.packable);
  }
}
