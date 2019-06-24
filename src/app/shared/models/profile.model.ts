import { PackablePrivate, PackableComplete } from './packable.model';
import { CollectionPrivate, CollectionComplete } from './collection.model';
import { isDefined, Guid, timeStamp } from '../global-functions';
import { ColorGeneratorService } from '../services/color-gen.service';
import { Injectable } from '@angular/core';
import { ItemMetaData } from '../library/library.model';

export class Avatar {
    constructor(
        public icon: string = 'default',
        public color: string|string[] = "white"
    ){
    }
}
export class Profile {
    constructor(
        public id: string = '',
        public name: string = '',
        public collections: CollectionPrivate[] = [],
        public avatar: Avatar = new Avatar(),
        public dateModified: number =  timeStamp(),
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
        public avatar: Avatar = new Avatar(),
        public dateModified: number =  timeStamp(),
    ) { }
}

export class ProfileWithMetadata extends Profile {
    metaData: ItemMetaData
    constructor(p:Profile, metaData: ItemMetaData){
        super(p.id,p.name,p.collections,p.avatar,p.dateModified)
        this.metaData = new ItemMetaData(p.id,metaData)
    }
}
export class ProfileCompleteWithMetadata extends ProfileComplete {
    metaData: ItemMetaData
    constructor(p:ProfileComplete, metaData: ItemMetaData){
        super(p.id,p.name,p.collections,p.avatar,p.dateModified)
        this.metaData = new ItemMetaData(p.id,metaData)
    }
}