import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableOriginal, PackablePrivate, PackableAny, PackableComplete, isPackableOriginal, isPackablePrivate, isPackableComplete, QuantityRule } from '../models/packable.model';
import { weatherFactory } from './weather.factory';

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
            p.subscribeToOriginal || true
        )
    }
    public clonePackableOriginal = (p: PackableOriginal): PackableOriginal => {
        return new PackableOriginal(
            p.id,
            p.name,
            p.icon,
            this.cloneQuantityRules(p.quantityRules),
            this.weatherFactory.deepCopy(p.weatherRules)
        )
    }

    public newPrivatePackable = function (original: PackableOriginal): PackablePrivate {
        let newPackable = new PackablePrivate(
            original.id,
            original.quantityRules.slice(),
            this.weatherFactory.deepCopy(original.weatherRules),
            true
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
    public makeComplete = (packable: PackableAny): PackableComplete => {
        if (isPackableOriginal(packable)) {
            return new PackableComplete(
                packable.id,
                packable.name,
                packable.icon,
                packable.quantityRules.slice(),
                this.weatherFactory.deepCopy(packable.weatherRules),
                true,
                packable
            )
        } else {
            let original = this.storeSelector.getPackableById(packable.id)
            return new PackableComplete(
                packable.id,
                original.name,
                original.icon,
                packable.subscribeToOriginal ? original.quantityRules.slice() : packable.quantityRules.slice(),
                packable.subscribeToOriginal ? this.weatherFactory.deepCopy(original.weatherRules) : this.weatherFactory.deepCopy(packable.weatherRules),
                packable.subscribeToOriginal,
                packable
            )
        }
    }
    public makeCompleteFromArray = (packables: PackableAny[]): PackableComplete[] => {
        let completePackables = packables.map(p => this.makeComplete(p))
        return completePackables;
    }
    public makeCompeleteFromIds = (ids: string[]): PackableComplete[] => {
        let originals = this.storeSelector.getPackablesByIds(ids)
        return this.makeCompleteFromArray(originals)
    }
    public completeToPrivate = (complete: PackableComplete): PackablePrivate => {
        if (isPackablePrivate(complete.parent)) {
            return complete.parent
        } else {
            return this.makePrivate(complete.parent)
        }
    }

}