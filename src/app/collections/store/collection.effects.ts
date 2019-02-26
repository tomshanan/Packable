import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as collectionActions from './collections.actions'
import { StorageService } from '../../shared/storage/storage.service';
import { tap, map, switchMap } from 'rxjs/operators';
import * as profileActions from '@app/profiles/store/profile.actions';
import { removeOriginalCollections, REMOVE_ORIGINAL_COLLECTIONS } from './collections.actions';

@Injectable()
export class CollectionEffects{
    constructor(
        private actions$:Actions,
        private storageService: StorageService
    ){}

    @Effect({dispatch:false}) updateCollectionEffect = this.actions$.pipe(
        ofType<collectionActions.updateOriginalCollection>(collectionActions.UPDATE_ORIGINAL_COLLECTION),
        tap((action:collectionActions.updateOriginalCollection)=>{
            this.storageService.saveItemsInUser('collections', [action.payload])
        })
    )
    
    @Effect({dispatch:false}) removeCollectionEffect = this.actions$.pipe(
        ofType<collectionActions.removeOriginalCollections>(collectionActions.REMOVE_ORIGINAL_COLLECTIONS),
        tap((action:collectionActions.removeOriginalCollections)=>{
            this.storageService.removeItemsInUser('collections', action.payload)
        })
        // ADD: DISPATCH REMOVE FROM COLLECTION FROM PROFILE
    )

    // FROM Packable Effects ==>
    @Effect() removePackablesFromCollectionEffect = this.actions$.pipe(
        ofType<collectionActions.removePackablesFromAllCollections>(collectionActions.REMOVE_PACKABLES_FROM_COLLECTIONS),
        map(action=>{
           return new profileActions.deleteProfilePackables(action.payload)  
           // ==> Profile reducers ==> Database
        })
    )
}