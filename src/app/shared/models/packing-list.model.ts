import { Destination } from '../services/location-data.service';
import { WeatherObject, weatherData } from '../services/weather.service';
import * as moment from 'moment';

export class packingListData {
    destination:Destination = null;
    totalDays:number = null;
    totalNights:number = null;
    weatherData: weatherData = new weatherData();
    constructor(){
    }
}

export class Reason {
    constructor(
        public text: string,
        public active = true){
    }

}
export interface PackingListPackable {
    profileID: string,
    collectionID: string,
    packableID: string,
    quantity: number,
    quantityReasons: Reason[],
    checked: boolean,
    changedAfterChecked: boolean,
    weatherNotChecked?: boolean,
    recentlyAdded?:boolean
}

export class PackingList {
    constructor(
        public id: string,
        public updated: string = moment().format(),
        public data: packingListData = new packingListData(),
        public packables: PackingListPackable[] =[],
        public dataInput: 'auto' | 'manual' = 'auto'
    ){}

}