import { PackablePrivate, ActivityRule, PackableOriginal, PackableFactory } from './packable.model';
import { Guid } from '../global-functions';
import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';
import { WeatherRule } from './weather.model';

export class CollectionComplete {
    constructor(
        public id: string,
        public name: string,
        public activity: boolean,
        public packables: any[],
        public activityRules: ActivityRule[] = [],
        public weatherRules: WeatherRule = new WeatherRule()
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
        public weatherRules: WeatherRule = new WeatherRule()
    ) {
        this.id = Guid.newGuid();
    }
}

export class CollectionPrivate {
    constructor(
        public id: string = '',
        public packables: PackablePrivate[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
        public activityRules: ActivityRule[] = [],
    ){
    }
}

export interface Activity {
    id: string,
    name: string
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
            original.weatherRules.deepCopy(),
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
    public getActivityCollections = (collections: CollectionAny[]): Activity[] =>{
        return collections
            .map(c => this.storeSelector.getCollectionById(c.id))
            .filter(c => c.activity == true)
            .map(c => {
                return {name: c.name, id:c.id}
            })
    }
}