import { Destination } from '../services/location-data.service';
import { DayWeatherData, TripWeatherData } from '../services/weather.service';
import * as moment from 'moment';
import { timeStamp } from '../global-functions';
import { Avatar } from './profile.model';

export class packingListData {
    destination: Destination = null;
    totalDays: number = null;
    totalNights: number = null;
    weatherData: TripWeatherData = new TripWeatherData();
    constructor(data?: Partial<packingListData>) {
        if (data) {
            Object.assign(this, data)
        }
    }
}

export class Reason {
    constructor(
        public text: string,
        public active = true) {
    }

}
export class listCollection {
    header: string = ''
    id: string = ''
    packables: PackingListPackable[] = []
    constructor(list: Partial<listCollection> = {}) {
        Object.assign(this, list)
    }
    validPackables(): number {
        return this.packables.reduce((count, p) => {
            return pass(p) ? count + 1 : count
        }, 0)
    }
}

export class DisplayPackingList {
    header: string = ''
    id: string = ''
    avatar: Avatar = new Avatar()
    collections: listCollection[] = []
    constructor(list: Partial<DisplayPackingList> = {}) {
        Object.assign(this, list)
    }
}


export type ListPackableType = 'SHARED' | 'PRIVATE';

export interface PackingListPackable {
    profileID: string,
    collectionID: string,
    id: string,
    name: string,
    type: ListPackableType,
    userCreated:boolean,
    quantity: number,
    quantityReasons: Reason[],
    forceQuantity: boolean,
    checked: boolean,
    changedAfterChecked: boolean,
    passChecks: boolean,
    weatherReasons: Reason[],
    weatherNotChecked: boolean,
    forcePass: boolean,
    forceRemove:boolean,
    recentlyAdded: boolean,
    dateModified: number,
}

/**
    * @property showInvalid: boolean = false;
    * @property showWarnings: boolean  = true;
    * @property showCalculations: boolean  = false;
    * @property editMode:boolean = true;
 */
export class PackingListSettings {
    showInvalid: boolean = false;
    showWarnings: boolean = true;
    showCalculations: boolean = false;
    editMode: boolean = true;
    constructor(settings?: Partial<PackingListSettings>) {
        if (settings) {
            Object.assign(this, settings)
        }
    }
}


export class PackingList {
    constructor(
        public id: string,
        public data: packingListData = new packingListData(),
        public packables: PackingListPackable[] = [],
        public dateModified: number = timeStamp(),
    ) { }

}

export function pass(p: PackingListPackable): boolean {
    return !p.forceRemove && (p.passChecks || p.forcePass) && p.quantity > 0
}