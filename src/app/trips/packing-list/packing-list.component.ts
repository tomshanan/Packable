import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers'
import * as tripActions from '../store/trip.actions';
import { Observable, Subscription, Subject } from 'rxjs';
import { PackingList, PackingListPackable, Reason, packingListData, pass } from '../../shared/models/packing-list.model';
import { State as tripState } from '../store/trip.reducers';
import { MemoryService } from '../../shared/services/memory.service';
import { Trip } from '../../shared/models/trip.model';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { DestinationDataService } from '../../shared/services/location-data.service';
import { PackableComplete, ActivityRule } from '../../shared/models/packable.model';
import { WindowService } from '../../shared/services/window.service';
import { navParams } from '../../shared-comps/mobile-nav/mobile-nav.component';
import { WeatherService, TripWeatherData, weatherCheckResponse } from '../../shared/services/weather.service';
import { WeatherRule, weatherType, weatherOptions, tempOptions, absoluteMax, absoluteMin } from '../../shared/models/weather.model';
import { take } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isDefined, getAllDates, copyProperties } from '../../shared/global-functions';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { weatherFactory } from '../../shared/factories/weather.factory';
import { TripMemoryService } from '@app/shared/services/trip-memory.service';
import { CollectionComplete } from '../../shared/models/collection.model';
import { ProfileComplete, Avatar } from '../../shared/models/profile.model';
import { colors, ColorGeneratorService } from '../../shared/services/color-gen.service';


class listCollection {
  header: string = ''
  collectionID: string = ''
  packables: PackingListPackable[] = []
  constructor(list:Partial<listCollection> = {}){
    Object.assign(this,list)
  }
  get validPackables():number {
    return this.packables.reduce((count,p)=>{
      return pass(p) ? count+1 : count
    },0)
  }
}
class listProfile {
  header: string = ''
  profileID: string = ''
  avatar:Avatar = new Avatar()
  collections: listCollection[] = []
  constructor(list:Partial<listProfile> = {}){
    Object.assign(this,list)
  }
}

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packing-list.component.css']
})
export class PackingListComponent implements OnInit, OnDestroy {
  trip_obs: Observable<tripState>
  state_subscription: Subscription;
  saveTimeout = setTimeout(() => { }, 0);

  absoluteMaxTemp = absoluteMax // for template
  absoluteMinTemp = absoluteMin // for template
  lastSave: string; // for template
  navParams: navParams; // for template
  tempOptions = tempOptions; // for template
  weatherTypeOptions = weatherOptions; // for template
  settingsOpen = false; // for template
  showInvalidPackables = true // for template

  customWeatherForm: FormGroup;
  sharedAvatar = new Avatar('together',this.colorGen.getUnused())
  trip: Trip;
  packingList: PackingList;
  sortedList: listProfile[];
  tripWeather: TripWeatherData;
  packingListData: packingListData;

  constructor(
    private store: Store<fromApp.appState>,
    private tripMemory: TripMemoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storeSelector: StoreSelectorService,
    private destService: DestinationDataService,
    public windowService: WindowService, // used by template
    private weatherService: WeatherService,
    private fb: FormBuilder,
    private profileFactory: ProfileFactory,
    private weatherFactory: weatherFactory,
    private colorGen:ColorGeneratorService,
  ) {
    /*
      MOVE CUSTOM WEATHER FORM TO COMPONENT 
    */
    this.customWeatherForm = fb.group({
      min: [null],
      max: [null],
      types: [[]]
    })

  }

