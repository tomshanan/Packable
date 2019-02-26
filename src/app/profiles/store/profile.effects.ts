import { Injectable } from '@angular/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as profileActions from './profile.actions';
import { tap, map } from 'rxjs/operators';
import { deleteProfilePackables } from './profile.actions';
import * as collectionActions from '@app/collections/store/collections.actions';

@Injectable()
export class ProfileEffects{
    constructor(
        private storageServices:StorageService,
        private actions$:Actions
    ){}

    @Effect({dispatch:false}) saveProfileState = this.actions$.pipe(
        ofType(
            profileActions.ADD_PROFILE,
            profileActions.DELETE_COLLECTIONS_FROM_PROFILES,
            profileActions.EDIT_PROFILES,
            profileActions.REMOVE_PROFILE),
        tap(()=>{
            this.storageServices.setUserItemsNode('profiles')
        })
    )
    // from Packable Effects ==> Collection Effects ==>
    @Effect({dispatch:false}) deleteProfilePackable = this.actions$.pipe(
        ofType<profileActions.deleteProfilePackables>(profileActions.DELETE_PACKABLES_FROM_PROFILES),
        tap(()=>{
            this.storageServices.setAllUserItemsAndSettings();
        })
    )
}