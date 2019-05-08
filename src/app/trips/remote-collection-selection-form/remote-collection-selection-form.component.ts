import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { remoteCollection } from '@app/shared/library/library.model';
import { CollectionOriginal, CollectionComplete } from '../../shared/models/collection.model';
import { Profile } from '../../shared/models/profile.model';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { destMetaData } from '../../shared/library/library.model';
import { tripCollectionGroup } from '@app/shared/models/trip.model';
import { CollectionProfilesDialog_data, SelectCollectionProfilesDialogComponent } from '../collection-selection-form/select-collection-profiles-dialog/select-collection-profiles-dialog.component';
import { MatDialog } from '@angular/material';
import { take } from 'rxjs/operators';
import { isDefined } from '../../shared/global-functions';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { blockInitialAnimations, dropInTrigger } from '../../shared/animations';

@Component({
  selector: 'remote-collection-selection-form',
  templateUrl: './remote-collection-selection-form.component.html',
  styleUrls: ['./remote-collection-selection-form.component.css'],
  animations:[blockInitialAnimations,dropInTrigger]
})
export class RemoteCollectionSelectionFormComponent implements OnInit,OnChanges {
@Input('remoteCollections') remoteCollections: remoteCollection[] = []
@Input('localCollections') localCollections: CollectionComplete[] = []
@Input('selected') selected: tripCollectionGroup[] = []
@Input('loadingLibrary') loadingLibrary:boolean;
@Input('profiles') inputTripProfiles: string[] = []
@Input('destMetaData') destMetaData: destMetaData;
@Output() selectedChange = new EventEmitter<tripCollectionGroup[]>()
/*
<remote-collection-selection-form
  [remoteCollections]="remoteCollection[]"
  [localCollectionGroups]="tripCollectionGroup[]"
  [profiles]="string[]"
  (localCollectionGroupsChange)="onchange($event:tripCollectionGroup[])">
</remote-collection-selection-form>
*/
sortedCollections: CollectionComplete[];
tripProfiles:Profile[] = []
storeProfiles: Profile[];
debounceTimer = setTimeout(()=>{},0)
  constructor(
    private colFac:CollectionFactory,
    private storeSelector: StoreSelectorService,
    private dialogRef: MatDialog,
    private bulkActions:BulkActionsService,
  ) { }

  ngOnInit() {
    this.updateCollectionList(true)
  }
  ngOnChanges(changes:SimpleChanges) {
    if(this.sortedCollections && (changes['remoteCollections'] || changes['localCollections'])){
      console.log('RemoteCollectionForm Updating\nLocal:',this.localCollections,'\nRemote:',this.remoteCollections)
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(()=>{
        this.updateCollectionList()
      }, 150)
    }
    if(changes['inputTripProfiles'] && this.inputTripProfiles){
      this.tripProfiles = this.storeSelector.profiles.filter(p => this.inputTripProfiles.includes(p.id))
    }
  }
  updateCollectionList(initial:boolean = false){
    let localIds = this.localCollections.ids()
    let filtered = this.remoteCollections
    .filter(c=>!localIds.includes(c.id))
    initial && filtered
      .sort((a,b)=>{
        return b.metaData.metaScore - a.metaData.metaScore
      })
      .sort((a,b)=>{
        const aCount = this.destMetaData.collections[a.id] || 0
        const bCount = this.destMetaData.collections[b.id] || 0
        return bCount - aCount
      })
    let updatedComplete = this.colFac.remoteToComplete(filtered)
      if(this.sortedCollections){
        console.log('RemoteCollectionForm used COMPARE')
        this.sortedCollections.compare(updatedComplete)
      } else {
        this.sortedCollections = updatedComplete
      }
  }

  onClickCollection(col:CollectionComplete) {
    if (this.inputTripProfiles.length === 1) {
      this.bulkActions.processImportCollections([col.id],this.inputTripProfiles)
      this.emitChange(col,this.tripProfiles)
    } else {
      let data: CollectionProfilesDialog_data = {
        collection: col,
        profileGroup: this.tripProfiles,
        selectedProfiles: this.tripProfiles
      }
      let dialog = this.dialogRef.open(SelectCollectionProfilesDialogComponent, {
        data: data,
        maxHeight: '99vh',
        maxWidth: '99vw',
        width: '400px',
      })
      dialog.afterClosed().pipe(take(1)).subscribe((profiles: Profile[]) => {
        console.log('select profile dialog returned',profiles)
        if (isDefined(profiles)) {
          this.bulkActions.processImportCollections([col.id],profiles.ids())
          this.emitChange(col,profiles)
        } else {
          console.log('select profile returned null')
        }
      })
    }
  }

  emitChange(col:CollectionComplete,profiles:Profile[]) {
    this.selected.push({id: col.id,profiles:profiles.ids()})
    //this.updateCollectionList()
    this.selectedChange.emit(this.selected)
  }
}
