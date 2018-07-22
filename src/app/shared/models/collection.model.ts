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
        public weatherRules: WeatherRule[],
        public activityRules: ActivityRule[],
        public packables: PackablePrivate[],
        public id: string
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
    public newPrivateCollection = function (original: CollectionOriginal): CollectionPrivate {
        let newCollection = new CollectionPrivate([],[],[],'');
        newCollection.packables = original.packables.map(p => {
            return this.packableFactory.makePrivateFromId(p);
        })
        newCollection.activityRules = [...original.activityRules];
        newCollection.weatherRules = [...original.weatherRules]
        newCollection.id = original['id'];

        return newCollection
    }
    public restorePrivate = function (collection: CollectionPrivate): CollectionPrivate {
        let original = this.storeSelector.getCollectionById(collection.id);
        return this.newPrivateCollection(original);
    }
    public makePrivate = function (collection: CollectionPrivate | CollectionOriginal): CollectionPrivate {
        if (collection.hasOwnProperty('name')) {
            return this.newPrivateCollection(collection);
        }
        return <CollectionPrivate>collection;
    }
    public makeComplete = function (collection: CollectionAny): CollectionComplete {
        let completeCollection = this.storeSelector.getCompleteCollections([collection])[0]
        return completeCollection;
    }
}