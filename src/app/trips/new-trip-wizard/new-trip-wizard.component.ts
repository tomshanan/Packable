import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { Icon } from '@app/shared-comps/stepper/stepper.component';
import { stepperTransition } from '@app/shared/animations';
import { TripMemoryService } from '../../shared/services/trip-memory.service';
import { Trip, tripCollectionGroup } from '../../shared/models/trip.model';
import { DestinationDataService } from '../../shared/services/location-data.service';
import * as moment from 'moment'
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile } from '../../shared/models/profile.model';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { isDefined } from '@app/shared/global-functions';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { TripDetailsFormComponent } from '../trip-details-form/trip-details-form.component';
import { TripFactory, tripProperties } from '../../shared/factories/trip.factory';
import { remoteCollection, destMetaData } from '../../shared/library/library.model';
import { CollectionComplete } from '../../shared/models/collection.model';
import { Subscription, combineLatest, from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import * as libraryActions from '@shared/library/library.actions';
import * as tripActions from '../store/trip.actions';
import { TripWeatherData } from '@app/core';
import { WeatherService } from '../../shared/services/weather.service';
import { MatDialog } from '@angular/material';
import { ImportCollectionDialogComponent, importCollections_result, importCollections_data } from '../../collections/collection-list/import-collection-dialog/import-collection-dialog.component';
import { take, takeWhile } from 'rxjs/operators';
import { expandAndFadeTrigger } from '../../shared/animations';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-trip-wizard',
  templateUrl: './new-trip-wizard.component.html',
  styleUrls: ['./new-trip-wizard.component.css'],
  animations: [stepperTransition,expandAndFadeTrigger]
})
export class NewTripWizardComponent implements OnInit, OnDestroy {
  trip: Trip;
  step:number = 1;
  stepValid: boolean = false;
  prevStep:number = 0;
  nextIcon:Icon = {icon:null,text:'Next'}
  packIcon:Icon = {icon:null,text:'Pack'}
  profileGroup: Profile[] = [];
  remoteCollections:remoteCollection[] = [];
  localCollections:CollectionComplete[] = [];
  loadingLibrary: boolean = true;
  subs = new Subscription();
  destMetaData:destMetaData;
  destWeatherData:TripWeatherData;

  constructor(
    public windowService:WindowService,
    public tripMemory:TripMemoryService,
    public storeSelector:StoreSelectorService,
    private destinationData:DestinationDataService,
    private bulkActions: BulkActionsService,
    private colFac: CollectionFactory,
    private tripFac: TripFactory,
    private store: Store<fromApp.appState>,
    private weatherService: WeatherService,
    private router: Router,
  ) { }
    steps:Icon[] =[
      {icon:{type:'svg',name:'place-edit'},text:'Where & When'},
      {icon:{type:'svg',name:'together'},text:'Who'},
      {icon:{type:'svg',name:'collection-alt'},text:'What'},
      {icon:{type:'mat',name:'tune'},text:'Customise'},
      {icon:{type:'svg',name:'minimalist'},text:'Pack'},
    ]
  ngOnInit() {
    this.trip = this.tripMemory.trip || new Trip();
    for(let i = 1; i < this.steps.length; i++){
      if(this.checkStep(i) && i < 3){
        this.stepActions(i)
        continue;
      } else {
        this.step = i;
        break;
      }
    }
    this.localCollections = this.colFac.getAllComplete()
    this.subs.add(
        this.storeSelector.collections_obs.subscribe(()=>{
          console.log('Collection state updated')
          this.localCollections = this.colFac.getAllComplete()
        })
      )
    this.store.dispatch(new libraryActions.loadLibrary())
    }
    
    ngOnDestroy(){
      this.subs.unsubscribe()
    }
  

