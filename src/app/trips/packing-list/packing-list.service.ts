import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers'
import * as tripActions from '../store/trip.actions';
import { TripMemoryService } from '../../shared/services/trip-memory.service';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { DestinationDataService } from '../../shared/services/location-data.service';
import { WeatherService, TripWeatherData, weatherCheckResponse } from '../../shared/services/weather.service';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { weatherFactory } from '@app/shared/factories/weather.factory';
import { Trip } from '../../shared/models/trip.model';
import { PackingList, packingListData, pass, PackingListPackable, Reason } from '../../shared/models/packing-list.model';
import { Subscription, Subject } from 'rxjs';
import { isDefined, getAllDates, copyProperties, timeStamp } from '../../shared/global-functions';
import { PackableComplete } from '../../shared/models/packable.model';
import { CollectionComplete } from '../../shared/models/collection.model';
import { ProfileComplete } from '../../shared/models/profile.model';
import { WeatherRule } from '../../shared/models/weather.model';
import { updatePackingList } from '../store/trip.actions';

@Injectable()
export class PackingListService {
  trip: Trip;
  packingList: PackingList;
  tripWeather: TripWeatherData;
  packingListData: packingListData;
  serviceSubscription: Subscription = new Subscription();
  saveTimeout = setTimeout(() => { }, 0);

  packingListEmitter = new Subject<PackingList>();
  setPackingList(packingList: PackingList) {
    this.packingList = packingList
    this.packingListEmitter.next(this.packingList)
  }
  weatherDataEmitter = new Subject<TripWeatherData>();
  setTripWeather(tripWeather: TripWeatherData) {
    this.tripWeather = tripWeather
    this.weatherDataEmitter.next(this.tripWeather)
  }

  constructor(
    private store: Store<fromApp.appState>,
    private tripMemory: TripMemoryService,
    private storeSelector: StoreSelectorService,
    private destService: DestinationDataService,
    private weatherService: WeatherService,
    private profileFactory: ProfileFactory,
    private weatherFactory: weatherFactory,
  ) {
    console.log('PackingListService inititated')
    let memoryTrip = this.tripMemory.trip
    /*
        ADD ALTERNATIVE HERE: 
        get trip from router params, disable editing unless user logged in 
    */
    if (!!memoryTrip) {
      this.serviceSubscription = this.storeSelector.trips_obs.subscribe(tripState => {
        console.log('📥 received new tripstate')
        let newTrip = tripState.trips.find(trip => trip.id == memoryTrip.id);
        if (newTrip) {
          let newPackinglist = tripState.packingLists.findId(memoryTrip.id);
          console.log('Received packinglist from tripState',newPackinglist)
          this.autoUpdatePackingList(newTrip,newPackinglist)
        } else {
          console.log(`This trip was not saved in the Store.`);
        }
      })
    }
  }
  autoUpdatePackingList(newTrip: Trip, newPackingList: PackingList) {
    this.trip = newTrip
    if (newPackingList) {
      if (this.packingList && this.tripWeather) {
        if(this.packingList.dateModified !== newPackingList.dateModified){
          this.generateAndSetPackingList()
        } else{
          console.log(`received new packinglist, but it has the same timestamp\ncurrent:`,this.packingList,'\nnew:',newPackingList)
        }
      } else {
        this.packingList = newPackingList
        this.updatePackingListBySetting(newPackingList.data.weatherData.dataInput)
      }
    } else {
      this.updatePackingListBySetting('auto')
    }
  }

  updatePackingListBySetting(setting: 'auto' | 'manual') {
    if (setting === 'auto') {
      this.updateUsingWeatherAPI()
    } else if (setting === 'manual') {
      this.updateUsingCustomWeather()
    }
  }
  updateUsingWeatherAPI() {
    console.log(`fetching trip weather data`);
    this.weatherService.createWeatherData(this.trip).then(tripWeather => {
      this.setTripWeather(tripWeather)
      this.generateAndStorePackingList()
    }).catch(e => {
      console.log('could not get new weather data', e)
    })
  }
  updateUsingCustomWeather(weatherData?: TripWeatherData) {
    this.tripWeather = weatherData || (this.packingList ? this.packingList.data.weatherData : new TripWeatherData({ dataInput: 'manual' }));
    this.generateAndStorePackingList()
  }

