import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../store-selector.service';
import { PackableOriginal, PackablePrivate, PackableAny, PackableComplete, isPackableOriginal, isPackablePrivate, isPackableComplete } from '../models/packable.model';

@Injectable()
export class PackableFactory{
    constructor(private storeSelector:StoreSelectorService){}
    public newPrivatePackable = function (original:PackableOriginal):PackablePrivate{
        let newPackable = new PackablePrivate(
            original.id,
            original.quantityRules.slice(),
            original.weatherRules.deepCopy(),
            true
        )
        return newPackable;
    }
    public restorePrivate = function(packable:PackablePrivate):PackablePrivate{
        let original = this.storeSelector.getPackableById(packable.id);
        return this.newPrivatePackable(original);
    }
    public makePrivate = function(packable: PackableAny):PackablePrivate{
        if(isPackableOriginal(packable)){
            return this.newPrivatePackable(packable);
        } 
        return packable;
    }
    
    public makePrivateFromId = function(id:string){
        let original = this.storeSelector.getPackableById(id);
        return this.newPrivatePackable(original);
    }
    public makeComplete = (packable: PackableAny): PackableComplete =>{
        if(isPackableOriginal(packable)){
            return new PackableComplete(
                packable.id,
                packable.name,
                packable.icon,
                packable.quantityRules.slice(),
                packable.weatherRules.deepCopy(),
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
                packable.subscribeToOriginal ? original.weatherRules.deepCopy() : packable.weatherRules.deepCopy(),
                packable.subscribeToOriginal,
                packable
            )
        }
    }
    public makeCompleteFromArray = (packables: PackableAny[]): PackableComplete[] => {
        let completePackables = packables.map(p=> this.makeComplete(p))
        return completePackables;
    }
    public makeCompeleteFromIds = (ids: string[]): PackableComplete[] => {
        let originals = this.storeSelector.getPackablesByIds(ids)
        return this.makeCompleteFromArray(originals)
    }
    public completeToPrivate = (complete: PackableComplete): PackablePrivate => {
        if(isPackablePrivate(complete.parent)){
            return complete.parent
        } else {
            return this.makePrivate(complete.parent)
        }
    }
    
}