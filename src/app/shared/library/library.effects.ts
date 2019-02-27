import { Injectable } from "@angular/core";
import { StorageService } from '../storage/storage.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as libraryActions from '@shared/library/library.actions'
import { tap } from 'rxjs/operators';

@Injectable()
export class LibraryEffects {
    constructor(
        private storage: StorageService,
        private actions$: Actions
    ){}
    @Effect({dispatch:false}) loadLibrary = this.actions$.pipe(
        ofType(libraryActions.LOAD_LIBRARY),
        tap(()=>{
            console.log('load library effect: getting library');
            this.storage.getLibrary()
        })
    )
}