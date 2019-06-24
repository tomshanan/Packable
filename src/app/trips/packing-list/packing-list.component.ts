import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { PackingList, PackingListPackable, PackingListSettings, DisplayPackingList, pass } from '../../shared/models/packing-list.model';
import { Trip, displayTrip } from '../../shared/models/trip.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { DestinationDataService } from '../../shared/services/location-data.service';
import { WindowService } from '../../shared/services/window.service';
import { navParams } from '../../shared-comps/mobile-nav/mobile-nav.component';
import { TripWeatherData } from '../../shared/services/weather.service';
import { weatherOptions, tempOptions, absoluteMax, absoluteMin } from '../../shared/models/weather.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListPackableComponent } from './list-packable/list-packable.component';
import { PackingListService} from './packing-list.service';
import { Icon } from '../../shared-comps/stepper/stepper.component';
import { TripFactory } from '../../shared/factories/trip.factory';

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packing-list.component.css'],
  providers: [PackingListService]
})
export class PackingListComponent implements OnInit, OnDestroy {
  state_subscription: Subscription = new Subscription();
  saveTimeout = setTimeout(() => { }, 0);
  loading$:Observable<boolean>|boolean = false;
  absoluteMaxTemp = absoluteMax // for template
  absoluteMinTemp = absoluteMin // for template
  lastSave: string; // for template
  navParams: navParams; // for template
  tempOptions = tempOptions; // for template
  weatherTypeOptions = weatherOptions; // for template
  settingsOpen = false; // for template
  showInvalidPackables = true // for template
  menuIcon:Icon = {icon:{type:'mat',name:'settings'},text:'Options'}
  editingPackable: ListPackableComponent; // for list-collection-component

  forecastString:string = 'Loading Weather';
  customWeatherForm: FormGroup; 
  trip: Trip;
  displayTrip:displayTrip;

  packingList: PackingList;
  sortedList: DisplayPackingList[] = [];
  packingListSettings: PackingListSettings;

  constructor(
    private router: Router,
    private tripFac: TripFactory,
    private destService: DestinationDataService,
    public windowService: WindowService, // used by template
    private fb: FormBuilder,
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
    // if(!this.packingList && this.packingListService.packingList){
    //   this.updateView(this.packingListService.packingList)
    // }
    this.packingListSettings = this.packingListService.packingListSettings
    console.log('loaded list with settings:',this.packingListSettings)
    this.loading$ = this.packingListService.loadingEmit.pipe()
    this.state_subscription.add(this.packingListService.serviceSubscription)
    this.state_subscription.add(
      this.packingListService.packingListEmitter.subscribe(newPackinglist => {
        console.log(`PackingListComponent received newPackinglist`,newPackinglist)
        if (newPackinglist) {
          this.updateView(newPackinglist)
        } else {
          this.packingList = null;
        }
      })
    )
    this.state_subscription.add(
      this.packingListService.settingsEmitter.subscribe(settings=>{
        this.packingListSettings = new PackingListSettings(settings)
      })
    )
    
  }

  updateView(newPackinglist: PackingList) {
    this.packingList = newPackinglist
    this.trip = this.packingListService.trip
    this.displayTrip = this.packingListService.displayTrip
    this.forecastString = newPackinglist.data.weatherData.forecastString()
    this.patchWeatherForm(this.packingList)
    this.lastSave = moment().format('MMM Do, hh:mm')
    if (!this.sortedList) {
      this.sortedList = this.tripFac.createDisplayPackingList(this.packingList.packables)
    } else {
      this.tripFac.createDisplayPackingList(this.packingList.packables, this.sortedList)
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



  // -- bulk actions 

  tickAllProfile(profile:DisplayPackingList){
    this.packingListService.delayedSave()
    this.modifyPackablesForProfile(profile,(packable)=>{
      packable.checked = true
  })
  }
  resetAllProfile(profile:DisplayPackingList){
    this.modifyPackablesForProfile(profile,(packable)=>{
        packable.forceQuantity = false
        packable.forcePass = false
        packable.checked = false
    })
  }
  modifyPackablesForProfile(profile:DisplayPackingList,changePackable:(p:PackingListPackable)=>void){
    let savePackables:PackingListPackable[] = []
    profile.collections.forEach(c=>{
      c.packables.forEach(p => {
        changePackable(p)
        savePackables.push(p)
      });
    })
    this.packingListService.onUpdatePackables(savePackables,true)
  }


  // ---- PACKABLE ACTIONS

  onUpdatePackable(newPackable: PackingListPackable) {
    this.packingListService.onUpdatePackables([newPackable])
  }


  // -- checklist tests

  countCompletedInProfile(profile: DisplayPackingList): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.reduce((subtotal, packable) => {
        return (packable.checked && pass(packable)) ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }

  countPackablesInProfile(profile: DisplayPackingList): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.validPackables()
    }, 0);
  }
  isProfileChecked(profile: DisplayPackingList): boolean {
    return this.countPackablesInProfile(profile) === this.countCompletedInProfile(profile)
  }

  ngOnDestroy() {
    this.state_subscription && this.state_subscription.unsubscribe();
  }

  return() {
    this.router.navigate(['/trips'])
  }
}
