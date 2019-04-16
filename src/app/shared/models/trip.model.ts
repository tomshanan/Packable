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

export class displayTrip {
    constructor(
        public id: string,
        public displayDate: string,
        public temp: string,
        public destinationName: string,
        public profileNames: string[],
        public collectionNames: string[],
        public dateModified: number
    ){
    }
}