  // STEP 1 - Where and When
  setTimeAndPlace(trip:Trip){
    this.trip.destinationId = trip.destinationId
    this.trip.startDate = trip.startDate
    this.trip.endDate = trip.endDate
    this.stepValid = this.checkStep(1)
    console.log('updated trip ',this.trip)
  }
  fetchLibraryData(){
    this.loadingLibrary = true;
    // check that all the trips properties that are required for weather data are present
    if(this.tripFac.validateTripProperties(this.trip,['startDate','startDate','destinationId'])){
      const libState =this.storeSelector.libraryState_obs
      const weatherDataObs = from(this.weatherService.createWeatherData(this.trip))
      console.log('TRIP WIZARD',`subscribing to lib/weatherAPI`)
      this.subs.add(
        combineLatest(libState,weatherDataObs)
        .pipe(
          takeWhile(()=>{
            return this.loadingLibrary === true
        }))
        .subscribe(([state,wData])=>{
          console.log('TRIP WIZARD',`received update from lib/weatherAPI\nstate`,state,'\nWeather',wData)
          this.loadingLibrary = (state.loading || !wData) ? true : false;
          if(!state.loading){
            this.remoteCollections = this.storeSelector.getRemoteCollections()
            this.destMetaData = new destMetaData(state.destMetaData[this.trip.destinationId])
          }
          if(wData){
            this.destWeatherData = wData
          }
          console.log('TRIP WIZARD',`this.loadingLibrary: ${this.loadingLibrary}`)
        })
      )
    } else {
      console.log(`🚫 could not fetch library and weather data because trip is not set up correctly`,this.trip)
    }
  }
  // STEP 2 - Who is going
  setSelectedProfiles(ids:string[]){
    this.trip.profiles = ids;
    this.stepValid = this.checkStep(2)
    console.log('updated trip ',this.trip)
  }

  // STEP 3 - collections
  getLimit():number{
    let val = this.localCollections.length
    switch(true){
      case (val === 0): return null
      case (val < 3): return 3
      case (val < 5): return 2
      default: return 1
    }
  }
  setCollections(cGroups:tripCollectionGroup[]){
    this.trip.collections = cGroups
    this.stepValid = this.checkStep(3)
    console.log('updated trip ',this.trip)
  }

  // STEP MANAGEMENT
  stepActions(step:number):boolean{
    switch(step){
      case 1:
        // subscribe to library to fetch items, and get destination weather data
        this.fetchLibraryData()
        return true
      case 2:
        // remove missing IDs from trip collections groups
        let profileIds = this.trip.profiles
        this.trip.collections.forEach(c=>{
          c.profiles = c.profiles.filter(pId=>profileIds.includes(pId))
        })
        this.profileGroup = this.storeSelector.profiles.filter(p=>profileIds.includes(p.id))
        return true
      case 3:
          // check all profiles selected have the collections, if not, push collections
        this.bulkActions.pushMissingCollectionsToProfiles(this.trip.collections)
        return true
      case 4:
        this.tripMemory.saveTripAndDeleteTemp(this.trip)
        this.router.navigate(['trips/packing-list'])
        return false
    }
  }
  onConfirmStep(step:number){
    if(this.checkStep(step)){
      let cont = this.stepActions(step)
      if(cont){
        this.tripMemory.saveTempTrip(this.trip)
        this.nextStep(step+1)
      }
    }
  }
  nextStep(nextStep:number){ 
    if(nextStep <= this.steps.length){
      this.prevStep = this.step;
      this.step = nextStep
      this.stepValid = this.checkStep(this.step)
      console.log(`stepping from ${this.prevStep} to ${this.step}`)
    }
  }

  checkStep(step:number):boolean{ // VALIDATE EACH STEP
    let validArray:tripProperties[] = this.tripFac.validateTrip(this.trip)
    let propsValid = (props:tripProperties[])=>{
      return props.every(prop=>validArray.includes(prop))
    }
    switch(step){
      case 1:
        return propsValid(['startDate','endDate','destinationId'])
      case 2:
        return propsValid(['profiles'])
      case 3:
        return propsValid(['collections'])
      case 4: 
      case 5:
      default:
      return true
    }
  }
}
