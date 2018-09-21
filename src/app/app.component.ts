import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from './shared/app.reducers'
import { PackableOriginal, QuantityType } from './shared/models/packable.model';
import * as packableActions from './packables/store/packables.actions';
import * as profileActions from './profiles/store/profile.actions';
import * as collectionActions from './collections/store/collections.actions';
import * as tripActions from './trips/store/trip.actions';
import { CollectionOriginal } from './shared/models/collection.model';
import { StoreSelectorService } from './shared/store-selector.service';
import { Profile } from './shared/models/profile.model';
import { Guid } from './shared/global-functions';
import { destinations } from './shared/location-data-object';
import { Trip } from './shared/models/trip.model';
import * as moment from 'moment';
import { CollectionFactory } from './shared/factories/collection.factory';
import { PackableFactory } from './shared/factories/packable.factory';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None 

})
export class AppComponent implements OnInit {
  icons = ['binoculars','bomb','book','camera','eraser','glasses','key','money-bill-alt','newspaper','rocket','tablet-alt','ticket-alt','wallet',]
  constructor(
    private store: Store<fromApp.appState>,
    private selectorService: StoreSelectorService,
    private PackableFactory: PackableFactory,
    private CollectionFactory: CollectionFactory,
  ){
  }
  ngOnInit(){
    let packableNames = ['Ski Pants', 'jumper','shorts','towl','t-shirt','gym pants','sun glasses','toothbrush','toothpaste', 'gloves','jeans','earphones','tissues','shorts','shirt','radio','towel','sun screen']
    let repTypes = ["period" , "profile" , "trip"]
    let allPackables: PackableOriginal[] = [];
    packableNames.forEach(name=>{
      let icon = this.icons[Math.floor(Math.random()*this.icons.length)]
      let amount = Math.floor(Math.random()*3)+1
      let repAmount = Math.floor(Math.random()*4)+1
      let type = repTypes[Math.floor(Math.random()*repTypes.length)]
      let packable = new PackableOriginal(Guid.newGuid(),name, icon, [{ amount: amount, type: <QuantityType>type, repAmount: repAmount }])
      allPackables.push(packable)
      this.store.dispatch(new packableActions.addOriginalPackable(packable))
    })
    let collectionNames = ['Winter Clothes', 'Hiking','Mountain Climbing','Swimming','Toiletries','Road Trip','Skiing','Baby Stuff']
    let allCollections: CollectionOriginal[] = [];
    collectionNames.forEach(name=>{
      let activity = Math.random() > 0.6 ? true : false;
      let packableIds = allPackables.map(p=>p.id).filter(()=>Math.random()>0.5)
      let collection = new CollectionOriginal(Guid.newGuid(),name,activity,packableIds)
      allCollections.push(collection)
      this.store.dispatch(new collectionActions.addOriginalCollection(collection))
    })
    let profileNames = ['Tom','Steven','Daniel']
    let allProfiles: Profile[] = [];
    profileNames.forEach(name=>{
      let packables = allPackables.filter(()=>Math.random()>0.5).map(p => this.PackableFactory.makePrivate(p))
      let collections = allCollections.filter(()=>Math.random()>0.5).map(c => this.CollectionFactory.makePrivate(c))
      let profile = new Profile(Guid.newGuid(), name, packables, collections)
      allProfiles.push(profile);
      this.store.dispatch(new profileActions.addProfile(profile))
    })
    let destinationId = destinations[Math.floor(Math.random() * destinations.length)].id
    let startdate = moment();
    let endDate = moment().add(5,'days')
    let profiles = allProfiles.map(p => p.id);
    let activities = this.CollectionFactory.getActivityCollections(allCollections).map(a => a.id)
    let trip = new Trip(Guid.newGuid(), startdate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), destinationId, profiles, activities,moment().format())
    this.store.dispatch(new tripActions.addTrip(trip))
  }
}
