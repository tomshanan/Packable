import { Action } from '@ngrx/store';
import { State, ItemLibrary, MetaDataNode, destMetaDataNode } from './library.model';
export const SET_LIBRARY_STATE = "SET_LIBRARY_STATE"
export const UPDATE_META_DATA = "UPDATE_META_DATA"
export const LOAD_LIBRARY = "LOAD_LIBRARY"
export const LOAD_LIBRARY_ERROR = "LOAD_LIBRARY_ERROR"

export class SetLibraryState implements Action{
    readonly type = SET_LIBRARY_STATE;
    constructor(public payload: {library:ItemLibrary, metaData:MetaDataNode,destMetaData:destMetaDataNode}){};
}
export class UpdateMetaData implements Action{
    readonly type = UPDATE_META_DATA;
    constructor(public payload: MetaDataNode){};
}
export class loadLibrary implements Action{
    readonly type = LOAD_LIBRARY;
    constructor(){};
}
export class loadLibraryError implements Action{
    readonly type = LOAD_LIBRARY_ERROR;
    constructor(public payload: string){};
}

export type actionsTypes = SetLibraryState | UpdateMetaData | loadLibrary | loadLibraryError;