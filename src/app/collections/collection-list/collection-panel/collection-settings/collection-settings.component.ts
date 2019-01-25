import { Component, OnInit, EventEmitter, Input, Output, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { WeatherRule } from '../../../../shared/models/weather.model';
import { MatSlideToggleChange, MatDialog } from '@angular/material';
import { ContextService } from '@app/shared/services/context.service';
import { BulkActionsService } from '../../../../shared/services/bulk-actions.service';
import { ChooseProfileDialogComponent, DialogData_ChooseProfiles } from '../choose-profile-dialog/choose-profile-dialog.component';
import { ProfileFactory } from '../../../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../../../shared/services/store-selector.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-collection-settings',
  templateUrl: './collection-settings.component.html',
  styleUrls: ['./collection-settings.component.css']
})
export class CollectionSettingsComponent implements OnInit, OnChanges, OnDestroy {
/**
 * RECEIVES COLLECTION and PROFILE-ID
 * MUTATES COLLECTION:
 *    > Essential collection  -> Emit Updated Collection
 *    > Limit Temp            -> Emit Updated Collection
 *    > LImit Weather         -> Emit Updated Collection
 * 
 * SEND COLLECTIO TO BULK ACTIONS:
 *    > Apply Collection to Travelers  -> Modal select Profiles -> Bulk Actions
 *    > Remove Collection              -> Modal select Profiles -> Bulk Actions
 *        > emit remove event
 * 
 */
  @Input('collection') inputCollection: CollectionComplete;
  collection: CollectionComplete;
  @Input('profileId') inputProfileId: string;
  profileId: string;
  @Output() collectionChange = new EventEmitter<CollectionComplete>()
  @Output() remove = new EventEmitter<void>()

  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  dialogData;
  subscription: Subscription;

  constructor(
    private context:ContextService,
    private bulkActions: BulkActionsService,
    public dialog: MatDialog,
    private proFac: ProfileFactory,
    private storeSelector: StoreSelectorService,
  ) { }
  ngOnInit(){
    this.collection = this.inputCollection
    this.profileId = this.inputProfileId
    if(this.inputProfileId === null && this.context.profileId){
      this.inputProfileId = this.context.profileId
    }
    this.updateDialogData()
    this.subscription = this.context.changes.subscribe(newcontext=>{
      this.inputCollection = this.context.getCollection()
      this.inputProfileId = this.context.profileId
      this.updateCollection();
    })
  }
  ngOnDestroy(){
    this.subscription.unsubscribe()
  }
  updateCollection(){
    if (this.inputCollection && this.inputProfileId){
      if(this.collection.id != this.inputCollection.id || this.profileId != this.inputProfileId){
        this.collection = this.inputCollection
        this.profileId = this.inputProfileId;
        console.log(`collection settings for "${this.collection.name}" has loaded/changed:`, this.collection);
        this.updateDialogData()
      }
    }
  }
  updateDialogData(){
    this.dialogData = {
      collection: this.inputCollection,
      profileGroup: this.storeSelector.getProfilesWithCollectionId(this.collection.id),
      selectedProfiles: [this.profileId]
    }
  }
  ngOnChanges(changes:SimpleChanges) {
    if(changes['collection']){
      this.updateCollection();
      
    }
    
  }

  emitUpdate(){
    console.log('sending collection to be updated:\n',this.collection);
    this.collectionChange.emit(this.collection)
  }

  toggleEssential(e?:MatSlideToggleChange){
    console.log('toggle event:',e);
    if(e!=null){
      this.collection.essential = e.checked
    } else {
      this.collection.essential = !this.collection.essential;
    }
    this.emitUpdate();
  }

  applyCollection(){
    let usedProfiles = this.storeSelector.getProfilesWithCollectionId(this.collection.id)
    let data:DialogData_ChooseProfiles = {
      ...this.dialogData,
      header: `Select Profiles`,
      content: `<small>This will override existing Collections (including all Packables and settings)</small>`,
      super: `Apply Changes To Travelers`,
      profileGroup: usedProfiles,

    }
    let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        this.bulkActions.pushCollectionsToProfiles([this.inputCollection],profileIds)
        this.emitUpdate();
      }
    })
  }
  addCollection(){
    let usedProfiles = this.storeSelector.getProfilesWithCollectionId(this.collection.id)
    let data:DialogData_ChooseProfiles = {
      ...this.dialogData,
      header: `Select Profiles`,
      content: `<small>Select the profiles you would like to add this Collection to.</small>`,
      super: `Applying Collection To Travelers`,
      // profileGroup - get only the profiles that do not use this collection
      profileGroup: this.storeSelector.profiles.removeIds(usedProfiles)

    }
    let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        this.bulkActions.pushCollectionsToProfiles([this.inputCollection],profileIds)
        this.emitUpdate();
      }
    })
  }
  removeCollection(){
    let data:DialogData_ChooseProfiles = {
      ...this.dialogData,
      header: `Select Profiles`,
      content: `Please select the profiles you would like to remove this Collection from`,
      super: `Deleting Collection`
    }
    let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        this.bulkActions.removeCollectionsFromProfiles([this.inputCollection.id],profileIds)
        this.remove.emit()
      }
    })
  }

}
