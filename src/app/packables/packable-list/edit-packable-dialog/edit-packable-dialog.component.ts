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
    this.packable = Object.assign(new PackableComplete(), data.pakable)
    this.isNew = data.isNew || false;
    this.editName = this.isNew || (!this.context.collectionId && this.packable.userCreated) || false;
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

  onConfirmPackable(data: {
    packable: PackableComplete,
    selectedProfiles: string[]
  }) {
    this.packable = data.packable;
    this.packable.dateModified = timeStamp()
    this.selectedProfiles = data.selectedProfiles;
    // save original packable
    this.newPackable = new PackableOriginal(
      this.packable.id,
      this.packable.name,
      this.packable.quantityRules.slice(),
      this.wFactory.deepCopy(this.packable.weatherRules),
      this.isNew || this.packable.userCreated,
      this.packable.dateModified,
      this.packable.deleted
    )
    if(this.isNew || !this.collectionId){
      // update original packable if no collection id is set
      console.log('EDIT PACKABLE: updating original packable / registering new packable');
      this.store.dispatch(new packableActions.updateOriginalPackables([this.newPackable]))
    }
    if(this.collectionId && !this.context.profileId){
      // update original collection if no profile id is set
      console.log('EDIT PACKABLE: updating original collection');
      this.bulkActions.pushOriginalPackablesByCP([this.newPackable],[{pId:null,cId:this.collectionId}])
    }
    if (this.collectionId && this.selectedProfiles.length > 0) {
      // UPDATE SELECTED PROFILES WITH NEW PRIVATE PACKABLE
      console.log('EDIT PACKABLE: updating selected profiles');
      let CPs: CollectionProfile[] = []
      this.selectedProfiles.forEach((pId) => {
        CPs.push({pId: pId,cId: this.collectionId})
      })
      this.bulkActions.pushOriginalPackablesByCP([this.newPackable],CPs)
      this.onClose(this.packable);
    } else if (!this.collectionId && !this.context.profileId && this.storeSelector.profiles.some(p=>p.collections.length>0)){
      this.step = 2;
    } else {
      this.onClose(this.newPackable)
    }
  }
  onConfirmCollections(confirm: CollectionSelectorConfirmEvent) {
    this.bulkActions.pushOriginalPackablesByCP([this.newPackable],confirm.selectedIds)
    this.onClose(this.packable);
  }
  onClose(packable:PackableComplete) {
    this.dialogRef.close(packable ? packable : null);
  }
}
