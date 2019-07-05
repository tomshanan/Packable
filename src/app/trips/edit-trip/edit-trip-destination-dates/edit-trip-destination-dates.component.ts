import { Component, OnInit } from '@angular/core';
import { TripFactory, tripProperties } from '../../../shared/factories/trip.factory';
import { WindowService } from '../../../shared/services/window.service';
import { TripMemoryService } from '../../../shared/services/trip-memory.service';
import { Trip } from '../../../shared/models/trip.model';

@Component({
  selector: 'app-edit-trip-destination-dates',
  templateUrl: './edit-trip-destination-dates.component.html',
  styleUrls: ['./edit-trip-destination-dates.component.css']
})
export class EditTripDestinationDatesComponent implements OnInit {
  trip: Trip;
  isValid: boolean = false;
  touched: boolean = false;
  errors:string[] = []

  constructor(
    private tripFac: TripFactory,
    private tripService: TripMemoryService,
    public windowService: WindowService,
  ) { }

  ngOnInit() {
    this.trip = this.tripService.trip
    this.isValid = this.tripFac.validateTripProperties(this.trip, ['collections'])
  }

  setTimeAndPlace(trip: Trip) {
    this.trip.destinationId = trip.destinationId
    this.trip.startDate = trip.startDate
    this.trip.endDate = trip.endDate
    this.validate()
    if(trip.destinationId && (trip.startDate != "" || trip.endDate != "")){
      this.touched = true
    }
    console.log('updated trip ', this.trip)
  }
  validate(){
    let validArray: tripProperties[] = this.tripFac.validateTrip(this.trip,true)
    let propsValid = (props: tripProperties[]) => {
      return props.every(prop => validArray.includes(prop))
    }
    this.errors = []
    if(!propsValid(['startDate','endDate','destinationId'])){
      this.isValid = false;
      if(!propsValid(['startDate'])){
        this.errors.push(`The start date must be in the future`)
      }
      if(!propsValid(['endDate'])){
        this.errors.push(`The end date must be after the start date`)
      }
      if(!propsValid(['destinationId'])){
        this.errors.push(`The destination isn't valid`)
      }
    } else{
      this.isValid = true;
    }
  }

  onConfirm() {
    if (this.isValid) {
      this.tripService.saveTrip(this.trip)
      this.touched = false;
    }
  }
}
