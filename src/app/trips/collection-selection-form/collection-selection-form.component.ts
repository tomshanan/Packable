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

export interface collectionProfileGroups { [id: string]: Profile[] }

@Component({
  selector: 'collection-selection-form',
  templateUrl: './collection-selection-form.component.html',
  styleUrls: ['./collection-selection-form.component.css']
})
export class CollectionSelectionFormComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

  @Input() selected: tripCollectionGroup[] = []
  @Input('profiles') inputProfiles: string[] = []
  profiles: Profile[] = []
  @Output() selectedChange = new EventEmitter<tripCollectionGroup[]>()

  collections: CollectionComplete[] = [];
  selectedGroup: collectionProfileGroups = {};
  collectionProfileGroups: collectionProfileGroups = {};

  subs = new Subscription()
  viewLoaded: boolean;
  constructor(
    private storeSelector: StoreSelectorService,
    private colFac: CollectionFactory,
    private proFac: ProfileFactory,
    private dialogRef: MatDialog
  ) { }

  ngOnInit() {
    this.profiles = this.storeSelector.profiles.filter(p => this.inputProfiles.includes(p.id))
    this.updateCollections(this.storeSelector.originalCollections)
    // this.subs.add(
    //   this.storeSelector.store_obs.subscribe(([pacState, colSatet, proState, tripState]) => {
    //     this.updateCollections(colSatet.collections)
    //   })
    // )
  }
  updateCollections(collections: CollectionOriginal[], first: boolean = true) {
    let completeCols = this.colFac.makeCompleteArray(collections)
    this.collections.compare(completeCols)
    if (isDefined(this.selected)) {
      this.selected.forEach(col => {
        this.selectedGroup[col.id] = this.profiles.filter(p => col.profiles.includes(p.id))
      })
    }
    this.collections.forEach(c => {
      // find profiles that have this collection
      let profilesWithColId = this.storeSelector.getProfilesWithCollectionId(c.id)
      // filter for profiles that are in the trip
      this.collectionProfileGroups[c.id] = profilesWithColId.filter(p => this.profiles.idIndex(p.id) > -1);
    // if selected groups weren't provided, 
    // filter for profiles where col is essential 
      if(!isDefined(this.selected)){
        this.selectedGroup[c.id] = this.collectionProfileGroups[c.id].filter(p => p.collections.findId(c.id).essential);
      } 
    })
    if (first) {
      // if not all profiles are present
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
      this.collections
        .sort((a, b) => this.sortColProGroup(a, b, this.collectionProfileGroups))
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


  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected'] && this.viewLoaded) {
      this.updateCollections(this.storeSelector.originalCollections, false)
    }
  }
  ngAfterViewChecked() {
    this.viewLoaded = true;
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
  setProfiles(id: string) {
    if (this.profiles.length === 1) {
      this.selectedGroup[id] = this.profiles.slice()
      this.emitSelected()
    } else {
      let data: CollectionProfilesDialog_data = {
        collection: this.collections.findId(id),
        profileGroup: this.profiles,
        selectedProfiles: this.selectedGroup[id] && this.selectedGroup[id].length > 0 ? this.selectedGroup[id] : this.profiles
      }
      let dialog = this.dialogRef.open(SelectCollectionProfilesDialogComponent, {
        data: data,
        maxHeight: '99vh',
        maxWidth: '99vw',
        width: '400px',
      })
      dialog.afterClosed().pipe(take(1)).subscribe((profiles: Profile[]) => {
        if (isDefined(profiles)) {
          this.selectedGroup[id] = profiles.slice()
          this.emitSelected()
        }
      })
    }

  }

  emitSelected() {
    let selected: tripCollectionGroup[] = []
    for (let col in this.selectedGroup) {
      if (this.selectedGroup[col].length > 0) {
        selected.push({ id: col, profiles: this.selectedGroup[col].map(p => p.id) })
      }
    }
    this.selectedChange.emit(selected)
  }
}
