
export class Trip {
    constructor(
        public id: string,
        public startDate: string,
        public endDate: string,
        public destinationId: string,
        public profiles: string[],
        public activities: string[],
        public updated: string
    ) {
    }
}

export interface displayTrip {
    id: string,
    displayDate: string,
    temp: string,
    destinationName: string,
    profileNames: string[],
    activityNames: string[],
    updated: string
}