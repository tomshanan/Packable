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
import { indexOfId } from '../../../shared/global-functions';

export interface DialogData_EditPackable {
  pakable?: PackableComplete,
  profileGroup?: Profile[],
  selectedProfiles?: string[],
  collectionId?: string,
  isNew?: boolean
}
@Component({
  selector: 'app-edit-packable-dialog',
  templateUrl: './edit-packable-dialog.component.html',
  styleUrls: ['./edit-packable-dialog.component.css'],
  animations: [transitionTrigger]
})
export class EditPackableDialogComponent implements OnInit {
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
    private wFactory: weatherFactory,
    @Inject(MAT_DIALOG_DATA) public data: DialogData_EditPackable,
    public dialogRef: MatDialogRef<EditPackableDialogComponent>,
    private store: Store<fromApp.appState>,
    private windowService: WindowService
  ) {
    this.packable = data.pakable || new PackableComplete();
    this.profileGroup = data.profileGroup || [];
    this.selectedProfiles = data.selectedProfiles || [];
    this.collectionId = data.collectionId || null;
    this.isNew = data.isNew || false;
    this.editName = this.isNew || this.packable.userCreated || false;
  }


  ngOnInit() {
    this.updateWidth()
    this.windowService.change.subscribe(width => {
      this.updateWidth()
    })
    this.collectionName = this.collectionId ? this.storeSelector.getCollectionById(this.collectionId).name : null;
  }

  updateWidth() {
    this.dialogRef.updateSize(this.windowService.max('xs') ? '99vw' : '500px')
  }
  onClose(id?:string) {
    this.dialogRef.close(id ? [id] : null);
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
      this.isNew || this.packable.userCreated
    )
    console.log('created new Original Packable:', this.newPackable)
    if (this.isNew) {
      this.store.dispatch(new packableActions.addOriginalPackable(this.newPackable))
    } else {
      this.store.dispatch(new packableActions.editOriginalPackable(this.newPackable))
    }

    if (this.collectionId && this.selectedProfiles.length > 0) {

      let privatePackable = this.pacFac.makePrivate(this.newPackable)
      // UPDATE EACH SELECTED PROFILE WITH NEW PRIVATE PACKABLE
      let profiles = this.storeSelector.profiles
      this.selectedProfiles.forEach((pId) => {
        let pIndex = indexOfId(profiles,pId);
        let colIndex = indexOfId(profiles[pIndex].collections, this.collectionId)
        if (colIndex != -1) {
          let packIndex = indexOfId(profiles[pIndex].collections[colIndex].packables, this.packable.id)
          if(packIndex == -1){
            profiles[pIndex].collections[colIndex].packables.splice(0,0,privatePackable)
          } else {
            profiles[pIndex].collections[colIndex].packables[packIndex] = privatePackable
          }
        } else {
          console.error(`The selected Profile ${profiles[pIndex].name} does not contain the selected Collection id: \n ${this.collectionId}`)
        }
      })
      this.store.dispatch(new profileActions.setProfileState(profiles))

      // UPDATE THE COLLECTION WITH NEW PRIVATE PACKABLE
      let originalCollection = this.storeSelector.getCollectionById(this.collectionId)
      originalCollection = this.colFac.addEditPackable(originalCollection,this.packable)
      this.store.dispatch(new collectionActions.editOriginalCollection(originalCollection))
      this.onClose(privatePackable.id);
    } else {
      this.step = 2;
    }
  }
  onConfirmCollections(confirm: CollectionSelectorConfirmEvent) {
    console.log(confirm);
    let newPrivate = this.pacFac.makePrivate(this.newPackable);
    let uniqueCollections: string[] = []
    let uniqueProfiles: string[] = []
    // UPDATE SELECTED PROFILES AND THEIR COLLECTIONS
    confirm.selectedIds.forEach(pc => {
      if (!uniqueCollections.includes(pc.cId)) {
        uniqueCollections.push(pc.cId)
      }
      if (!uniqueProfiles.includes(pc.pId)) {
        uniqueProfiles.push(pc.pId)
      }
    })
    let profiles = this.storeSelector.profiles;
    uniqueProfiles.forEach(pId => {
      let pIndex = indexOfId(profiles,pId);
      confirm.selectedIds.filter(cp => cp.pId == pId).forEach(cp => {
        let colIndex = profiles[pIndex].collections.findIndex(c => c.id == cp.cId)
        if (this.isNew && confirm.action == 'add') {
          profiles[pIndex].collections[colIndex].packables.splice(0, 0, newPrivate)
        } else {
          let pacIndex = profiles[pIndex].collections[colIndex].packables.findIndex(p => p.id == this.packable.id)
          profiles[pIndex].collections[colIndex].packables.splice(pacIndex, 1, newPrivate)
        }
      })
    })
    this.store.dispatch(new profileActions.setProfileState(profiles))

    let collections = this.storeSelector.originalCollections;
    uniqueCollections.forEach(cId => { // update original collections
      let colIndex = indexOfId(collections,cId)
      collections[colIndex] = this.colFac.addEditPackable(collections[colIndex],newPrivate)
    })
    this.store.dispatch(new collectionActions.setCollectionState(collections))
    this.onClose(newPrivate.id);
  }
}