  ngOnInit() {
    let memoryTrip = this.tripMemory.trip
    /*
        ADD ALTERNATIVE HERE: 
        get trip from router params, disable editing unless user logged in 
    */
    if (!!memoryTrip) {
      this.state_subscription = this.storeSelector.trips_obs.pipe(take(1)).subscribe(tripState => {
        this.packingList = tripState.packingLists.findId(memoryTrip.id);
        console.log('<< Loaded PackingList: ', this.packingList)
        this.trip = tripState.trips.find(trip => trip.id == memoryTrip.id);
        if (!this.packingList) {
          this.updatePackingListWithWeatherAPI(this.trip);
        } else {
          this.patchWeatherForm(this.packingList)
          this.updatePackingListBySetting(this.packingList, this.trip)
          this.lastSave = moment().format('MMM Do, hh:mm')
        }
      })
      this.navSetup();
    } else {
      this.return();
    }
  }
  navSetup() {
    this.navParams = {
      header: this.destService.DestinationByCityId(this.trip.destinationId).fullName,
      left: { enabled: true, text: 'Trips', iconClass: 'fas fa-chevron-left' },
      right: { enabled: true, text: '', iconClass: 'fas fa-ellipsis-h' },
      options: []
    }
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
    const basePackable:PackingListPackable = {
      packableID: packable.id,
      profileID: profile.id,
      collectionID: collection.id,
      name:packable.name,
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
      if(accQuantity === 0){
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
      return p.packableID == newP.packableID && p.profileID == newP.profileID
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

      if(newP.passChecks || newP.passChecks == oldP.passChecks){
        voidWeather(oldP)
        copyProperties(oldP,newP,['weatherNotChecked','passChecks'])
        if(newP.forceQuantity || (!oldP.forceQuantity && newP.quantity>oldP.quantity)){
            voidQuantity(oldP)
            copyProperties(oldP,newP,['quantity', 'forceQuantity'])
        } else { 
          voidQuantity(newP)
        }
      } else {
        voidWeather(newP)
        // if(newP.forceQuantity){
        //   voidQuantity(oldP)
        //   copyProperties(oldP,newP,['quantity','forceQuantity'])
        // } else {
        voidQuantity(newP)
        // }
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
        return (p.packableID == newPackable.packableID
          && p.collectionID == newPackable.collectionID
          && p.profileID == newPackable.profileID)
      })
      if (oldPackable && oldPackable.checked) {
        if (oldPackable.quantity != newPackable.quantity) {
          newPackable.changedAfterChecked = true;
        } else {
          newPackable.checked = true;
        }
      }
      if (!oldPackable || (!oldPackable.passChecks && newPackable.passChecks)) {
        newPackable.recentlyAdded = true;
      } else if(oldPackable && oldPackable.forcePass){
        newPackable.forcePass = true
      }
    }
    return newPackable
  }

  updatePackingListBySetting(packingList: PackingList, trip: Trip) {
    if (packingList.dataInput == 'manual') {
      this.updatePackingListWithCustomWeather(trip);
    } else if (packingList.dataInput == 'auto') {
      this.updatePackingListWithWeatherAPI(trip)
    }
  }

  updatePackingListWithWeatherAPI(trip: Trip) {
    this.sortedList = null;
    let dates = getAllDates(trip.startDate, trip.endDate, { first: true, last: true });
    let dailyWeatherArray = this.weatherService.getDailyWeatherForCity(trip.destinationId, dates)
    let tripWeather = new TripWeatherData();
    dailyWeatherArray.then(weatherArray => {
      tripWeather.weatherArray = weatherArray;
      tripWeather.minTemp = this.weatherService.getMinTemp(weatherArray)
      tripWeather.maxTemp = this.weatherService.getMaxTemp(weatherArray)
      // push daily weather type, clear duplicates, 
      // don't include rain as it will be calculated seperately
      tripWeather.weatherTypes.push(
        ...weatherArray.map(dayWeather => dayWeather.weatherType).filter((x, pos, arr) => (x != 'rain' && x != null && arr.indexOf(x) == pos))
      )
      this.weatherService.willItRain(weatherArray) && tripWeather.weatherTypes.push('rain');
      this.tripWeather = tripWeather;
      let newPackingList = this.generateList(trip, this.packingList)
      this.patchWeatherForm(newPackingList)
      this.updatePackingList(newPackingList);
    })
  }

