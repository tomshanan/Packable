import { Store } from "@ngrx/store";
import * as fromApp from '../app.reducers'
import { Injectable } from '@angular/core';
import { Observable, combineLatest } from "rxjs";
import { PackableOriginal, PackablePrivate, PackableOriginalWithMetaData } from '../models/packable.model';
import { CollectionOriginal, CollectionWithMetadata } from '../models/collection.model';
import { Profile, ProfileWithMetadata } from "../models/profile.model";
import { Trip, DisplayTrip } from '../models/trip.model';
import { DestinationDataService } from './location-data.service';
import * as moment from 'moment';
import { PackingList } from '../models/packing-list.model';
import { State as AdminState } from '@app/admin/store/adminState.model'
import { State as libraryState, LibraryItem } from '@shared/library/library.model'
import { UserService } from './user.service';
import { ItemLibrary, MetaDataNode, Metadata } from '../library/library.model';
import { isDefined, hasNameAndId, hasOrigin } from '../global-functions';

@Injectable()
export class StoreSelectorService {
    public packables$: Observable<{ packables: PackableOriginal[] }>;
    public collections$: Observable<{ collections: CollectionOriginal[] }>;
    public profiles$: Observable<{ profiles: Profile[] }>;
    public trips$: Observable<{ trips: Trip[], incomplete: Trip[], packingLists: PackingList[] }>;
    public adminState$: Observable<AdminState>
    public libraryState$: Observable<libraryState>

    private _originalPackables: PackableOriginal[];
    private _originalCollections: CollectionOriginal[];
    private _profiles: Profile[];
    private _trips: Trip[];
    private _incompleteTrips: Trip[];
    private _packingLists: PackingList[]
    private _adminState: AdminState
    private _libraryState: libraryState
    store$: Observable<[{ packables: PackableOriginal[]; }, { collections: CollectionOriginal[]; }, { profiles: Profile[]; }, { trips: Trip[]; packingLists: PackingList[]; }]>;

