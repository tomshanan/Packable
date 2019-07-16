import { PackableOriginal } from '../models/packable.model';
import { CollectionOriginal } from '../models/collection.model';
import { Profile, ProfileComplete } from '../models/profile.model';
import { timeStamp } from '../global-functions';

export type LibraryItem = PackableOriginal | CollectionOriginal | Profile;



export interface ItemLibrary{
    packables: PackableOriginal[],
    collections: CollectionOriginal[],
    profiles:Profile[]
}
export interface idCounter {[id:string]:number}
export class destMetaData {
    tripCount: number;
    collections: idCounter;
    constructor(metaData?:Partial<destMetaData>){
        if(metaData){
            this.tripCount = metaData.tripCount || 0;
            this.collections = metaData.collections || {};
        }
    }
}
export interface destMetaDataNode {[id:string]:destMetaData}

export type HasMetaData = {metaData:Metadata}

export class Metadata {
    id: string
    metaScore: number = 0 // a popularity score
    downloaded: number= 0 // How many users have imported this item (includes deleted items)
    deleted: number = 0 // how many users have deleted this item (does not include revived items)
    usedOnTrip: number = 0 // how many users have used this on a trip (does not include deleted trips or incomplete trips)
    modified: number = 0 // how many times users modified the item (does not include deleting the item)
    description: string = ''
    tags:string[] = []
    altNames:string[] = []
    constructor(id:string, metaData:Partial<Metadata> = {}){
        this.id = id
        Object.assign(this,metaData)
    }
}
export interface MetaDataNode {[id:string]:Metadata}

export interface State {
    library: ItemLibrary,
    metaData: MetaDataNode,
    destMetaData: destMetaDataNode,
    loading: boolean,
    loaded:boolean,
    error: string
}

export const initialLibrary: ItemLibrary = {
    packables: [],
    collections: [],
    profiles: []
}
export const initialLibraryState:State = {
    loaded:false,
    loading: false,
    error: null,
    library: initialLibrary,
    metaData: {},
    destMetaData: {}
}