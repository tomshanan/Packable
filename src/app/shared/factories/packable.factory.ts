import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableOriginal, PackablePrivate, PackableAny, PackableComplete, isPackableOriginal, isPackablePrivate, isPackableComplete, QuantityRule,  PackableOriginalWithMetaData } from '../models/packable.model';
import { weatherFactory } from './weather.factory';
import { isDefined } from '../global-functions';
import { Metadata } from '../library/library.model';

function log (...args){
    //console.log('PACFAC',...args)
}

@Injectable()
export class PackableFactory {
    constructor(
        private storeSelector: StoreSelectorService,
        private weatherFactory: weatherFactory) { }

    public cloneQuantityRules = (q: any[]): QuantityRule[] => {
        let rules: QuantityRule[] = [];
        q.forEach(rule => {
            rules.push(new QuantityRule(
                rule.amount || 1,
                rule.type || 'period',
                rule.repAmount || 1
            ))
        })
        return rules
    }
    public clonePackablePrivate = (p: PackablePrivate): PackablePrivate => {
        return new PackablePrivate(
            p.id,
            this.cloneQuantityRules(p.quantityRules),
            this.weatherFactory.deepCopy(p.weatherRules),
            p.dateModified
        )
    }
    public clonePackableOriginal = (p: PackableOriginal): PackableOriginal => {
        return new PackableOriginal(
            p.id,
            p.name,
            this.cloneQuantityRules(p.quantityRules),
            this.weatherFactory.deepCopy(p.weatherRules),
            p.userCreated,
            p.dateModified,
            p.deleted
        )
    }

    public newPrivatePackable = function (original: PackableOriginal): PackablePrivate {
        let newPackable = new PackablePrivate(
            original.id,
            original.quantityRules.slice(),
            this.weatherFactory.deepCopy(original.weatherRules),
            original.dateModified
        )
        return newPackable;
    }
    public restorePrivate = function (packable: PackablePrivate): PackablePrivate {
        let original = this.storeSelector.getPackableById(packable.id);
        return this.newPrivatePackable(original);
    }
    public makePrivate = function (packable: PackableAny): PackablePrivate {
        if (isPackableOriginal(packable)) {
            return this.newPrivatePackable(packable);
        }
        return packable;
    }

    public makePrivateFromId = function (id: string) {
        let original = this.storeSelector.getPackableById(id);
        return this.newPrivatePackable(original);
    }
    public makeComplete = (p: PackableAny): PackableComplete => {
        if (isPackableOriginal(p)) {
            return new PackableComplete(
                p.id,
                p.name,
                p.quantityRules.slice(),
                this.weatherFactory.deepCopy(p.weatherRules),
                p.userCreated,
                p.dateModified,
                p.deleted
            )
        } else if (isPackablePrivate(p)){
            let original = this.storeSelector.getPackableById(p.id) || this.storeSelector.getRemotePackablesWithMetaData([p.id])[0]
            if(isDefined(original)){
                return new PackableComplete(
                    p.id,
                    original.name,
                    p.quantityRules.slice(),
                    this.weatherFactory.deepCopy(p.weatherRules),
                    original.userCreated,
                    p.dateModified,
                    original.deleted
                )
            } else {
                return undefined
            }
        }
    }
    public makeCompleteFromArray = (packables: PackableAny[]): PackableComplete[] => {
        let completePackables = packables.map(p => this.makeComplete(p))
        return completePackables;
    }
    public makeCompleteFromIds = (ids: string[]): PackableComplete[] => {
        let originals = this.storeSelector.getPackablesByIds(ids)
        return this.makeCompleteFromArray(originals)
    }

    public completeToPrivate = (completePackable: PackableComplete): PackablePrivate =>{
        return new PackablePrivate(
            completePackable.id,
            completePackable.quantityRules.slice(),
            this.weatherFactory.deepCopy(completePackable.weatherRules),
            completePackable.dateModified
        )
    }
    public completeToOriginal = (p: PackableComplete): PackableOriginal =>{
        return new PackableOriginal(
            p.id,
            p.name,
            p.quantityRules.slice(),
            this.weatherFactory.deepCopy(p.weatherRules),
            p.userCreated,
            p.dateModified,
            p.deleted
        )
    }

    public getQuantityStrings = (quantityRules: QuantityRule[]): string[] =>{
        let returnStrings = [];
        quantityRules.forEach(qr => {
            let {amount,repAmount,type} = qr
            let phrase: string = "";
            switch(type){
                case "period":
                    phrase = `${amount} per ${repAmount} day` + (repAmount>1 ? 's' : '');
                    break;
                case "profile":
                    phrase = `${amount} per Traveler`
                    break;
                case "trip":
                    phrase = `${amount} to Share`
                    break;
            }            
            returnStrings.push(phrase)
        })
        return returnStrings
    }
    public getAllPackablesWithMetaData():PackableOriginalWithMetaData[]{
        let local = this.storeSelector.originalPackables.filter(p=>!p.deleted)
        let remote = this.storeSelector.libraryState.library.packables.filter(p=>!local.hasId(p.id))
        return this.getPackablesWithMetaData([...local,...remote])
    }
    public getPackablesWithMetaData(packables:Array<PackableOriginal>):PackableOriginalWithMetaData[] {
        return packables.map(p=>{
            let metaData = this.storeSelector.getMetaDataForId(p.id) || new Metadata(p.id);
            return new PackableOriginalWithMetaData(p,metaData)
        })
    }
}