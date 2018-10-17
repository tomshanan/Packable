import { Injectable } from '@angular/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as profileActions from './profile.actions';
import { tap } from 'rxjs/operators';

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
            profileActions.DELETE_PROFILE_PACKABLE,
            profileActions.EDIT_PROFILE,
            profileActions.REMOVE_PROFILE),
        tap(()=>{
            this.storageServices.setUserData('profiles')
        })
    )
}