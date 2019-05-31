import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers'
import { Subscription } from 'rxjs';
import { PackingList, PackingListPackable, Reason, packingListData, PackingListSettings } from '../../shared/models/packing-list.model';
import { Trip } from '../../shared/models/trip.model';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { DestinationDataService } from '../../shared/services/location-data.service';
import { WindowService } from '../../shared/services/window.service';
import { navParams } from '../../shared-comps/mobile-nav/mobile-nav.component';
import { WeatherService, TripWeatherData, weatherCheckResponse } from '../../shared/services/weather.service';
import { weatherOptions, tempOptions, absoluteMax, absoluteMin } from '../../shared/models/weather.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { weatherFactory } from '../../shared/factories/weather.factory';
import { TripMemoryService } from '@app/shared/services/trip-memory.service';
import { ColorGeneratorService } from '../../shared/services/color-gen.service';
import { ListPackableComponent } from './list-packable/list-packable.component';
import { PackingListService , pass} from './packing-list.service';
import { Avatar } from '../../shared/models/profile.model';


export class listCollection {
  header: string = ''
  id: string = ''
  packables: PackingListPackable[] = []
  constructor(list: Partial<listCollection> = {}) {
    Object.assign(this, list)
  }
  validPackables(): number {
    return this.packables.reduce((count, p) => {
      return pass(p) ? count + 1 : count
    }, 0)
  }
}
export class listProfile {
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
  styleUrls: ['../../shared/css/full-flex.css', './packing-list.component.css'],
  providers: [PackingListService]
})
export class PackingListComponent implements OnInit, OnDestroy {
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
  editingPackable: ListPackableComponent; // for list-collection-component
  forecastString:string = 'Loading Weather';
  customWeatherForm: FormGroup;
  sharedAvatar = new Avatar('together', this.colorGen.getUnused())
  trip: Trip;
  packingList: PackingList;
  sortedList: listProfile[] = [];
  packingListSettings: PackingListSettings;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storeSelector: StoreSelectorService,
    private destService: DestinationDataService,
    public windowService: WindowService, // used by template
    private fb: FormBuilder,
    private colorGen: ColorGeneratorService,
    private packingListService: PackingListService,
  ) {
    /*
      MOVE CUSTOM WEATHER FORM TO COMPONENT 
    */
    this.customWeatherForm = this.fb.group({
      min: [null],
      max: [null],
      types: [[]]
    })

  }

  ngOnInit() {
    if(!this.packingList && this.packingListService.packingList){
      this.updateView(this.packingListService.packingList)
    }
    this.navSetup();
    this.state_subscription.add(this.packingListService.serviceSubscription)
    this.state_subscription.add(
      this.packingListService.packingListEmitter.subscribe(newPackinglist => {
        console.log(`PackingListComponent received newPackinglist`,newPackinglist)
        if (newPackinglist) {
          this.updateView(newPackinglist)
        }
      })
    )
    this.packingListSettings = this.packingListService.packingListSettings
  }

  updateView(newPackinglist: PackingList) {
    this.packingList = newPackinglist
    this.trip = this.packingListService.trip
    this.forecastString = newPackinglist.data.weatherData.forecastString()
    this.patchWeatherForm(this.packingList)
    this.lastSave = moment().format('MMM Do, hh:mm')
    if (!this.sortedList) {
      this.sortedList = this.arrangeDisplayList(this.packingList.packables)
    } else {
      this.arrangeDisplayList(this.packingList.packables, this.sortedList)
    }
    this.navSetup();
  }
  navSetup() {
    this.navParams = {
      header: this.trip ? this.destService.DestinationByCityId(this.trip.destinationId).fullName : 'Packing List',
      left: { enabled: true, text: 'Trips', iconClass: 'fas fa-chevron-left' },
      right: { enabled: true, text: '', iconClass: 'fas fa-ellipsis-h' },
      options: []
    }
  }

  updatePackingListWithCustomWeather() {
    this.packingList = null;
    let formWeather = this.getWeatherDataFromForm();
    setTimeout(()=>{
      this.packingListService.updateUsingCustomWeather({weatherData:formWeather,save:true})
    },0)
  }
  updatePackingListWithWeatherAPI(){
    this.packingList = null;
    this.forecastString = 'Loading Weather...'
    setTimeout(()=>{
      this.packingListService.updateUsingWeatherAPI({save:true})
    },0)
  }

  getWeatherDataFromForm(): TripWeatherData {
    let tripWeather = new TripWeatherData();
    tripWeather.minTemp = this.customWeatherForm.get('min').value
    tripWeather.maxTemp = this.customWeatherForm.get('max').value
    tripWeather.weatherTypes = this.customWeatherForm.get('types').value
    tripWeather.dataInput = 'manual';
    return tripWeather
  }

  reloadPackingList() {
    this.packingListService.generateAndStorePackingList()
  }

  patchWeatherForm(NewPackingList: PackingList) {
    let weatherDataObj = NewPackingList.data.weatherData;
    this.customWeatherForm.patchValue({
      min: weatherDataObj.minTemp,
      max: weatherDataObj.maxTemp,
      types: weatherDataObj.weatherTypes
    })
  }

  // to update display list, include the original as porfileList, to create a new one, leave it out
  arrangeDisplayList(packingListPackables: PackingListPackable[], profileList: listProfile[] = []): listProfile[] {
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
        const collection = this.storeSelector.getCollectionById(item.collectionID)
        profileList[profileIndex].collections.push(
          new listCollection({
            header: collection.name,
            id: item.collectionID,
            packables: []
          })
        )
        collectionIndex = profileList[profileIndex].collections.findIndex(p => p.id == item.collectionID)
      }
      let packableIndex = profileList[profileIndex].collections[collectionIndex].packables.findIndex(p => p.id == item.id)
      if (packableIndex === -1) {
        profileList[profileIndex].collections[collectionIndex].packables.push(item)
      } else {
        let p = profileList[profileIndex].collections[collectionIndex].packables[packableIndex]
        Object.assign(p, item)
      }
    })
    let SharedListIndex = profileList.findIndex(p => p.id === null);
    // push Shared list to the end
    if (SharedListIndex != -1) {
      profileList.push(...profileList.splice(SharedListIndex, 1))
    }
    const removeList: PackingListPackable[] = []
    profileList.forEach(profileList => {
      profileList.collections.forEach(colList => {
        colList.packables.forEach(p1 => {
          // FIND MISSING PACKABLES
          const i = packingListPackables.findIndex(p2 => {
            return p1.id == p2.id && p1.profileID == p2.profileID && p1.collectionID == p2.collectionID
          })
          if (i === -1) {
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
    removeList.forEach(p => this.removePackableFromSortedList(p, profileList))
    return profileList;
  }

  removePackableFromSortedList($p: PackingListPackable, list: listProfile[]) {
    let packables = list
      .findId($p.profileID).collections
      .findId($p.collectionID).packables
    const sortedListIndex = packables.findIndex(p => p.id === $p.id)
    console.log(`removing ${$p.name} -  found at ${sortedListIndex}`, packables.slice())
    packables.splice(sortedListIndex, 1)
  }
  // -- bulk actions 

  tickAll(){

  }
  resetAll(){

  }
  tickAllProfile(profile:listProfile){
    profile.collections.forEach(c=>{
      c.packables.forEach(p => {
        p.checked = true
        this.packingListService.onUpdatePackable(p,false)
      });
    })
    this.packingListService.delayedSave()
  }
  resetAllProfile(profile:listProfile){
    profile.collections.forEach(c=>{
      c.packables.forEach(p => {
        p.forceQuantity = false
        p.forcePass = false
        p.checked = false
        this.packingListService.onUpdatePackable(p,false)
      });
    })
    this.packingListService.generateAndStorePackingList()
  }


  // ---- PACKABLE ACTIONS

  onUpdatePackable(newPackable: PackingListPackable) {
    this.packingListService.onUpdatePackable(newPackable)
  }


  // -- checklist tests

  countCompletedInProfile(profile: listProfile): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.reduce((subtotal, packable) => {
        return (packable.checked && pass(packable)) ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }

  countPackablesInProfile(profile: listProfile): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.validPackables()
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
