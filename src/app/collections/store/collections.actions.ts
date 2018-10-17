import { Action } from '@ngrx/store';
import { CollectionPrivate, CollectionOriginal } from '../../shared/models/collection.model';
import { PackableOriginal } from '../../shared/models/packable.model';

export const ADD_ORIGINAL_COLLECTION = 'ADD_COLLECTION';
export const REMOVE_ORIGINAL_COLLECTION = 'REMOVE_COLLECTION';
export const EDIT_ORIGINAL_COLLECTION = 'EDIT_COLLECTION';
export const DELETE_PACKABLE = 'DELETE_PACKABLE';
export const SET_COLLECTION_STATE = 'SET_COLLECTION_STATE';

export class setCollectionState  implements Action{
    readonly type = SET_COLLECTION_STATE;
    constructor(public payload: CollectionOriginal[]){};
}
export class addOriginalCollection  implements Action{
    readonly type = ADD_ORIGINAL_COLLECTION;
    constructor(public payload: CollectionOriginal){};
}
export class editOriginalCollection  implements Action{
    readonly type = EDIT_ORIGINAL_COLLECTION;
    constructor(public payload:CollectionOriginal){};
}
export class removeOriginalCollection  implements Action{
    readonly type = REMOVE_ORIGINAL_COLLECTION;
    constructor(public payload: string){};
}
export class deletePackable  implements Action{
    readonly type = DELETE_PACKABLE;
    constructor(public payload: string){};
}

export type theActions = addOriginalCollection | editOriginalCollection | removeOriginalCollection | deletePackable | setCollectionState;