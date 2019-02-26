import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import * as adminActions from './admin.actions'
import { StorageService } from '../../shared/storage/storage.service';
import { tap } from 'rxjs/operators';
import { ADMIN_SIMULATE_USER } from './admin.actions';

@Injectable()
export class adminEffects{
    constructor(
        private actions$:Actions,
        private storageService: StorageService
    ){}

    @Effect({dispatch: false}) 
    adminUpdatePermissionsEffect = this.actions$.pipe(
        ofType(adminActions.ADMIN_SET_PERMISSIONS),
        tap((action)=>{
            console.log('action received in Effects',action);
            this.storageService.adminSetUserData(action)
        }, e=>console.log(e))
    )

    @Effect({dispatch: false}) 
    adminSimulateUserEffect = this.actions$.pipe(
        ofType(adminActions.ADMIN_SIMULATE_USER),
        tap(()=>{
            this.storageService.initialGetAllItems()
            this.storageService.listenToUserItems()
        }, e=>console.log(e))
    )
}