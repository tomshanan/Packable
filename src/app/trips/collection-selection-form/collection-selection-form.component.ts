import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, AfterViewChecked } from '@angular/core';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { SelectedList } from '@app/shared/services/selected-list';
import { CollectionComplete, CollectionOriginal, CollectionWithMetadata, CollectionCompleteWithMetadata } from '../../shared/models/collection.model';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { Profile } from '../../shared/models/profile.model';
import { indexOfId, isDefined, sortByMetascore } from '../../shared/global-functions';
import { MatDialog } from '@angular/material';
import { SelectCollectionProfilesDialogComponent, CollectionProfilesDialog_data } from './select-collection-profiles-dialog/select-collection-profiles-dialog.component';
import { take, filter, takeWhile, first } from 'rxjs/operators';
import { tripCollectionGroup } from '@app/shared/models/trip.model';
import { blockInitialAnimations, dropInTrigger } from '../../shared/animations';
import { TripWeatherData, WeatherService } from '../../shared/services/weather.service';
import { NewCollectionDialogComponent, newCollectionDialog_result, newCollectionDialog_data } from '../../collections/collection-list/new-collection-dialog/new-collection-dialog.component';
import { destMetaData } from '@app/shared/library/library.model';

export interface collectionProfileGroups { [id: string]: Profile[] }

