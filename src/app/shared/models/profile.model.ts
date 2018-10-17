import { PackablePrivate, PackableComplete } from './packable.model';
import { CollectionPrivate, CollectionComplete } from './collection.model';
import { isDefined, Guid } from '../global-functions';
import { ColorGeneratorService } from '../services/color-gen.service';
import { Injectable } from '@angular/core';

export class Avatar {
    constructor(
        public icon: string = 'default',
        public color: string = "white"
    ){
    }
}
export class Profile {
    constructor(
        public id: string = '',
        public name: string = '',
        public collections: CollectionPrivate[] = [],
        public avatar: Avatar = new Avatar(),
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
        public collections: CollectionComplete[] = [],
        public parent: Profile = new Profile(),
        public avatar: Avatar = new Avatar(),
    ) { }
}