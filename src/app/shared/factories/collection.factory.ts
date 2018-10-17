import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionAny, CollectionOriginal, CollectionPrivate, CollectionComplete, Activity, isCollectionOriginal } from '../models/collection.model';
import { PackableComplete } from '../models/packable.model';
import { weatherFactory } from './weather.factory';

@Injectable()
export class CollectionFactory {
    constructor(
        private storeSelector: StoreSelectorService,
        private packableFactory: PackableFactory,
        private weatherFactory:weatherFactory,
    ) { }
    public isOriginal = (collection: CollectionAny): collection is CollectionOriginal => {
        return (<CollectionOriginal>collection).name !== undefined;
    }
    public duplicatePrivateCollection = (packable: CollectionPrivate): CollectionPrivate =>{
        return new CollectionPrivate(
            packable.id,
            packable.packables ? packable.packables.map(p=>this.packableFactory.clonePackablePrivate(p)) : [],
            this.weatherFactory.deepCopy(packable.weatherRules),
            packable.subscribeToOriginal || true
        )
        
    }
    public duplicateOriginalCollection = (original: CollectionOriginal): CollectionOriginal =>{
        return new CollectionOriginal(
            original.id,
            original.name,
            original.activity,
            original.packables ? original.packables.slice() : [],
            this.weatherFactory.deepCopy(original.weatherRules)
        )
    }
    public newPrivateCollection = (original: CollectionOriginal, patchValue?:{}): CollectionPrivate => {
        let privatePackables = original.packables.map(p => {
            return this.packableFactory.makePrivateFromId(p);
        })
        let newCollection = new CollectionPrivate(
            original.id, 
            privatePackables,
            this.weatherFactory.deepCopy(original.weatherRules)
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
                this.weatherFactory.deepCopy(collection.weatherRules),
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
                this.weatherFactory.deepCopy(collection.weatherRules),
                collection.subscribeToOriginal,
                collection
            )
        }
        return returnCollection
    }
    public makeCompleteArray = (collections: CollectionAny[]): CollectionComplete[] =>{
        return collections.filter(c=>{
            return !!this.storeSelector.getCollectionById(c.id) ? true : (
                console.log(`could not load id ${c.id} from store:`, this.storeSelector.originalCollections),
                false)
        }).map(c=>this.makeComplete(c))
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