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
import { Trip, DisplayTrip } from '../../shared/models/trip.model';
import { PackingList, packingListData, PackingListPackable, Reason, PackingListSettings, pass } from '../../shared/models/packing-list.model';
import { Subscription, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { getAllDates, copyProperties, timeStamp, isDefined } from '../../shared/global-functions';
import { PackableComplete } from '../../shared/models/packable.model';
import { CollectionComplete } from '../../shared/models/collection.model';
import { ProfileComplete } from '../../shared/models/profile.model';
import { WeatherRule } from '../../shared/models/weather.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import * as userActions from '@app/user/store/user.actions';
import { UserSettings } from '../../user/store/userState.model';
import { TripFactory, SHARED } from '../../shared/factories/trip.factory';
import * as moment from 'moment';



function log(...args) {
  console.log('💼', ...args)
}
function warn(...args) {
  console.warn('💼', ...args)
}
/**
 * @weatherData TripWeatherData
 * @save boolean
 */
export interface updateOptions { weatherData?: TripWeatherData, save?: boolean }


@Injectable()
export class PackingListService {
  trip: Trip;
  displayTrip: DisplayTrip;
  packingList: PackingList;
  tripWeather: TripWeatherData;
  packingListData: packingListData;
  serviceSubscription: Subscription = new Subscription();
  packingListSettings: PackingListSettings = new PackingListSettings();

  saveTimeout = setTimeout(() => { }, 0);

  packingListEmitter = new BehaviorSubject<PackingList>(this.packingList);
  setPackingList(packingList: PackingList) {
    log('setting updated packinglist in service', packingList)
    this.packingList = packingList
    this.packingListEmitter.next(this.packingList)
  }
  weatherDataEmitter = new BehaviorSubject<TripWeatherData>(this.tripWeather);
  setTripWeather(tripWeather: TripWeatherData) {
    this.tripWeather = new TripWeatherData(tripWeather)
    this.weatherDataEmitter.next(this.tripWeather)
  }

  settingsEmitter = new BehaviorSubject<PackingListSettings>(this.packingListSettings);
  setSettings(newSettings: PackingListSettings) {
    log('set settings', newSettings)
    this.packingListSettings = Object.assign(this.packingListSettings, newSettings)
    this.settingsEmitter.next(this.packingListSettings)
  }
  loading;
  loadingEmit = new BehaviorSubject<boolean>(true);
  setloading(bool: boolean) {
    log('set loading', bool)
    this.loading = bool
    this.loadingEmit.next(bool)
  }

  constructor(
    private store: Store<fromApp.appState>,
    private tripMemory: TripMemoryService,
    private tripFac: TripFactory,
    private storeSelector: StoreSelectorService,
    private destService: DestinationDataService,
    private weatherService: WeatherService,
    private profileFactory: ProfileFactory,
    private weatherFactory: weatherFactory,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {
    log('PackingListService inititated')
    this.setloading(true)
    let memoryTrip: Trip = this.tripMemory.trip;
    let combinedObserver = combineLatest(this.storeSelector.trips$, this.route.paramMap, this.store.select('auth'))
    /*
      ADD FUNCTIONALITY, COMBINE WITH AUTH GUARD TOO:
        disable editing unless user logged in 
    */
    this.serviceSubscription.add(
      combinedObserver.subscribe(([tripState, paramMap]) => {
        const id = paramMap.get('id')
        let loadedPackingList: PackingList;
        let loadedTrip: Trip;
        if (isDefined(id)) {
          loadedPackingList = tripState.packingLists.findId(id)
          loadedTrip = tripState.trips.findId(id)
        } else if (isDefined(memoryTrip)) {
          loadedPackingList = tripState.packingLists.findId(memoryTrip.id)
          loadedTrip = tripState.trips.findId(memoryTrip.id)
        }
        if (isDefined(loadedTrip)) {
          log('Received packinglist from tripState', loadedPackingList)
          this.autoUpdatePackingList(loadedTrip, loadedPackingList)
        } else {
          warn('Could not load trip')
          this.setloading(false);
          this.setPackingList(null)
        }

      }))
    this.serviceSubscription.add(
      this.userService.userState$.subscribe(userState => {
        log('Received UserState', userState)
        this.setSettings(userState.settings.packinglistSettings)
      })
    )
  }
  autoUpdatePackingList(newTrip: Trip, loadedPackingList: PackingList) {
    const tripUpdated = isDefined(this.trip) && newTrip.dateModified > this.trip.dateModified;
    this.trip = newTrip
    log(`autoUpdate using trip`, this.trip)
    this.displayTrip = this.tripFac.makeDisplayTrip(this.trip)
    // THERES A SAVED PACKING LIST and TRIP IS NOT UPDATED
    if (loadedPackingList && !tripUpdated) {
      // THIS SERVICE ALREADY HAS LOADED A PACKING LIST
      if (this.packingList && this.tripWeather) {
        if (this.packingList.dateModified < loadedPackingList.dateModified) {
          // NEW LIST IS NEWER
          this.setPackingList(this.tripFac.cleanUpList(loadedPackingList))
        } else {
          log(`new packing list does not have a later time stamp\nOLD:`, this.packingList, '\nNEW:', loadedPackingList)
        }
      } else {
        log('Weather or PackingList not setup, updatingListBySetting,\n', 'Packinglist:', this.packingList, '\nTripWeather:', this.tripWeather)
        this.packingList = loadedPackingList
        this.updatePackingListBySetting(loadedPackingList.data.weatherData.dataInput, { save: true })
      }
      // THERES NO SAVED PACKING LIST
    } else {
      if (tripUpdated) {
        this.setPackingList(null)
        log(`Received updated trip`)
      }
      this.updatePackingListBySetting('auto', { save: true })
    }
  }

  updatePackingListBySetting(setting: 'auto' | 'manual', updateOptions: updateOptions) {
    log(`updating using: ${setting}`, updateOptions)
    if (setting === 'auto') {
      this.updateUsingWeatherAPI(updateOptions)
    } else if (setting === 'manual') {
      this.updateUsingCustomWeather(updateOptions)
    }
  }
  updateUsingWeatherAPI({ weatherData, save }: updateOptions = { save: true }) {

    if (weatherData && weatherData.isValid) {
      log(`using input weatherData`);
      this.setTripWeather(weatherData)
      this.updateWeather(save)
    } else {
      log(`fetching trip weather data`);
      this.setloading(true)
      this.weatherService.getTripWeatherData(this.trip).then(tripWeather => {
        this.setTripWeather(tripWeather)
        this.updateWeather(save)
        this.setloading(false)
      }).catch(e => {
        log('could not get new weather data', e)
      })
    }
  }
  updateUsingCustomWeather({ weatherData, save }: updateOptions = { save: true }) {
    this.packingListEmitter.next(null)
    if (weatherData) {
      this.setTripWeather(weatherData)
    } else if (this.packingList) {
      this.setTripWeather(this.packingList.data.weatherData)
    } else {
      this.setTripWeather(new TripWeatherData({ dataInput: 'manual' }))
    }
    setTimeout(() => {
      this.updateWeather(save)
    }, 0);
  }
  updateWeather(save: boolean) {
    if (save) {
      this.generateAndStorePackingList()
    } else {
      this.generateAndSetPackingList()
    }
  }
  generateAndStorePackingList() {
    this.storePackingList(this.generateAndSetPackingList())
  }
  generateAndSetPackingList(): PackingList {
    const newList = this.generateList(this.trip, this.packingList)
    this.setPackingList(newList)
    return newList
  }

  onUpdatePackables(newPackables: PackingListPackable[], save: boolean = true) {
    let stamp = timeStamp()
    newPackables.forEach(p => {
      p.dateModified = stamp
      const i = this.packingList.packables.findIndexBy(p, ['id', 'profileID', 'collectionID'])
      this.packingList.packables[i] = p
    })
    this.packingList.dateModified = stamp
    if (save === true) {
      log(`Saving packables`, newPackables, moment(stamp).format('HH:mm:ss'))
      this.store.dispatch(new tripActions.updatePackingListPackables({ packingList: this.packingList, packables: newPackables }))
    }
  }
  onUpdateList(updatedList: PackingList) {
    updatedList.dateModified = timeStamp()
    this.setPackingList(updatedList)
    this.storePackingList(this.packingList)
  }

  delayedSave() {
    clearTimeout(this.saveTimeout)
    this.packingList.dateModified = timeStamp()
    log(`Delayed save...`, moment(this.packingList.dateModified).format('HH:mm:ss'));
    this.saveTimeout = setTimeout(() => {
      this.storePackingList(this.packingList)
    }, 2000)
  }

  storePackingList(packinglist: PackingList) {
    log('💾 store packing list', moment(packinglist.dateModified).format('HH:mm:ss'))
    this.store.dispatch(new tripActions.updatePackingList([packinglist]))
  }


  generateList(trip: Trip, oldPackingList: PackingList = null): PackingList {
    let newPackingList = new PackingList(trip.id);
    let dates = getAllDates(trip.startDate, trip.endDate);
    let profiles = this.profileFactory.getCompleteProfilesByIds(trip.profiles)
    let data = new packingListData({
      totalDays: dates.length,
      totalNights: dates.length - 1,
      destination: this.destService.findDestination(trip.destinationId),
      weatherData: this.tripWeather
    })

    profiles.forEach(profile => {
      // FILTER PROFILE COLLECTIONS PER THE TRIP COLLECTION GROUPS
      profile.collections = profile.collections.filter(c => {
        const cGroup = trip.collections.findId(c.id)
        return cGroup && cGroup.profiles.includes(profile.id)
      })
      profile.collections.forEach(collection => {
        collection.packables.forEach(packable => {
          // APPLY CHECKS ON EACH PACKABLE AND SEPERATE SHARED PACKABLES
          const listPackables = this.applyChecksOnPackable(data, packable, collection, profile)
          // ADD NEW PACKABLES TO LIST WHILE COMPARING TO EXISTING PACKABLES
          listPackables.forEach(listPackable => this.addPackableToList(listPackable, newPackingList))
        })

      })
    })
    newPackingList.packables.forEach(p => this.checkPackableChanges(oldPackingList, p))
    newPackingList.instaPackables = oldPackingList.instaPackables || []
    newPackingList.data = data;
    log(`Generated updated list`, newPackingList)
    return newPackingList
  }


  applyChecksOnPackable(data: packingListData, packable: PackableComplete, collection: CollectionComplete, profile: ProfileComplete): PackingListPackable[] {
    let collectionName = collection.name
    let pacWeatherCheck = this.checkWeatherRules(packable)
    let colWeatherCheck = this.checkWeatherRules(collection)
    let pacWeatherIsSet = this.weatherFactory.isSet(packable.weatherRules)
    let colWeatherIsSet = this.weatherFactory.isSet(collection.weatherRules)

    let accQuantity = 0;
    let quantitiyReasons: Reason[] = [];
    let weatherNotChecked = false;
    let passChecks = true;
    let weatherReasons: Reason[] = [];
    let returnListPackable: PackingListPackable[] = []

    // CHECK WEATHER
    // WILL ADD ERRORS WHEN NEEDED, AND SET PASSCHECKS=FALSE IF FAILS
    if (pacWeatherIsSet || colWeatherIsSet) { // are weather conditions set
      if (this.tripWeather.isValid) { // is the trip weather set
        if (collection.weatherOverride && colWeatherIsSet) { // does collection ovveride packable
          weatherNotChecked = pacWeatherIsSet
          weatherNotChecked && weatherReasons.push(new Reason(`[${collectionName}] The Collection's Weather Settings override the Packable's.`))
          if (!colWeatherCheck.conditionsMet) { // does the col weather setting not meet trip weather
            passChecks = false;
            weatherReasons.push(new Reason(`Required: ` + this.weatherFactory.getWeatherRulesToString(collection.weatherRules)))
            weatherReasons.push(...colWeatherCheck.response.map(r => new Reason(`[${collectionName}] ${r}`)))
          }
        } else if (!pacWeatherCheck.conditionsMet) { // if no override, and packable doesn't meet conditions
          passChecks = false;
          weatherReasons.push(
            new Reason(`[${collectionName}>${packable.name}] Required: ` + this.weatherFactory.getWeatherRulesToString(packable.weatherRules)),
            ...pacWeatherCheck.response.map(r => new Reason(r)))
        }
      } else { // if trip weather is invalid
        weatherNotChecked = true
        weatherReasons.push(new Reason(`The destination weather forecast is currently unavailable or uncertain.`))
        colWeatherIsSet && weatherReasons.push(new Reason(`[${collectionName}] Required: ` + this.weatherFactory.getWeatherRulesToString(collection.weatherRules)))
        pacWeatherIsSet && weatherReasons.push(new Reason(`[${collectionName}>${packable.name}] Required: ` + this.weatherFactory.getWeatherRulesToString(packable.weatherRules)))
      }
    }


    const basePackable: PackingListPackable = {
      name: packable.name,
      checked: false,
      quantity: accQuantity,
      id: packable.id,
      profileID: profile.id,
      collectionID: collection.id,
      quantityReasons: [],
      changedAfterChecked: false,
      weatherNotChecked: weatherNotChecked,
      passChecks: passChecks,
      weatherReasons: weatherReasons,
      forcePass: false,
      forceQuantity: false,
      recentlyAdded: false,
      dateModified: timeStamp(),
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
          if (this.trip.profiles.length > 1) {
            returnListPackable.push(
              {
                ...basePackable,
                profileID: SHARED, // TO SHARE
                quantity: rule.amount,
                quantityReasons: [new Reason(reasonText)],
              }
            )
          } else {
            accQuantity += +rule.amount;
            quantitiyReasons.push(new Reason(reasonText))
          }
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
    let oldPackableIndex = packingList.packables.findIndexBy(newP, ['id', 'profileID'])
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
        copyProperties(oldP, newP, ['weatherNotChecked', 'passChecks', 'checked'])
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
  checkPackableChanges(oldList: PackingList, newPackable: PackingListPackable) {
    if (oldList) {
      let oldPackable = oldList.packables.findBy(newPackable, ['id', 'collectionID', 'profileID'])
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
      } else {
        newPackable.recentlyAdded = false;
      }
    }
  }

  storeSettings(listSettings: PackingListSettings) {
    this.store.dispatch(new userActions.setPackingListSettings(listSettings))
  }
  refreshPackingList() {
    this.packingListEmitter.next(null)
    setTimeout(() => {
      this.packingListEmitter.next(this.packingList)
    }, 0);
  }
}