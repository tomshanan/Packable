import { timeStamp, Guid } from '../global-functions';
import { Profile } from './profile.model';

export interface tripCollectionGroup {id:string,profiles: string[]}
export class Trip {
    constructor(
        public id: string = Guid.newGuid(),
        public startDate: string = '',
        public endDate: string = '',
        public destinationId: string = '',
        public profiles: string[] = [],
        public collections: tripCollectionGroup[] = [],
        public dateModified: number = timeStamp()
    ) {
    }
}

export class displayTrip {
    constructor(
        public id: string,
        public displayDate: string,
        public firstDate: string,
        public temp: string,
        public destinationName: string,
        public profileNames: string[],
        public collectionNames: string[],
        public dateModified: number
    ){
    }
}