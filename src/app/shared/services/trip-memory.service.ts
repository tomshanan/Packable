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
import { filter, map, takeWhile, take, first, tap } from 'rxjs/operators';
import { isDefined, propertiesAreSame, timeStamp } from '../global-functions';

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
  get tripSetAndValid(): boolean {
    let tripDefined = isDefined(this._trip)
    let tripValid = tripDefined && this.tripFac.validateTrip(this._trip).length === 5
    return tripDefined && tripValid
  }
  public tripEmitter = new BehaviorSubject<Trip>(null)
  public displayTrip: DisplayTrip;
  public destWeatherData$ = new BehaviorSubject<TripWeatherData>(null);
  public destMetaData$ = new BehaviorSubject<destMetaData>(null);

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
      this.weatherService.getTripWeatherData(trip).then(wData => {
        console.log(`setTrip got weatherData`,wData)
        this.destWeatherData$.next(wData)
      })
    }
    if (!propertiesAreSame(trip, this._trip, ['destinationId'])) {
      console.log(`setTrip requesting destData for ${trip.destinationId}`)
      this.storeSelector.libraryState$.pipe(
        first((state) => !state.loading)
      ).subscribe(state=>{
        let newDestData = new destMetaData(state.destMetaData[trip.destinationId])
        console.log(`setTrip got destData`,newDestData)
        this.destMetaData$.next(newDestData)
      })
    }
    this._trip = this.tripFac.duplicateTrip(trip)
    this.tripEmitter.next(this.trip)
  }

  clear() {
    this._trip = null;
    this.displayTrip = null;
    this.destWeatherData$.next(null)
    this.destMetaData$.next(null)
    this.tripEmitter.next(null)
  }
  saveTempTrip(trip: Trip) {
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateIncomplete([trip]))
  }
  saveTrip(trip: Trip) {
    trip.dateModified = timeStamp()
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateTrips([trip]))
  }
  saveTripAndDeleteTemp(trip: Trip) {
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateTrips([trip]))
    this.store.dispatch(new tripActions.removeIncomplete([trip.id]))
  }
}
