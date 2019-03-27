import { PackableOriginal } from '../models/packable.model';
import { CollectionOriginal } from '../models/collection.model';
import { Profile } from '../models/profile.model';
import { timeStamp } from '../global-functions';

export type libraryItem = PackableOriginal | CollectionOriginal | Profile;

export class remoteCollection extends CollectionOriginal {
    metaData: ItemMetaData = new ItemMetaData()
    constructor(c:CollectionOriginal, metaData:ItemMetaData){
        super(c.id,c.name,c.packables,c.weatherRules,false,c.dateModified, c.locations)
        this.metaData = {...this.metaData,...metaData}
    }
}
export class remoteProfile extends Profile {
    metaData: ItemMetaData = new ItemMetaData()
    constructor(p:Profile, metaData: ItemMetaData){
        super(p.id,p.name,p.collections,p.avatar,p.dateModified)
        this.metaData = {...this.metaData,...metaData}
    }
}
export interface ItemLibrary{
    packables: PackableOriginal[],
    collections: CollectionOriginal[],
    profiles:Profile[]
}

export class ItemMetaData {
    metascore: number = 0
    downloaded: number= 0
    deleted: number = 0
    usedOnTrip: number = 0
    timesModified: number = 0
    updated: number = 0
    description: string = ''
    constructor(){
        this.updated = timeStamp()
    }
}
export interface MetaDataNode {[id:string]:ItemMetaData}

export interface State {
    library: ItemLibrary,
    metaData: MetaDataNode,
    loading: boolean
    error: string;
}

export const initialLibrary: ItemLibrary = {
    packables: [],
    collections: [],
    profiles: []
}
export const initialLibraryState:State = {
    loading: false,
    error: null,
    library: initialLibrary,
    metaData: {}
}