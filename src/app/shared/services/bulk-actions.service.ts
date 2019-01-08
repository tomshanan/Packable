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
import { PackablePrivate, PackableOriginal } from '../models/packable.model';
import * as collectionActions from '@app/collections/store/collections.actions';
import { CollectionComplete } from '../models/collection.model';
import { isDefined } from '../global-functions';

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
        let profile = profiles.findId(pId)
        profile.collections = profile.collections.filter(c=> !collectionIds.includes(c.id))
      })
      this.store.dispatch(new profileActions.setProfileState(profiles))
    }
  }
 
  public pushCollectionsToProfiles(collections:CollectionComplete[], profileIds: string[]){
    if(collections.length >0 && profileIds.length > 0){
      let privateCollections = collections.map(c=>this.colFac.completeToPrivate(c))
      let profiles = this.storeSelector.profiles;
      privateCollections.forEach(privateCol=>{
        profileIds.forEach(pId=>{
          let profile = profiles.findId(pId)
          let index = profile.collections.idIndex(privateCol.id)
          if(index !== -1){
            profile.collections.splice(index,1,privateCol)
          } else {
            profile.collections.unshift(privateCol)
          }
        })
      })
      this.store.dispatch(new profileActions.setProfileState(profiles))
    }
  }
  //  --- [ PACKABLES ] - BULK ACTIONS

  public removePackablesByCP(packables:string[], CPs?:CollectionProfile[]){
    if(CPs && CPs.length>0){
      let profiles = this.storeSelector.profiles;
      CPs.forEach(CP => {
        let profile = profiles.findId(CP.pId)
        if (profile){
          let col = profile.collections.findId(CP.cId)
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
  public pushContextPackablesByCP(packables:string[], CPs?:CollectionProfile[]){
    if(CPs && CPs.length>0 && this.context.collectionId && this.context.profileId){
      let privatePackables = this.storeSelector
        .getAllPrivatePackables(this.context.collectionId,this.context.profileId)
        .filter(p=>packables.includes(p.id))
        this.pushPrivatePackablesByCP(privatePackables, CPs)
    }
  }
  public pushOriginalPackablesByCP(packables:PackableOriginal[], CPs:CollectionProfile[]){
    if(CPs && CPs.length>0 && this.context.collectionId && this.context.profileId){
      let privatePackables = packables.map(p=>this.pacFac.makePrivate(p))
      this.pushPrivatePackablesByCP(privatePackables, CPs)
    }
  }
  private pushPrivatePackablesByCP(privatePackables:PackablePrivate[], CPs:CollectionProfile[]){
    if(CPs && CPs.length>0 && privatePackables && privatePackables.length>0){
      let profiles = this.storeSelector.profiles;
      profiles = this.proFac.addEditPackablesByCP(profiles,privatePackables,CPs)
      this.store.dispatch(new profileActions.setProfileState(profiles))
    }
  }
}
