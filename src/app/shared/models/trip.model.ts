import { Profile } from "./profile.model";
import { CollectionPrivate } from './collection.model';

export class Trip{
    constructor(
        public id: string,
        public startDate: string,
        public endDate: string,
        public destinationId: string,
        public profiles: string[],
        public activities: string[],
        public updated: string
    ){
    }
}