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
import { ListPackableComponent } from './list-packable/list-packable.component';
import { MatDialog } from '@angular/material';
import { DialogData_EditPackable, EditPackableDialogComponent } from '../../packables/packable-list/edit-packable-dialog/edit-packable-dialog.component';
import { ContextService } from '../../shared/services/context.service';


class listCollection {
  header: string = ''
  id: string = ''
  packables: PackingListPackable[] = []
  constructor(list: Partial<listCollection> = {}) {
    Object.assign(this, list)
  }
  get validPackables(): number {
    return this.packables.reduce((count, p) => {
      return pass(p) ? count + 1 : count
    }, 0)
  }
}
class listProfile {
  header: string = ''
  id: string = ''
  avatar: Avatar = new Avatar()
  collections: listCollection[] = []
  constructor(list: Partial<listProfile> = {}) {
    Object.assign(this, list)
  }
}

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packing-list.component.css']
})
export class PackingListComponent implements OnInit, OnDestroy {
  trip_obs: Observable<tripState>
  state_subscription: Subscription = new Subscription();
  saveTimeout = setTimeout(() => { }, 0);

  absoluteMaxTemp = absoluteMax // for template
  absoluteMinTemp = absoluteMin // for template
  lastSave: string; // for template
  navParams: navParams; // for template
  tempOptions = tempOptions; // for template
  weatherTypeOptions = weatherOptions; // for template
  settingsOpen = false; // for template
  showInvalidPackables = true // for template

  profiles: ProfileComplete[];
  customWeatherForm: FormGroup;
  sharedAvatar = new Avatar('together', this.colorGen.getUnused())
  trip: Trip;
  packingList: PackingList;
  sortedList: listProfile[] = [];
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
    private colorGen: ColorGeneratorService,
    private dialog: MatDialog,
    private context: ContextService,
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
      this.state_subscription.add(this.storeSelector.trips_obs
      //.pipe(take(1))
      .subscribe(tripState => {
          this.packingList = tripState.packingLists.findId(memoryTrip.id);
          console.log('<< Loaded PackingList: ', this.packingList)
          this.trip = tripState.trips.find(trip => trip.id == memoryTrip.id);
          if (!this.packingList) {
            console.log(`updatePackingListWithWeatherAPI`);
            this.updatePackingListWithWeatherAPI(this.trip);
          } else if(!this.tripWeather || !this.sortedList || this.sortedList.length===0){
            console.log(`patchWeatherForm, updatePackingListBySetting`);
            this.patchWeatherForm(this.packingList)
            this.updatePackingListBySetting(this.packingList, this.trip)
          } else{
            console.log(`updatePackingList`);
            console.log(`this.sortedList:`,this.sortedList)
            this.updatePackingList(this.trip)
          }
          this.lastSave = moment().format('MMM Do, hh:mm')
        })
      )
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
    this.profiles = this.profileFactory.getCompleteProfilesByIds(trip.profiles)
    let data = new packingListData({
      totalDays: dates.length,
      totalNights: dates.length - 1,
      destination: this.destService.DestinationByCityId(trip.destinationId),
      weatherData: this.tripWeather
    })

