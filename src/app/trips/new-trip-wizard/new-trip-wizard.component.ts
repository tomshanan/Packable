import { Component, OnInit } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { Step } from '@app/shared-comps/stepper/stepper.component';
import { stepperTransition } from '@app/shared/animations';
import { TripMemoryService } from '../../shared/services/trip-memory.service';
import { Trip, tripCollectionGroup } from '../../shared/models/trip.model';
import { DestinationDataService } from '../../shared/services/location-data.service';
import * as moment from 'moment'
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile } from '../../shared/models/profile.model';
@Component({
  selector: 'app-new-trip-wizard',
  templateUrl: './new-trip-wizard.component.html',
  styleUrls: ['./new-trip-wizard.component.css'],
  animations: [stepperTransition]
})
export class NewTripWizardComponent implements OnInit {
  trip: Trip;
  step:number = 1;
  prevStep:number = 0;
  profileGroup: Profile[] = [];

  constructor(
    public windowService:WindowService,
    public tripMemory:TripMemoryService,
    public storeSlector:StoreSelectorService,
    private destinationData:DestinationDataService,
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
      case 3:
        this.tripMemory.saveTempTrip(this.trip)
    }
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
    switch(step){
      case 1:
        let id = this.trip.destinationId
        let destisValid = this.destinationData.DestinationById(id)
        let now = moment()
        let startDate = moment(this.trip.startDate)
        let startDateIsFuture = startDate.year() >= now.year() && startDate.dayOfYear() >= now.dayOfYear()
        let endDateIsAfterStart = moment(this.trip.endDate).isAfter(startDate)
        return !!destisValid && startDateIsFuture && endDateIsAfterStart
      case 2:
        return this.trip.profiles.length > 0
      case 3:
        return this.trip.collections.length > 0
      case 4: 
      case 5:
      default:
      return true
    }
  }
}
