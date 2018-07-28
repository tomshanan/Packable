import { destinations } from './location-data-object';
import { Injectable } from '../../../node_modules/@angular/core';
import { Pipe } from '@angular/core';
export interface Destination {
    country:string,
    city:string,
    id:string
}
export interface DestinationConcatinated {
    destination:string,
    id:string
}

@Injectable()
export class DestinationDataService {
    private _destinations: Destination[];
    constructor(){
        this._destinations = destinations;
    }
    get destinations():Destination[]{
        return this._destinations.slice();
    }
    get concatDestinations():DestinationConcatinated[]{
        return this.destinations.map((dest,i,arr)=>{
            return {destination:this.placeToString(dest), id:dest.id}
        })
    }
    cityById(id:string):string{
        let dest = this._destinations.find(x=>x.id == id);
        return dest ? this._destinations.find(x=>x.id == id).city : undefined;
    }
    countryById(id:string):string{
        return this._destinations.find(x=>x.id == id).country
    }
    placeToStringById(id:string):string{
         let dest = this._destinations.find(x=>x.id == id)
         return dest ? this.placeToString(dest) : id;
    }
    placeToString(dest:Destination):string{
         return `${dest.city}, ${dest.country}`
    }
    
}