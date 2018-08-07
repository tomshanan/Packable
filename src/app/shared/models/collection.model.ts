import { PackablePrivate, ActivityRule, WeatherRule, PackableOriginal, PackableFactory } from './packable.model';
import { Guid } from '../global-functions';
import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';

export class CollectionComplete {
    constructor(
        public id: string,
        public name: string,
        public activity: boolean,
        public packables: any[],
        public activityRules: ActivityRule[] = [],
        public weatherRules: WeatherRule[] = []
    ) {
    }
}

export class CollectionOriginal {
    public id: string;
    constructor(
        public name: string,
        public activity: boolean,
        public packables: string[],
        public activityRules: ActivityRule[] = [],
        public weatherRules: WeatherRule[] = []
    ) {
        this.id = Guid.newGuid();
    }
}

export class CollectionPrivate {
    constructor(
        public id: string = '',
        public packables: PackablePrivate[] = [],
        public weatherRules: WeatherRule[] = [],
        public activityRules: ActivityRule[] = [],
    ){
    }
}

export type CollectionAny = CollectionPrivate | CollectionOriginal;


@Injectable()
export class CollectionFactory {
    constructor(
        private storeSelector: StoreSelectorService,
        private packableFactory: PackableFactory
    ) { }
    public isOriginal = (collection: CollectionAny): collection is CollectionOriginal => {
        return (<CollectionOriginal>collection).name !== undefined;
    }

    public newPrivateCollection = (original: CollectionOriginal): CollectionPrivate => {
        let privatePackables = original.packables.map(p => {
            return this.packableFactory.makePrivateFromId(p);
        })
        let newCollection = new CollectionPrivate(
            original['id'], 
            privatePackables,
            original.weatherRules.slice(),
            original.activityRules.slice()
        );
        return newCollection
    }
    public restorePrivate = (collection: CollectionPrivate): CollectionPrivate => {
        let original = this.storeSelector.getCollectionById(collection.id);
        return this.newPrivateCollection(original);
    }
    public makePrivate = (collection: CollectionPrivate | CollectionOriginal): CollectionPrivate => {
        if (this.isOriginal(collection)) {
            return this.newPrivateCollection(collection);
        } else {
            return collection
        }
    }
    public makeComplete =  (collection: CollectionAny): CollectionComplete => {
        let completeCollection = this.storeSelector.getCompleteCollections([collection])[0]
        return completeCollection;
    }
    public getActivityCollections = (collections: CollectionAny[]): {name:string,collectionId:string}[] =>{
        return collections
            .map(c => this.storeSelector.getCollectionById(c.id))
            .filter(c => c.activity == true)
            .map(c => {
                return {name: c.name, collectionId:c.id}
            })
    }
}