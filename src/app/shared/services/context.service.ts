import { Injectable } from '@angular/core';
import { StoreSelectorService } from './store-selector.service';
import { CollectionFactory } from '../factories/collection.factory';
import { Profile } from '../models/profile.model';
import { CollectionComplete } from '../models/collection.model';
import { Subject } from 'rxjs';
import { isDefined } from '../global-functions';

@Injectable({
  providedIn: 'root'
})
export class ContextService {


  constructor(
    private storeSelector: StoreSelectorService,
    private colFac: CollectionFactory,
    ) {
  }
  private _profileId: string
  private _collectionId: string

  public get profileId(): string{return this._profileId}
  public get collectionId(): string{return this._collectionId}

  public setBoth(collectionId:string, profileId:string){
    this._profileId = profileId;
    this._collectionId = collectionId;
    this.emitChanges()
  }
  public setProfile(id:string){
    this._profileId = id;
    if(isDefined(id)){ console.log(`<< CONTEXT PROFILE SET TO ${this.getProfile().name} >>`);}
    this.emitChanges()
  }
  public setCollection(id:string){
    this._collectionId = id;
    isDefined(id) && console.log(`<< CONTEXT COLLECTION SET TO ${this.getCollection().name} >>`);
    this.emitChanges()
  }
  public getProfile():Profile {
    return this.storeSelector.getProfileById(this.profileId)
  }
  public getCollection():CollectionComplete {
    return this.colFac.getCompleteById(this._collectionId, this._profileId) // if profile is null, original collection will be returned
  }

  public reset(){
    this.setBoth(null, null)  }

  public changes = new Subject<any>();
  private emitChanges(){
    console.log(`<< CHANGES FROM CONTEXT EMITTED >>`);
    this.changes.next({
      profileId: this.profileId,
      collecitonId: this.collectionId
    })
  }
}
