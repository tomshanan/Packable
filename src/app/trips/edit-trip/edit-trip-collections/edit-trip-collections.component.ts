import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { destMetaData } from '@app/shared/library/library.model';
import { TripWeatherData } from '../../../shared/services/weather.service';
import { Trip } from '@app/shared/models/trip.model';
import { TripFactory } from '../../../shared/factories/trip.factory';
import { WindowService } from '../../../shared/services/window.service';
import { tripCollectionGroup } from '../../../shared/models/trip.model';
import { TripMemoryService } from '../../../shared/services/trip-memory.service';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';

@Component({
  selector: 'app-edit-trip-collections',
  templateUrl: './edit-trip-collections.component.html',
  styleUrls: ['./edit-trip-collections.component.css']
})
export class EditTripCollectionsComponent implements OnInit {
  destWeatherData$: Observable<TripWeatherData>;
  destMetaData$: Observable<destMetaData>;
  trip: Trip;
  isValid: boolean = false;
  touched: boolean = false;

  constructor(
    private tripFac: TripFactory,
    private tripService: TripMemoryService,
    private bulkActions:BulkActionsService,
    public windowService: WindowService,
  ) { }

  ngOnInit() {
    this.trip = this.tripService.trip
    this.destWeatherData$ = this.tripService.destWeatherData$
    this.destMetaData$ = this.tripService.destMetaData$
    this.isValid = this.tripFac.validateTripProperties(this.trip, ['collections'])
  }

  setCollections(cGroups: tripCollectionGroup[]) {
    this.trip.collections = cGroups
    this.touched = true;
    this.isValid = this.tripFac.validateTripProperties(this.trip, ['collections'])
  }
  onConfirm() {
    if (this.isValid) {
      this.bulkActions.pushMissingCollectionsToProfiles(this.trip.collections)
      this.tripService.saveTrip(this.trip)
      this.touched = false;
    }
  }
}