    this.profiles.forEach(profile => {
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

  updatePackingListBySetting(packingList: PackingList, trip: Trip) {
    if (packingList.data.weatherData.dataInput == 'manual') {
      this.updatePackingListWithCustomWeather(trip);
    } else if (packingList.data.weatherData.dataInput == 'auto') {
      this.updatePackingListWithWeatherAPI(trip)
    }
  }

  updatePackingListWithWeatherAPI(trip: Trip) {
    let dates = getAllDates(trip.startDate, trip.endDate, { first: true, last: true });
    let dailyWeatherArray = this.weatherService.getDailyWeatherForCity(trip.destinationId, dates)
    let tripWeather = new TripWeatherData();
    console.log(`fetching dailyWeatherArray`);
    dailyWeatherArray.then(weatherArray => {
      console.log(`received`,weatherArray);
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
      console.log(`saved this.tripWeather`, tripWeather);
      let newPackinglist = this.updatePackingList(trip)
      console.log(`updatePackingList(trip)`, newPackinglist);
      this.patchWeatherForm(newPackinglist)
      this.storePackingList(newPackinglist)
    })
  }

  updatePackingListWithCustomWeather(trip: Trip) {
    let tripWeather = new TripWeatherData();
    tripWeather.minTemp = this.customWeatherForm.get('min').value
    tripWeather.maxTemp = this.customWeatherForm.get('max').value
    tripWeather.weatherTypes = this.customWeatherForm.get('types').value
    tripWeather.dataInput = 'manual';
    this.tripWeather = tripWeather;
    this.storePackingList(this.updatePackingList(trip))
  }

  updatePackingList(trip:Trip):PackingList {
    this.packingList = this.generateList(trip, this.packingList)
    if(isDefined(this.sortedList)){
      this.arrangeDisplayList(this.packingList.packables,this.sortedList)
    } else {
      this.sortedList = this.arrangeDisplayList(this.packingList.packables)
    }
    return this.packingList
  }
  storePackingList(packinglist:PackingList){
    console.log('>> update packing list emitted', packinglist)
    this.store.dispatch(new tripActions.updatePackingList(packinglist))
  }

  patchWeatherForm(NewPackingList: PackingList) {
    console.log(`patching form with weatherDataObj`);
    let weatherDataObj = NewPackingList.data.weatherData;
    console.log(`weatherDataObj:`, weatherDataObj);
    this.customWeatherForm.patchValue({ min: weatherDataObj.minTemp, max: weatherDataObj.maxTemp, types: weatherDataObj.weatherTypes })
  }

  // to update display list, include the original as porfileList, to create a new one, leave it out
  arrangeDisplayList(packingListPackables: PackingListPackable[], profileList:listProfile[] = []): listProfile[] {
    const firstTime = profileList.length === 0
    packingListPackables.forEach(item => {
      let profileIndex = profileList.findIndex(p => p.id == item.profileID)
      if (profileIndex == -1) {
        const profile = this.storeSelector.getProfileById(item.profileID)
        profileList.push(
          new listProfile({
            header: profile ? profile.name : 'Shared',
            id: item.profileID,
            avatar: profile ? profile.avatar : this.sharedAvatar,
            collections: []
          })
        )
        profileIndex = profileList.findIndex(p => p.id == item.profileID)
      }
      let collectionIndex = profileList[profileIndex].collections.findIndex(c => c.id == item.collectionID)
      if (collectionIndex == -1) {
        profileList[profileIndex].collections.push(
          new listCollection({
            header: this.getCollectionName(item),
            id: item.collectionID,
            packables: []
          })
        )
        collectionIndex = profileList[profileIndex].collections.findIndex(p => p.id == item.collectionID)
      }
      let packableIndex = profileList[profileIndex].collections[collectionIndex].packables.findIndex(p => p.id == item.id)
      if(packableIndex === -1){
        profileList[profileIndex].collections[collectionIndex].packables.push(item)
      } else {
        let p = profileList[profileIndex].collections[collectionIndex].packables[packableIndex]
        Object.assign(p,item)
      }
    })
    let SharedListIndex = profileList.findIndex(p => p.id === null);
    // push Shared list to the end
    if (SharedListIndex != -1) {
      profileList.push(...profileList.splice(SharedListIndex, 1))
    }
    const removeList:PackingListPackable[] = []
    profileList.forEach(profileList => {
      profileList.collections.forEach(colList => {
        colList.packables.forEach(p1=>{
          // FIND MISSING PACKABLES
          const i = packingListPackables.findIndex(p2=>{
            return p1.id == p2.id && p1.profileID == p2.profileID && p1.collectionID == p2.collectionID
          })
          if(i === -1){
            removeList.push(p1)
          }
        })
        firstTime && colList.packables.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            return nameA > nameB ? 1 : -1;
          })
          .sort((a, b) => {
            return pass(a) ? (pass(b) ? 0 : -1) : (pass(b) ? 1 : 0)
          })
      })
    })
    removeList.forEach(plp=>this.removePackableFromList(plp,profileList))
    return profileList;
  }




