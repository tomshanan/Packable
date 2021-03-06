import { Injectable } from '@angular/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as TripActions from './trip.actions'
import { tap } from 'rxjs/operators';

@Injectable()
export class TripEffects {
    constructor(
        private storageServices: StorageService,
        private actions$: Actions
    ) { }
    @Effect({ dispatch: false }) updatePackingList = this.actions$.pipe(
        ofType(TripActions.UPDATE_PACKING_LIST),
        tap((action: TripActions.updatePackingList) => {
            let packinglists = action.payload.map(list=>{
                return {
                    ...list,
                    packables:this.storageServices.wrapPackingListsPackables(list.packables)
                }
            })
            this.storageServices.saveItemsInUser('tripState', packinglists, ['packingLists'])
        })
    )
    @Effect({ dispatch: false }) updateTripEffect = this.actions$.pipe(
        ofType(TripActions.UPDATE_TRIP),
        tap((action: TripActions.updateTrips) => {
            this.storageServices.saveItemsInUser('tripState', action.payload, ['trips'])
        })
    )
    @Effect({ dispatch: false }) updateIncompleteEffect = this.actions$.pipe(
        ofType(TripActions.UPDATE_INCOMPLETE),
        tap((action: TripActions.updateIncomplete) => {
            this.storageServices.saveItemsInUser('tripState', action.payload, ['incomplete'])
        })
    )
    @Effect({ dispatch: false }) updatePackingListPackablesEffect = this.actions$.pipe(
        ofType(TripActions.UPDATE_PACKING_LIST_PACKABLES),
        tap((action: TripActions.updatePackingListPackables) => {
            this.storageServices.savePackingListPackables(
                action.payload.packingList,
                action.payload.packables
            )
        })
    )
    @Effect({ dispatch: false }) removeTripEffect = this.actions$.pipe(
        ofType(TripActions.REMOVE_TRIPS),
        tap((action: TripActions.removeTrips) => {
            this.storageServices.removeItemsInUser('tripState', action.payload, 'trips')
            this.storageServices.removeItemsInUser('tripState', action.payload, 'packingLists')
        })
    )
    @Effect({ dispatch: false }) removeIncompleteEffect = this.actions$.pipe(
        ofType(TripActions.REMOVE_INCOMPLETE),
        tap((action: TripActions.removeIncomplete) => {
            this.storageServices.removeItemsInUser('tripState', action.payload, 'incomplete')
        })
    )
}