import { timeStamp, Guid } from '../global-functions';

export class Trip {
    constructor(
        public id: string = Guid.newGuid(),
        public startDate: string = '',
        public endDate: string = '',
        public destinationId: string = '',
        public profiles: string[] = [],
        public collections: string[] = [],
        public dateModified: number = timeStamp()
    ) {
    }
}

export interface displayTrip {
    id: string,
    displayDate: string,
    temp: string,
    destinationName: string,
    profileNames: string[],
    collectionNames: string[],
    dateModified: number
}