  generateAndStorePackingList() {
    this.storePackingList(this.generateAndSetPackingList())
  }
  generateAndSetPackingList(): PackingList {
    const newList = this.generateList(this.trip, this.packingList)
    this.setPackingList(newList)
    return newList
  }

  onUpdatePackable(newPackable: PackingListPackable, save:boolean = true) {
    const i = this.packingList.packables.findIndexBy(newPackable, ['id', 'profileID', 'collectionID'])
    this.packingList.packables[i] = newPackable
    if(save === true){
        this.delayedSave(true)
    }
  }

  delayedSave(update:boolean = false) {
    console.log(`Delayed save...`);
    if(update){
      this.packingList.dateModified = timeStamp()
    }
    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      this.storePackingList(this.packingList)
    }, 2000)
  }

  storePackingList(packinglist: PackingList) {
    console.log('💾 store packing list', packinglist)
    this.store.dispatch(new tripActions.updatePackingList(packinglist))
  }

  generateList(trip: Trip, oldPackingList: PackingList = null): PackingList {
    let newPackingList = new PackingList(trip.id);
    let dates = getAllDates(trip.startDate, trip.endDate);
    let profiles = this.profileFactory.getCompleteProfilesByIds(trip.profiles)
    let data = new packingListData({
      totalDays: dates.length,
      totalNights: dates.length - 1,
      destination: this.destService.DestinationByCityId(trip.destinationId),
      weatherData: this.tripWeather
    })

    profiles.forEach(profile => {
      // FILTER PROFILE COLLECTIONS PER THE TRIP COLLECTION GROUPS
      profile.collections = profile.collections.filter(c => {
        const cGroup = trip.collections.findId(c.id)
        return cGroup && cGroup.profiles.includes(profile.id)
      })
      profile.collections.forEach(collection => {
        // CHECK COLLECTION WEATHER
        if (this.checkWeatherRules(collection)) {
          collection.packables.forEach(packable => {
            // APPLY CHECKS ON EACH PACKABLE AND SEPERATE SHARED PACKABLES
            const listPackables = this.applyChecksOnPackable(data, packable, collection, profile)
            // ADD NEW PACKABLES TO LIST WHILE COMPARING TO EXISTING PACKABLES
            listPackables.forEach(listPackable => this.addPackableToList(listPackable, newPackingList))
          })
        }
      })
    })
    newPackingList.packables = newPackingList.packables.map(p => this.checkPackableChanges(oldPackingList, p))
    newPackingList.data = data;
    return newPackingList
  }

  applyChecksOnPackable(data: packingListData, packable: PackableComplete, collection: CollectionComplete, profile: ProfileComplete): PackingListPackable[] {
    let collectionName = collection.name
    let weatherCheck = this.checkWeatherRules(packable)
    let accQuantity = 0;
    let quantitiyReasons: Reason[] = [];
    let weatherNotChecked = false;
    let passChecks = true;
    let weatherReasons: Reason[] = [];
    let returnListPackable: PackingListPackable[] = []
    // CHECK WEATHER
    if (weatherCheck.conditionsMet || collection.weatherOverride) {
      if (collection.weatherOverride) {
        weatherNotChecked = this.weatherFactory.isSet(packable.weatherRules)
        weatherNotChecked && weatherReasons.push(new Reason(`[${collectionName}] The Collection's Weather Settings override the Packable's.`))
      } else {
        weatherNotChecked = this.weatherFactory.isSet(packable.weatherRules) && !this.tripWeather.isValid;
        weatherNotChecked && weatherReasons.push(new Reason(`[${collectionName}] The destination weather forecast is currently unavailable or uncertain.`))
      }
    } else {
      weatherReasons.push(...weatherCheck.response.map(r => new Reason(r)))
      passChecks = false;
    }
    const basePackable: PackingListPackable = {
      id: packable.id,
      profileID: profile.id,
      collectionID: collection.id,
      name: packable.name,
      quantity: accQuantity,
      quantityReasons: [],
      checked: false,
      changedAfterChecked: false,
      weatherNotChecked: weatherNotChecked,
      passChecks: passChecks,
      weatherReasons: weatherReasons,
      forcePass: false,
      forceQuantity: false,
    }
    // CHECK QUANTITY RULES
    packable.quantityRules.forEach(rule => {
      let reasonText: string;
      switch (rule.type) {
        case 'period':
          let ruleQuantity = rule.amount * Math.floor(data.totalDays / rule.repAmount);
          accQuantity += +ruleQuantity;
          reasonText = `[${collectionName}] ${rule.amount} per ${rule.repAmount} days = ${ruleQuantity}`;
          quantitiyReasons.push(new Reason(reasonText))
          break;
        case 'profile':
          accQuantity += +rule.amount;
          reasonText = `[${collectionName}] ${rule.amount} per Traveler `
          quantitiyReasons.push(new Reason(reasonText))
          break;
        case 'trip':
          reasonText = `[${profile.name}>${collectionName}] ${rule.amount} to Share `
          returnListPackable.push(
            {
              ...basePackable,
              profileID: null, // TO SHARE
              quantity: rule.amount,
              quantityReasons: [new Reason(reasonText)],
            }
          )
          break;
        default:
          break;
      }
    })
    if (quantitiyReasons.length > 0) {
      if (accQuantity === 0) {
        quantitiyReasons.push(new Reason(`[${collectionName}] Minimum 1`))
      }
      returnListPackable.push({
        ...basePackable,
        passChecks: passChecks,
        quantity: accQuantity > 0 ? accQuantity : 1,
        quantityReasons: [...quantitiyReasons],
      })
    }
    return returnListPackable
  }

  addPackableToList(newP: PackingListPackable, packingList: PackingList): void {
    let oldPackableIndex = packingList.packables.findIndex(p => {
      return p.id == newP.id && p.profileID == newP.profileID
    })
    // COMPARE OLD PACKABLE'S QUANTITIES AND WEATHER CHECKS
    if (oldPackableIndex != -1) {
      let oldP = packingList.packables[oldPackableIndex]
      let voidWeather = (p: PackingListPackable) => {
        p.weatherReasons.forEach(r => r.active = false)
      }
      let voidQuantity = (p: PackingListPackable) => {
        p.quantityReasons.forEach(r => r.active = false)
      }
      if (newP.passChecks || newP.passChecks == oldP.passChecks) {
        voidWeather(oldP)
        copyProperties(oldP, newP, ['weatherNotChecked', 'passChecks'])
        if (newP.quantity >= oldP.quantity) {
          voidQuantity(oldP)
          copyProperties(oldP, newP, ['quantity'])
        } else {
          voidQuantity(newP)
        }
      } else {
        voidWeather(newP)
        voidQuantity(newP)
      }

      oldP.quantityReasons.push(...newP.quantityReasons)
      oldP.weatherReasons.push(...newP.weatherReasons)
    } else {
      packingList.packables.push(newP)
    }
  }

  checkWeatherRules(item: { weatherRules: WeatherRule }): weatherCheckResponse {
    return this.weatherService.checkWeatherRules(item.weatherRules, this.tripWeather)
  }
  checkPackableChanges(oldList: PackingList, newPackable: PackingListPackable): PackingListPackable {
    if (oldList) {
      let oldPackable = oldList.packables.find(p => {
        return (p.id == newPackable.id
          && p.collectionID == newPackable.collectionID
          && p.profileID == newPackable.profileID)
      })
      if (oldPackable) {
        if (oldPackable.forceQuantity && !newPackable.forceQuantity) {
          newPackable.forceQuantity = true
          newPackable.quantity = oldPackable.quantity
          newPackable.quantityReasons.forEach(r => r.active = false)
        }
        if (oldPackable.forcePass) {
          newPackable.forcePass = true
        }
        if (oldPackable.checked) {
          if (oldPackable.quantity != newPackable.quantity) {
            newPackable.changedAfterChecked = true;
          } else {
            newPackable.checked = true;
          }
        }
      }
      if (!oldPackable || (!pass(oldPackable) && pass(newPackable))) {
        newPackable.recentlyAdded = true;
      }
    }
    return newPackable
  }

}