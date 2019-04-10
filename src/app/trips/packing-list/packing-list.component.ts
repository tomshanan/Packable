import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers'
import * as tripActions from '../store/trip.actions';
import { Observable ,  Subscription ,  Subject } from 'rxjs';
import { PackingList, PackingListPackable, Reason, packingListData } from '../../shared/models/packing-list.model';
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
import { WeatherService, tempOptions, weatherData, absoluteMax, absoluteMin } from '../../shared/services/weather.service';
import { WeatherRule, weatherType, weatherOptions } from '../../shared/models/weather.model';
import { take } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isDefined } from '../../shared/global-functions';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { weatherFactory } from '../../shared/factories/weather.factory';


interface collectionList {
  header: string,
  collectionID: string,
  packables: PackingListPackable[]
}
interface profileList {
  header: string,
  profileID: string,
  collections: collectionList[]
}

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packing-list.component.css']
})
export class PackingListComponent implements OnInit, OnDestroy {
  trip_obs: Observable<tripState>
  state_subscription: Subscription;
  packingList: PackingList;
  sortedList: profileList[];
  saveTimeout;
  lastSave: string;
  trip: Trip;
  navParams: navParams;
  moment = moment;
  tempOptions = tempOptions;
  weatherTypeOptions = weatherOptions;
  settingsOpen = false;
  customWeatherForm: FormGroup;
  packingListUpdated = new Subject<PackingList>()
  absoluteMaxTemp = absoluteMax
  absoluteMinTemp = absoluteMin
  packingList_subscription: Subscription;

  constructor(
    private store: Store<fromApp.appState>,
    private memoryService: MemoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private selectorService: StoreSelectorService,
    private destService: DestinationDataService,
    public windowService: WindowService, // used by template
    private weatherService: WeatherService,
    private fb:FormBuilder,
    private profileFactory: ProfileFactory,
    
    private weatherFactory:weatherFactory,
  ) {
    this.customWeatherForm = fb.group({
      min: [null],
      max: [null],
      types: [[]]
    })
    this.packingList_subscription = this.packingListUpdated.subscribe((NewPackingList)=>{
      console.log('>> update packing list emitted', NewPackingList)
      this.store.dispatch(new tripActions.updatePackingList(NewPackingList))
      this.packingList = NewPackingList;
      this.sortedList = this.sortPackingList(NewPackingList)
    })
  }

