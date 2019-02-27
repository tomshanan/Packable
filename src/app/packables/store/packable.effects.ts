import { Injectable } from '@angular/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as PackableActions from './packables.actions'
import { tap, switchMap, map } from 'rxjs/operators';
import * as packableActions from '@app/packables/store/packables.actions';
import * as collectionActions from '@app/collections/store/collections.actions';
import * as profileActions from '@app/profiles/store/profile.actions';

@Injectable()
export class PackableEffects {
    constructor(
        private storageServices: StorageService,
        private actions$:Actions
    ){}

    @Effect({dispatch:false}) addEditPackableEffect = this.actions$.pipe(
        ofType(PackableActions.UPDATE_ORIGINAL_PACKABLE),
        tap((action:PackableActions.updateOriginalPackables)=>{
            this.storageServices.saveItemsInUser('packables',action.payload)
        })
    )
    @Effect() removeOriginalPackable = this.actions$.pipe(
        ofType<packableActions.removeOriginalPackables>(packableActions.REMOVE_ORIGINAL_PACKABLES),
        map(action=>{
           return new collectionActions.removePackablesFromAllCollections(action.payload) 
        })
        // ==> Collections reducers ==> Profile Reducers ==> Database
    )
}