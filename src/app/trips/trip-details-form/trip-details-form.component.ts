import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { dateSelectionEvent } from './date-range-selector/date-range-selector.component';
import { Destination, DestinationDataService } from '@app/core';
import * as moment from 'moment'
import { Trip } from '@app/shared/models/trip.model';
import { Guid, timeStamp } from '@app/shared/global-functions';

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

  constructor(
    private destinationData:DestinationDataService,
  ) { }
  ngOnInit() {
    this.destination = this.destinationData.DestinationById(this.trip.destinationId) || null
    this.fromDate = this.trip.startDate ? moment(this.trip.startDate) : null;
    this.toDate = this.trip.endDate ? moment(this.trip.endDate) : null;
  }
  onDestinationSelected(destination:Destination){
    this.trip.destinationId = destination.id
    this.emitChange()
  }
  onDatesSelected(e:dateSelectionEvent){
    this.trip.startDate = moment(e.from).format('YYYY-MM-DD')
    this.trip.endDate = moment(e.to).format('YYYY-MM-DD')
    this.emitChange()
  }
  emitChange(){
    this.tripChange.emit(this.trip)
  }
}
