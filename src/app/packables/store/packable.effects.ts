import { Injectable } from '@angular/core';
import { StorageService } from '../../shared/storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as PackableActions from './packables.actions'
import { tap } from 'rxjs/operators';

@Injectable()
export class PackableEffects {
    constructor(
        private storageServices: StorageService,
        private actions$:Actions
    ){}

    @Effect({dispatch:false}) savePackableState = this.actions$.pipe(
        ofType(PackableActions.ADD_ORIGINAL_PACKABLE,
                PackableActions.EDIT_ORIGINAL_PACKABLE,
                PackableActions.REMOVE_ORIGINAL_PACKABLE),
        tap(()=>{
            this.storageServices.setUserData('packables')
        })
    )
}