import { Action } from '@ngrx/store';
import { State, ItemLibrary, ItemMetaData, MetaDataNode } from './library.model';
export const SET_LIBRARY_STATE = "SET_LIBRARY_STATE"
export const UPDATE_META_DATA = "UPDATE_META_DATA"

export class SetLibraryState implements Action{
    readonly type = SET_LIBRARY_STATE;
    constructor(public payload: {library:ItemLibrary, metaData:MetaDataNode}){};
}
export class UpdateMetaData implements Action{
    readonly type = UPDATE_META_DATA;
    constructor(public payload: MetaDataNode){};
}

export type actionsTypes = SetLibraryState | UpdateMetaData;