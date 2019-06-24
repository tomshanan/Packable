import { Injectable } from '@angular/core';
import { TripFactory } from '../factories/trip.factory';
import { Trip } from '../models/trip.model';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers'
import * as tripActions from '../../trips/store/trip.actions'

@Injectable({
  providedIn: 'root'
})
export class TripMemoryService {
  constructor(
    private tripFac:TripFactory,
    private store: Store<fromApp.appState>
  ) { }
  
  private _trip: Trip;
  public get trip(){ return this._trip ? this.tripFac.duplicateTrip(this._trip) : null}
  public get displayTrip() {return this._trip ? this.tripFac.makeDisplayTrip(this._trip): null }
  
  setTrip(trip:Trip):void{
    this._trip = this.tripFac.duplicateTrip(trip)
  }
  clear(){
    this._trip = null;
  }
  saveTempTrip(trip:Trip){
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateIncomplete([trip]))
  }
  saveTrip(trip:Trip){
    this.setTrip(trip)
    this.store.dispatch(new tripActions.updateTrips([trip]))
  }
  saveTripAndDeleteTemp(trip:Trip){
    this.store.dispatch(new tripActions.updateTrips([trip]))
    this.store.dispatch(new tripActions.removeIncomplete([trip.id]))
    this.clear()
  }
}
