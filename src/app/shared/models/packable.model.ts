import { WeatherRule } from './weather.model';
import { Guid, timeStamp } from '../global-functions';
import { ItemMetaData } from '../library/library.model';

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

export type packableType = 'original' | 'private' | 'complete' | 'remote';

export class PackableComplete {
    type: packableType = 'complete';
    constructor(
        public id: string =  Guid.newGuid(),
        public name: string = '',
        public quantityRules: QuantityRule[] = [new QuantityRule()],
        public weatherRules: WeatherRule = new WeatherRule(),
        public userCreated: boolean = false,
        public dateModified: number = timeStamp(),
        public deleted: boolean = false
    ) { }
}
export class PackableOriginal {
    type: packableType = 'original';
    constructor(
        public id: string = Guid.newGuid(),
        public name: string = '',
        public quantityRules: QuantityRule[] = [new QuantityRule()],
        public weatherRules: WeatherRule = new WeatherRule(),
        public userCreated: boolean = false,
        public dateModified: number = timeStamp(),
        public deleted: boolean = false
    ) {
    }
}
export class PackablePrivate {
    type: packableType = 'private';
    constructor(
        public id: string,
        public quantityRules: QuantityRule[] = [],
        public weatherRules: WeatherRule = new WeatherRule(),
        public dateModified: number = timeStamp()
    ) { }
}
export class remotePackable extends PackableOriginal {
    metaData: ItemMetaData = new ItemMetaData()
    constructor(p:PackableOriginal, metaData:ItemMetaData){
        super(p.id,p.name,p.quantityRules,p.weatherRules,false,p.dateModified, p.deleted)
        this.metaData = {...this.metaData,...metaData}
        this.type = 'remote'
    }
}

export type PackableAny = PackablePrivate | PackableOriginal | remotePackable;

export function isPackableOriginal(p: { type: packableType }): p is PackableOriginal {
    return p.type == 'original'
}
export function isPackablePrivate(p: { type: packableType }): p is PackablePrivate {
    return p.type == 'private'
}
export function isPackableComplete(p: { type: packableType }): p is PackableComplete {
    return p.type == 'complete'
}
export function isPackableRemote(p: { type: packableType }): p is remotePackable {
    return p.type == 'remote'
}