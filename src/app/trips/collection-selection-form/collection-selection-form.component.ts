import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, AfterViewChecked } from '@angular/core';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { SelectedList } from '@app/shared/services/selected-list';
import { CollectionComplete, CollectionOriginal } from '../../shared/models/collection.model';
import { Subscription } from 'rxjs';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { Profile } from '../../shared/models/profile.model';
import { indexOfId, isDefined } from '../../shared/global-functions';
import { MatDialog } from '@angular/material';
import { SelectCollectionProfilesDialogComponent, CollectionProfilesDialog_data } from './select-collection-profiles-dialog/select-collection-profiles-dialog.component';
import { take } from 'rxjs/operators';
import { tripCollectionGroup } from '@app/shared/models/trip.model';
import { blockInitialAnimations, dropInTrigger } from '../../shared/animations';
import { TripWeatherData } from '../../shared/services/weather.service';
import { NewCollectionDialogComponent, newCollectionDialog_result, newCollectionDialog_data } from '../../collections/collection-list/new-collection-dialog/new-collection-dialog.component';

export interface collectionProfileGroups { [id: string]: Profile[] }

@Component({
  selector: 'collection-selection-form',
  templateUrl: './collection-selection-form.component.html',
  styleUrls: ['./collection-selection-form.component.css'],
  animations:[blockInitialAnimations,dropInTrigger]

})
export class CollectionSelectionFormComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

  @Input() selected: tripCollectionGroup[] = []
  @Input() localCollections: CollectionComplete[] = []
  @Input('profiles') inputProfiles: string[] = []
  @Input('destWeatherData') weatherData: TripWeatherData = new TripWeatherData()
  profiles: Profile[] = []
  @Output() selectedChange = new EventEmitter<tripCollectionGroup[]>()

  collections: CollectionComplete[] = [];
  selectedGroup: collectionProfileGroups = {};
  collectionProfileGroups: collectionProfileGroups = {};
  debounceTimer = setTimeout(()=>{},0)

  subs = new Subscription()
  viewLoaded: boolean;
  constructor(
    private storeSelector: StoreSelectorService,
    private colFac: CollectionFactory,
    private proFac: ProfileFactory,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.profiles = this.storeSelector.profiles.filter(p => this.inputProfiles.includes(p.id))
    this.collections = this.localCollections
    this.updateCollections(this.localCollections, true)
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.viewLoaded && (changes['selected'] || changes['localCollections'])) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(()=>{
        this.updateCollections(this.localCollections, false)
      }, 150)
    }
  }
  ngAfterViewChecked() {
    this.viewLoaded = true;
  }
  updateCollections(collections: CollectionComplete[], first: boolean = true) {
    this.collections.compare(collections)
    // if we already selected some cols before, filter for only those currently on the trip
    if (isDefined(this.selected)) {
      this.selected.forEach(colGroup => {
        this.selectedGroup[colGroup.id] = this.profiles.filter(p => colGroup.profiles.includes(p.id))
      })
    }
    this.collections.forEach(c => {
      // find profiles that have this collection
      let profilesWithColId = this.storeSelector.getProfilesWithCollectionId(c.id)
      // filter for profiles that are in the trip
      this.collectionProfileGroups[c.id] = profilesWithColId.filter(p => this.profiles.idIndex(p.id) > -1);
      // if selected groups weren't provided, 
      // filter for profiles where col is essential 
      if(!isDefined(this.selected) && first){
        this.selectedGroup[c.id] = this.collectionProfileGroups[c.id].filter(p => p.collections.findId(c.id).essential);
      } 
    })
    // on first load
    if (first) {
      // if not all profiles are present, add their essential collections
      if (isDefined(this.selected) && !this.profiles.every(p => this.profileInSelected(p))) {
        this.profiles.forEach(p => {
          if(!this.profileInSelected(p)){
            let essentials = p.collections.filter(c=>c.essential)
            essentials.forEach(c=>{
              this.selectedGroup[c.id] = this.selectedGroup[c.id] ? [...this.selectedGroup[c.id], p] : [p];
            })
          }
        })
      }
      setTimeout(()=>{
        this.emitSelected()
      },100) 

      this.collections
        // sort first by most used collection per profile
        .sort((a, b) => this.sortColProGroup(a, b, this.collectionProfileGroups))
        // sort again by most used on this trip
        .sort((a, b) => this.sortColProGroup(a, b, this.selectedGroup))
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
        collection: this.collections.findId(colId),
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
        if (isDefined(profiles)) {
          this.selectedGroup[colId] = profiles.slice()
          this.emitSelected()
        }
      })
    }

  }
  newCollection(){
    const data:newCollectionDialog_data = {
      profileGroup: this.profiles
    }
    let newCollectionDialog = this.dialog.open(NewCollectionDialogComponent, {
      maxHeight: '99vh',
      maxWidth: '99vw',
      disableClose: true,
      autoFocus: false,
      data:data
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
    console.log('Trip Collections emitted:',selected)
    this.selectedChange.emit(selected)
  }
}
