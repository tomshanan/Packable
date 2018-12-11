import { WeatherRule } from './weather.model';
import { Guid } from '../global-functions';

export type QuantityType = "period" | "profile" | "trip";

export class QuantityRule {
    constructor(
        public amount: number = 1,
        public type: QuantityType = 'period',
        public repAmount: number = 1
    ) { }

}
export interface ActivityRule {
    id: string
}

export type packableType = 'original' | 'private' | 'complete';

export class PackableComplete {
    type: packableType = 'complete';
    constructor(
        public id: string =  Guid.newGuid(),
        public name: string = '',
        public quantityRules: QuantityRule[] = [new QuantityRule()],
        public weatherRules: WeatherRule = new WeatherRule(),
        public userCreated: boolean = false,
    ) { }
}
export class PackableOriginal {
    type: packableType = 'original';
    constructor(
        public id: string = Guid.newGuid(),
        public name: string = '',
        public quantityRules: QuantityRule[] = [new QuantityRule()],
        public weatherRules: WeatherRule = new WeatherRule(),
        public userCreated: boolean = false
    ) {
    }
}
export class PackablePrivate {
    type: packableType = 'private';
    constructor(
        public id: string,
        public quantityRules: QuantityRule[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
    ) { }
}
export type PackableAny = PackablePrivate | PackableOriginal;

export function isPackableOriginal(p: { type: packableType }): p is PackableOriginal {
    return p.type == 'original'
}
export function isPackablePrivate(p: { type: packableType }): p is PackablePrivate {
    return p.type == 'private'
}
export function isPackableComplete(p: { type: packableType }): p is PackableComplete {
    return p.type == 'complete'
}