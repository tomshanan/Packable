import * as firebase from 'firebase';
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
import {State as LibraryState} from '@shared/library/library.model'
import { PackableFactory } from '../factories/packable.factory';
import {tempOptions, absoluteMax, absoluteMin, WeatherRule, weatherOptions, weatherType } from '../models/weather.model';
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
import { defaultUserSettings, userPermissions, defaultUserConfigState } from '@app/user/store/userState.model';
import { setUserPermissions, setUserSettings } from '../../user/store/user.actions';
import { State as userConfig } from '../../user/store/userState.model';
import * as AdminActions from '@app/admin/store/admin.actions'
import { UserService } from '../services/user.service';
import * as adminActions from '../../admin/store/admin.actions';
import { User } from '../../admin/store/adminState.model';
import { PackingList } from '../models/packing-list.model';
import { initialLibraryState } from '../library/library.model';
import { Router, ActivatedRoute } from '@angular/router';
export type nodeOptions = 'packables' | 'collections' | 'profiles' | 'tripState';
export type nodeOrAll = nodeOptions | 'all'

type updates = { [path: string]: any } 
type configItem = {[id:string]:userConfig}
type firebaseItem =  {[id:string]:{[x:string]:any}}
type localItem = {id:string, [x:string]:any}

const USER_CONFIG = 'userConfig'
const USERS = 'users'
const SETTINGS = 'settings'
const PERMISSIONS = 'permissions'
const LIBRARY = 'library'

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
        private weatherFactory: weatherFactory,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {

    }
    private get userId():string{
        return firebase.auth().currentUser.uid
    }
    private get pathToUserItems():string{
        if(this.storeSelector.isLibraryStore){
            this.log('<<  Accessing items in Library >>');
            return LIBRARY
        } else {
            return path(USERS,this.userId)
        }
    }
    private checkAuth(logmessage: any = ''): boolean {
        if (this.authService.isAuthenticated) {
            return true
        } else {
            this.log('Could Not Authenticate.\n', logmessage);
            return false
        }
    }
    private log(...arg){
        console.log('📡 ',...arg)
    }
    private warn(...arg){
        console.warn('📡~⚠️ ',...arg)
    }
    
    getUserConfig() {
        if (this.checkAuth()) {
            this.log('requesting config')
            firebase.database().ref(path(USER_CONFIG,this.userId)).once('value', snapshot => {
                let data = snapshot.val();
                this.log('receiving config data') // , JSON.stringify(data)
                if (data) {
                    this.log(`saving user state`);
                    this.store.dispatch(new userActions.setUserState(data))
                } else {
                    this.log(`data was empty`);
                    this.setInitialUserConfig()
                }
            }).catch(e=>{
                this.log(e.message)
                this.setInitialUserConfig()
            })
        }
    }
    listenToUserItems(){
        if (this.checkAuth()) {
            let target:'user'|'library' = this.storeSelector.isLibraryStore ? 'library' : 'user';
            this.log('Current listening target: '+target)
            let callBack = ()=> {
                this.log(`~~-> listening to: ${this.pathToUserItems}`)
                firebase.database().ref(this.pathToUserItems).on('child_changed', (snapshot)=>{
                    let data: {[x:string]:any} = {}
                    let node = <nodeOptions>snapshot.key
                    data[node] = snapshot.val()
                    this.log(`received CHANGED data from ${node} library `)//+JSON.stringify(data)
                    this.tidayAndStoreUserItems(data,[node])
                })
                firebase.database().ref(this.pathToUserItems).on('child_added', (snapshot)=>{
                    let data: {[x:string]:any} = {}
                    let node = <nodeOptions>snapshot.key
                    data[node] = snapshot.val()
                    this.log(`received ADDED data from ${node} library `)//+JSON.stringify(data)
                    this.tidayAndStoreUserItems(data,[node])
                })
                firebase.database().ref(this.pathToUserItems).on('child_removed', (snapshot)=>{
                    let node = <nodeOptions>snapshot.key
                    this.log(`received REMOVED data from ${node} library `)//+JSON.stringify(data)
                    this.tidayAndStoreUserItems({},[node])
                })
            } 
            if (target == 'user') {
                firebase.database().ref(LIBRARY).off()
                callBack()
            } else if (target == 'library'){
                firebase.database().ref(path(USERS,this.userId)).off()
                callBack()
            }
            
        }
    }
    getLibrary(){
        if(this.checkAuth()){
            firebase.database().ref(LIBRARY).once('value', snapshot => {
                this.log(`received library items`)
                let data = snapshot.val()
                let newLibraryState: LibraryState = initialLibraryState
                if(data['packables']){
                    let packables:PackableOriginal[] = this.unwrapForLocalStore(data['packables']).map((p: PackableOriginal) => {
                        let packable = this.packableFactory.clonePackableOriginal(p)
                        packable.userCreated = false
                        return packable
                    })
                    newLibraryState.library.packables = packables
                }
                if(data['collections']){
                    let collections:CollectionOriginal[] = this.unwrapForLocalStore(data['collections']).map((c: CollectionOriginal) => {
                        let collection = this.collectionFactory.duplicateOriginalCollection(c)
                        collection.userCreated = false 
                        return collection
                    })
                    newLibraryState.library.collections = collections
                }
                if(data['profiles']){
                    let profiles:Profile[] =  this.unwrapForLocalStore(data['profiles']).map((p: Profile) => {
                        let profile = this.profileFactory.duplicateProfile(p)
                        return profile
                    })
                    newLibraryState.library.profiles = profiles
                }
                if(data['metaData']){
                    newLibraryState.metaData = data['metaData']
                }
                if(data['destMetaData']){
                    newLibraryState.destMetaData = data['destMetaData']
                }
                this.store.dispatch(new libraryActions.SetLibraryState(newLibraryState))
            }).catch(e=>{
                this.store.dispatch(new libraryActions.loadLibraryError(e['message']))
            }) // ERROR HANDELING GOES HERE, SEND EMPTY LIBRARY STATE TO STOP LOADING STATE
        } else {
            this.store.dispatch(new libraryActions.loadLibraryError('Cannot Authenticate User'))

        }
    }
    initialGetAllItems() {
        if (this.checkAuth()) {
            let path = this.pathToUserItems
            this.log(`getting all items with path ${path}`);
            firebase.database().ref(path).once('value', snapshot => {
                this.log('received initial items')
                let data = snapshot.val();
                this.tidayAndStoreUserItems(data,['all'])
            }).catch(e=>this.log(e.message))
        }
    }
    private tidayAndStoreUserItems(data:{},replace:nodeOrAll[]=[]):void{
        if(data!==null){
            this.log(`tidayAndStoreUserItems received data`,data,'\nReplace:',replace); //JSON.stringify(data)

            if(data['packables']){
                let packables:PackableOriginal[] = this.unwrapForLocalStore(data['packables']).map((p: PackableOriginal) => this.packableFactory.clonePackableOriginal(p))
                this.store.dispatch(new packableActions.setPackableState(packables))
            } else if (replace.includes('all') || replace.includes('packables')){
                this.store.dispatch(new packableActions.setPackableState([]))
            }
            if(data['collections']){
                let collections:CollectionOriginal[] = this.unwrapForLocalStore(data['collections']).map((c: CollectionOriginal) => this.collectionFactory.duplicateOriginalCollection(c))
                this.store.dispatch(new collectionActions.setCollectionState(collections))
            }else if (replace.includes('all') || replace.includes('collections')){
                this.store.dispatch(new collectionActions.setCollectionState([]))
            }
            if(data['profiles']){
                let profiles:Profile[] =  this.unwrapForLocalStore(data['profiles']).map((profile: Profile) => this.profileFactory.duplicateProfile(profile))
                this.store.dispatch(new profileAction.setProfileState(profiles))
            } else if (replace.includes('all') || replace.includes('profiles')){
                this.store.dispatch(new profileAction.setProfileState([]))
            }
            if(data['tripState']){
                let _trips: Trip[] =  data['tripState']['trips'] ? this.unwrapForLocalStore(data['tripState']['trips']).map((t:Trip) => this.tripFactory.duplicateTrip(t)) : [];
                let _incomplete: Trip[] =  data['tripState']['incomplete'] ? this.unwrapForLocalStore(data['tripState']['incomplete']).map((t:Trip) => this.tripFactory.duplicateTrip(t)) : [];
                let _packingLists: PackingList[] =  data['tripState']['packingLists'] ? this.unwrapForLocalStore(data['tripState']['packingLists']): [];
                this.store.dispatch(new tripActions.setTripState({
                    trips: _trips,
                    incomplete:_incomplete,
                    packingLists: _packingLists
                }))
            }else if (replace.includes('all') || replace.includes('tripState')){
                this.store.dispatch(new tripActions.setTripState({
                    trips: [],
                    incomplete:[],
                    packingLists: []
                }))
            }
        }
    }
    setUserItemsNode(node: nodeOptions) {
        if (this.checkAuth()) {
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
                        packingLists: this.wrapForStorage(this.storeSelector.packingLists)
                    }
                    break;
            }
            firebase.database().ref(path(this.pathToUserItems,node)).set(data)
                .then(() => {
                    this.log(`<-~-> saved ${node} successfully`);
                }, (e) => {
                    this.warn(`<-~-> FAILED to save ${node}`, e);
                })
        }
    }
    saveItemsInUser(node: nodeOptions,items:localItem[], subNode: string = ''){
        if (this.checkAuth()) {
            let updates: updates = {}
            let wrappedItems = this.wrapForStorage(items)
            for(let item in wrappedItems){
                let itempath = path(this.pathToUserItems,node,subNode,item)
                updates[itempath] = wrappedItems[item]
            }
            firebase.database().ref().update(updates).then(()=>{this.log('Saved items (updateItemsInUser)',updates);
            })
        }
    }
    removeItemsInUser(node: nodeOptions,ids:string[], subNode: string = ''){
        if (this.checkAuth()) {
            let updates: updates = {}
            ids.forEach(id=>{
                let itemPath = path(this.pathToUserItems,node,subNode,id)
                updates[itemPath] = null
            })
            firebase.database().ref().update(updates).then(()=>{this.log('Removed items (removeItemsInUser)',updates);
            })
        }
    }

    setAllUserItemsAndSettings() {
        if (this.checkAuth()) {
            this.log(`Setting all user items and settings to FireBase (setAllUserItemsAndSettings)`);
            let updates: updates = {}
            let userData = {
                packables: this.wrapForStorage(this.storeSelector.originalPackables),
                collections: this.wrapForStorage(this.storeSelector.originalCollections),
                profiles: this.wrapForStorage(this.storeSelector.profiles),
                tripState: {
                    trips: this.wrapForStorage(this.storeSelector.trips),
                    incomplete: this.wrapForStorage(this.storeSelector.incompleteTrips),
                    packingLists: this.wrapForStorage(this.storeSelector.packingLists)
                },
            }
            updates[this.pathToUserItems] = userData
            updates[path(USER_CONFIG,this.userId,SETTINGS)] = this.user.settings
            firebase.database().ref().update(updates).then(()=>{this.log('Saved (setAllUserItemsAndSettings)');
            })
        }
    }
    saveUserSettings(){
        if (this.checkAuth()) {
            let data = this.user.settings
            firebase.database().ref(path(USER_CONFIG,this.userId,SETTINGS)).set(data).then(()=>{this.log('Saved (saveUserSettings)');
            })
        }
    }
    setInitialUserConfig() {
        this.log(`setting initial user data`);
        if (this.checkAuth()) {
            let initialConfig = defaultUserConfigState
            initialConfig.settings.alias = firebase.auth().currentUser.email.split('@')[0]
            this.log(`saving initial data to firebase`);
            firebase.database().ref(path(USER_CONFIG,this.userId)).set(initialConfig)
                .then(() => {
                    this.log('set userState in store:', initialConfig)
                    this.store.dispatch(new userActions.setUserState(initialConfig))
                }, (e) => {
                    this.log('failed to set userConfig:', e)
                })
        }
    }

    
    adminDeleteUsers(ids:string[]){
        if (this.checkAuth()) {
            if (this.user.permissions.userManagement) {
                this.log('attempting to delete users')
                let updates: updates = {}
                ids.forEach(id => {
                    updates[path(USER_CONFIG,id)] = null
                    updates[path(USERS,id)] = null
                }) 
                firebase.database().ref().update(updates).then(()=>{
                    this.log('users deleted', updates);
                }).catch(e=>{
                    this.log('unable to delete users', updates, e['message']);
                });
            } else {
                this.warn('You are unable to delete users.')
            }
        }
    }

    adminSetUserData(action) {
        this.log('attempting to change permissions', action)
        if (this.checkAuth()) {
            if (action.type == AdminActions.ADMIN_SET_PERMISSIONS
                && this.user.permissions.setPermissions) {
                this.log('attempting to change permissions')
                let changes = (<AdminActions.adminSetPermissions>action).payload
                let updates: updates = {}
                changes.forEach(change => {
                    updates[path(USER_CONFIG,change.id,PERMISSIONS)] = change.permissions
                }) 
                firebase.database().ref().update(updates).then(()=>{
                    this.log('permissions updated');
                });
            } else {
                this.warn('You are unable to change permissions.')
            }
        }
    }
    
    
    //adminUserConfig_Obs: Subject<configItem>
    adminListenToUserConfig(listen:boolean = true) {
        if (this.checkAuth()) {
            if (this.user.permissions.userManagement) {
            if(!!listen){
                //this.adminUserConfig_Obs = new Subject()
                firebase.database().ref(USER_CONFIG).on('value', (snapshot) => {
                    //this.adminUserConfig_Obs.next(snapshot.val())
                    let records:configItem = snapshot.val();
                    let newData:User[] = []
                    for(let record in records){
                        newData.push({
                        id:record,
                        permissions:records[record].permissions,
                        alias:records[record].settings.alias
                        }) 
                    }
                    this.store.dispatch(new adminActions.adminSetUsers(newData))
                })
            } else {
                //this.adminUserConfig_Obs.complete()
                firebase.database().ref(USER_CONFIG).off()
            }
            }
        }
    }
    
    wrapForStorage(items:localItem[]):firebaseItem {
        let firebaseData: firebaseItem = {}
        items.forEach(item=>{
            let newItem = firebaseData[item.id] = Object.assign({},item)
            delete newItem.id
        })
        return firebaseData
    }
    unwrapForLocalStore<T extends localItem>(firebaseItems:firebaseItem):T[]{
        let itemArray: T[] = [];
        for(let item in firebaseItems){
            let newItem:T = <T>{id:item, ...firebaseItems[item]}
            if('userCreated' in newItem && this.storeSelector.isLibraryStore){
                newItem['userCreated'] = true
            }
            itemArray.push(newItem)
        }
        return itemArray
    }
    

    generateDummyData() {
        let packableNames = ['Ski Pants', 'Jumper', 'shorts', 'Belt', 't-shirt', 'gym pants', 'sun glasses', 'toothbrush', 'toothpaste', 'gloves', 'jeans', 'earphones', 'tissues', 'shorts', 'shirt', 'radio', 'towel', 'sun screen']
        let repTypes = ["period", "profile", "trip"]
        let allPackables: PackableOriginal[] = [];
        packableNames.forEach(name => {
            let amount = Math.floor(Math.random() * 3) + 1
            let repAmount = Math.floor(Math.random() * 4) + 1
            let type = repTypes[Math.floor(Math.random() * repTypes.length)]
            let min, max;
            if (Math.random() > 0.6) {
                min = randomBetween(absoluteMin, absoluteMax)
                max = randomBetween(min, absoluteMax)
            } else if (Math.random() > 0.5) {
                max = randomBetween(absoluteMin, absoluteMax)
                min = randomBetween(absoluteMin, max)
            } else {
                max = absoluteMax
                min = absoluteMin
            }
            let numOfConditions = randomBetween(-4, 5);
            let conditionsUnused: weatherType[] = weatherOptions.slice()
            let conditionsUsed: weatherType[] = [];

            for (let i = numOfConditions; i > 0; i--) {
                let choice = randomBetween(0, conditionsUnused.length - 1)
                conditionsUsed = [...conditionsUsed, ...conditionsUnused.splice(choice, 1)]
            }
            let weather = new WeatherRule(min, max, conditionsUsed)
            let packable = new PackableOriginal(Guid.newGuid(), name, [{ amount: amount, type: <QuantityType>type, repAmount: repAmount }], weather, true,timeStamp(),false)
            allPackables.push(packable)
        })
        this.store.dispatch(new packableActions.setPackableState(allPackables))

        let collectionNames = ['Winter Clothes', 'Hiking', 'Mountain Climbing', 'Swimming', 'Toiletries', 'Road Trip', 'Skiing', 'Baby Stuff']
        let allCollections: CollectionOriginal[] = [];
        collectionNames.forEach(name => {
            let packableIds = allPackables.map(p => this.packableFactory.makePrivate(p)).filter(() => Math.random() > 0.6)
            let collection = new CollectionOriginal(Guid.newGuid(), name, packableIds,new WeatherRule(),true)
            allCollections.push(collection)
        })
        this.store.dispatch(new collectionActions.setCollectionState(allCollections))

        let profileNames = ['Tom', 'Steven', 'Daniel', 'Ilaria', 'Tasha', 'James', 'Mike', 'Donald', 'Ricky', 'Sam', 'Steve', 'Jordan']
        let allProfiles: Profile[] = [];
        profileNames.forEach(name => {
            let collections = allCollections.filter((v, i, arr) => Math.random() > 0.5 && i != 0).map(c => this.collectionFactory.makePrivate(c))
            let icons = this.iconService.profileIcons.icons.filter(i => i != 'default')
            let iconLength = icons.length
            let randomIcon = icons[randomBetween(0, iconLength - 1)]
            let color = this.colorGen.getUnusedAndRegister();
            let avatar = new Avatar(randomIcon, color)
            let profile = new Profile(Guid.newGuid(), name, collections, avatar)
            allProfiles.push(profile);
        })
        this.store.dispatch(new profileActions.setProfileState(allProfiles))
    }

}
