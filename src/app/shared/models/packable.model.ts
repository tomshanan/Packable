export type QuantityType = "period" | "profile" | "trip";
import { Guid } from '../global-functions';
import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';

export interface QuantityRule {
    amount: number,
    type: QuantityType,
    repAmount?: number
}
export interface ActivityRule {
    id: string
}
export interface WeatherRule {
    [s:string]:any;
}

export class PackableBlueprint {
    constructor(
        public id:string,
        public name: string,
        public icon: string,
        public quantityRules: QuantityRule[],
        public activityRules: ActivityRule[] = [],
        public weatherRules: WeatherRule[] = []
    ) { }
}
export class PackableOriginal extends PackableBlueprint {
    public id:string;
    constructor(
        public name: string,
        public icon: string,
        public quantityRules: QuantityRule[],
        public activityRules: ActivityRule[] = [],
        public weatherRules: WeatherRule[] = []
    ) {
        super(Guid.newGuid(),name, icon, quantityRules, activityRules, weatherRules)
    }
}

export class PackablePrivate {
    constructor(
        public id:string,
        public quantityRules: QuantityRule[] = [],
        public activityRules: ActivityRule[] = [],
        public weatherRules: WeatherRule[] = []) 
        {}
}
export type PackableAny = PackablePrivate | PackableOriginal;


@Injectable()
export class PackableFactory{
    constructor(private storeSelector:StoreSelectorService){}
    public newPrivatePackable = function (original:PackableOriginal):PackablePrivate{
        let newPackable = new PackablePrivate(
            original.id,
            original.quantityRules.slice(),
            original.activityRules.slice(),
            original.weatherRules.slice()
        )
        return newPackable;
    }
    public restorePrivate = function(packable:PackablePrivate):PackablePrivate{
        let original = this.storeSelector.getPackableById(packable.id);
        return this.newPrivatePackable(original);
    }
    public makePrivate = function(packable: PackableAny):PackablePrivate{
        if(packable.hasOwnProperty('name')){
            return this.newPrivatePackable(packable);
        } 
        return packable;
    }
    public makePrivateFromId = function(id:string){
        let original = this.storeSelector.getPackableById(id);
        return this.newPrivatePackable(original);
    }
    public makeComplete = function(packable: PackableAny): PackableBlueprint {
        let completePackable = this.storeSelector.getCompletePackables([packable])[0];
        return completePackable;
    }
    public makeCompleteFromArray = function(packables: PackableAny[]): PackableBlueprint[] {
        let completePackables = this.storeSelector.getCompletePackables(packables);
        return completePackables;
    }
}