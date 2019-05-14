import { Store } from "@ngrx/store";
import * as fromApp from '../app.reducers'
import { Injectable } from '@angular/core';
import { Observable, combineLatest } from "rxjs";
import { PackableOriginal, PackablePrivate, remotePackable } from '../models/packable.model';
import { CollectionOriginal } from '../models/collection.model';
import { Profile } from "../models/profile.model";
import { Trip, displayTrip } from '../models/trip.model';
import { DestinationDataService } from './location-data.service';
import * as moment from 'moment';
import { PackingList } from '../models/packing-list.model';
import {State as AdminState} from '@app/admin/store/adminState.model'
import {State as libraryState, libraryItem, remoteCollection, remoteProfile} from '@shared/library/library.model'
import { UserService } from './user.service';
import { ItemLibrary, MetaDataNode, ItemMetaData } from '../library/library.model';
import { isDefined } from '../global-functions';

@Injectable()
export class StoreSelectorService{    
    public packables_obs:Observable<{packables: PackableOriginal[]}>;
    public collections_obs:Observable<{collections: CollectionOriginal[]}>;
    public profiles_obs:Observable<{profiles: Profile[]}>;
    public trips_obs:Observable<{trips: Trip[], incomplete: Trip[], packingLists:PackingList[]}>;
    public adminState_obs: Observable<AdminState>
    public libraryState_obs: Observable<libraryState>

    private _originalPackables: PackableOriginal[];
    private _originalCollections: CollectionOriginal[];
    private _profiles: Profile[];
    private _trips: Trip[];
    private _incompleteTrips: Trip[];
    private _packingLists: PackingList[]
    private _adminState: AdminState
    private _libraryState: libraryState
    store_obs: Observable<[{ packables: PackableOriginal[]; }, { collections: CollectionOriginal[]; }, { profiles: Profile[]; }, { trips: Trip[]; packingLists: PackingList[]; }]>;

    constructor(private store:Store<fromApp.appState>, private destServices: DestinationDataService, private user: UserService){
        this.packables_obs = this.store.select('packables');
        this.collections_obs = this.store.select('collections');
        this.profiles_obs = this.store.select('profiles');
        this.trips_obs = this.store.select('trips');
        this.adminState_obs = this.store.select('admin')
        this.libraryState_obs = this.store.select('library')
        this.store_obs = combineLatest(this.packables_obs,this.collections_obs,this.profiles_obs,this.trips_obs)

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
            this._incompleteTrips = tripState.incomplete;
            this._packingLists = tripState.packingLists
        })
        this.adminState_obs.subscribe(adminState =>{
            this._adminState = adminState
        })
        this.libraryState_obs.subscribe(libState =>{
            console.log('StoreSelector: library state updeted',libState);
            this._libraryState = libState
        })
        
    }
    public get originalPackables(): PackableOriginal[] {return this._originalPackables.slice()}
    public get originalCollections(): CollectionOriginal[] {return this._originalCollections.slice()}
    public get profiles(): Profile[] {return this._profiles.slice()}
    public get trips(): Trip[]  {return this._trips.slice()}
    public get incompleteTrips(): Trip[]  {return this._incompleteTrips.slice()}
    public get packingLists(): PackingList[] { return this._packingLists.slice()}
    public get adminState(): AdminState { return this._adminState}
    public get isLibraryStore():boolean {
        return this.user.permissions.creator && this.adminState.simulateUser===false
    }
    public get libraryState():libraryState { 
        let lib = Object.assign({},this._libraryState)
        // // DEEPER COPY:
        // for (let node in lib.library){
        //     lib.library[node] = lib.library[node].slice()
        // }
        // lib.metaData = Object.assign({},lib.metaData)
        // for (let node in lib.metaData){
        //     lib.metaData[node] = Object.assign({}, lib.metaData[node])
        // }
        return lib
    }
    getLibraryItemById(node:keyof ItemLibrary,id:string):libraryItem{
        return this.libraryState.library[node].findId(id) || 
        (console.warn(`could not find item id: ${id} in Library/${node}`), null);
    }
    
    getLibraryItemsByIds(node:keyof ItemLibrary,ids:string[]):libraryItem[]{
       let itemsArray:libraryItem[] = this.libraryState.library[node]
       return itemsArray.filter((x:libraryItem)=>ids.includes(x.id))
    }
    getMetaDataForId(id:string): ItemMetaData{
        return this.libraryState.metaData[id]
    }

    getRemotePackables(ids?:string[]):remotePackable[]{
        let packables = this.libraryState.library.packables
        let remotePackables = packables.map(p=>new remotePackable(p,this.getMetaDataForId(p.id)))
        if(isDefined(ids)){
            return remotePackables.filter(c=>ids.includes(c.id))
        } else {
            return remotePackables
        } 
    }
    getRemoteCollections(ids?:string[]):remoteCollection[]{
        let libCollections:CollectionOriginal[] = this.libraryState.library.collections
        let remoteCollections:remoteCollection[] = libCollections.map(c=>new remoteCollection(c,this.getMetaDataForId(c.id)))
        if(isDefined(ids)){
            return remoteCollections.filter(c=>ids.includes(c.id))
        } else {
            return remoteCollections
        }
    }
    getRemoteProfiles(ids?:string[]):remoteProfile[]{
        let profiles = this.libraryState.library.profiles
        let remoteProfiles = profiles.map(p=>new remoteProfile(p,this.getMetaDataForId(p.id)))
        if(isDefined(ids)){
            return remoteProfiles.filter(c=>ids.includes(c.id))
        } else {
            return remoteProfiles
        } 
    }

    getTripById(id:string):Trip{
        return this.trips.find(t=>t.id == id) || null;
    }
    getIncompleteTripById(id:string):Trip{
        return this.incompleteTrips.find(t=>t.id == id) || null;
    }
    getDisplayTrips(trips:Trip[]): displayTrip[]{
        return trips.map(trip =>{
            let destination = this.destServices.DestinationByCityId(trip.destinationId)
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
            let collections = [];
            trip.collections.forEach(aid => {
                let c = this.getCollectionById(aid.id)
                if (c){
                    collections.push(c.name) 
                }
            })
            return {
                id: trip.id,
                displayDate: dates,
                temp: 'TBC',
                destinationName: destination.fullName,
                profileNames: profiles,
                collectionNames: collections,
                dateModified: trip.dateModified
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
    getProfilesById(ids:string[]):Profile[]{
        return ids.map(id=>this.getProfileById(id))
    }
    getProfilesWithPackableId(id:string):Profile[] {
        return this.profiles.filter(profile=>{
            return profile.collections.some(c=>{
                return c.packables.some(p=>p.id==id)
            })
        })
    }
    /**
     * Find all profiles that contain a certain packable.
     * @param id the packable id to look up
     */
    getProfilesWithCollectionId(cId:string):Profile[] {
        return this.profiles.filter(p=>{
            return p.collections.some(c=>{
                return c.id == cId
            })
        })
    }
    getProfilesWithCollectionAndPackable(cId:string, pId:string):Profile[] {
        return this.profiles.filter(profile=>{
            return profile.collections.some(c=>{
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