@Component({
  selector: 'collection-selection-form',
  templateUrl: './collection-selection-form.component.html',
  styleUrls: ['./collection-selection-form.component.css'],
  animations: [blockInitialAnimations, dropInTrigger]

})
export class CollectionSelectionFormComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

  @Input() selected: tripCollectionGroup[] = []

  @Input('profiles') inputProfiles: string[] = []
  @Input('destWeatherData') weatherData$: Observable<TripWeatherData>;
  @Input('destMetaData') destMetaData$: Observable<destMetaData>;
  destMetaData: destMetaData;
  weatherData: TripWeatherData;
  loading: boolean = true;

  profiles: Profile[] = []
  @Output() selectedChange = new EventEmitter<tripCollectionGroup[]>()

  allCollections: CollectionCompleteWithMetadata[] = [];
  sortedCollections: CollectionCompleteWithMetadata[] = [];
  recommendedCollections: CollectionCompleteWithMetadata[] = [];

  selectedGroup: collectionProfileGroups = {};
  collectionProfileGroups: collectionProfileGroups = {};

  debounceTimer = setTimeout(() => { }, 0)

  subs = new Subscription()
  viewLoaded: boolean;
  constructor(
    private storeSelector: StoreSelectorService,
    private weatherService: WeatherService,
    private colFac: CollectionFactory,
    private proFac: ProfileFactory,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.profiles = this.storeSelector.profiles.filter(p => this.inputProfiles.includes(p.id))
    let initial = true;
    const collections$ = this.storeSelector.collections$
    const libState$ = this.storeSelector.libraryState$
    this.subs.add(
      combineLatest(libState$, collections$, this.weatherData$,this.destMetaData$)
        .pipe(
          first(([libState, collectionState, wData,destMetaData]) => {
            return !libState.loading && wData && !isDefined(libState.error) && isDefined(destMetaData)
          }),
        )
        .subscribe(([libState, collectionState, wData,destMetaData]) => {
          this.weatherData = wData
          this.destMetaData = destMetaData
          let originalCollections = collectionState.collections
          let remoteCollections = libState.library.collections.filter(c => !originalCollections.hasId(c.id))
          this.allCollections = this.colFac.makeCompleteWithMetaData([...originalCollections, ...remoteCollections])
          console.log(`Collection Selection form received: allCollections`, this.allCollections)
          this.updateAll(this.allCollections, initial)
          this.loading = false
          initial = false
        })
    )

  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.viewLoaded && (changes['selected'])) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.updateSelectedGroups(this.allCollections, false)
        this.updateRecommended(this.allCollections, false)
      }, 150)
    }
  }
  ngAfterViewChecked() {
    this.viewLoaded = true;
  }
  updateAll(collections: CollectionCompleteWithMetadata[], initialLoad: boolean = true) {
    this.updateSelectedGroups(collections, initialLoad)
    this.updateRecommended(collections, initialLoad)
    this.updateCollections(collections, initialLoad)
  }
  updateCollections(collections: CollectionCompleteWithMetadata[], sort: boolean = true) {
    this.sortedCollections.compare(collections)
    if (sort) {
      this.sortedCollections
        // by heighest meta data
        .sort(sortByMetascore)
        // most used collection per profile
        .sort((a, b) => this.sortColProGroup(a, b, this.collectionProfileGroups))
      this.weatherService.sortByConditionsMet(this.sortedCollections, this.weatherData)
      this.sortedCollections
        // user created
        .sort((a, b) => {
          return a.userCreated ? -1 : (b.userCreated ? 1 : 0)
        })
        // most used on this trip
        .sort((a, b) => this.sortColProGroup(a, b, this.selectedGroup))
    }
  }
  updateRecommended(collections: CollectionCompleteWithMetadata[], sort: boolean = true) {
    // filter for ones not created by the user, and ones not currently selected
    let filteredRecommended = collections.filter(c => {
      return !c.userCreated && !isDefined(this.selectedGroup[c.id])
    })
    filteredRecommended = this.weatherService.filterConditionsMet(filteredRecommended, this.weatherData)
    this.recommendedCollections.compare(filteredRecommended)
    if (sort) {
      this.recommendedCollections
        .sort(sortByMetascore)
        .sort((a, b) => {
          const aCount = this.destMetaData.collections[a.id] || 0
          const bCount = this.destMetaData.collections[b.id] || 0
          return bCount - aCount
        })
    }
  }

  updateSelectedGroups(collections: CollectionCompleteWithMetadata[], addEessntials: boolean = true) {
    if (isDefined(this.selected)) {
      this.selected.forEach(colGroup => {
        this.selectedGroup[colGroup.id] = this.profiles.filter(p => colGroup.profiles.includes(p.id))
      })
    }
    collections.forEach(c => {
      // find profiles that have this collection
      let profilesWithColId = this.storeSelector.getProfilesWithCollectionId(c.id)
      // set groups for 
      this.collectionProfileGroups[c.id] = profilesWithColId.filter(p => this.profiles.idIndex(p.id) > -1);
      // if selected groups weren't provided, 
      // filter for profiles where col is essential and add to selectedGroups
      if (!isDefined(this.selected) && addEessntials) {
        this.selectedGroup[c.id] = this.collectionProfileGroups[c.id].filter(p => p.collections.findId(c.id).essential);
      }
    })
    // on first load
    if (addEessntials) {
      // if not all profiles are present, add their essential collections
      let changeMade = false;
      if (isDefined(this.selected) && !this.profiles.every(p => this.profileInSelected(p))) {
        this.profiles.forEach(p => {
          if (!this.profileInSelected(p)) {
            changeMade = true;
            let essentials = p.collections.filter(c => c.essential)
            essentials.forEach(c => {
              this.selectedGroup[c.id] = this.selectedGroup[c.id] ? [...this.selectedGroup[c.id], p] : [p];
            })
          }
        })
      }
      if(changeMade){
        setTimeout(() => {
          this.emitSelected()
        }, 100)
      }
    }
  }




  profileInSelected(p: Profile): boolean {
    return this.selected.some(c => {
      return c.profiles.includes(p.id)
    })
  }
  sortColProGroup(a: CollectionComplete, b: CollectionComplete, groups: collectionProfileGroups): number {
    if (groups[a.id] && groups[b.id]) {
      return groups[b.id].length - groups[a.id].length
    } else {
      return groups[a.id] ? -1 : groups[b.id] ? 1 : 0;
    }
  }



  ngOnDestroy() {

  }

  toggleCollection(id: string) {
    if (this.selectedGroup[id] && this.selectedGroup[id].length > 0) {
      this.selectedGroup[id] = []
      this.emitSelected()
    } else {
      this.setProfiles(id)
    }
  }
  setProfiles(colId: string) {
    if (this.profiles.length === 1) {
      this.selectedGroup[colId] = this.profiles.slice()
      this.emitSelected()
    } else {
      let data: CollectionProfilesDialog_data = {
        collection: this.sortedCollections.findId(colId),
        profileGroup: this.profiles,
        weatherData: this.weatherData,
        selectedProfiles: this.selectedGroup[colId] && this.selectedGroup[colId].length > 0 ? this.selectedGroup[colId] : this.profiles
      }
      let dialog = this.dialog.open(SelectCollectionProfilesDialogComponent, {
        data: data,
        maxHeight: '99vh',
        maxWidth: '99vw',
        width: '400px',
      })
      dialog.afterClosed().pipe(take(1)).subscribe((profiles: Profile[]) => {
        if (profiles) {
          this.selectedGroup[colId] = profiles.slice()
          this.emitSelected()
        }
      })
    }

  }
  newCollection() {
    const data: newCollectionDialog_data = {
      profileGroup: this.profiles
    }
    let newCollectionDialog = this.dialog.open(NewCollectionDialogComponent, {
      maxHeight: '99vh',
      maxWidth: '99vw',
      disableClose: true,
      autoFocus: false,
      data: data
    });
    newCollectionDialog.afterClosed().pipe(take(1)).subscribe((result: newCollectionDialog_result) => {
      if (result.collection && isDefined(result.profiles)) {
        const profiles = result.profiles
        const colId = result.collection.id
        this.selectedGroup[colId] = profiles
        this.emitSelected()
      }
    })
  }
  emitSelected() {
    let selected: tripCollectionGroup[] = []
    for (let col in this.selectedGroup) {
      if (this.selectedGroup[col].length > 0) {
        selected.push({ id: col, profiles: this.selectedGroup[col].ids() })
      }
    }
    console.log('Trip Collections emitted:', selected)
    this.selectedChange.emit(selected)
  }
}
