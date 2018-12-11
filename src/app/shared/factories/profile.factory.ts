import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionFactory } from './collection.factory';
import { Profile, ProfileComplete, Avatar } from '../models/profile.model';
import { CollectionPrivate } from '../models/collection.model';
import { indexOfId } from '../global-functions';

@Injectable()
export class ProfileFactory{
    constructor(
        private storeSelector:StoreSelectorService,
        private packableFactory: PackableFactory,
        private collectionFactory: CollectionFactory
    ){}
        public duplicateProfile =(profile:Profile): Profile =>{
            return new Profile(
                profile.id,
                profile.name,
                profile.collections ? profile.collections.map(c=> this.collectionFactory.duplicatePrivateCollection(c)) : [],
                profile.avatar ? profile.avatar : new Avatar(),
            )
        }
    public getCompleteProfiles =(profiles: Profile[]): ProfileComplete[] =>{
        return profiles.map(profile => {
            let completeCollections = this.collectionFactory.makeCompleteArray(profile.collections)
            return new ProfileComplete(
                profile.id,
                profile.name,
                completeCollections,
                profile,
                profile.avatar
            )
        })
    }
    public getCompleteProfilesByIds = (ids:string[]): ProfileComplete[] =>{
        let profiles = []
        ids.forEach(id=>{
            let p = this.storeSelector.getProfileById(id);
            p && profiles.push(p);
        })
        return this.getCompleteProfiles(profiles);
    }
    public addEditCollection(profile:Profile,collection:CollectionPrivate){
        let colIndex = indexOfId(profile.collections, collection.id)
        if(colIndex > -1) { 
            profile.collections.splice(colIndex,1,collection) 
        } else {
            profile.collections.splice(0,0,collection)
        } 
        return profile
    }
}