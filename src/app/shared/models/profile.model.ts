import { PackablePrivate, PackableComplete } from './packable.model';
import { CollectionPrivate, CollectionComplete } from './collection.model';
import { isDefined, Guid } from '../global-functions';

export class Profile {
    constructor(
        public id: string = '',
        public name: string = '',
        public packables: PackablePrivate[] = [],
        public collections: CollectionPrivate[] = []
    ) { 
        if(!isDefined(id)){
            this.id = Guid.newGuid();
        }
    }
}
export class ProfileComplete {
    constructor(
        public id: string = '',
        public name: string = '',
        public packables: PackableComplete[] = [],
        public collections: CollectionComplete[] = [],
        public parent: Profile = new Profile()
    ) { }
}