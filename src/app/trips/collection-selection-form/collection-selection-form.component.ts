import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { SelectedList } from '@app/shared/services/selected-list';
import { CollectionComplete } from '../../shared/models/collection.model';
import { Subscription } from 'rxjs';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { Profile } from '../../shared/models/profile.model';
import { indexOfId } from '../../shared/global-functions';


@Component({
  selector: 'collection-selection-form',
  templateUrl: './collection-selection-form.component.html',
  styleUrls: ['./collection-selection-form.component.css']
})
export class CollectionSelectionFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selected: string[] = []
  @Input() profiles: Profile[] = []
  @Output() selectedChanged = new EventEmitter<string[]>()

  list: SelectedList = new SelectedList();
  collections: CollectionComplete[] = [];
  collectionProfileGroups: { [id: string]: Profile[] } = {};

  subs = new Subscription()
  constructor(
    private storeSelector: StoreSelectorService,
    private colFac: CollectionFactory,
    private proFac: ProfileFactory
  ) { }

  ngOnInit() {
    this.subs.add(
      this.storeSelector.store_obs.subscribe(([pacState, colSatet, proState, tripState]) => {
        this.updateCollections(colSatet.collections)
      })
    )
  }
  updateCollections(collections) {
    let completeCols = this.colFac.makeCompleteArray(collections)
    this.collections.compare(completeCols)
    this.collections.forEach(c => {
      let profilesWithColId = this.storeSelector.getProfilesWithCollectionId(c.id)
      this.collectionProfileGroups[c.id] = profilesWithColId.filter(p => this.profiles.idIndex(p.id) > -1);
    })
    this.collections.sort((a, b) => {
      return this.collectionProfileGroups[b.id].length - this.collectionProfileGroups[a.id].length
    }).sort((a,b)=>{
      return this.selected.includes(a.id) ? -1 : this.selected.includes(b.id) ? 1 : 0;
    })
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected']) {
      this.list.array = [...this.selected]
    }
  }
  ngOnDestroy() {

  }

  toggleCollection(id: string) {
    if (this.collectionProfileGroups[id].length > 0) {
      // add to selection
      this.list.toggle(id)
    } else {
      // dialog: add to profiles
    }
  }

}
