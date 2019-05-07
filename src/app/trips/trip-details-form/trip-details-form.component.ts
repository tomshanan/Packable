import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { dateSelectionEvent } from './date-range-selector/date-range-selector.component';
import { Destination, DestinationDataService } from '@app/core';
import * as moment from 'moment'
import { Trip } from '@app/shared/models/trip.model';
import { Guid, timeStamp } from '@app/shared/global-functions';
import { TripFactory, tripProperties } from '../../shared/factories/trip.factory';

@Component({
  selector: 'trip-details-form',
  templateUrl: './trip-details-form.component.html',
  styleUrls: ['./trip-details-form.component.css']
})
export class TripDetailsFormComponent implements OnInit {
  @Input('trip') trip:Trip = new Trip()
  @Output('tripChange') tripChange = new EventEmitter<Trip>()
  @Input('disabled') disabled: boolean = false;

  destination: Destination;
  fromDate: moment.Moment;
  toDate: moment.Moment;
  valid:boolean;

  constructor(
    private destinationData:DestinationDataService,
    private tripFac: TripFactory,
  ) { }
  ngOnInit() {
    this.destination = this.destinationData.DestinationByCityId(this.trip.destinationId) || null
    this.fromDate = this.trip.startDate ? moment(this.trip.startDate) : null;
    this.toDate = this.trip.endDate ? moment(this.trip.endDate) : null;
    this.validate()
  }
  onDestinationSelected(destination:Destination){
    this.trip.destinationId = destination.cityId
    this.emitChange()
  }
  onDatesSelected(e:dateSelectionEvent){
    this.trip.startDate = moment(e.from).format('YYYY-MM-DD')
    this.trip.endDate = moment(e.to).format('YYYY-MM-DD')
    this.emitChange()
  }
  emitChange(){
    this.validate()
    this.tripChange.emit(this.trip)
  }
  private validate() {
    let validArray = this.tripFac.validateTrip(this.trip)
    let checkArray: tripProperties[] = ['startDate','endDate', 'destinationId']
    this.valid = checkArray.every(p=>validArray.includes(p))
  }
}
