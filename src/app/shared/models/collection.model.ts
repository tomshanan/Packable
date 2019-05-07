import { PackablePrivate, PackableComplete } from './packable.model';
import { Guid, timeStamp } from '../global-functions';
import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { WeatherRule } from './weather.model';

export type collectionType = 'complete' | 'private' | 'original';

export function isCollectionOriginal(col:{type:collectionType}): col is CollectionOriginal {return col.type == 'original';}
export function isCollectionComplete(col:{type:collectionType}): col is CollectionComplete {return col.type == 'complete';}
export function isCollectionPrivate(col:{type:collectionType}): col is CollectionPrivate {return col.type == 'private';}

export class CollectionComplete {
    public type: collectionType = 'complete';
    constructor(
        public id: string = '',
        public name: string = '',
        public essential: boolean = false,
        public packables: PackableComplete[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
        public userCreated: boolean = false,
        public dateModified: number = timeStamp(),
        public locations: string[] = [],
        public deleted: boolean  = false

    ) {
    }
}

export class CollectionOriginal {
    public type: collectionType = 'original';
    constructor(
        public id: string = Guid.newGuid(),
        public name: string = '',
        public packables: PackablePrivate[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
        public userCreated: boolean = false,
        public dateModified: number =  timeStamp(),
        public locations: string[] = [],
        public deleted: boolean  = false
    ) {
    }
}

export class CollectionPrivate {
    public type: collectionType = 'private';
    constructor(
        public id: string = '',
        public packables: PackablePrivate[] = [],
        public essential: boolean = false,
        public weatherRules: WeatherRule = new WeatherRule(),
        public dateModified: number =  timeStamp(),
    ){
    }
}

export interface CollectionRef {
    id: string,
    name: string
}

export type CollectionAny = CollectionPrivate | CollectionOriginal;