import { Injectable } from '@angular/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as TripActions from './trip.actions'
import { tap } from 'rxjs/operators';

@Injectable()
export class TripEffects {
    constructor(
        private storageServices: StorageService,
        private actions$:Actions
    ){}

    @Effect({dispatch:false}) saveTripState = this.actions$.pipe(
        ofType(TripActions.ADD_TRIP,
            TripActions.EDIT_TRIP,
            TripActions.REMOVE_TRIP,
            TripActions.REMOVE_TRIP_ACTIVITY,
            TripActions.REMOVE_TRIP_PROFILE),
        tap(()=>{
            this.storageServices.setUserData('tripState')
        })
    )
}