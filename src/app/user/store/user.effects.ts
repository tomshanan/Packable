import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as userActions from './user.actions'
import { StorageService } from '../../shared/storage/storage.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class userEffects{
    constructor(
        private actions$:Actions,
        private storageService: StorageService
    ){}
    @Effect({dispatch: false}) 
    user_updateSettingsEffect = this.actions$.pipe(
        ofType(
            userActions.SET_USER_SETTINGS,
            userActions.SET_PACKING_LIST_SETTINGS
            ),
        tap(()=>{
            this.storageService.saveUserSettings()
        })
        )
    @Effect({dispatch: false})
    user_setStateEffect = this.actions$.pipe(
        ofType(userActions.SET_USER_STATE),
        tap((action:userActions.setUserState)=>{
            this.storageService.initialGetAllItems()
            this.storageService.listenToUserItems()
        })
    )
}