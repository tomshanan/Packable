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
import { destMetaData } from '../../shared/library/library.model';
import { CollectionComplete, CollectionWithMetadata } from '../../shared/models/collection.model';
import { Subscription, combineLatest, from, of, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import * as libraryActions from '@shared/library/library.actions';
import * as tripActions from '../store/trip.actions';
import { TripWeatherData } from '@app/core';
import { WeatherService } from '../../shared/services/weather.service';
import { MatDialog } from '@angular/material';
import { ImportCollectionDialogComponent, importCollections_result, importCollections_data } from '../../collections/collection-list/import-collection-dialog/import-collection-dialog.component';
import { take, takeWhile, filter, map } from 'rxjs/operators';
import { expandAndFadeTrigger } from '../../shared/animations';
import { Router } from '@angular/router';
import { StorageService } from '../../shared/storage/storage.service';

@Component({
  selector: 'app-new-trip-wizard',
  templateUrl: './new-trip-wizard.component.html',
  styleUrls: ['./new-trip-wizard.component.css'],
  animations: [stepperTransition, expandAndFadeTrigger]
})
export class NewTripWizardComponent implements OnInit, OnDestroy {
  trip: Trip;
  step: number = 1;
  stepValid: boolean = false;
  stepErrors:string[] = []
  stepTouched:{[step:number]:boolean} = {1:false,2:false,3:false}

  prevStep: number = 0;
  nextIcon: Icon = { icon: null, text: 'Next' }
  packIcon: Icon = { icon: null, text: 'Pack' }
  profileGroup: Profile[] = [];
  remoteCollections: CollectionWithMetadata[] = [];
  localCollections: CollectionComplete[] = [];
  subs = new Subscription();

  destWeatherData$: Observable<TripWeatherData>;
  destMetaData$: Observable<destMetaData>;

  constructor(
    public windowService: WindowService,
    public tripMemory: TripMemoryService,
    public storeSelector: StoreSelectorService,
    private storageService: StorageService,
    private destinationData: DestinationDataService,
    private bulkActions: BulkActionsService,
    private colFac: CollectionFactory,
    private tripFac: TripFactory,
    private store: Store<fromApp.appState>,
    private weatherService: WeatherService,
    private router: Router,
  ) { }
  steps: Icon[] = [
    { icon: { type: 'svg', name: 'place-edit' }, text: 'Where & When' },
    { icon: { type: 'mat', name: 'group' }, text: 'Who' },
    { icon: { type: 'svg', name: 'collection-alt' }, text: 'What' },
    { icon: { type: 'svg', name: 'minimalist' }, text: 'Pack' },
  ]
  ngOnInit() {
    this.trip = this.tripMemory.trip || new Trip();
    for (let i = 0; i < this.steps.length; i++) {
      if (this.checkStep(i) && i < 3) {
        this.stepActions(i)
        continue;
      } else {
        this.step = i;
        break;
      }
    }
    this.localCollections = this.colFac.getAllComplete()
    this.subs.add(
      this.storeSelector.collections$.subscribe(() => {
        console.log('Collection state updated')
        this.localCollections = this.colFac.getAllComplete()
      })
    )
    this.store.dispatch(new libraryActions.loadLibrary())
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }


  // STEP 1 - Where and When
  setTimeAndPlace(trip: Trip) {
    this.trip.destinationId = trip.destinationId
    this.trip.startDate = trip.startDate
    this.trip.endDate = trip.endDate
    this.validateStep(1)
    if(trip.destinationId && (trip.startDate != "" || trip.endDate != "")){
      this.stepTouched[1] = true
    }
    console.log('updated trip ', this.trip)
  }
  fetchLibraryData() {
    // check that all the trips properties that are required for weather data are present
    if (this.tripFac.validateTripProperties(this.trip, ['startDate', 'startDate', 'destinationId'])) {
      this.storageService.getLibrary()
      this.destWeatherData$ = from(this.weatherService.getTripWeatherData(this.trip))
      this.destMetaData$ = this.storeSelector.libraryState$
        .pipe(
          filter((state) => !state.loading),
          map(state => new destMetaData(state.destMetaData[this.trip.destinationId]))
        )
      console.log('TRIP WIZARD', `subscribing to lib/weatherAPI`)
    } else {
      console.log(`🚫 could not fetch library and weather data because trip is not set up correctly`, this.trip)
    }
  }
  // STEP 2 - Who is going
  setSelectedProfiles(ids: string[]) {
    this.trip.profiles = ids;
    this.validateStep(2)
    this.stepTouched[2] = true
    console.log('updated trip ', this.trip)
  }

  // STEP 3 - collections
  getLimit(): number {
    let val = this.localCollections.length
    switch (true) {
      case (val === 0): return null
      case (val < 3): return 3
      case (val < 5): return 2
      default: return 1
    }
  }
  setCollections(cGroups: tripCollectionGroup[]) {
    this.trip.collections = cGroups
    this.validateStep(3)
    this.stepTouched[3] = true
    console.log('updated trip ', this.trip)
  }

  // STEP MANAGEMENT
  stepActions(step: number): boolean {
    switch (step) {
      case 1:
        // subscribe to library to fetch items, and get destination weather data
        this.fetchLibraryData()
        
        return true
      case 2:
        // remove missing IDs from trip collections groups
        let profileIds = this.trip.profiles
        this.trip.collections.forEach(c => {
          c.profiles = c.profiles.filter(pId => profileIds.includes(pId))
        })
        this.profileGroup = this.storeSelector.profiles.filter(p => profileIds.includes(p.id))
        
        return true
      case 3:
        this.bulkActions.pushMissingCollectionsToProfiles(this.trip.collections)
        this.tripMemory.saveTripAndDeleteTemp(this.trip)
        this.router.navigate(['trips', 'packing-list', this.trip.id])
        return false
    }
    this.validateStep(step+1)
  }
  onConfirmStep(step: number) {
    if (this.checkStep(step)) {
      let cont = this.stepActions(step)
      if (cont) {
        this.tripMemory.saveTempTrip(this.trip)
        this.nextStep(step + 1)
      }
    }
  }
  nextStep(nextStep: number) {
    if (nextStep <= this.steps.length) {
      this.prevStep = this.step;
      this.step = nextStep
      this.validateStep(this.step)
      console.log(`stepping from ${this.prevStep} to ${this.step}`)
    }
  }

  validateStep(step: number){
    this.stepErrors = this.stepValidationErrors(step)
    this.stepValid = this.stepErrors.length === 0
  }
  checkStep(step: number): boolean { 
    return this.stepValidationErrors(step).length === 0
  }

  stepValidationErrors(step: number):string[]{
    let validArray: tripProperties[] = this.tripFac.validateTrip(this.trip,true)
    let propsValid = (props: tripProperties[]) => {
      return props.every(prop => validArray.includes(prop))
    }
    let stringArray:string[] = []
    switch (step) {
      case 1:
        if(!propsValid(['startDate'])){
          stringArray.push(`The start date must be in the future`)

        }
        if(!propsValid(['endDate'])){
          stringArray.push(`The end date must be after the start date`)
        }
        if(!propsValid(['destinationId'])){
          stringArray.push(`The destination isn't valid`)
        }
        return stringArray
      case 2:
          if(!propsValid(['profiles'])){
            stringArray.push(`Please select at least 1 Traveler`)
          }
        return stringArray
      case 3:
          if(!propsValid(['collections'])){
            stringArray.push(`All Travelers should have at least 1 Collection`)
          }
        return stringArray
      case 4:
      case 5:
      default:
        return []
    }
  }
}
