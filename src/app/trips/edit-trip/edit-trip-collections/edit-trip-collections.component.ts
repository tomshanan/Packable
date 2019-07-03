import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { destMetaData } from '@app/shared/library/library.model';
import { TripWeatherData, WeatherService } from '../../../shared/services/weather.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { Trip } from '@app/shared/models/trip.model';
import { TripFactory } from '../../../shared/factories/trip.factory';
import { StorageService } from '../../../shared/storage/storage.service';
import { filter, map, takeUntil, takeWhile, take, first, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { DestinationDataService } from '../../../shared/services/location-data.service';
import { WindowService } from '../../../shared/services/window.service';
import { tripCollectionGroup } from '../../../shared/models/trip.model';
import { appState } from '@app/shared/app.reducers';
import { Store } from '@ngrx/store';
import * as tripActions from '../../store/trip.actions';
import { TripMemoryService } from '../../../shared/services/trip-memory.service';
import { isDefined } from '../../../shared/global-functions';

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
      this.tripService.saveTrip(this.trip)
      this.touched = false;
    }
  }
}