  ngOnInit() {
    let memoryTrip = this.memoryService.getAll.trip
    if (!!memoryTrip) {
      this.trip_obs = this.store.select('trips')
      this.state_subscription = this.trip_obs.pipe(take(1)).subscribe(tripState => {
        this.packingList = tripState.packingLists.find(pl => pl.id == memoryTrip.id);
        console.log('<< Loaded PackingList: ',this.packingList)
        this.trip = tripState.trips.find(trip => trip.id == memoryTrip.id);
        if (!this.packingList) {
          this.updatePackingListWithWeatherAPI(this.trip);
        } else {
          this.patchWeatherForm(this.packingList)
          this.updatePackingListBySetting(this.packingList, this.trip)
          this.lastSave = moment().format('MMM Do YYYY, HH:mm:ss')
        }
      })
      this.navSetup();
    } else {
      this.return();
    }
  }
  navSetup() {
    this.navParams = {
      header: this.destService.DestinationById(this.trip.destinationId).fullName,
      left: { enabled: true, text: 'Trips', iconClass: 'fas fa-chevron-left' },
      right: { enabled: true, text: '', iconClass: 'fas fa-ellipsis-h' },
      options: []
    }
  }
  toggleCheck(packabale: PackingListPackable) {
    let index = this.packingList.packables.findIndex(p => {
      return p.packableID == packabale.packableID && p.profileID == packabale.profileID
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

  generateList(trip: Trip, weatherData: weatherData, oldPackingList: PackingList = null): PackingList {
    let newPackingList = new PackingList(trip.id);
    let data = new packingListData()
    let dates = this.getAllDates(trip.startDate, trip.endDate);
    data.totalDays = dates.length;
    data.totalNights = dates.length - 1;
    data.destination = this.destService.DestinationById(trip.destinationId);
    data.weatherData = weatherData;
    let activityIds = trip.collections;
    let profiles = this.profileFactory.getCompleteProfilesByIds(trip.profiles)

    let addPackableToList = (newPackable: PackingListPackable): void => {
      let packableIndex = newPackingList.packables.findIndex(p => {
        return p.packableID == newPackable.packableID && p.profileID == newPackable.profileID
      })
      if (packableIndex != -1) {
        let currentQuantity = newPackingList.packables[packableIndex].quantity;
        if (newPackable.quantity > currentQuantity) {
          newPackingList.packables[packableIndex].quantity = newPackable.quantity;
          newPackingList.packables[packableIndex].quantityReasons.forEach(r => r.active = false)
        } else {
          newPackable.quantityReasons.forEach(r => r.active = false)
        }
        newPackingList.packables[packableIndex].quantityReasons.push(...newPackable.quantityReasons)
      } else {
        newPackingList.packables.push(newPackable)
      }
    }
    let processPackable = (packable: PackableComplete, collectionId: string, profileId: string): void => {
      let collectionName = collectionId ? this.selectorService.getCollectionById(collectionId).name : 'Loose';
      let profileName = this.selectorService.getProfileById(profileId).name;
      if (checkWeatherRules(packable)) {
        let accQuantity = 0;
        let reasons: Reason[] = [];
        let weatherNotChecked = this.weatherFactory.isSet(packable.weatherRules) && !this.weatherFactory.weatherDataIsValid(data.weatherData);
        packable.quantityRules.forEach(rule => {
          let reasonText: string;
          switch (rule.type) {
            case 'period':
              let ruleQuantity = rule.amount * Math.floor(data.totalDays / rule.repAmount);
              accQuantity += ruleQuantity;
              reasonText = `${rule.amount} per ${rule.repAmount} days = ${ruleQuantity} (from ${collectionName} Collection)`;
              reasons.push(new Reason(reasonText))
              break;
            case 'profile':
              accQuantity += rule.amount;
              reasonText = `${rule.amount} per Profile (from ${collectionName} Collection)`
              reasons.push(new Reason(reasonText))
              break;
            case 'trip':
              reasonText = `${rule.amount} per Trip (from ${collectionName} Collection in ${profileName}'s Profile)`
              let newPackable: PackingListPackable = {
                packableID: packable.id,
                profileID: null,
                collectionID: collectionId,
                quantity: rule.amount,
                quantityReasons: [new Reason(reasonText)],
                checked: false,
                changedAfterChecked: false, //check this
                weatherNotChecked: weatherNotChecked
              }
              addPackableToList(newPackable);
              break;
            default:
              break;
          }
        })
        if (accQuantity > 0) {
          let newPackable: PackingListPackable = {
            packableID: packable.id,
            profileID: profileId,
            collectionID: collectionId,
            quantity: accQuantity,
            quantityReasons: [...reasons],
            checked: false,
            changedAfterChecked: false, //check this
            weatherNotChecked: weatherNotChecked
          }
          addPackableToList(newPackable);
        }
      }
    }
    let checkWeatherRules = (item: { weatherRules: WeatherRule }): boolean => {
      let rule = item.weatherRules;
      let wData = data.weatherData;
      let conditionsMet:boolean = true;
      if(wData.isValid){
        if(isDefined(rule.minTemp)){
          conditionsMet = wData.maxTemp >= rule.minTemp ? conditionsMet : false;
        }
        if(isDefined(rule.maxTemp)){
          conditionsMet = wData.minTemp < rule.maxTemp ? conditionsMet : false;
        }
        if(isDefined(rule.weatherTypes) && rule.weatherTypes.length>0){
          conditionsMet = rule.weatherTypes.some(w=>!!~wData.weatherTypes.indexOf(w)) ? conditionsMet : false;
        }
      }
      return conditionsMet
    }
    let checkActivityId = (id: string): boolean => {
      return activityIds.indexOf(id) != -1
    }
    // let checkActivityRules = (object: { activityRules: ActivityRule[] }): boolean => {
    //   if (object.activityRules.length > 0) {
    //     return object.activityRules.every(activityRule => {
    //       return checkActivityId(activityRule.id)
    //     })
    //   } else {
    //     return true;
    //   }
    // }
    let checkChanges = (newPackable: PackingListPackable): PackingListPackable => {
      if (oldPackingList) {
        let oldPackable = oldPackingList.packables.find(p => {
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
        if (!oldPackable){
          newPackable.recentlyAdded = true;
        }
      }
      return newPackable
    }

    profiles.forEach(profile => {
      profile.collections.forEach(collection => {
        if ((checkActivityId(collection.id)) && checkWeatherRules(collection)) { // CHECK THIS - used to check if collection is activity
          collection.packables.forEach(packable => {
            processPackable(packable, collection.id, profile.id)
          })
        }
      })
    })
    newPackingList.packables = newPackingList.packables.map(p => checkChanges(p))
    newPackingList.data = data;
    return newPackingList
  }

  updatePackingListBySetting(packingList:PackingList, trip:Trip){
    if(packingList.dataInput == 'manual'){
      this.updatePackingListWithCustomWeather(trip);
    } else if (packingList.dataInput == 'auto'){
      this.updatePackingListWithWeatherAPI(trip)
    }
  }

  updatePackingListWithWeatherAPI(trip: Trip) {
    this.sortedList = null;
    let dates = this.getAllDates(trip.startDate, trip.endDate);
    let dailyWeatherArray = this.weatherService.getDailyWeatherForCity(trip.destinationId, dates)
    let weatherDataObj = new weatherData();
    dailyWeatherArray.pipe(take(1)).subscribe(weatherArray => {
      weatherDataObj.weatherArray = weatherArray;
      weatherDataObj.minTemp = this.weatherService.getMinTemp(weatherArray)
      weatherDataObj.maxTemp = this.weatherService.getMaxTemp(weatherArray)
      weatherDataObj.weatherTypes.push(
        ...weatherArray.map(wObj => wObj.weatherType).filter((x, pos, arr) => (x != 'rain' && x != null && arr.indexOf(x) == pos))
      )
      this.weatherService.willItRain(weatherArray) && weatherDataObj.weatherTypes.push('rain');
      let newPackingList = this.generateList(trip, weatherDataObj, this.packingList)
      this.patchWeatherForm(newPackingList)
      this.packingListUpdated.next(newPackingList);
    })
  }

  updatePackingListWithCustomWeather(trip: Trip) {
    this.sortedList = null;
    let weatherDataObj = new weatherData();
    weatherDataObj.minTemp = this.customWeatherForm.get('min').value
    weatherDataObj.maxTemp = this.customWeatherForm.get('max').value
    weatherDataObj.weatherTypes = this.customWeatherForm.get('types').value
    let newPackingList = this.generateList(trip, weatherDataObj, this.packingList)
    newPackingList.dataInput = 'manual';
    this.packingListUpdated.next(newPackingList);
  }

  patchWeatherForm(NewPackingList:PackingList){
    let weatherDataObj = NewPackingList.data.weatherData;
    this.customWeatherForm.patchValue({min: weatherDataObj.minTemp, max:weatherDataObj.maxTemp, types: weatherDataObj.weatherTypes})
  }

  sortPackingList(packingList: PackingList): profileList[] {
    let sortedList: profileList[] = [];
    packingList.packables.forEach(item => {
      let profileIndex = sortedList.findIndex(p => p.profileID == item.profileID)
      if (profileIndex == -1) {
        sortedList.push({
          header: this.getProfileName(item),
          profileID: item.profileID,
          collections: []
        })
        profileIndex = sortedList.findIndex(p => p.profileID == item.profileID)
      }
      let collectionIndex = sortedList[profileIndex].collections.findIndex(p => p.collectionID == item.collectionID)
      if (collectionIndex == -1) {
        sortedList[profileIndex].collections.push({
          header: this.getCollectionName(item),
          collectionID: item.collectionID,
          packables: []
        })
        collectionIndex = sortedList[profileIndex].collections.findIndex(p => p.collectionID == item.collectionID)
      }
      sortedList[profileIndex].collections[collectionIndex].packables.push(item)
    })
    let SharedListIndex = sortedList.findIndex(p => p.header == 'Shared');
    if (!!~SharedListIndex) {
      sortedList.push(...sortedList.splice(SharedListIndex, 1))
    }
    return sortedList;
  }


  getAllDates(startDate: string, EndDate: string): moment.Moment[] {
    let startMoment = moment(startDate, 'YYYY-MM-DD');
    let endMoment = moment(EndDate, 'YYYY-MM-DD');
    let daysTotal = endMoment.diff(startMoment, 'days');
    let allDates: moment.Moment[] = [];
    for (let i = 0; i <= daysTotal; i++) { // INCLUDES FIRST DAY - change i = 1 to exclude first day
      allDates.push(moment(startMoment).add(i, 'd'))
    }
    return allDates
  }

  getPackableName(packable: PackingListPackable) {
    return this.selectorService.getPackableById(packable.packableID).name;
  }
  getProfileName(packable: PackingListPackable) {
    if (packable.profileID) {
      return this.selectorService.getProfileById(packable.profileID).name;
    } else {
      return 'Shared'
    }
  }
  getCollectionName(packable: PackingListPackable) {
    if (packable.collectionID) {
      return this.selectorService.getCollectionById(packable.collectionID).name;
    } else {
      return 'General'
    }
  }

  countCompleted(profile: profileList): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.reduce((subtotal, packable) => {
        return packable.checked ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }
  countPackables(profile: profileList): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.length
    }, 0);
  }
  checkCompleted(profile: profileList): boolean {
    return this.countPackables(profile) === this.countCompleted(profile)
  }

  ngOnDestroy() {
    this.state_subscription && this.state_subscription.unsubscribe();
    this.packingList_subscription.unsubscribe();
  }

  return() {
    this.router.navigate(['/trips'])
  }
}
