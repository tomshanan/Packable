import { Store } from "@ngrx/store";
import * as fromApp from '../app.reducers'
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { PackableOriginal, PackableAny, PackableComplete, PackablePrivate } from '../models/packable.model';
import { CollectionOriginal, CollectionAny, CollectionComplete, isCollectionOriginal, isCollectionPrivate } from '../models/collection.model';
import { Profile, ProfileComplete } from "../models/profile.model";
import { Trip, displayTrip } from '../models/trip.model';
import { DestinationDataService } from './location-data.service';
import * as moment from 'moment';
import { PackingList } from '../models/packing-list.model';

@Injectable()
export class StoreSelectorService{    
    public packables_obs:Observable<{packables: PackableOriginal[]}>;
    public collections_obs:Observable<{collections: CollectionOriginal[]}>;
    public profiles_obs:Observable<{profiles: Profile[]}>;
    public trips_obs:Observable<{trips: Trip[],packingLists:PackingList[]}>;

    private _originalPackables: PackableOriginal[];
    private _originalCollections: CollectionOriginal[];
    private _profiles: Profile[];
    private _trips: Trip[];
    private _packingLists: PackingList[]
    
    public get originalPackables(): PackableOriginal[] {return this._originalPackables.slice()}
    public get originalCollections(): CollectionOriginal[] {return this._originalCollections.slice()}
    public get profiles(): Profile[] {return this._profiles.slice()}
    public get trips(): Trip[]  {return this._trips.slice()}
    public get packingLists(): PackingList[] { return this._packingLists.slice()}



    constructor(private store:Store<fromApp.appState>, private destServices: DestinationDataService){
        this.packables_obs = this.store.select('packables');
        this.collections_obs = this.store.select('collections');
        this.profiles_obs = this.store.select('profiles');
        this.trips_obs = this.store.select('trips');

        this.packables_obs.subscribe(packablesState =>{
            this._originalPackables = packablesState.packables;
        })
        this.collections_obs.subscribe(collectionState =>{
            this._originalCollections = collectionState.collections;
        })
        this.profiles_obs.subscribe(profileState =>{
            this._profiles = profileState.profiles;
        })
        this.trips_obs.subscribe(tripState =>{
            this._trips = tripState.trips;
            this._packingLists = tripState.packingLists
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
            let profiles = [];
            trip.profiles.forEach(pid => {
                let p = this.getProfileById(pid)
                if (p){
                    profiles.push(p.name) 
                }
            })
            let activities = [];
            trip.activities.forEach(aid => {
                let c = this.getCollectionById(aid)
                if (c){
                    activities.push(c.name) 
                }
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
    getAllPrivatePackables(collectionId:string, profileId?:string):PackablePrivate[]{
        if(profileId){
            return this.getProfileById(profileId).collections.find(c=>c.id == collectionId).packables.slice()
        } else {
            return this.getCollectionById(collectionId).packables.slice()
        }
    }
    findPrivatePackable(packableId:string, collectionId: string, profileId?: string):PackablePrivate{
        return this.getAllPrivatePackables(collectionId,profileId).find(p=>p.id==packableId)
    }

    getProfileById(id:string):Profile{
        return this.profiles.find(x => x.id === id) || (console.log(`could not find id ${id} in profile state:`,this.profiles), null);
    }
    
    getProfilesWithPackableId(id:string):Profile[] {
        return this.profiles.filter(pr=>{
            return pr.collections.some(c=>{
                return c.packables.some(p=>p.id==id)
            })
        })
    }
    /**
     * Find all profiles that contain a certain packable.
     * @param id the packable id to look up
     */
    getProfilesWithCollectionId(cId:string):Profile[] {
        return this.profiles.filter(pr=>{
            return pr.collections.some(c=>{
                return c.id == cId
            })
        })
    }
    getProfilesWithCollectionAndPackable(cId:string, pId:string):Profile[] {
        return this.profiles.filter(pr=>{
            return pr.collections.some(c=>{
                return c.id == cId && c.packables.some(p=>p.id == pId)
            })
        })
    }
    getCollectionsWithPackableId(id:String):CollectionOriginal[] {
        return this.originalCollections.filter(c=>{
            return c.packables.some(p=>p.id == id)
        })
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