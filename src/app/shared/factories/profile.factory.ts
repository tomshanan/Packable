import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionFactory } from './collection.factory';
import { Profile, ProfileComplete } from '../models/profile.model';

@Injectable()
export class ProfileFactory{
    constructor(
        private storeSelector:StoreSelectorService,
        private packableFactory: PackableFactory,
        private collectionFactory: CollectionFactory
    ){}

    public getCompleteProfiles =(profiles: Profile[]): ProfileComplete[] =>{
        return profiles.map(profile => {
            let completePackables = this.packableFactory.makeCompleteFromArray(profile.packables);
            let completeCollections = this.collectionFactory.makeCompleteArray(profile.collections)
            return new ProfileComplete(
                profile.id,
                profile.name,
                completePackables,
                completeCollections,
                profile
            )
        })
    }
    public getCompleteProfilesByIds = (ids:string[]): ProfileComplete[] =>{
        let profiles = ids.map(id=>this.storeSelector.getProfileById(id))
        return this.getCompleteProfiles(profiles);
    }

}