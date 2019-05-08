import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { Step } from '@app/shared-comps/stepper/stepper.component';
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
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import * as libraryActions from '@shared/library/library.actions';
import * as tripActions from '../store/trip.actions';

@Component({
  selector: 'app-new-trip-wizard',
  templateUrl: './new-trip-wizard.component.html',
  styleUrls: ['./new-trip-wizard.component.css'],
  animations: [stepperTransition]
})
export class NewTripWizardComponent implements OnInit, OnDestroy {
  trip: Trip;
  step:number = 1;
  prevStep:number = 0;
  profileGroup: Profile[] = [];
  remoteCollections:remoteCollection[];
  localCollections:CollectionComplete[];
  loadingLibrary: boolean;
  subs = new Subscription();
  destMetaData:destMetaData;

  constructor(
    public windowService:WindowService,
    public tripMemory:TripMemoryService,
    public storeSelector:StoreSelectorService,
    private destinationData:DestinationDataService,
    private bulkActions: BulkActionsService,
    private colFac: CollectionFactory,
    private tripFac: TripFactory,
    private store: Store<fromApp.appState>,
  ) { }
    steps:Step[] =[
      {icon:{type:'mat',name:'place'},text:'Where & When'},
      {icon:{type:'svg',name:'together'},text:'Who'},
      {icon:{type:'svg',name:'collection3'},text:'What'},
      {icon:{type:'mat',name:'tune'},text:'Customise'},
      {icon:{type:'svg',name:'minimalist'},text:'Pack'},
    ]
  ngOnInit() {
    this.trip = this.tripMemory.trip || new Trip();
    for(let i = 1; i < this.steps.length; i++){
      if(this.stepIsValid(i) && i < 3){
        continue;
      } else {
        this.step = i;
        break;
      }
    }
    this.localCollections = this.colFac.getAllComplete()
    this.subs.add(this.storeSelector.libraryState_obs.subscribe((state)=>{
        if(state.loading){
          this.loadingLibrary = true
        } else {
          this.loadingLibrary = false
          this.remoteCollections = this.storeSelector.getRemoteCollections()
          this.destMetaData = new destMetaData(state.destMetaData[this.trip.destinationId])
        }
      })).add(
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
    console.log('updated trip ',this.trip)
  }

  // STEP 2 - Who is going
  setSelectedProfiles(ids:string[]){
    this.trip.profiles = ids;
    console.log('updated trip ',this.trip)
  }

  // STEP 3 - collections
  setCollections(cGroups:tripCollectionGroup[]){
    this.trip.collections = cGroups
    console.log('updated trip ',this.trip)
  }
  // STEP MANAGEMENT
  onConfirmStep(step){
    switch(step){
      case 1:
      case 2:
        // remove IDs from trip collections groups
        this.trip.collections.forEach(c=>{
          c.profiles = c.profiles.filter(pId=>this.trip.profiles.includes(pId))
        })
      case 3:
          // check all profiles selected have the collections, if not, push collections
        this.bulkActions.pushMissingCollectionsToProfiles(this.trip.collections)
        break;
    }
    this.tripMemory.saveTempTrip(this.trip)
    this.nextStep(step+1)
  }
  nextStep(nextStep:number){ 
    if(nextStep <= this.steps.length){
      this.prevStep = this.step;
      this.step = nextStep
      console.log(`stepping from ${this.prevStep} to ${this.step}`)
    }
  }

  stepIsValid(step:number):boolean{ // VALIDATE EACH STEP
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
