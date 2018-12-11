import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionAny, CollectionOriginal, CollectionPrivate, CollectionComplete, Activity, isCollectionOriginal } from '../models/collection.model';
import { PackableComplete, PackablePrivate } from '../models/packable.model';
import { weatherFactory } from './weather.factory';
import { indexOfId } from '../global-functions';

type T = {packables:PackablePrivate[]}

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
            packable.essential,
            this.weatherFactory.deepCopy(packable.weatherRules),
        )
        
    }
    public duplicateOriginalCollection = (original: CollectionOriginal): CollectionOriginal =>{
        return new CollectionOriginal(
            original.id,
            original.name,
            original.packables ? original.packables.slice() : [],
            this.weatherFactory.deepCopy(original.weatherRules),
            original.userCreated
        )
    }
    public newPrivateCollection = (original: CollectionOriginal, patchValue?:{}): CollectionPrivate => {
        let privatePackables = original.packables.map(p => this.packableFactory.makePrivate(p))
        let newCollection = new CollectionPrivate(
            original.id, 
            privatePackables,
            false,   
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
    public makeCompleteArray = (collections: CollectionAny[]): CollectionComplete[] =>{
        return collections.filter(c=>{
            return !!this.storeSelector.getCollectionById(c.id) ? true : (
                console.log(`could not load id ${c.id} from store:`, this.storeSelector.originalCollections),
                false)
        }).map(c=>this.makeComplete(c))
    }

    public getCompleteById(id:string):CollectionComplete{
        return this.makeComplete(this.storeSelector.getCollectionById(id))
    }
    public getCompleteByIdArray(ids:string[]):CollectionComplete[]{
        return ids.map(id=>this.getCompleteById(id))
    }
    
    public addEditPackable<T extends {packables:PackablePrivate[]}>(collection:T, packable:PackablePrivate):T{
        let pcIndex = indexOfId(collection.packables, packable.id)
        if(pcIndex < 0){
            collection.packables.splice(0,0,packable)
        } else {
            collection.packables.splice(pcIndex,1,packable)
        }
        return collection
    }

}