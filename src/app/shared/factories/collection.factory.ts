import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionAny, CollectionOriginal, CollectionPrivate, CollectionComplete, Activity, isCollectionOriginal } from '../models/collection.model';
import { PackableComplete, PackablePrivate } from '../models/packable.model';
import { weatherFactory } from './weather.factory';
import { indexOfId } from '../global-functions';
import { CollectionProfile } from '../../packables/packable-list/edit-packable-dialog/choose-collections-dialog/choose-collections-dialog.component';

type T = { packables: PackablePrivate[] }

@Injectable()
export class CollectionFactory {
    constructor(
        private storeSelector: StoreSelectorService,
        private packableFactory: PackableFactory,
        private weatherFactory: weatherFactory,
    ) { }
    public isOriginal = (collection: CollectionAny): collection is CollectionOriginal => {
        return (<CollectionOriginal>collection).name !== undefined;
    }
    public duplicatePrivateCollection = (packable: CollectionPrivate): CollectionPrivate => {
        return new CollectionPrivate(
            packable.id,
            packable.packables ? packable.packables.map(p => this.packableFactory.clonePackablePrivate(p)) : [],
            packable.essential,
            this.weatherFactory.deepCopy(packable.weatherRules),
        )

    }
    public duplicateOriginalCollection = (original: CollectionOriginal): CollectionOriginal => {
        return new CollectionOriginal(
            original.id,
            original.name,
            original.packables ? original.packables.slice() : [],
            this.weatherFactory.deepCopy(original.weatherRules),
            original.userCreated
        )
    }
    public newPrivateCollection = (original: CollectionOriginal, patchValue?: {}): CollectionPrivate => {
        let privatePackables = original.packables.map(p => this.packableFactory.makePrivate(p))
        let newCollection = new CollectionPrivate(
            original.id,
            privatePackables,
            false,
            this.weatherFactory.deepCopy(original.weatherRules)
        );
        if (patchValue) {
            for (var property in patchValue) {
                if (patchValue.hasOwnProperty(property) && newCollection.hasOwnProperty(property)) {
                    newCollection[property] = patchValue[property]
                } else {
                    !newCollection.hasOwnProperty(property) && console.warn(`could not find property "${property}" in private collection "${original.name}" \n`, newCollection, patchValue);
                }
            }
        }
        return newCollection
    }
    public restorePrivate = (collection: CollectionPrivate): CollectionPrivate => {
        let original = this.storeSelector.getCollectionById(collection.id);
        return this.newPrivateCollection(original);
    }
    public makePrivate = (collection: CollectionAny, patchValue?: {}): CollectionPrivate => {
        if (this.isOriginal(collection)) {
            return this.newPrivateCollection(collection, patchValue);
        } else {
            return collection
        }
    }
    public completeToPrivate = (complete:CollectionComplete):CollectionPrivate => {
        return new CollectionPrivate(
            complete.id,
            complete.packables.slice(),
            complete.essential,
            this.weatherFactory.deepCopy(complete.weatherRules))
    }
    public completeToOriginal = (complete:CollectionComplete):CollectionOriginal => {
        return new CollectionOriginal(
            complete.id,
            complete.name,
            complete.packables.map(p=>this.packableFactory.completeToPrivate(p)),
            this.weatherFactory.deepCopy(complete.weatherRules),
            complete.userCreated
        )
    }
    public makeComplete = (collection: CollectionAny): CollectionComplete => {
        let returnCollection: CollectionComplete;
        if (isCollectionOriginal(collection)) {
            return new CollectionComplete(
                collection.id,
                collection.name,
                false,
                this.packableFactory.makeCompleteFromArray(collection.packables),
                this.weatherFactory.deepCopy(collection.weatherRules),
                collection.userCreated
            )
        } else {
            let original = this.storeSelector.getCollectionById(collection.id)
            let completePackables = this.packableFactory.makeCompleteFromArray(collection.packables)
            return new CollectionComplete(
                collection.id,
                original.name,
                collection.essential,
                completePackables,
                this.weatherFactory.deepCopy(collection.weatherRules),
                original.userCreated
            )
        }
    }
    public makeCompleteArray = (collections: CollectionAny[]): CollectionComplete[] => {
        return collections.filter(c => {
            return !!this.storeSelector.getCollectionById(c.id) ? true : (
                console.log(`could not load id ${c.id} from store:`, this.storeSelector.originalCollections),
                false)
        }).map(c => this.makeComplete(c))
    }

    /** Get a complete collection from the Store by collection ID
     * @param ids the Collection Id
     * @param profileIds optional: Profile ID, will return the collection from the profile, or return null if not found in profile. Omit to find the original collection.
     */
    public getCompleteById(id: string, profileId?:string): CollectionComplete {
        if(profileId){
            return this.getCompleteFromProfile(id, profileId)
        } else {
            return this.makeComplete(this.storeSelector.getCollectionById(id))
        }
    }

    public getCompleteByIdArray(ids: string[]): CollectionComplete[] {
        return ids.map(id => this.getCompleteById(id))
    }
    public getCompleteFromProfile(colId:string, proId:string):CollectionComplete{
        let profile = this.storeSelector.getProfileById(proId)
        return this.makeComplete(profile.collections.findId(colId))
    }

    public addEditPackablesByCP(collections: CollectionOriginal[], packables: PackablePrivate[], cps: CollectionProfile[]): CollectionOriginal[] {
        let uniqueCollections = []
        cps.forEach(cp => {
            if (!uniqueCollections.includes(cp.cId)) {
                uniqueCollections.push(cp.cId)
            }
        })
        uniqueCollections.forEach(cId => { 
            let collection = collections.find(c=>c.id == cId)
            collection = this.addEditPackables(collection, packables)
        })
        return collections

    }
    public addEditPackables<T extends { packables: PackablePrivate[] }>(collection: T, packables: PackablePrivate[]): T {
        packables.forEach(packable => {
            let pacIndex = collection.packables.idIndex(packable.id)
            if (pacIndex < 0) {
                collection.packables.unshift(packable)
            } else {
                collection.packables.splice(pacIndex, 1, packable)
            }
        });
        return collection
    }

}