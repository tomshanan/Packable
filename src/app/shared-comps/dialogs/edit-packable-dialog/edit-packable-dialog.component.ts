import { Component, OnInit, Inject } from '@angular/core';
import { PackableComplete, PackableOriginal } from '@shared/models/packable.model';
import { Profile } from '@app/shared/models/profile.model';
import { CollectionComplete, CollectionOriginal } from '../../../shared/models/collection.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { isPackableOriginal } from '../../../shared/models/packable.model';
import { CollectionFactory } from '@shared/factories/collection.factory';
import { ProfileFactory } from '../../../shared/factories/profile.factory';
import { CollectionProfile } from '../choose-collections-dialog/choose-collections-dialog.component';
import { weatherFactory } from '@factories/weather.factory';
import { Store } from '@ngrx/store';
import * as packableActions from '@app/packables/store/packables.actions';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { WindowService } from '../../../shared/services/window.service';
import { expandAndFadeTrigger } from '../../../shared/animations';

export interface DialogData_EditPackable {
  pakable?: PackableComplete,
  profileGroup?: Profile[],
  selectedProfiles?: Profile[],
  collection?: CollectionComplete,
  isNew?: boolean
}
@Component({
  selector: 'app-edit-packable-dialog',
  templateUrl: './edit-packable-dialog.component.html',
  styleUrls: ['./edit-packable-dialog.component.css']
})
export class EditPackableDialogComponent implements OnInit {
  packable: PackableComplete;
  newPackable: PackableOriginal;
  profileGroup: Profile[];
  selectedProfiles: Profile[];
  CollectionProfileGroup: CollectionProfile[];
  collectionAction: 'ADD' | 'UPDATE';
  selectedCollections: CollectionProfile[] = [];
  collection: CollectionComplete;
  isNew: boolean;
  editName: boolean;
  step: number = 1;

  constructor(
    private storeSelector: StoreSelectorService,
    private proFac: ProfileFactory,
    private pacFac: PackableFactory,
    private wFactory: weatherFactory,
    @Inject(MAT_DIALOG_DATA) public data: DialogData_EditPackable,
    public dialogRef: MatDialogRef<EditPackableDialogComponent>,
    private store: Store<fromApp.appState>,
    private windowService: WindowService
  ) {
    this.packable = data.pakable || new PackableComplete();
    this.profileGroup = data.profileGroup || [];
    this.selectedProfiles = data.selectedProfiles || [];
    this.collection = data.collection || null;
    this.isNew = data.isNew || false;
    this.editName = this.isNew || this.packable.userCreated || false;

    let profiles = this.storeSelector.profiles;
    let filteredProfileGroup = !this.isNew ? this.storeSelector.getProfilesWithPackableId(this.packable.id) : [];
    if (this.isNew || filteredProfileGroup.length == 0) {
      this.CollectionProfileGroup = this.wrapToCollectionProfileGroup(profiles)
      this.collectionAction = 'ADD'
    } else {
      this.CollectionProfileGroup = this.wrapToCollectionProfileGroup(filteredProfileGroup, this.packable.id)
      this.collectionAction = 'UPDATE'
    }
  }

  wrapToCollectionProfileGroup(profiles: Profile[], packableId: string = null): CollectionProfile[] {
    let collectionProfileGroup: CollectionProfile[] = []
    profiles.forEach(p => {
      p.collections.forEach(c => {
        if (!packableId || c.packables.some(Packable => Packable.id == packableId)) {
          collectionProfileGroup.push({ cId: c.id, pId: p.id })
        } 
      })
    })
    return collectionProfileGroup
  }

  ngOnInit() {
    this.updateWidth()
    this.windowService.change.subscribe(width=>{
      this.updateWidth()
    })
  }
  updateWidth(){
    this.dialogRef.updateSize( this.windowService.max_xs ? '99vw' : '500px')
  }
  onClose() {
    this.dialogRef.close();
  }
  onConfirmPackable(data: {
    packable: PackableComplete,
    selectedProfiles: Profile[]
  }) {
    this.packable = data.packable;
    this.selectedProfiles = data.selectedProfiles;
    // save original packable
    this.newPackable = new PackableOriginal (
      this.packable.id,
      this.packable.name,
      this.packable.quantityRules.slice(),
      this.wFactory.deepCopy(this.packable.weatherRules),
      this.isNew || this.packable.userCreated
    )
    console.log('created new Original Packable:',this.newPackable)
    if(this.isNew){
      this.store.dispatch(new packableActions.addOriginalPackable(this.newPackable))
    } else {
      this.store.dispatch(new packableActions.editOriginalPackable(this.newPackable))
    }

    if (this.collection && this.selectedProfiles.length > 0) {
      // for each selected profile
      // find collection id
      // find packable id
      // replace packable
      // save profile to store
    } else {
      this.step = 2;
    }
  }
  onConfirmCollections(pcGroup: CollectionProfile[]) {
    console.log(pcGroup);
    let newPrivate = this.pacFac.makePrivate(this.newPackable);
    pcGroup.forEach(pc =>{
      let profile = this.storeSelector.getProfileById(pc.pId)
      let colIndex = profile.collections.findIndex(c=>c.id == pc.cId)
      if (this.isNew){
        profile.collections[colIndex].packables.push(newPrivate)
      } else {
        let pacIndex = profile.collections[colIndex].packables.findIndex(p=>p.id == this.packable.id)
        profile.collections[colIndex].packables.splice(pacIndex,1,newPrivate)
        this.store.dispatch(new profileActions.editProfile(profile))
      }
    })
    this.onClose();
  }
}
