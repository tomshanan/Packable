import { Injectable } from '@angular/core';
import { TripFactory } from '../factories/trip.factory';
import { Trip, DisplayTrip } from '../models/trip.model';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers'
import * as tripActions from '../../trips/store/trip.actions'
import { Observable, from, Subject, BehaviorSubject } from 'rxjs';
import { destMetaData } from '../library/library.model';
import { TripWeatherData, WeatherService } from './weather.service';
import { StoreSelectorService } from './store-selector.service';
import { filter, map, takeWhile, take, first } from 'rxjs/operators';
import { isDefined, propertiesAreSame } from '../global-functions';

@Injectable({
  providedIn: 'root'
})
export class TripMemoryService {
  constructor(
    private tripFac: TripFactory,
    private weatherService: WeatherService,
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>
  ) {

  }

  private _trip: Trip;
  public get trip() { return this._trip ? this.tripFac.duplicateTrip(this._trip) : null }
  public tripEmitter = new BehaviorSubject<Trip>(null)
  public displayTrip: DisplayTrip;
  public destWeatherData$: Observable<TripWeatherData>;
  public destMetaData$: Observable<destMetaData>;
  private subs;
  setTripById(id: string): void {
    this.subs = this.storeSelector.trips$.pipe(
      first(tripState => tripState.trips.hasId(id)),
      map(tripState => tripState.trips.findId(id))
    ).subscribe(trip => {
      this.setTrip(trip)
    })
  }
  setTrip(trip: Trip): void {
    console.log(`TRIP MEMEORY set new trip`, trip);
    this.displayTrip = this.tripFac.makeDisplayTrip(trip)
    if (!propertiesAreSame(trip, this._trip, ['startDate', 'endDate', 'destinationId'])) {
      this.destWeatherData$ = from(this.weatherService.getTripWeatherData(trip))
    }
    if (!propertiesAreSame(trip, this._trip, ['destinationId'])) {
      this.destMetaData$ = this.storeSelector.libraryState$.pipe(
        filter((state) => !state.loading),
        map(state => new destMetaData(state.destMetaData[trip.destinationId]))
      )
    }
    this._trip = this.tripFac.duplicateTrip(trip)
    this.tripEmitter.next(this.trip)
  }
  clear() {
    this._trip = null;
    this.displayTrip = null;
    this.destWeatherData$ = null
    this.destMetaData$ = null
    this.tripEmitter.next(null)
  }
  saveTempTrip(trip: Trip) {
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateIncomplete([trip]))
  }
  saveTrip(trip: Trip) {
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateTrips([trip]))
  }
  saveTripAndDeleteTemp(trip: Trip) {
    this.store.dispatch(new tripActions.updateTrips([trip]))
    this.store.dispatch(new tripActions.removeIncomplete([trip.id]))
    this.clear()
  }
}
