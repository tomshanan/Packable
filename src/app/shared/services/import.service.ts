import { Injectable } from '@angular/core';
import { StoreSelectorService } from './store-selector.service';
import { ContextService } from './context.service';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  constructor(
    private storeSelector: StoreSelectorService,
    private context:ContextService,
  ) { }

  canImportPackableId(id:string){
    
  }
}
