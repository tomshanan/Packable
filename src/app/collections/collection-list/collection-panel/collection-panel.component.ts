import { Component, OnInit, Input } from '@angular/core';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { transitionTrigger } from '../../../shared/animations';
import { updatePackableListEvent } from '@app/packables/packable-list/packable-list.component';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { CollectionFactory } from '../../../shared/factories/collection.factory';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import * as packableActions from '@app/packables/store/packables.actions';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';

export type CollectionPanelView = 'list' | 'settings';

@Component({
  selector: 'app-collection-panel',
  templateUrl: './collection-panel.component.html',
  styleUrls: ['./collection-panel.component.css'],
  animations: [transitionTrigger]
})
export class CollectionPanelComponent implements OnInit {
  @Input() selectedView: CollectionPanelView = 'list';
  @Input() collection: CollectionComplete;

  constructor(
    private storeSelector: StoreSelectorService,
    private pacFac: PackableFactory,
    private colFac: CollectionFactory,
    private store: Store<fromApp.appState>,
  ) { }

  ngOnInit() {
  }
  updateList(event: updatePackableListEvent) {
    let packables = event.packables;
    if (event.collections.length > 0) {
      let privatePackables = packables.map(p => this.pacFac.makePrivateFromComplete(p))
      if (event.profiles.length > 0) {
        let profiles = this.storeSelector.profiles
        profiles.forEach(profile => {
          profile.collections.forEach(collection => {
            if (event.collections.includes(collection.id)) {
              collection.packables = privatePackables
            }
          })
        })
        this.store.dispatch(new profileActions.setProfileState(profiles))
      }
      let collections = this.storeSelector.originalCollections
      collections.forEach(collection => {
        if (event.collections.includes(collection.id)) {
          collection.packables = privatePackables
        }
      })
      this.store.dispatch(new collectionActions.setCollectionState(collections))

    }
  }
}
