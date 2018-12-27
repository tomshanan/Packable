import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { WeatherRule } from '../../../../shared/models/weather.model';
import { MatSlideToggleChange, MatDialog } from '@angular/material';
import { ContextService } from '@app/shared/services/context.service';
import { BulkActionsService } from '../../../../shared/services/bulk-actions.service';
import { ChooseProfileDialogComponent, DialogData_ChooseProfiles } from '../choose-profile-dialog/choose-profile-dialog.component';
import { ProfileFactory } from '../../../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../../../shared/services/store-selector.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-collection-settings',
  templateUrl: './collection-settings.component.html',
  styleUrls: ['./collection-settings.component.css']
})
export class CollectionSettingsComponent implements OnInit {
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
  @Input() collection: CollectionComplete = new CollectionComplete();
  @Input() profileId: string;
  @Output() collectionChange = new EventEmitter<CollectionComplete>()
  @Output() remove = new EventEmitter<void>()

  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  dialogData;

  constructor(
    private context:ContextService,
    private bulkActions: BulkActionsService,
    public dialog: MatDialog,
    private proFac: ProfileFactory,
    private storeSelector: StoreSelectorService,
  ) { }

  ngOnInit() {
    if(this.profileId === null && this.context.profileId){
      this.profileId = this.context.profileId
    }
    this.dialogData = {
      collection: this.collection,
      profileGroup: this.storeSelector.getProfilesWithCollectionId(this.collection.id),
      selectedProfiles: [this.context.profileId]
    }
  }

  emitUpdate(){
    console.log(this.collection);
    this.collectionChange.emit(this.collection)
  }

  toggleEssential(e?:MatSlideToggleChange){
    if(e){
      this.collection.essential = e.checked
    } else {
      this.collection.essential = !this.collection.essential;
    }
    this.emitUpdate();
  }

  applyCollection(){

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
        this.bulkActions.removeCollectionsFromProfiles([this.collection.id],profileIds)
        this.remove.emit()
      }
    })
  }
}
