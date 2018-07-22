import { PackablePrivate, PackableBlueprint } from './packable.model';
import { CollectionPrivate, CollectionComplete } from './collection.model';

export class Profile {
    constructor(
        public id: string,
        public name: string,
        public packables: PackablePrivate[],
        public collections: CollectionPrivate[]
    ) { }
}
export class ProfileComplete {
    constructor(
        public id: string,
        public name: string,
        public packables: PackableBlueprint[],
        public collections: CollectionComplete[]
    ) { }
}