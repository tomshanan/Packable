import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ListPackableComponent } from '../list-packable/list-packable.component';
import { PackingListPackable, PackingListSettings, listCollection } from '../../../shared/models/packing-list.model';
import { PackableComplete } from '../../../shared/models/packable.model';
import { EditPackableDialog_data, EditPackableDialogComponent, EditPackableDialog_result } from '../../../packables/packable-list/edit-packable-dialog/edit-packable-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ContextService } from '../../../shared/services/context.service';
import { ProfileFactory } from '../../../shared/factories/profile.factory';
import { ProfileComplete } from '../../../shared/models/profile.model';
import { Trip } from '../../../shared/models/trip.model';
import { take } from 'rxjs/operators';
import { PackingListService } from '../packing-list.service';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { Observable } from 'rxjs';
import { Guid, isDefined } from '../../../shared/global-functions';
import { editCollectionDialog_data } from '@app/collections/collection-list/edit-collection-dialog/edit-collection-dialog.component';
import { EditCollectionDialogComponent } from '../../../collections/collection-list/edit-collection-dialog/edit-collection-dialog.component';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { CollectionFactory } from '../../../shared/factories/collection.factory';
import { importPackables_result } from '@app/packables/packable-list/import-packables-dialog/import-packables-dialog.component';

@Component({
  selector: 'packing-list-collection',
  templateUrl: './list-collection.component.html',
  styleUrls: ['./list-collection.component.css']
})
export class ListCollectionComponent implements OnInit {
  @Input() collection: listCollection;
  @Input('profile') inputProfile: string;
  profileId:string;
  @Input() trip: Trip;
  @Input() editingPackable: ListPackableComponent;
  @Input() listSettings: PackingListSettings = new PackingListSettings();
  @Output() collectionChange = new EventEmitter<listCollection>()
  @Output() editingPackableChange = new EventEmitter<ListPackableComponent>()

  profiles: ProfileComplete[];
  settings$: Observable<PackingListSettings>;
  constructor(
    private dialog: MatDialog,
    private context: ContextService,
    private profileFactory: ProfileFactory,
    private colFac: CollectionFactory,
    private packingListService: PackingListService,
    private pacFac: PackableFactory,
  ) {
  }

  ngOnInit() {
    this.profiles = this.profileFactory.getCompleteProfilesByIds(this.trip.profiles)
    this.profileId = this.inputProfile != 'shared' ? this.inputProfile : null
    this.settings$ = this.packingListService.settingsEmitter.pipe()
  }

  onUpdatePackable(packable: PackingListPackable, save: boolean = true) {
    console.log(`onUpdatePackable: updatePackable.emit  collectionChange.emit`)
    this.collectionChange.emit(this.collection)
    this.packingListService.onUpdatePackables([packable], save)
  }

  toggleCheck(packable: PackingListPackable) {
    packable.checked = !packable.checked
    this.onUpdatePackable(packable)
  }
  addInvalid(packable: PackingListPackable) {
    packable.forcePass = true;
    this.onUpdatePackable(packable)
  }
  editPackableRules(packable: PackingListPackable) {
    let editingPackable: PackableComplete
    let data: EditPackableDialog_data

    let selected: string[];
    if (packable.profileID) {
      let editingProfile = this.profiles.findId(packable.profileID)
      let eiditingCollection = editingProfile.collections.findId(packable.collectionID)
      editingPackable = eiditingCollection.packables.findId(packable.id);
      this.context.setBoth(packable.collectionID, packable.profileID)
      selected = [packable.profileID]
    } else {
      // in case dealing with a shared packable, treat it like a packable original
      editingPackable = this.pacFac.makeCompleteFromIds([packable.id])[0]
      this.context.setBoth(null, null)
      selected = this.profiles.ids();
    }
    data = {
      pakable: editingPackable,
      limitProfileGroup: this.profiles.ids(),
      limitCollectionGroup: this.trip.collections.ids(),
      selected: selected,
      isNew: false
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      disableClose: true,
      autoFocus: false,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1))
      .subscribe((
        { resultPackable, newDialogRef }: EditPackableDialog_result
      ) => {
        console.log(`Received from modal:`, resultPackable);
        if (resultPackable) {
          if (this.editingPackable && this.editingPackable.editToggle) {
            this.editingPackable.toggleEditing(false)
          }
          packable.forceQuantity = false
          packable.forcePass = false
          this.onUpdatePackable(packable, false)
          this.packingListService.generateAndStorePackingList()
        } else if (newDialogRef) {
          newDialogRef.afterClosed().pipe(take(1)).subscribe((r:importPackables_result)=>{
            if(r && r.packables){
              this.packingListService.generateAndStorePackingList()
            }
          })
        }
      })
  }

  onToggleEditPackable(editing: boolean, editingPackable: ListPackableComponent) {
    if (editing) {
      if (this.editingPackable && this.editingPackable.editToggle) {
        this.editingPackable.toggleEditing(false)
      }
      this.editingPackable = editingPackable
    } else if (!editing && this.editingPackable) {
      this.editingPackable = null
    }
    this.editingPackableChange.emit(this.editingPackable)
  }
  quickAddPackable(str:string) {
    console.log('Adding simple packable:', str)
  }
  newPackable() {
    let editingPackable = new PackableComplete()
    editingPackable.userCreated = true;
    this.context.setBoth(this.collection.id, this.profileId)
    let data: EditPackableDialog_data = {
      pakable: editingPackable,
      isNew: true,
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      disableClose: true,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(({ resultPackable, newDialogRef }: EditPackableDialog_result) => {
      console.log(`Received from modal:`, resultPackable);
      if (resultPackable) {
        this.packingListService.generateAndStorePackingList()
        //this.packingListService.refreshPackingList()
      } else if (newDialogRef) {
        newDialogRef.afterClosed().pipe(take(1)).subscribe((r:importPackables_result)=>{
          if(r && r.packables){
            this.packingListService.generateAndStorePackingList()
          }
        })
      }
    })
  }

  editCollection() {
    let profileId = this.profileId
    let collection = this.colFac.getCompleteById(this.collection.id, profileId)
    this.context.setBoth(this.collection.id, profileId)
    let data: editCollectionDialog_data = {
      collection: collection,
      profileGroup: this.profileFactory.getAllProfilesAndMakeComplete()
    }
    this.dialog.open(EditCollectionDialogComponent, {
      disableClose: true,
      data: data
    }).afterClosed().pipe(take(1)).subscribe((collection: CollectionComplete) => {
      if (isDefined(collection)) {
        console.log(`${collection.name} has been updated`, collection)
        this.packingListService.generateAndStorePackingList()
      }
    })

  }
}