  delayedSave() {
    console.log(`Delayed save...`);

    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      console.log(`Delayed save executed`);
      this.store.dispatch(new tripActions.updatePackingList(this.packingList))
    }, 2000)
  }




  getPackableName(packable: PackingListPackable) {
    return this.storeSelector.getPackableById(packable.id).name;
  }
  getCollectionName(packable: PackingListPackable) {
    return this.storeSelector.getCollectionById(packable.collectionID).name;
  }
  getPackableIndex(packable: PackingListPackable): number {
    return this.packingList.packables.findIndex(p => {
      return p.id == packable.id && p.profileID == packable.profileID
    })
  }


  // ---- PACKABLE ACTIONS

  editingPackable: ListPackableComponent;
  onToggleEditPackable(editing: boolean, editingPackable: ListPackableComponent) {
    if (editing) {
      if (this.editingPackable && this.editingPackable.editMode) {
        this.editingPackable.toggleEditMode(false)
      }
      this.editingPackable = editingPackable
    } else if (!editing && this.editingPackable) {
      this.editingPackable = null
    }
  }

  onUpdateQuantity(packable: PackingListPackable) {
    let index = this.getPackableIndex(packable)
    this.packingList.packables[index] = packable
    this.delayedSave();
  }
  toggleCheck(packable: PackingListPackable) {
    packable.checked = !packable.checked
    let index = this.getPackableIndex(packable)
    this.packingList.packables[index].checked = packable.checked;
    this.delayedSave();
  }

  addInvalid(packable: PackingListPackable) {
    let index = this.getPackableIndex(packable)
    this.packingList.packables[index].forcePass = true;
    this.delayedSave();
  }

  editPackableRules(packable: PackingListPackable) {
    let editingPackable: PackableComplete
    let data: DialogData_EditPackable
    this.context.setBoth(packable.collectionID, packable.profileID)
    let editingProfile = this.profiles.findId(packable.profileID)
    let eiditingCollection = editingProfile.collections.findId(packable.collectionID)
    editingPackable = eiditingCollection.packables.findId(packable.id)
    data = {
      pakable: editingPackable,
      isNew: false
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      maxWidth: "99vw",
      maxHeight: "99vh",
      disableClose: true,
      autoFocus: false,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((newPackable: PackableComplete) => {
      console.log(`Received from modal:`, newPackable);
      if(newPackable){
        if (this.editingPackable && this.editingPackable.editMode) {
          this.editingPackable.toggleEditMode(false)
        }
        let i = this.getPackableIndex(packable)
        this.packingList.packables[i].forceQuantity = false
        this.packingList.packables[i].forcePass = false
        this.storePackingList(this.updatePackingList(this.trip))
        // this.removePackableFromList(packable)
        // let miniPackingList = new PackingList(this.trip.id)
        // editingProfile.collections.forEach(c=>{
        //   c.packables.forEach(p=>{
        //     if(p.id === newPackable.id){
        //       const listPackables = this.applyChecksOnPackable(this.packingList.data, p, eiditingCollection, editingProfile)
        //       listPackables.forEach(listPackable => {
        //         this.addPackableToList(listPackable, this.packingList)
        //         this.addPackableToList(listPackable, miniPackingList)
        //       })
        //     }
        //   })
        // })
        // const listPackables = this.applyChecksOnPackable(this.packingList.data, newPackable, eiditingCollection, editingProfile)
        // listPackables.forEach(listPackable => this.addPackableToList(listPackable, this.packingList))
        // this.arrangeDisplayList(miniPackingList.packables,this.sortedList)
      }
    })
  }

  removePackableFromList(packable: PackingListPackable, list:listProfile[]){
    let packables = list
    .findId(packable.profileID).collections
    .findId(packable.collectionID).packables
    const sortedListIndex = packables.findIndex(p=>p.id===packable.id)
    console.log(`removing ${packable.name} -  found at ${sortedListIndex}`,packables.slice())
    packables.splice(sortedListIndex,1)
  }
  // -- checklist count

  countCompletedInProfile(profile: listProfile): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.reduce((subtotal, packable) => {
        return (packable.checked && pass(packable)) ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }
  countPackablesInProfile(profile: listProfile): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.validPackables
    }, 0);
  }
  isProfileChecked(profile: listProfile): boolean {
    return this.countPackablesInProfile(profile) === this.countCompletedInProfile(profile)
  }

  ngOnDestroy() {
    this.state_subscription && this.state_subscription.unsubscribe();
  }

  return() {
    this.router.navigate(['/trips'])
  }
}
