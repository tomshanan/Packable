import { Destination } from '../services/location-data.service';
import { DayWeatherData, TripWeatherData } from '../services/weather.service';
import * as moment from 'moment';
import { timeStamp } from '../global-functions';

export class packingListData {
    destination:Destination = null;
    totalDays:number = null;
    totalNights:number = null;
    weatherData: TripWeatherData = new TripWeatherData();
    constructor(data?:Partial<packingListData>){
        if(data){
            Object.assign(this,data)
        }
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
    id: string,
    name: string,
    quantity: number,
    quantityReasons: Reason[],
    forceQuantity: boolean,
    checked: boolean,
    changedAfterChecked: boolean,
    passChecks: boolean,
    weatherReasons: Reason[],
    weatherNotChecked: boolean,
    forcePass: boolean,
    recentlyAdded?:boolean,
}

export class PackingListSettings {
    showInvalid: boolean = false;
    showWarnings: boolean  = true;
    showCalculations: boolean  = false;
    constructor(settings?:Partial<PackingListSettings>){
        if(settings){
            Object.assign(this,settings)
        }
    }
}


export class PackingList {
    constructor(
        public id: string,
        public data: packingListData = new packingListData(),
        public packables: PackingListPackable[] =[],
        public dateModified: number = timeStamp(),
    ){}

}