import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as collectionActions from './collections.actions'
import { StorageService } from '../../shared/storage/storage.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class CollectionEffects{
    constructor(
        private actions$:Actions,
        private storageService: StorageService
    ){}

    @Effect({dispatch:false}) saveCollectionState = this.actions$.pipe(
        ofType(
            collectionActions.ADD_ORIGINAL_COLLECTION,
            collectionActions.DELETE_PACKABLE,
            collectionActions.EDIT_ORIGINAL_COLLECTION,
            collectionActions.REMOVE_ORIGINAL_COLLECTION),
        tap(()=>{
            this.storageService.setUserData('collections')
        })

    )
}