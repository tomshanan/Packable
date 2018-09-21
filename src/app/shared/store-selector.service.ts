import { Store } from "@ngrx/store";
import * as fromApp from './app.reducers'
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { PackableOriginal, PackableAny, PackableComplete } from './models/packable.model';
import { CollectionOriginal, CollectionAny, CollectionComplete, isCollectionOriginal, isCollectionPrivate } from './models/collection.model';
import { Profile, ProfileComplete } from "./models/profile.model";
import { Trip, displayTrip } from './models/trip.model';
import { DestinationDataService } from './location-data.service';
import * as moment from 'moment';

@Injectable()
export class StoreSelectorService{    
    public packables_obs:Observable<{packables: PackableOriginal[]}>;
    public collections_obs:Observable<{collections: CollectionOriginal[]}>;
    public profiles_obs:Observable<{profiles: Profile[]}>;
    public trips_obs:Observable<{trips: Trip[]}>;

    public originalPackables: PackableOriginal[];
    public originalCollections: CollectionOriginal[];
    public profiles: Profile[];
    public trips: Trip[];

    constructor(private store:Store<fromApp.appState>, private destServices: DestinationDataService){
        this.packables_obs = this.store.select('packables');
        this.collections_obs = this.store.select('collections');
        this.profiles_obs = this.store.select('profiles');
        this.trips_obs = this.store.select('trips');

        this.packables_obs.subscribe(packablesState =>{
            this.originalPackables = packablesState.packables;
        })
        this.collections_obs.subscribe(collectionState =>{
            this.originalCollections = collectionState.collections;
        })
        this.profiles_obs.subscribe(profileState =>{
            this.profiles = profileState.profiles;
        })
        this.trips_obs.subscribe(tripState =>{
            this.trips = tripState.trips;
        })
    }

    getTripById(id:string):Trip{
        return this.trips.find(t=>t.id == id) || null;
    }
    getDisplayTrips(trips:Trip[]): displayTrip[]{
        return trips.map(trip =>{
            let destination = this.destServices.cityById(trip.destinationId)
            let startDate = moment(trip.startDate)
            let endDate = moment(trip.endDate)
            let dates:string;
            if (startDate.month != endDate.month){
                dates = `${startDate.format('D MMM')} - ${endDate.format('D MMM')}`
            } else {
                dates = `${startDate.date()} - ${endDate.format('D MMMM')}`
            }
            let profiles = trip.profiles.map(pid => {
                return this.getProfileById(pid).name
            })
            let activities = trip.activities.map(aid => {
                return this.getCollectionById(aid).name
            })
            return {
                id: trip.id,
                displayDate: dates,
                temp: 'TBC',
                destinationName: destination,
                profileNames: profiles,
                activityNames: activities,
                updated: trip.updated
            }
        })
    }
    getPackableById(id:string):PackableOriginal {
        let index = this.originalPackables.findIndex(x => x.id === id);
        return index >= 0 ? this.originalPackables[index]: null;
    }
    getPackablesByIds(ids:string[]):PackableOriginal[] {
        return ids.map((id)=>{
            return this.getPackableById(id);
        })
    }
    getProfileById(id:string):Profile{
        let foundPorfile:Profile;
        let index = this.profiles.findIndex(x => x.id === id)
        return index >= 0 ? this.profiles[index]: null;
    }
    
    getCollectionById(id:string):CollectionOriginal {
        let index = this.originalCollections.findIndex(x => x.id === id);
        return index >= 0 ? this.originalCollections[index]: null;
    }

    getUsedCollectionNames():string[]{
        let usedNames = [];
        for (let collection of this.originalCollections) {
            usedNames.push(collection.name.toLowerCase());
        }
        return usedNames;
    }
    getUsedPackableNames():string[]{
        let usedNames = [];
        for (let packable of this.originalPackables) {
            usedNames.push(packable.name.toLowerCase());
        }
        return usedNames;
    }
}