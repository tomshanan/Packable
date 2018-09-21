import { Guid } from '../global-functions';
import { Injectable, Type } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';
import { WeatherRule } from './weather.model';

export type QuantityType = "period" | "profile" | "trip";

export interface QuantityRule {
    amount: number,
    type: QuantityType,
    repAmount?: number
}
export interface ActivityRule {
    id: string
}

export type packableType = 'original' | 'private' | 'complete';
export class PackableComplete {
    type:packableType = 'complete';
    constructor(
        public id:string = '',
        public name: string = '',
        public icon: string = '',
        public quantityRules: QuantityRule[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
        public sameAsOriginal: boolean = true,
        public parent: PackableAny = new PackableOriginal()
    ) { }
}
export class PackableOriginal {
    type:packableType = 'original';
    constructor(
        public id: string = '',
        public name: string ='',
        public icon: string = '',
        public quantityRules: QuantityRule[] = [],
        public weatherRules: WeatherRule = new WeatherRule()
    ) {
    }
}

export class PackablePrivate {
    type:packableType = 'private';
    constructor(
        public id:string,
        public quantityRules: QuantityRule[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
        public subscribeToOriginal: boolean = true
    ){}
}
export type PackableAny = PackablePrivate | PackableOriginal;

export function isPackableOriginal(p:{type:packableType}):p is PackableOriginal {
    return p.type == 'original'
}
export function isPackablePrivate(p:{type:packableType}):p is PackablePrivate {
    return p.type == 'private'
}
export function isPackableComplete(p:{type:packableType}):p is PackableComplete {
    return p.type == 'complete'
}