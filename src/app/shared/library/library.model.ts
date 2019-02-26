import { PackableOriginal } from '../models/packable.model';
import { CollectionOriginal } from '../models/collection.model';
import { Profile } from '../models/profile.model';

export interface ItemLibrary{
    packables: PackableOriginal[],
    collections: CollectionOriginal[],
    profiles:Profile[]
}
export interface ItemMetaData {
    metascore: number,
    downloaded: number,
    deleted: number,
    usedOnTrip: number,
    modified: number,
    updated: number
}
export interface MetaDataNode {[id:string]:ItemMetaData}

export interface State {
    library: ItemLibrary,
    metaData: MetaDataNode
}

export const initialLibrary: ItemLibrary = {
    packables: [],
    collections: [],
    profiles: []
}
export const initialLibraryState:State = {
    library: initialLibrary,
    metaData: {}
}