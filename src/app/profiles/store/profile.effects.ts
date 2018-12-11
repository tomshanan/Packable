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
            profileActions.DELETE_PROFILE_COLLECTION,
            profileActions.EDIT_PROFILE,
            profileActions.REMOVE_PROFILE),
        tap(()=>{
            this.storageServices.setUserData('profiles')
        })
    )
    // from Packable Effects ==> Collection Effects ==>
    @Effect({dispatch:false}) deleteProfilePackable = this.actions$.pipe(
        ofType<profileActions.deleteProfilePackables>(profileActions.DELETE_PROFILE_PACKABLES),
        tap(()=>{
            this.storageServices.setAllUserData();
        })
    )
}