import * as firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../app.reducers'
import { AuthService } from '../../user/auth.service';
import { PackableOriginal, QuantityRule } from '../models/packable.model';
import { CollectionOriginal } from '../models/collection.model';
import { Profile } from '../models/profile.model';
import { StoreSelectorService } from '../services/store-selector.service';

import * as packableActions from '../../packables/store/packables.actions';
import * as collectionActions from '../../collections/store/collections.actions'
import * as tripActions from '../../trips/store/trip.actions';
import * as profileAction from '../../profiles/store/profile.actions'
import { PackableFactory } from '../factories/packable.factory';
import { WeatherRule } from '../models/weather.model';
import { weatherFactory } from '../factories/weather.factory';
import { CollectionFactory } from '../factories/collection.factory';
import { ProfileFactory } from '../factories/profile.factory';
import { TripFactory } from '../factories/trip.factory';

export type nodeOptions = 'packables' | 'collections' | 'profiles' | 'tripState' | 'settings';

@Injectable()
export class StorageService {
    constructor(
        private store: Store<fromApp.appState>,
        private authService: AuthService,
        private storeSelector: StoreSelectorService,
        private packableFactory:PackableFactory,
        private collectionFactory: CollectionFactory,
        private profileFactory: ProfileFactory,
        private tripFactory: TripFactory,
        private weatherFactory:weatherFactory
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
                    let packables = data['packables'].map((p:PackableOriginal)=>this.packableFactory.clonePackableOriginal(p))
                    this.store.dispatch(new packableActions.setPackableState(packables))
                } else{
                    this.store.dispatch(new packableActions.setPackableState([]))
                }
                if (data['collections']) {
                    let collections = data['collections'].map((c:CollectionOriginal)=>this.collectionFactory.duplicateOriginalCollection(c))
                    this.store.dispatch(new collectionActions.setCollectionState(collections))
                } else {
                    this.store.dispatch(new collectionActions.setCollectionState([]))
                }
                if (data['profiles']) {
                    let profiles = data['profiles'].map((profile:Profile)=>this.profileFactory.duplicateProfile(profile))
                    this.store.dispatch(new profileAction.setProfileState(profiles))
                } else {
                    this.store.dispatch(new profileAction.setProfileState([]))
                }
                if (data['tripState']) {
                    console.log('tripState:', data['tripState']);
                    let _trips = data['tripState']['trips'] ? data['tripState']['trips'].map(t=>this.tripFactory.duplicateTrip(t)) : [];
                    let _packingLists = data['tripState']['packingLists'] || [];
                    this.store.dispatch(new tripActions.setTripState({
                        trips: _trips,
                        packingLists: _packingLists
                    }))
                }else {
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
    setUserData(node:nodeOptions){
        if(this.checkAuth()){
            let userId = firebase.auth().currentUser.uid
            let data;
            switch(node){
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
        .then(()=>{
            console.log(`saved ${node} successfully`);
        },(e)=>{
            console.warn(`failed to save ${node}`,e);
        })
        }
    }
    
    checkAuth(logmessage:any = ''):boolean{
        if(this.authService.isAuthenticated){
            return true
        } else {
            console.log('Could Not Authenticate.\n',logmessage);
            return false
        }
    }
}
