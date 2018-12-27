import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import { StoreSelectorService } from './store-selector.service';
import { PackableFactory } from '../factories/packable.factory';
import { ProfileFactory } from '../factories/profile.factory';
import { CollectionFactory } from '../factories/collection.factory';
import { ContextService } from './context.service';
import { weatherFactory } from '../factories/weather.factory';
import * as packableActions from '@app/packables/store/packables.actions';
import { CollectionProfile } from '../../packables/packable-list/edit-packable-dialog/choose-collections-dialog/choose-collections-dialog.component';
import * as profileActions from '@app/profiles/store/profile.actions';
import { PackablePrivate } from '../models/packable.model';
import * as collectionActions from '@app/collections/store/collections.actions';

@Injectable({
  providedIn: 'root'
})
export class BulkActionsService {

  constructor(
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    private pacFac: PackableFactory,
    private proFac: ProfileFactory,
    private colFac: CollectionFactory,
    private context: ContextService,
    private wcFactory: weatherFactory,
  ) { }
  
  // ---- [ COLLECTIONS ] - BULK ACTIONS
  public removeCollectionsFromProfiles(collectionIds:string[], profileIds: string[]){
    if(collectionIds.length >0 && profileIds.length > 0){
      let profiles = this.storeSelector.profiles;
      profileIds.forEach(pId=>{
        let profile = profiles.id(pId)
        profile.collections = profile.collections.filter(c=> !collectionIds.includes(c.id))
      })
      this.store.dispatch(new profileActions.setProfileState(profiles))
    }
  }
 
  //  --- [ PACKABLES ] - BULK ACTIONS

  public removePackablesByCP(packables:string[], CPs?:CollectionProfile[]){
    if(CPs && CPs.length>0){
      let profiles = this.storeSelector.profiles;
      CPs.forEach(CP => {
        let profile = profiles.id(CP.pId)
        if (profile){
          let col = profile.collections.id(CP.cId)
          if (col){
            col.packables = col.packables.filter(p=> !packables.includes(p.id))
          }
        }
      })
      this.store.dispatch(new profileActions.setProfileState(profiles))
    } else {
      //this.store.dispatch(new packableActions.removeOriginalPackables(packables))
      console.error('Did not recieve valid CollectionProfile array', CPs);
    }
  } 
  public pushPackablesByCP(packables:string[], CPs?:CollectionProfile[]){
    if(CPs && CPs.length>0 && this.context.collectionId && this.context.profileId){
      let privatePackables = this.storeSelector
        .getAllPrivatePackables(this.context.collectionId,this.context.profileId)
        .filter(p=>packables.includes(p.id))
      let profiles = this.storeSelector.profiles;
      profiles = this.proFac.addEditPackablesByCP(profiles,privatePackables,CPs)
      this.store.dispatch(new profileActions.setProfileState(profiles))
    }
  }
}