  updatePackingListWithCustomWeather(trip: Trip) {
    this.sortedList = null;
    let weatherDataObj = new TripWeatherData();
    weatherDataObj.minTemp = this.customWeatherForm.get('min').value
    weatherDataObj.maxTemp = this.customWeatherForm.get('max').value
    weatherDataObj.weatherTypes = this.customWeatherForm.get('types').value
    let newPackingList = this.generateList(trip, this.packingList)
    newPackingList.dataInput = 'manual';
    this.updatePackingList(newPackingList);
  }

  updatePackingList(NewPackingList: PackingList) {
    console.log('>> update packing list emitted', NewPackingList)
    this.store.dispatch(new tripActions.updatePackingList(NewPackingList))
    this.packingList = NewPackingList;
    this.sortedList = this.createDisplayList(NewPackingList)
  }

  patchWeatherForm(NewPackingList: PackingList) {
    let weatherDataObj = NewPackingList.data.weatherData;
    this.customWeatherForm.patchValue({ min: weatherDataObj.minTemp, max: weatherDataObj.maxTemp, types: weatherDataObj.weatherTypes })
  }

  createDisplayList(packingList: PackingList): listProfile[] {
    let profileList: listProfile[] = [];
    packingList.packables.forEach(item => {
      let profileIndex = profileList.findIndex(p => p.profileID == item.profileID)
      if (profileIndex == -1) {
        const profile = this.storeSelector.getProfileById(item.profileID)
        profileList.push(
          new listProfile({
            header: profile ? profile.name : 'Shared',
            profileID: item.profileID,
            avatar: profile ? profile.avatar: this.sharedAvatar,
            collections: []
          })
        )
        profileIndex = profileList.findIndex(p => p.profileID == item.profileID)
      }
      let collectionIndex = profileList[profileIndex].collections.findIndex(p => p.collectionID == item.collectionID)
      if (collectionIndex == -1) {
        profileList[profileIndex].collections.push(
          new listCollection({
            header: this.getCollectionName(item),
            collectionID: item.collectionID,
            packables: []
          })
        )
        collectionIndex = profileList[profileIndex].collections.findIndex(p => p.collectionID == item.collectionID)
      }
      profileList[profileIndex].collections[collectionIndex].packables.push(item)
    })
    let SharedListIndex = profileList.findIndex(p => p.header == 'Shared');
    // push Shared list to the end
    if (SharedListIndex != -1) {
      profileList.push(...profileList.splice(SharedListIndex, 1))
    }
    profileList.forEach(profileList=>{
      profileList.collections.forEach(colList=>{
        colList.packables
        .sort((a,b)=>{
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
          return nameA > nameB ? 1 : -1;
        })
        .sort((a,b)=>{
          return pass(a) ? (pass(b) ? 0 : -1) : (pass(b) ? 1 : 0)
        })
      })
    })
    return profileList;
  }



  toggleCheck(packable: PackingListPackable) {
    let index = this.packingList.packables.findIndex(p => {
      return p.packableID == packable.packableID && p.profileID == packable.profileID
    })
    this.packingList.packables[index].checked = !this.packingList.packables[index].checked;
    this.delayedSave();
  }

  delayedSave() {
    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      this.store.dispatch(new tripActions.updatePackingList(this.packingList))
    }, 2000)
  }


  addInvalid(packable: PackingListPackable){
    let index = this.packingList.packables.findIndex(p => {
      return p.packableID == packable.packableID && p.profileID == packable.profileID
    })
    this.packingList.packables[index].forcePass = true;
    this.delayedSave();
  }

  getPackableName(packable: PackingListPackable) {
    return this.storeSelector.getPackableById(packable.packableID).name;
  }
  getCollectionName(packable: PackingListPackable) {
    return this.storeSelector.getCollectionById(packable.collectionID).name;
  }

  countCompleted(profile: listProfile): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.reduce((subtotal, packable) => {
        return (packable.checked && pass(packable)) ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }
  countPackables(profile: listProfile): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.validPackables
    }, 0);
  }
  checkCompleted(profile: listProfile): boolean {
    return this.countPackables(profile) === this.countCompleted(profile)
  }

  ngOnDestroy() {
    this.state_subscription && this.state_subscription.unsubscribe();
  }

  return() {
    this.router.navigate(['/trips'])
  }
}
