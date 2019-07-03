import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { CollectionOriginal, CollectionComplete, CollectionWithMetadata } from '../../shared/models/collection.model';
import { Profile } from '../../shared/models/profile.model';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { destMetaData } from '../../shared/library/library.model';
import { tripCollectionGroup } from '@app/shared/models/trip.model';
import { CollectionProfilesDialog_data, SelectCollectionProfilesDialogComponent } from '../collection-selection-form/select-collection-profiles-dialog/select-collection-profiles-dialog.component';
import { MatDialog } from '@angular/material';
import { take } from 'rxjs/operators';
import { isDefined } from '../../shared/global-functions';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { blockInitialAnimations, dropInTrigger, expandAndFadeTrigger } from '../../shared/animations';
import { WeatherService, TripWeatherData } from '../../shared/services/weather.service';
import { importCollections_data, ImportCollectionDialogComponent, importCollections_result } from '../../collections/collection-list/import-collection-dialog/import-collection-dialog.component';

type weatherMet = { weatherMet: boolean }
type completeAndWeatherMet = CollectionComplete & weatherMet
@Component({
  selector: 'recommended-collection-selection-form',
  templateUrl: './recommended-collection-selection-form.component.html',
  styleUrls: ['./recommended-collection-selection-form.component.css'],
  animations: [blockInitialAnimations, dropInTrigger,expandAndFadeTrigger]
})
export class RecommendedCollectionSelectionFormComponent implements OnInit, OnChanges {
  @Input('remoteCollections') remoteCollections: CollectionWithMetadata[] = []
  @Input('localCollections') localCollections: CollectionComplete[] = []
  @Input('selected') selected: tripCollectionGroup[] = []
  @Input('loadingLibrary') loadingLibrary: boolean;
  @Input('profiles') inputTripProfiles: string[] = []
  @Input('destMetaData') destMetaData: destMetaData;
  @Input('destWeatherData') destWeatherData: TripWeatherData;
  @Input('limit') limit: number = null;
  @Output() selectedChange = new EventEmitter<tripCollectionGroup[]>()
  /*
  <remote-collection-selection-form
    [remoteCollections]="remoteCollection[]"
    [localCollectionGroups]="tripCollectionGroup[]"
    [profiles]="string[]"
    (localCollectionGroupsChange)="onchange($event:tripCollectionGroup[])">
  </remote-collection-selection-form>
  */
  sortedCollections: completeAndWeatherMet[];
  tripProfiles: Profile[] = []
 
  debounceTimer = setTimeout(() => { }, 0)
  constructor(
    private colFac: CollectionFactory,
    private storeSelector: StoreSelectorService,
    private dialogRef: MatDialog,
    private bulkActions: BulkActionsService,
    private weatherService: WeatherService,
    private dialog: MatDialog,

  ) { }

  ngOnInit() {
    this.updateCollectionList(true)
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.sortedCollections && (changes['remoteCollections'] || changes['localCollections'])) {
      console.log('RemoteCollectionForm Updating\nLocal:', this.localCollections, '\nRemote:', this.remoteCollections)
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.updateCollectionList()
      }, 150)
    }
    if (changes['inputTripProfiles'] && this.inputTripProfiles) {
      this.tripProfiles = this.storeSelector.profiles.filter(p => this.inputTripProfiles.includes(p.id))
    }
  }
  updateCollectionList(initial: boolean = false) {
    let localIds = this.localCollections.ids()
    let filtered = this.remoteCollections
      .filter(c => !localIds.includes(c.id))
    initial && filtered
      .sort((a, b) => {
        return b.metaData.metaScore - a.metaData.metaScore
      })
      .sort((a, b) => {
        const aCount = this.destMetaData.collections[a.id] || 0
        const bCount = this.destMetaData.collections[b.id] || 0
        return bCount - aCount
      })
    let updatedComplete = this.colFac.remoteToComplete(filtered)
      .map(c => this.attachWeahter(c))
    if (this.sortedCollections) {
        this.sortedCollections.compare(updatedComplete)
    } else {
      this.sortedCollections = updatedComplete
    }
    this.sortedCollections.sort((a, b) => {
      let aWeather = a.weatherMet
      let bWeather = b.weatherMet
      return aWeather ? (bWeather ? 0 : -1) : 1
    })
    console.log('RemoteCollectionForm Updated to:',this.sortedCollections)
  }
  attachWeahter(col: CollectionComplete): completeAndWeatherMet {
    let weatherMet = this.weatherService.checkWeatherRules(col.weatherRules, this.destWeatherData).conditionsMet
    return Object.assign({ ...col }, { weatherMet: weatherMet })
  }
  onClickCollection(col: CollectionComplete) {
    if (this.inputTripProfiles.length === 1) {
      this.bulkActions.processImportCollections([col.id], this.inputTripProfiles)
      this.emitChange(col, this.tripProfiles)
    } else {
      let data: CollectionProfilesDialog_data = {
        collection: col,
        weatherData: this.destWeatherData,
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
        console.log('select profile dialog returned', profiles)
        if (isDefined(profiles)) {
          this.bulkActions.processImportCollections([col.id], profiles.ids())
          this.emitChange(col, profiles)
        } else {
          console.log('select profile returned null')
        }
      })
    }
  }
  bulkActionImportCollections(){
    let data: importCollections_data = {
      profileGroup: this.tripProfiles,
      selectedProfiles: this.tripProfiles.ids()
    }
    let importCollectionDialog = this.dialog.open(ImportCollectionDialogComponent, {
      maxWidth:'99vw',
      maxHeight: '99vh',
      disableClose: true,
      data: data
    });
    importCollectionDialog.afterClosed().pipe(take(1)).subscribe((r:importCollections_result)=>{
      if(isDefined(r) && isDefined(r.collections)){
        r.collections.forEach(col=>{
          this.selected.push({ id: col.id, profiles: r.profiles})
        })
        this.selectedChange.emit(this.selected)
      }
    })
  }

  emitChange(col: CollectionComplete, profiles: Profile[]) {
    this.selected.push({ id: col.id, profiles: profiles.ids() })
    //this.updateCollectionList()
    this.selectedChange.emit(this.selected)
  }
}
