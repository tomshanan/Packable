import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ListPackableComponent } from '../list-packable/list-packable.component';
import { PackingListPackable, PackingListSettings, listCollection } from '../../../shared/models/packing-list.model';
import { PackableComplete } from '../../../shared/models/packable.model';
import { DialogData_EditPackable, EditPackableDialogComponent } from '../../../packables/packable-list/edit-packable-dialog/edit-packable-dialog.component';
import { MatDialog } from '@angular/material';
import { ContextService } from '../../../shared/services/context.service';
import { ProfileFactory } from '../../../shared/factories/profile.factory';
import { ProfileComplete } from '../../../shared/models/profile.model';
import { Trip } from '../../../shared/models/trip.model';
import { take } from 'rxjs/operators';
import { PackingListService } from '../packing-list.service';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { PackableFactory } from '../../../shared/factories/packable.factory';

@Component({
  selector: 'packing-list-collection',
  templateUrl: './list-collection.component.html',
  styleUrls: ['./list-collection.component.css']
})
export class ListCollectionComponent implements OnInit {
  @Input() collection:listCollection;
  @Input() trip:Trip;
  @Input() editingPackable: ListPackableComponent;
  @Input() listSettings: PackingListSettings = new PackingListSettings();
  @Output() collectionChange = new EventEmitter<listCollection>()
  @Output() editingPackableChange = new EventEmitter<ListPackableComponent>()
  
  profiles:ProfileComplete[];

  constructor(
    private dialog: MatDialog,
    private context: ContextService,
    private profileFactory: ProfileFactory,
    private packingListService: PackingListService,
    private pacFac:PackableFactory,
  ) { }

  ngOnInit() {
    this.profiles = this.profileFactory.getCompleteProfilesByIds(this.trip.profiles)
  }

  onUpdatePackable(packable:PackingListPackable, save:boolean= true){
    console.log(`onUpdatePackable: updatePackable.emit  collectionChange.emit`)
    this.collectionChange.emit(this.collection)
    this.packingListService.onUpdatePackables([packable],save)
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
    let data: DialogData_EditPackable
    
    let selected:string[];
    if(packable.profileID){
      let editingProfile = this.profiles.findId(packable.profileID)
      let eiditingCollection =  editingProfile.collections.findId(packable.collectionID)
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
      maxWidth: "99vw",
      maxHeight: "99vh",
      width: "500px",
      disableClose: true,
      autoFocus: false,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((newPackable: PackableComplete) => {
      console.log(`Received from modal:`, newPackable);
      if(newPackable){
        if (this.editingPackable && this.editingPackable.editToggle) {
          this.editingPackable.toggleEditing(false)
        }
        packable.forceQuantity = false
        packable.forcePass = false
        this.onUpdatePackable(packable,false)
        this.packingListService.generateAndStorePackingList()
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
}
