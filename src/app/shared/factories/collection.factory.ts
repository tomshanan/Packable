import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionAny, CollectionOriginal, CollectionPrivate, CollectionComplete, Activity, isCollectionOriginal } from '../models/collection.model';
import { PackableComplete } from '../models/packable.model';

@Injectable()
export class CollectionFactory {
    constructor(
        private storeSelector: StoreSelectorService,
        private packableFactory: PackableFactory
    ) { }
    public isOriginal = (collection: CollectionAny): collection is CollectionOriginal => {
        return (<CollectionOriginal>collection).name !== undefined;
    }

    public newPrivateCollection = (original: CollectionOriginal, patchValue?:{}): CollectionPrivate => {
        let privatePackables = original.packables.map(p => {
            return this.packableFactory.makePrivateFromId(p);
        })
        let newCollection = new CollectionPrivate(
            original.id, 
            privatePackables,
            original.weatherRules.deepCopy()
        );
        if(patchValue){
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
    public makePrivate = (collection: CollectionAny, patchValue?:{}): CollectionPrivate => {
        if (this.isOriginal(collection)) {
            return this.newPrivateCollection(collection,patchValue);
        } else {
            return collection
        }
    }
    public makeComplete =  (collection: CollectionAny ): CollectionComplete  => {
        let returnCollection: CollectionComplete;
        if(isCollectionOriginal(collection)){
            returnCollection = new CollectionComplete(
                collection.id,
                collection.name,
                collection.activity,
                this.packableFactory.makeCompeleteFromIds(collection.packables),
                collection.weatherRules.deepCopy(),
                true,
                collection
            )
        } else {
            let original = this.storeSelector.getCollectionById(collection.id)
            let completePackables:PackableComplete[];
            if (collection.subscribeToOriginal){
                completePackables = this.packableFactory.makeCompeleteFromIds(original.packables)
            } else{
                completePackables = this.packableFactory.makeCompleteFromArray(collection.packables)
            }
            returnCollection = new CollectionComplete(
                collection.id,
                original.name,
                original.activity,
                completePackables,
                collection.weatherRules.deepCopy(),
                collection.subscribeToOriginal,
                collection
            )
        }
        return returnCollection
    }
    public makeCompleteArray = (collections: CollectionAny[]): CollectionComplete[] =>{
        return collections.map(c=>this.makeComplete(c))
    }
    public getActivityCollections = (collections: CollectionAny[]): Activity[] =>{
        return collections
            .map(c => this.storeSelector.getCollectionById(c.id))
            .filter(c => c.activity == true)
            .map(c => {
                return {name: c.name, id:c.id}
            })
    }
}