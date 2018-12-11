import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as collectionActions from './collections.actions'
import { StorageService } from '../../shared/storage/storage.service';
import { tap, map, switchMap } from 'rxjs/operators';
import * as profileActions from '@app/profiles/store/profile.actions';

@Injectable()
export class CollectionEffects{
    constructor(
        private actions$:Actions,
        private storageService: StorageService
    ){}

    @Effect({dispatch:false}) saveCollectionState = this.actions$.pipe(
        ofType(
            collectionActions.ADD_ORIGINAL_COLLECTION,
            collectionActions.EDIT_ORIGINAL_COLLECTION,
            collectionActions.REMOVE_ORIGINAL_COLLECTION),
        tap(()=>{
            this.storageService.setUserData('collections')
        })
    )
    // FROM Packable Effects ==>
    @Effect() deleteCollectionPackable = this.actions$.pipe(
        ofType<collectionActions.deleteCollectionsPackables>(collectionActions.DELETE_COLLECTION_PACKABLES),
        map(action=>{
           return new profileActions.deleteProfilePackables(action.payload)  
           // ==> Profile reducers ==> Database
        })
    )
}