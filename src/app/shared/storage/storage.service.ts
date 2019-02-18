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
import { PackableFactory } from '../factories/packable.factory';
import { WeatherRule, weatherOptions, weatherType } from '../models/weather.model';
import { weatherFactory } from '../factories/weather.factory';
import { CollectionFactory } from '../factories/collection.factory';
import { ProfileFactory } from '../factories/profile.factory';
import { TripFactory } from '../factories/trip.factory';
import { randomBetween, Guid, path } from '../global-functions';
import { absoluteMax, absoluteMin } from '../services/weather.service';
import { IconService } from '../services/icon.service';
import { ColorGeneratorService } from '../services/color-gen.service';
import { destinations } from '../location-data-object';
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
export type nodeOptions = 'packables' | 'collections' | 'profiles' | 'tripState';

type configItem = {[id:string]:userConfig}
const USER_CONFIG = 'userConfig'
const USERS = 'users'
const SETTINGS = 'settings'
const PERMISSIONS = 'permissions'

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

    ) {

    }
    test() {
        this.getAllUserItems()
    }

    // fixWeatherRules(item){
    //     if(item.hasOwnProperty('weatherRules')){
    //         let wr = item.weatherRules;
    //         if(!wr.hasOwnProperty('weatherTypes')){
    //             item.weatherRules = this.weatherFactory.deepCopy(wr);
    //         }
    //     }
    //     return item
    // }
    getAllUserItems() {
        if (this.checkAuth()) {
            let userId = firebase.auth().currentUser.uid
            console.log('trying UID: ', userId);
            firebase.database().ref('/users/' + userId).once('value', snapshot => {
                let data = snapshot.val();
                if (data['packables']) {
                    let packables = data['packables'].map((p: PackableOriginal) => this.packableFactory.clonePackableOriginal(p))
                    this.store.dispatch(new packableActions.setPackableState(packables))
                } else {
                    this.store.dispatch(new packableActions.setPackableState([]))
                }
                if (data['collections']) {
                    let collections = data['collections'].map((c: CollectionOriginal) => this.collectionFactory.duplicateOriginalCollection(c))
                    this.store.dispatch(new collectionActions.setCollectionState(collections))
                } else {
                    this.store.dispatch(new collectionActions.setCollectionState([]))
                }
                if (data['profiles']) {
                    let profiles = data['profiles'].map((profile: Profile) => this.profileFactory.duplicateProfile(profile))
                    this.store.dispatch(new profileAction.setProfileState(profiles))
                } else {
                    this.store.dispatch(new profileAction.setProfileState([]))
                }
                if (data['tripState']) {
                    console.log('tripState:', data['tripState']);
                    let _trips = data['tripState']['trips'] ? data['tripState']['trips'].map(t => this.tripFactory.duplicateTrip(t)) : [];
                    let _packingLists = data['tripState']['packingLists'] || [];
                    this.store.dispatch(new tripActions.setTripState({
                        trips: _trips,
                        packingLists: _packingLists
                    }))
                } else {
                    this.store.dispatch(new tripActions.setTripState({
                        trips: [],
                        packingLists: []
                    }))
                }
            })
        }
    }

    setAllUserData() {
        if (this.checkAuth()) {
            let userId = firebase.auth().currentUser.uid
            let updates: { [s: string]: any } = {}
            let userData = {
                packables: this.storeSelector.originalPackables,
                collections: this.storeSelector.originalCollections,
                profiles: this.storeSelector.profiles,
                tripState: {
                    trips: this.storeSelector.trips,
                    packingLists: this.storeSelector.packingLists
                },
            }
            updates[path(USERS,userId)] = userData
            updates[path(USER_CONFIG,userId,SETTINGS)] = this.user.settings

            firebase.database().ref('users/' + userId).set(userData).then()
        }
    }
    adminSetUserData(action) {
        console.log('attempting to change permissions', action)
        if (this.checkAuth()) {
            if (action.type == AdminActions.ADMIN_SET_PERMISSIONS
                && this.user.permissions.setPermissions) {
                console.log('attempting to change permissions')
                let changes = (<AdminActions.adminSetPermissions>action).payload
                let updates: { [s: string]: userPermissions } = {}
                changes.forEach(change => {
                    updates[path(USER_CONFIG,change.id,PERMISSIONS)] = change.permissions
                }) 
                firebase.database().ref().update(updates).then(()=>{
                    console.log('permissions updated');
                });
            } else {
                console.warn('You are unable to change permissions.')
            }
        }
    }
    getUserConfig() {
        if (this.checkAuth()) {
            let userId = firebase.auth().currentUser.uid
            console.log('requesting config')
            firebase.database().ref(path(USER_CONFIG,userId)).once('value', snapshot => {
                let data = snapshot.val();
                console.log('receiving config data:', data)
                if (data) {
                    this.store.dispatch(new userActions.setUserState(data))
                } else {
                    this.setInitialUserConfig()
                }
            }).catch(e=>{
                console.log(e.message)
                this.setInitialUserConfig()
            })
        }
    }
    
    //adminUserConfig_Obs: Subject<configItem>
    adminListenToUserData(listen:boolean = true) {
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
    setUserSettings(){
        if (this.checkAuth()) {
            let userId = firebase.auth().currentUser.uid
            let data = this.user.settings
            firebase.database().ref(path(USER_CONFIG,userId,SETTINGS)).set(data).then()
        }
    }
    setInitialUserConfig() {
        if (this.checkAuth()) {
            let userId = firebase.auth().currentUser.uid
            let initialConfig = defaultUserConfigState
            initialConfig.settings.alias = firebase.auth().currentUser.email.split('@')[0]
            firebase.database().ref(path(USER_CONFIG,userId)).set(initialConfig)
                .then(() => {
                    console.log('set userCongig:', initialConfig)
                    this.store.dispatch(new userActions.setUserState(initialConfig))
                }, (e) => {
                    console.log('failed to set userConfig:', e)
                })
        }
    }

    setUserData(node: nodeOptions) {
        if (this.checkAuth()) {
            let userId = firebase.auth().currentUser.uid
            let data;
            switch (node) {
                case 'packables':
                    data = this.storeSelector.originalPackables;
                    break;
                case 'collections':
                    data = this.storeSelector.originalCollections;
                    break;
                case 'profiles':
                    data = this.storeSelector.profiles;
                    break;
                case 'tripState':
                    data = {
                        trips: this.storeSelector.trips,
                        packingLists: this.storeSelector.packingLists
                    }
                    break;
            }
            firebase.database().ref(path(USERS,userId,node)).set(data)
                .then(() => {
                    console.log(`<-~-> saved ${node} successfully`, 'background: green;');
                }, (e) => {
                    console.warn(`<-~-> FAILED to save ${node}`, e);
                })
        }
    }
    checkAuth(logmessage: any = ''): boolean {
        if (this.authService.isAuthenticated) {
            return true
        } else {
            console.log('Could Not Authenticate.\n', logmessage);
            return false
        }
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
            let packable = new PackableOriginal(Guid.newGuid(), name, [{ amount: amount, type: <QuantityType>type, repAmount: repAmount }], weather)
            allPackables.push(packable)
        })
        this.store.dispatch(new packableActions.setPackableState(allPackables))

        let collectionNames = ['Winter Clothes', 'Hiking', 'Mountain Climbing', 'Swimming', 'Toiletries', 'Road Trip', 'Skiing', 'Baby Stuff']
        let allCollections: CollectionOriginal[] = [];
        collectionNames.forEach(name => {
            let packableIds = allPackables.map(p => this.packableFactory.makePrivate(p)).filter(() => Math.random() > 0.6)
            let collection = new CollectionOriginal(Guid.newGuid(), name, packableIds)
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
        let destinationId = destinations[Math.floor(Math.random() * destinations.length)].id
        let startdate = moment();
        let endDate = moment().add(5, 'days')
        let profiles = allProfiles.map(p => p.id);
        let trip = new Trip(Guid.newGuid(), startdate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), destinationId, profiles, [], moment().format())
        this.store.dispatch(new tripActions.setTripState({ trips: [trip], packingLists: [] }))
    }

}