    constructor(private store: Store<fromApp.appState>, private destServices: DestinationDataService, private user: UserService) {
        this.packables$ = this.store.select('packables');
        this.collections$ = this.store.select('collections');
        this.profiles$ = this.store.select('profiles');
        this.trips$ = this.store.select('trips');
        this.adminState$ = this.store.select('admin')
        this.libraryState$ = this.store.select('library')
        this.store$ = combineLatest(this.packables$, this.collections$, this.profiles$, this.trips$)

        this.packables$.subscribe(packablesState => {
            this._originalPackables = packablesState.packables;
        })
        this.collections$.subscribe(collectionState => {
            this._originalCollections = collectionState.collections;
        })
        this.profiles$.subscribe(profileState => {
            this._profiles = profileState.profiles;
        })
        this.trips$.subscribe(tripState => {
            this._trips = tripState.trips;
            this._incompleteTrips = tripState.incomplete;
            this._packingLists = tripState.packingLists
        })
        this.adminState$.subscribe(adminState => {
            this._adminState = adminState
        })
        this.libraryState$.subscribe(libState => {
            console.log('StoreSelector: library state updeted', libState);
            this._libraryState = libState
        })

    }
    public get originalPackables(): PackableOriginal[] { return this._originalPackables.slice() }
    public get originalCollections(): CollectionOriginal[] { return this._originalCollections.slice() }
    public get profiles(): Profile[] { return this._profiles.slice() }
    public get trips(): Trip[] { return this._trips.slice() }
    public get incompleteTrips(): Trip[] { return this._incompleteTrips.slice() }
    public get packingLists(): PackingList[] { return this._packingLists.slice() }
    public get adminState(): AdminState { return this._adminState }
    public get isLibraryStore(): boolean {
        return this.user.permissions.creator && this.adminState.simulateUser === false
    }
    public get libraryState(): libraryState {
        let lib = Object.assign({}, this._libraryState)
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
    getLibraryItems(node: keyof ItemLibrary): LibraryItem[] {
        return this.libraryState.library[node] || [];
    }
    getLibraryItemById(node: keyof ItemLibrary, id: string): LibraryItem {
        return this.libraryState.library[node].findId(id) ||
            (console.warn(`could not find item id: ${id} in Library/${node}`), null);
    }

    getLibraryItemsByIds(node: keyof ItemLibrary, ids: string[]): LibraryItem[] {
        let itemsArray: LibraryItem[] = this.libraryState.library[node]
        return itemsArray.filter((x: LibraryItem) => ids.includes(x.id))
    }
    getMetaDataForId(id: string): Metadata {
        return this.libraryState.metaData[id]
    }

    getRemotePackablesWithMetaData(ids?: string[]): PackableOriginalWithMetaData[] {
        let packables = this.libraryState.library.packables
        let remotePackables = packables.map(p => new PackableOriginalWithMetaData(p, this.getMetaDataForId(p.id)))
        if (isDefined(ids)) {
            return remotePackables.filter(c => ids.includes(c.id))
        } else {
            return remotePackables
        }
    }
    getRemoteCollectionsWithMetadata(ids?: string[]): CollectionWithMetadata[] {
        let libCollections: CollectionOriginal[] = this.libraryState.library.collections
        let remoteCollections: CollectionWithMetadata[] = libCollections.map(c => new CollectionWithMetadata(c, this.getMetaDataForId(c.id)))
        if (isDefined(ids)) {
            return remoteCollections.filter(c => ids.includes(c.id))
        } else {
            return remoteCollections
        }
    }
    getRemoteProfiles(ids?: string[]): ProfileWithMetadata[] {
        let profiles = this.libraryState.library.profiles
        let remoteProfiles = profiles.map(p => new ProfileWithMetadata(p, this.getMetaDataForId(p.id)))
        if (isDefined(ids)) {
            return remoteProfiles.filter(c => ids.includes(c.id))
        } else {
            return remoteProfiles
        }
    }
    getPackinglistById(id: string): PackingList {
        return this.packingLists.findId(id) || null;
    }
    getTripById(id: string): Trip {
        return this.trips.find(t => t.id == id) || null;
    }
    getIncompleteTripById(id: string): Trip {
        return this.incompleteTrips.find(t => t.id == id) || null;
    }

    getPackableById(id: string): PackableOriginal {
        let index = this.originalPackables.findIndex(x => x.id === id);
        return index >= 0 ? this.originalPackables[index] : null;
    }
    getPackablesByIds(ids: string[]): PackableOriginal[] {
        return ids.map((id) => {
            return this.getPackableById(id);
        })
    }
    getAllPrivatePackables(collectionId: string, profileId?: string): PackablePrivate[] {
        if (profileId) {
            return this.getProfileById(profileId).collections.find(c => c.id == collectionId).packables.slice()
        } else {
            return this.getCollectionById(collectionId).packables.slice()
        }
    }
    findPrivatePackable(packableId: string, collectionId: string, profileId?: string): PackablePrivate {
        return this.getAllPrivatePackables(collectionId, profileId).find(p => p.id == packableId)
    }

    getProfileById(id: string): Profile {
        return this.profiles.find(x => x.id === id) || (console.log(`could not find id ${id} in profile state:`, this.profiles), null);
    }
    getProfilesById(ids: string[]): Profile[] {
        return ids.map(id => this.getProfileById(id))
    }
    getProfilesWithPackableId(id: string): Profile[] {
        return this.profiles.filter(profile => {
            return profile.collections.some(c => {
                return c.packables.some(p => p.id == id)
            })
        })
    }
    /**
     * Find all profiles that contain a certain packable.
     * @param id the packable id to look up
     */
    getProfilesWithCollectionId(cId: string): Profile[] {
        return this.profiles.filter(p => {
            return p.collections.some(c => {
                return c.id == cId
            })
        })
    }
    getProfilesWithCollectionAndPackable(cId: string, pId: string): Profile[] {
        return this.profiles.filter(profile => {
            return profile.collections.some(c => {
                return c.id == cId && c.packables.some(p => p.id == pId)
            })
        })
    }
    getCollectionsWithPackableId(id: String): CollectionOriginal[] {
        return this.originalCollections.filter(c => {
            return c.packables.some(p => p.id == id)
        })
    }
    getCollectionById(id: string): CollectionOriginal {
        let index = this.originalCollections.findIndex(x => x.id === id);
        return index >= 0 ? this.originalCollections[index] : null;
    }
    getUsedCollectionNames(): Array<hasNameAndId & hasOrigin> {
        return [
            ...this.originalCollections
                .filter(p=>!p.deleted)
                .map(c => { return <hasNameAndId & hasOrigin>{ id: c.id, name: c.name, origin:'local'} }),
            ...this.libraryState.library.collections
                .filter(c => !this.originalCollections.filter(p=>!p.deleted).hasId(c.id))
                .map(c => { return <hasNameAndId & hasOrigin>{ id: c.id, name: c.name,origin:'remote' } }),
        ];
    }
    getUsedPackableNames(): Array<hasNameAndId & hasOrigin>{
        let usedNames:Array<hasNameAndId & hasOrigin> = []
        let originals = this.originalPackables
            .filter(p=>!p.deleted)
            .map(p => { return <hasNameAndId & hasOrigin>{ id: p.id, name: p.name,origin:'local'} })
        let remotes = this.libraryState.library.packables
            .filter(p => !originals.hasId(p.id))
            .map(p => { return <hasNameAndId & hasOrigin>{ id: p.id, name: p.name,origin:'remote' } })
        usedNames.push(...originals)
        usedNames.push(...remotes)
            return usedNames;
    }
}