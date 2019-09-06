import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";


import { Injectable, Pipe } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { Observable, bindCallback, of, Subject } from 'rxjs';

import * as fromApp from '../app.reducers'
import { AuthService } from '../../user/auth.service';
import { PackableOriginal, QuantityRule, QuantityType } from '../models/packable.model';
import { CollectionOriginal } from '../models/collection.model';
import { Profile, Avatar } from '../models/profile.model';
import { StoreSelectorService } from '../services/store-selector.service';
import * as packableActions from '../../packables/store/packables.actions';
import * as collectionActions from '../../collections/store/collections.actions'
import * as tripActions from '../../trips/store/trip.actions';
import * as profileAction from '../../profiles/store/profile.actions'
import * as userActions from '../../user/store/user.actions'
import * as libraryActions from '@shared/library/library.actions'
import { State as LibraryState } from '@shared/library/library.model'
import { PackableFactory } from '../factories/packable.factory';
import { tempOptions, absoluteMax, absoluteMin, WeatherRule, weatherOptions, weatherType } from '../models/weather.model';
import { weatherFactory } from '../factories/weather.factory';
import { CollectionFactory } from '../factories/collection.factory';
import { ProfileFactory } from '../factories/profile.factory';
import { TripFactory } from '../factories/trip.factory';
import { randomBetween, Guid, path, timeStamp } from '../global-functions';
import { IconService } from '../services/icon.service';
import { ColorGeneratorService } from '../services/color-gen.service';
import * as moment from 'moment';
import { Trip } from '../models/trip.model';
import * as profileActions from '@app/profiles/store/profile.actions';
import { setPackableState } from '../../packables/store/packables.actions';
import { defaultUserSettings, userPermissions, defaultUserState } from '@app/user/store/userState.model';
import { setUserPermissions, setUserSettings } from '../../user/store/user.actions';
import { State as userConfig } from '../../user/store/userState.model';
import * as AdminActions from '@app/admin/store/admin.actions'
import { UserService } from '../services/user.service';
import * as adminActions from '../../admin/store/admin.actions';
import { User } from '../../admin/store/adminState.model';
import { PackingList, PackingListPackable } from '../models/packing-list.model';
import { initialLibraryState } from '../library/library.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TripWeatherData } from '../services/weather.service';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { aliasExists } from '../../../../../Packable-firebase/functions/src/index';

export type nodeOptions = 'packables' | 'collections' | 'profiles' | 'tripState';
export type nodeOrAll = nodeOptions | 'all'

type updates = { [path: string]: any }
type configItem = { [id: string]: userConfig }
type firebaseItem = { [id: string]: { [x: string]: any } }
type localItem = { id: string, userCreated?: boolean, [x: string]: any }

const USER_CONFIG = 'userConfig'
const USERS = 'users'
const SETTINGS = 'settings'
const PERMISSIONS = 'permissions'
const LIBRARY = 'library'

function log(...arg) {
    console.log('📡 ', ...arg)
}
function warn(...arg) {
    console.warn('📡~⚠️ ', ...arg)
}

