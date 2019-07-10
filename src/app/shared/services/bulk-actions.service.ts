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
import { CollectionProfile } from '../../packables/packable-list/edit-packable-dialog/choose-collections-form/choose-collections-form.component';
import * as profileActions from '@app/profiles/store/profile.actions';
import { PackablePrivate, PackableOriginal } from '../models/packable.model';
import * as collectionActions from '@app/collections/store/collections.actions';
import { CollectionComplete, CollectionOriginal, CollectionWithMetadata } from '../models/collection.model';
import { isDefined, timeStamp } from '../global-functions';
import { editProfiles } from '../../profiles/store/profile.actions';
import { Profile } from '../models/profile.model';
import { tripCollectionGroup } from '../models/trip.model';
import * as tripActions  from '../../trips/store/trip.actions';
import { updateIncomplete } from '../../trips/store/trip.actions';

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

  /**
   * Checks profiles in each collection group to make sure collection exits in it, and adds missing collections, also import library collections
   * @param cGroups tripCollectionGroup[] 
   */
  public pushMissingCollectionsToProfiles(cGroups:tripCollectionGroup[]){
    if(isDefined(cGroups)){
      let storeProfiles = this.storeSelector.profiles
      let changes:number = 0;
      let importCollections:string[] = [];
      cGroups.forEach(({id,profiles})=>{
        let cId = id
        let profileIdsToUpdate = []
        profiles.forEach(pId=>{
          if(storeProfiles.findId(pId).collections.hasId(cId) === false){
            profileIdsToUpdate.push(pId)
          }
        })
        if(profileIdsToUpdate.length>0){
          let original = this.storeSelector.getCollectionById(cId)
          if(!original){
            original = <CollectionOriginal>this.storeSelector.getLibraryItemById('collections',cId)
            importCollections.push(cId)
          }
          let privateCol = this.colFac.makePrivate(original)
            privateCol.dateModified = timeStamp()
            profileIdsToUpdate.forEach(pId=>{
              let profile = storeProfiles.findId(pId)
              profile.collections.unshift(privateCol)
              profile.dateModified = timeStamp()
              changes++
            })
        }
      })
      if(changes>0){
        if(importCollections.length>0){
          this.processImportCollections(importCollections)
        }
        this.store.dispatch(new profileActions.editProfiles(storeProfiles))
      }
    }
  }





  public removeCollectionsFromProfilesAndTrips(collectionIds: string[], profileIds: string[]) {
    if (collectionIds.length > 0 && profileIds.length > 0) {
      let profiles = this.storeSelector.profiles.filter(p=>profileIds.includes(p.id));
      profileIds.forEach(pId => {
        let profile = profiles.findId(pId)
        profile.collections = profile.collections.filter(c => !collectionIds.includes(c.id))
      })
      let trips = this.storeSelector.trips
      let tripChanges = 0;
      // loop thru trips and remove profiles from collectionGroups
      trips.forEach(trip=>{
        profileIds.forEach(pId=>{
          if(trip.profiles.includes(pId)){
            trip.collections.forEach(col=>{
              console.log(col);
              if(collectionIds.includes(col.id)){
                col.profiles = isDefined(col.profiles) ? col.profiles.filter(pId=>!profileIds.includes(pId)) : []
                tripChanges++
              }
            })
          }
        })
      })

      let incompleteTrips = this.storeSelector.incompleteTrips
      let incompleteTripChanges = 0;
       // loop thru incompleteTrips and remove profiles from collectionGroups
      incompleteTrips.forEach(trip=>{
        profileIds.forEach(pId=>{
          if(trip.profiles.includes(pId)){
            trip.collections.forEach(col=>{
              console.log(col);
              if(collectionIds.includes(col.id)){
                col.profiles = isDefined(col.profiles) ? col.profiles.filter(pId=>!profileIds.includes(pId)) : [];
                incompleteTripChanges++
              }
            })
          }
        })
      })

      this.store.dispatch(new profileActions.editProfiles(profiles))
      if(tripChanges>0){
        this.store.dispatch(new tripActions.updateTrips(trips))
      }
      if(incompleteTripChanges>0){
        this.store.dispatch(new tripActions.updateIncomplete(incompleteTrips))
      }
    }
  }
  
  public processImportCollections(selectedColIds:string[],profileIds?:string[]):CollectionComplete[]{
    let localCollections = this.colFac.getAllComplete() // will only return living collections (not deleted)
    let allRemoteCollections = this.storeSelector.getRemoteCollectionsWithMetadata()

    // select only remote collections that aren't in the local library already
    let selectedRemoteCollections = allRemoteCollections.filter(c=>{
      return selectedColIds.includes(c.id) && !localCollections.findId(c.id)
    })
    let newOriginals = selectedRemoteCollections.map(c=>this.colFac.duplicateOriginalCollection(c))
    newOriginals.forEach(c=>c.dateModified=timeStamp())
    console.log('BULK ACTION: dispatch updateOriginalCollections',newOriginals)
    this.store.dispatch(new collectionActions.updateOriginalCollections(newOriginals))
    // REVIVE / ADD MISSING PACKABLES TO PACKABLE STORE
    this.addPackablesFromRemoteCollections(selectedRemoteCollections)
    // BULK ACTION- ADD SELECTED COLLECTIONS TO PROFILES, IF PROFILES WERE SELECTED
    let newCompletes = this.colFac.remoteToComplete(selectedRemoteCollections)
    let selectedLocal = localCollections.filter(c=>selectedColIds.includes(c.id))
    let allComplete = [...selectedLocal,...newCompletes]
    if(isDefined(profileIds)){
      this.pushCompleteCollectionsToProfiles(allComplete,profileIds)
    }
    return allComplete
  }

  public addPackablesFromRemoteCollections(selectedRemoteCollections:CollectionWithMetadata[]){
    if(isDefined(selectedRemoteCollections)){
      let packablesInRemote:string[] = []
      // iterate over collections and push one of each unique packable
      selectedRemoteCollections.forEach(col =>{
        col.packables.forEach(pac=>{
          if(!packablesInRemote.includes(pac.id)){
            packablesInRemote.push(pac.id)
      }})})
      this.addMissingPackableIdsFromRemote(packablesInRemote)
    }
  }

  public addMissingPackableIdsFromRemote(ids:string[]):PackableOriginal[]{
    let allRemotePackables = <PackableOriginal[]>this.storeSelector.getLibraryItems('packables')
    let allLocalPackables = this.storeSelector.originalPackables.filter(p=>!p.deleted) // only show living packables
    console.log('BULK ACTION: allLocalPackables',allLocalPackables)
    console.log('BULK ACTION: allRemotePackables',allRemotePackables)
    let missingPackables = 
      allRemotePackables
      .filter(p=>ids.includes(p.id)) // filter allRemotePackables for the ones required
      .filter(p=>allLocalPackables.idIndex(p.id)===-1) // filter for the ones not used locally already
      .map(p=>this.pacFac.clonePackableOriginal(p)); // turn into an original packable for local use
    missingPackables.forEach(p=>p.dateModified=timeStamp()) // update timestamp
    if(missingPackables.length > 0){
      console.log('BULK ACTION: dispatch addMissingPackables',missingPackables)
      this.store.dispatch(new packableActions.updateOriginalPackables(missingPackables))
      return missingPackables
    } else {
      console.log('BULK ACTION: did not distpatch addMissingPackables',missingPackables)
      return []
    }
  }
  /**
   * Push collectionComplete to all profile IDs provided, will override exiting, and add missing. 
   * @param collections CollectionComplete[] - will override any existing collections in selected IDs
   * @param profileIds  string[] - IDs of all profiles to be affected
   * 
   * Updates all timestamps of collections and profiles affected.
   * Does not add collections to Original Collections store.
   */
  public pushCompleteCollectionsToProfiles(collections: CollectionComplete[], profileIds: string[]) {
    if (collections.length > 0 && profileIds.length > 0) {
      let privateCollections = collections.map(c => this.colFac.completeToPrivate(c))

      let profiles = this.storeSelector.profiles.filter(p=>profileIds.includes(p.id));
      privateCollections.forEach(privateCol => {
        privateCol.dateModified = timeStamp()
        profileIds.forEach(pId => {
          let profile = profiles.findId(pId)
          profile.dateModified = timeStamp()
          let index = profile.collections.idIndex(privateCol.id)
          if (index !== -1) {
            profile.collections.splice(index, 1, privateCol)
          } else {
            profile.collections.unshift(privateCol)
          }
        })
      })
      console.log(`pushCompleteCollectionsToProfiles`,profiles)
      this.store.dispatch(new profileActions.editProfiles(profiles))
    }
  }
  
  //  --- [ PACKABLES ] - BULK ACTIONS

  public removePackablesByCP(packables: string[], CPs?: CollectionProfile[]) {
    if (CPs && CPs.length > 0) {

      let allProfiles = this.storeSelector.profiles
      let modifiedProfiles:Profile[] = []
      CPs.forEach(CP => {
        let profile = allProfiles.findId(CP.pId)
        if (profile) {
          let col = profile.collections.findId(CP.cId)
          if (col) {
            col.packables = col.packables.filter(p => !packables.includes(p.id))
            col.dateModified = timeStamp()
            profile.dateModified = timeStamp()
            modifiedProfiles.push(profile)
          }
        }
        this.store.dispatch(new profileActions.editProfiles(modifiedProfiles))
      })
    } else {
      console.error('Did not recieve valid CollectionProfile array', CPs);
    }
  }

  public pushPackablesByCP(ids: string[], CPs?: CollectionProfile[]) {
    if (CPs && CPs.length > 0) {
      if (this.context.collectionId) {
        this.pushContextPackablesByCP(ids, CPs)
      } else {
        let packables = this.storeSelector.originalPackables.filter(p=>ids.includes(p.id))
        this.pushOriginalPackablesByCP(packables, CPs)
      }
    }
  }
  public pushContextPackablesByCP(packables: string[], CPs?: CollectionProfile[]) {
    if (CPs && CPs.length > 0 && this.context.collectionId && this.context.profileId) {
      let privatePackables = this.storeSelector
        .getAllPrivatePackables(this.context.collectionId, this.context.profileId)
        .filter(p => packables.includes(p.id))
      this.pushPrivatePackablesByCP(privatePackables, CPs)
    }
  }
  public pushOriginalPackablesByCP(packables: PackableOriginal[], CPs: CollectionProfile[]) {
    if (CPs && CPs.length > 0) {
      let privatePackables = packables.map(p => { 
        p.dateModified = timeStamp();
         return this.pacFac.makePrivate(p)
        })
      this.pushPrivatePackablesByCP(privatePackables, CPs)
    }
  }
  private pushPrivatePackablesByCP(privatePackables: PackablePrivate[], CPs: CollectionProfile[]) {
    if (CPs && CPs.length > 0 && privatePackables && privatePackables.length > 0) {
      let allProfiles = this.storeSelector.profiles;
      let modifiedProfiles:Profile[] = []
      let modifiedCollections: CollectionOriginal[] = [];
      CPs.forEach(cp => {
          let profile = allProfiles.findId(cp.pId)
          if (profile) {
            let collection = profile.collections.findId(cp.cId)
            if (collection) {
              collection = this.colFac.addEditPackables(collection, privatePackables)
              collection.dateModified = timeStamp()
              profile.dateModified = timeStamp()
              modifiedProfiles.push(profile)
            }
          } else if(cp.pId === null){
            let collection = this.storeSelector.getCollectionById(cp.cId)
            collection = this.colFac.addEditPackables(collection,privatePackables)
            collection.dateModified = timeStamp()
            modifiedCollections.push(collection)
          }
      })
      if(modifiedProfiles.length>0){
        this.store.dispatch(new profileActions.editProfiles(modifiedProfiles))
      }
      if(modifiedCollections.length>0){
        this.store.dispatch(new collectionActions.updateOriginalCollections(modifiedCollections))
      }
    }
  }
}
