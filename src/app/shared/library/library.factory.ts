import { StoreSelectorService } from '../services/store-selector.service';
import { Injectable } from '@angular/core';
import { remotePackable } from './library.model';

@Injectable({providedIn:'root'})
export class libraryFactory {
    constructor(
        private storeSelector:StoreSelectorService
    ){}

}