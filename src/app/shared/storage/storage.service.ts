import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
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
import { PackableFactory } from '../factories/packable.factory';
import { WeatherRule, weatherOptions, weatherType } from '../models/weather.model';
import { weatherFactory } from '../factories/weather.factory';
import { CollectionFactory } from '../factories/collection.factory';
import { ProfileFactory } from '../factories/profile.factory';
import { TripFactory } from '../factories/trip.factory';
import { randomBetween, Guid } from '../global-functions';
import { absoluteMax, absoluteMin } from '../services/weather.service';
import { IconService } from '../services/icon.service';
import { ColorGeneratorService } from '../services/color-gen.service';
import { destinations } from '../location-data-object';
import * as moment from 'moment';
import { Trip } from '../models/trip.model';
import * as profileActions from '@app/profiles/store/profile.actions';
import { setPackableState } from '../../packables/store/packables.actions';

export type nodeOptions = 'packables' | 'collections' | 'profiles' | 'tripState' | 'settings';

@Injectable()
export class StorageService {
    constructor(
        private store: Store<fromApp.appState>,
        private authService: AuthService,
        private storeSelector: StoreSelectorService,
        private packableFactory: PackableFactory,
        private collectionFactory: CollectionFactory,
        private profileFactory: ProfileFactory,
        private tripFactory: TripFactory,
        private iconService: IconService,
        private colorGen: ColorGeneratorService,
        private weatherFactory: weatherFactory
    ) {

    }
    test() {
        this.getAllUserData()
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
    getAllUserData() {
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
            let userData = {
                packables: this.storeSelector.originalPackables,
                collections: this.storeSelector.originalCollections,
                profiles: this.storeSelector.profiles,
                tripState: {
                    trips: this.storeSelector.trips,
                    packingLists: this.storeSelector.packingLists
                }
            }
            firebase.database().ref('users/' + userId).set(userData).then()
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
            firebase.database().ref(`users/${userId}/${node}`).set(data)
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
            let collections = allCollections.filter((v,i,arr) => Math.random() > 0.5 && i!=0).map(c => this.collectionFactory.makePrivate(c))
            let iconLength = this.iconService.profileIcons.icons.length
            let randomIcon = this.iconService.profileIcons.icons[randomBetween(0, iconLength - 1)]
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
        this.store.dispatch(new tripActions.addTrip(trip))
    }

}
