import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionFactory } from './collection.factory';
import { Profile, ProfileComplete, Avatar } from '../models/profile.model';
import { CollectionPrivate } from '../models/collection.model';
import { indexOfId } from '../global-functions';
import { PackablePrivate } from '../models/packable.model';
import { CollectionProfile } from '../../packables/packable-list/edit-packable-dialog/choose-collections-dialog/choose-collections-dialog.component';

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
    public completeToPrivate(p: ProfileComplete): Profile{
        return new Profile(
            p.id,
            p.name,
            p.collections.map(c=>this.collectionFactory.completeToPrivate(c)),
            new Avatar(p.avatar.icon, p.avatar.color)
        )
    }
    public getAllProfilesAndMakeComplete():ProfileComplete[]{
        let profiles = this.storeSelector.profiles
        return this.makeComplete(profiles)
    }
    public makeComplete =(profiles: Profile[]): ProfileComplete[] =>{
        return profiles.map(profile => {
            let completeCollections = this.collectionFactory.makeCompleteArray(profile.collections)
            return new ProfileComplete(
                profile.id,
                profile.name,
                completeCollections,
                new Avatar(profile.avatar.icon, profile.avatar.color)
            )
        })
    }
    public getCompleteProfilesByIds = (ids:string[]): ProfileComplete[] =>{
        let profiles = []
        ids.forEach(id=>{
            let p = this.storeSelector.getProfileById(id);
            p && profiles.push(p);
        })
        return this.makeComplete(profiles);
    }
    public addEditCollection(profile:Profile,collection:CollectionPrivate):Profile{
        let colIndex = profile.collections.idIndex(collection.id)
        if(colIndex > -1) { 
            profile.collections.splice(colIndex,1,collection) 
        } else {
            profile.collections.unshift(collection)
        } 
        return profile
    }
    public addEditPackablesByCP(profiles: Profile[], packables:PackablePrivate[], cps: CollectionProfile[]):Profile[]{
        cps.forEach(cp=>{
            let profile = profiles.find(p=>p.id == cp.pId)
            if(profile){
                let collection = profile.collections.find(collection=>collection.id == cp.cId)
                if (collection){
                    collection = this.collectionFactory.addEditPackables(collection,packables)
                }
            }
            
        })
        return profiles
    }
}