import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CollectionComplete, CollectionPrivate } from '../../../shared/models/collection.model';
import { transitionTrigger } from '../../../shared/animations';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { CollectionFactory } from '../../../shared/factories/collection.factory';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import * as packableActions from '@app/packables/store/packables.actions';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { PackableComplete } from '../../../shared/models/packable.model';
import { ContextService } from '../../../shared/services/context.service';
import { Subscription } from 'rxjs';
import { editTrip } from '../../../trips/store/trip.actions';
import { timeStamp } from '@app/shared/global-functions';

export type CollectionPanelView = 'list' | 'settings';

@Component({
  selector: 'app-collection-panel',
  templateUrl: './collection-panel.component.html',
  styleUrls: ['./collection-panel.component.css'],
  animations: [transitionTrigger]
})
export class CollectionPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedView: CollectionPanelView = 'list';
  @Input() collection: CollectionComplete;
  @Output() change = new EventEmitter<void>();
  @Output() removeCollection = new EventEmitter<void>();
  @Input() profileId: string;

  subscription: Subscription;

  constructor(
    private storeSelector: StoreSelectorService,
    private pacFac: PackableFactory,
    private colFac: CollectionFactory,
    private store: Store<fromApp.appState>,
    private context: ContextService,
  ) { }

  packables: PackableComplete[];

  ngOnInit() {
    console.log(`CollectionPanelView - ngOnInit (${this.collection.name})`);
    
    this.init()
    this.subscription = this.storeSelector.profiles_obs.subscribe(() => {
      if (this.collection) {
        this.context.setCollection(this.collection.id)
      }
      this.init()
    })

  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['collection']) {
      console.log(`collection panel detected change in Collection (${this.collection.name})`);
      this.init()
    }
  }
  init() {
    
    this.collection = this.context.getCollection()
    this.packables = this.collection.packables
    if (!this.profileId && this.context.profileId) {
      this.profileId = this.context.profileId
      console.log('profile-id was not set in colleciton-panel, so retrieved it from contextService');
    }

  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
  remove() {
    this.removeCollection.emit()
  }
  updateSettings(collection: CollectionComplete) {
    this.collection = collection;
    this.collection.dateModified = timeStamp();
    let profile = this.storeSelector.getProfileById(this.profileId)
    let colIndex = profile.collections.idIndex(collection.id)
    profile.collections[colIndex] = this.colFac.completeToPrivate(collection)
    profile.dateModified = timeStamp()
    this.store.dispatch(new profileActions.editProfiles([profile]))
    this.emitUpdate();
  }

  updatePackables(packables: PackableComplete[]) {
    this.packables = packables
    this.collection.packables = packables
  }
  emitUpdate() {
    this.change.emit()
  }
}