@Injectable()
export class StorageService {
    constructor(
        private store: Store<fromApp.appState>,
        private authService: AuthService,
        private user: UserService,
        private storeSelector: StoreSelectorService,
        private packableFactory: PackableFactory,
        private collectionFactory: CollectionFactory,
        private profileFactory: ProfileFactory,
        private tripFactory: TripFactory,
        private iconService: IconService,
        private colorGen: ColorGeneratorService,
        private http:HttpClient,
        private weatherFactory: weatherFactory,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {

    }
    private get userId(): string {
        return firebase.auth().currentUser.uid
    }
    private get pathToUserItems(): string {
        if (this.storeSelector.isLibraryStore) {
            log('<<  Accessing items in Library >>');
            return LIBRARY
        } else {
            return path(USERS, this.userId)
        }
    }
    private isAuthenitcated(logmessage: any = ''): boolean {
        if (this.authService.isAuthenticated) {
            return true
        } else {
            log('Could Not Authenticate.\n', logmessage);
            return false
        }
    }
    checkAliasAvailable(alias:string):Promise<boolean>{
        const apiUrl = `https://www.packable.app/api.php?aliasExists=`
        return this.http.get(apiUrl+alias).toPromise().then((res:{aliasExists:boolean})=>!res['aliasExists'])
    }
    getUserConfig() {
        if (this.isAuthenitcated()) {
            log('requesting config')
            firebase.database().ref(path(USER_CONFIG, this.userId)).once('value', snapshot => {
                let data = snapshot.val();
                log('receiving config data') // , JSON.stringify(data)
                if (data) {
                    log(`saving user state`);
                    this.store.dispatch(new userActions.setUserState(data))
                } else {
                    log(`data was empty`);
                    this.setInitialUserConfig()
                }
            }).catch(e => {
                log(e.message)
                this.setInitialUserConfig()
            })
        }
    }
    listenToUserItems() {
        if (this.isAuthenitcated()) {
            let target: 'user' | 'library' = this.storeSelector.isLibraryStore ? 'library' : 'user';
            log('Current listening target: ' + target)
            let callBack = () => {
                log(`~~-> listening to: ${this.pathToUserItems}`)
                firebase.database().ref(this.pathToUserItems).on('child_changed', (snapshot) => {
                    let data: { [x: string]: any } = {}
                    let node = <nodeOptions>snapshot.key
                    data[node] = snapshot.val()
                    log(`received CHANGED data from ${node} library `)//+JSON.stringify(data)
                    this.tidayAndStoreUserItems(data, [node])
                })
                firebase.database().ref(this.pathToUserItems).on('child_added', (snapshot) => {
                    let data: { [x: string]: any } = {}
                    let node = <nodeOptions>snapshot.key
                    data[node] = snapshot.val()
                    log(`received ADDED data from ${node} library `)//+JSON.stringify(data)
                    this.tidayAndStoreUserItems(data, [node])
                })
                firebase.database().ref(this.pathToUserItems).on('child_removed', (snapshot) => {
                    let node = <nodeOptions>snapshot.key
                    log(`received REMOVED data from ${node} library `)//+JSON.stringify(data)
                    this.tidayAndStoreUserItems({}, [node])
                })
            }
            if (target == 'user') {
                firebase.database().ref(LIBRARY).off()
                callBack()
            } else if (target == 'library') {
                firebase.database().ref(path(USERS, this.userId)).off()
                callBack()
            }

        }
    }
    getLibrary() {
        if (this.isAuthenitcated()) {
            firebase.database().ref(LIBRARY).once('value', snapshot => {
                log(`received library items`)
                let data = snapshot.val()
                let newLibraryState: LibraryState = initialLibraryState
                if (data['packables']) {
                    let packables: PackableOriginal[] = this.unwrapForLocalStore(data['packables']).map((p: PackableOriginal) => {
                        let packable = this.packableFactory.clonePackableOriginal(p)
                        packable.userCreated = false
                        return packable
                    })
                    newLibraryState.library.packables = packables
                }
                if (data['collections']) {
                    let collections: CollectionOriginal[] = this.unwrapForLocalStore(data['collections']).map((c: CollectionOriginal) => {
                        let collection = this.collectionFactory.duplicateOriginalCollection(c)
                        collection.userCreated = false
                        return collection
                    })
                    newLibraryState.library.collections = collections
                }
                if (data['profiles']) {
                    let profiles: Profile[] = this.unwrapForLocalStore(data['profiles']).map((p: Profile) => {
                        let profile = this.profileFactory.duplicateProfile(p)
                        return profile
                    })
                    newLibraryState.library.profiles = profiles
                }
                if (data['metaData']) {
                    newLibraryState.metaData = data['metaData']
                }
                if (data['destMetaData']) {
                    newLibraryState.destMetaData = data['destMetaData']
                }
                this.store.dispatch(new libraryActions.SetLibraryState(newLibraryState))
            }).catch(e => {
                this.store.dispatch(new libraryActions.loadLibraryError(e['message']))
            }) // ERROR HANDELING GOES HERE, SEND EMPTY LIBRARY STATE TO STOP LOADING STATE
        } else {
            this.store.dispatch(new libraryActions.loadLibraryError('Cannot Authenticate User'))

        }
    }
    initialGetAllItems() {
        this.listenToUserItems()
        this.getLibrary()
    }
    private tidayAndStoreUserItems(data: {}, replace: nodeOrAll[] = []): void {
        if (data !== null) {
            log(`tidayAndStoreUserItems received data`, data, '\nReplace:', replace); //JSON.stringify(data)

            if (data['packables']) {
                let packables: PackableOriginal[] = this.unwrapForLocalStore(data['packables']).map((p: PackableOriginal) => this.packableFactory.clonePackableOriginal(p))
                this.store.dispatch(new packableActions.setPackableState(packables))
            } else if (replace.includes('all') || replace.includes('packables')) {
                this.store.dispatch(new packableActions.setPackableState([]))
            }
            if (data['collections']) {
                let collections: CollectionOriginal[] = this.unwrapForLocalStore(data['collections']).map((c: CollectionOriginal) => this.collectionFactory.duplicateOriginalCollection(c))
                this.store.dispatch(new collectionActions.setCollectionState(collections))
            } else if (replace.includes('all') || replace.includes('collections')) {
                this.store.dispatch(new collectionActions.setCollectionState([]))
            }
            if (data['profiles']) {
                let profiles: Profile[] = this.unwrapForLocalStore(data['profiles']).map((profile: Profile) => this.profileFactory.duplicateProfile(profile))
                this.store.dispatch(new profileAction.setProfileState(profiles))
            } else if (replace.includes('all') || replace.includes('profiles')) {
                this.store.dispatch(new profileAction.setProfileState([]))
            }
            if (data['tripState']) {
                let _trips: Trip[] = data['tripState']['trips'] ? this.unwrapForLocalStore(data['tripState']['trips']).map((t: Trip) => this.tripFactory.duplicateTrip(t)) : [];
                let _incomplete: Trip[] = data['tripState']['incomplete'] ? this.unwrapForLocalStore(data['tripState']['incomplete']).map((t: Trip) => this.tripFactory.duplicateTrip(t)) : [];
                let _packingLists: PackingList[] = this.unwrapPackingLists(data['tripState']['packingLists'])

                this.store.dispatch(new tripActions.setTripState({
                    trips: _trips,
                    incomplete: _incomplete,
                    packingLists: _packingLists
                }))
            } else if (replace.includes('all') || replace.includes('tripState')) {
                this.store.dispatch(new tripActions.setTripState({
                    trips: [],
                    incomplete: [],
                    packingLists: []
                }))
            }
        }
    }
    setUserItemsNode(node: nodeOptions) {
        if (this.isAuthenitcated()) {
            let data;
            switch (node) {
                case 'packables':
                    data = this.wrapForStorage(this.storeSelector.originalPackables);
                    break;
                case 'collections':
                    data = this.wrapForStorage(this.storeSelector.originalCollections);
                    break;
                case 'profiles':
                    data = this.wrapForStorage(this.storeSelector.profiles);
                    break;
                case 'tripState':
                    data = {
                        trips: this.wrapForStorage(this.storeSelector.trips),
                        incomplete: this.wrapForStorage(this.storeSelector.incompleteTrips),
                        packingLists: this.wrapPackingLists(this.storeSelector.packingLists)
                    }
                    break;
            }
            firebase.database().ref(path(this.pathToUserItems, node)).set(data)
                .then(() => {
                    log(`<-~-> saved ${node} successfully`);
                }, (e) => {
                    warn(`<-~-> FAILED to save ${node}`, e);
                })
        }
    }
    saveItemsInUser(node: nodeOptions, items: localItem[], subNodes: string[] = []) {
        if (this.isAuthenitcated()) {
            let updates: updates = {}
            let wrappedItems = this.wrapForStorage(items)
            for (let item in wrappedItems) {
                let itempath = path(this.pathToUserItems, node, ...subNodes, item)
                updates[itempath] = wrappedItems[item]
            }
            if (Object.keys(updates).length > 0) {
                firebase.database().ref().update(updates).then(() => {
                    log(`Saved items in ${path(node, ...subNodes)}`, updates);
                })
            } else {
                log('No updates to save', items)
            }
        }
    }
    savePackingListPackables(packingList:PackingList, packables: PackingListPackable[]) {
        if (this.isAuthenitcated()) {
            let updates: updates = {}
            Object.values(packables).forEach((packable)=>{
                let profileId = packable.profileID || 'shared';
                let packableId = packable.id
                let itempath = path(this.pathToUserItems, 'tripState', 'packingLists', packingList.id, 'packables',  profileId, packableId)
                log('itemPath:',itempath)
                updates[itempath] = packable
            })
            
            if (Object.keys(updates).length > 0) {
                updates[path(this.pathToUserItems, 'tripState', 'packingLists', packingList.id,'dateModified')] = packingList.dateModified
                firebase.database().ref().update(updates).then(() => {
                    log(`Saved packingList Packables`, updates);
                })
            } else {
                log('No updates to save', packables)
            }
        }
    }
    removeItemsInUser(node: nodeOptions, ids: string[], subNode: string = '') {
        if (this.isAuthenitcated()) {
            let updates: updates = {}
            ids.forEach(id => {
                let itemPath = path(this.pathToUserItems, node, subNode, id)
                updates[itemPath] = null
            })
            if (Object.keys(updates).length > 0) {
                firebase.database().ref().update(updates).then(() => {
                    log(`Removed ${node}/${subNode} items\nUpdates:`, updates);
                })
            } else {
                log('No updates to save', ids)
            }
        }
    }


    setAllUserItemsAndSettings() {
        if (this.isAuthenitcated()) {
            log(`Setting all user items and settings to FireBase (setAllUserItemsAndSettings)`);
            let updates: updates = {}
            let userData = {
                packables: this.wrapForStorage(this.storeSelector.originalPackables),
                collections: this.wrapForStorage(this.storeSelector.originalCollections),
                profiles: this.wrapForStorage(this.storeSelector.profiles),
                tripState: {
                    trips: this.wrapForStorage(this.storeSelector.trips),
                    incomplete: this.wrapForStorage(this.storeSelector.incompleteTrips),
                    packingLists: this.wrapPackingLists(this.storeSelector.packingLists)
                },
            }
            updates[this.pathToUserItems] = userData
            updates[path(USER_CONFIG, this.userId, SETTINGS)] = this.user.settings
            firebase.database().ref().update(updates).then(() => {
                log('Saved (setAllUserItemsAndSettings)');
            })
        }
    }
    saveUserSettings() {
        if (this.isAuthenitcated()) {
            let data = this.user.settings
            firebase.database().ref(path(USER_CONFIG, this.userId, SETTINGS)).set(data).then(() => {
                log('Saved (saveUserSettings)');
            })
        }
    }
    async setInitialUserConfig() {
        log(`setting initial user data`);
        if (this.isAuthenitcated()) {
            log('signed in as '+firebase.auth().currentUser.email)
            let initialConfig = defaultUserState
            initialConfig.settings.email = firebase.auth().currentUser.email
            initialConfig.settings.alias =  await this.createNewAliasName(initialConfig.settings.email)
            log('Setting alias name:',initialConfig.settings.alias)
            log(`saving initial data to firebase`,initialConfig);
            firebase.database().ref(path(USER_CONFIG, this.userId)).set({settings:initialConfig.settings,permissions:initialConfig.permissions})
                .then(() => {
                    log('setting userState in store:\n', initialConfig)
                    this.store.dispatch(new userActions.setUserState(initialConfig))
                }, (e) => {
                    log('failed to set userConfig:\n', e)
                })
        }
    }
    createNewAliasName(email:string,retry:boolean = false):Promise<string> {
        let alias = email.split('@')[0]
        if(retry){
            alias += randomBetween(0,10000).toString().padStart(4,"0")
        }
        log('Trying to use alias:',alias)
        return this.checkAliasAvailable(alias).then(available=>{
            if(available){
                log('>',alias," is available")
                return alias
            } else {
                log('>',alias," already exists")
                return this.createNewAliasName(email,true)
            }
        }).catch(rejected=>{
            log('Could not create alias, using GUID instead')
            return Guid.newGuid().substr(0,10)
        })
    }

    adminDeleteUsers(ids: string[]) {
        if (this.isAuthenitcated()) {
            if (this.user.permissions.userManagement) {
                log('attempting to delete users')
                let updates: updates = {}
                ids.forEach(id => {
                    firebase.database().ref(path(USER_CONFIG, id)).remove().then(() => {
                        log('users deleted: ',id);
                    }).catch(e => {
                        log('unable to delete users', updates, e['message']);
                    });
                })
            } else {
                warn('You are unable to delete users.')
            }
        }
    }

    adminSetUserData(action) {
        log('attempting to change permissions', action)
        if (this.isAuthenitcated()) {
            if (action.type == AdminActions.ADMIN_SET_PERMISSIONS
                && this.user.permissions.setPermissions) {
                log('attempting to change permissions')
                let changes = (<AdminActions.adminSetPermissions>action).payload
                let updates: updates = {}
                changes.forEach(change => {
                    updates[path(USER_CONFIG, change.id, PERMISSIONS)] = change.permissions
                })
                firebase.database().ref().update(updates).then(() => {
                    log('permissions updated');
                });
            } else {
                warn('You are unable to change permissions.')
            }
        }
    }


    //adminUserConfig$: Subject<configItem>
    adminListenToUserConfig(listen: boolean = true) {
        if (this.isAuthenitcated()) {
            if (this.user.permissions.userManagement) {
                if (!!listen) {
                    //this.adminUserConfig$ = new Subject()
                    firebase.database().ref(USER_CONFIG).on('value', (snapshot) => {
                        //this.adminUserConfig$.next(snapshot.val())
                        let records: configItem = snapshot.val();
                        let newData: User[] = []
                        for (let record in records) {
                            newData.push({
                                id: record,
                                permissions: records[record].permissions,
                                alias: records[record].settings.alias
                            })
                        }
                        this.store.dispatch(new adminActions.adminSetUsers(newData))
                    })
                } else {
                    //this.adminUserConfig$.complete()
                    firebase.database().ref(USER_CONFIG).off()
                }
            }
        }
    }
    wrapPackingLists(packingLists:PackingList[]):firebaseItem{
        return this.wrapForStorage(packingLists.map(list=>{
            return {
                ...list,
                packables: this.wrapPackingListsPackables(list.packables),
            }
        }))
    }
    unwrapPackingLists(packingLists:firebaseItem = {}):PackingList[]{
        for(let list in packingLists){
            (<PackingList>packingLists[list]).packables = this.unwrapPackingListsPackables(packingLists[list].packables);
            (<PackingList>packingLists[list]).data.weatherData = new TripWeatherData((<PackingList>packingLists[list]).data.weatherData);
        }
        return this.unwrapForLocalStore(packingLists)
    }
    wrapPackingListsPackables(packables: PackingListPackable[]): firebaseItem {
        let firebaseData: firebaseItem = {}
        packables.forEach(p => {
                let profileId = p.profileID || 'shared';
                firebaseData[profileId] = firebaseData[profileId] || {}
                firebaseData[profileId][p.id] = Object.assign({}, p)
        });
        return firebaseData
    }
    unwrapPackingListsPackables(profiles: firebaseItem = {}): PackingListPackable[] {
        let itemArray: PackingListPackable[] = [];
        for (let profile in profiles) {
            for(let packable in profiles[profile]){
                itemArray.push(<PackingListPackable>Object.assign({},profiles[profile][packable]))
            }
        }
        return itemArray
    }
    wrapForStorage(items: localItem[]): firebaseItem {
        let firebaseData: firebaseItem = {}
        items.forEach(item => {
            firebaseData[item.id] = Object.assign({}, item)
        })
        return firebaseData
    }

    unwrapForLocalStore<T extends localItem>(firebaseItems: firebaseItem = {}): T[] {
        let itemArray: T[] = [];
        for (let item in firebaseItems) {
            let newItem: T;
            if('id' in firebaseItems[item]){
                newItem = <T>firebaseItems[item]
            } else {
                newItem = <T>{ id: item, ...firebaseItems[item] }
            }
            if ('userCreated' in newItem && this.storeSelector.isLibraryStore) {
                newItem['userCreated'] = true
            }
            itemArray.push(newItem)
        }
        return itemArray
    }


}
