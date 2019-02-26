import { Action } from '@ngrx/store';
import { CollectionPrivate, CollectionOriginal } from '../../shared/models/collection.model';
import { PackableOriginal } from '../../shared/models/packable.model';

export const REMOVE_ORIGINAL_COLLECTIONS = 'REMOVE_COLLECTION';
export const UPDATE_ORIGINAL_COLLECTION = 'EDIT_COLLECTION';
export const REMOVE_PACKABLES_FROM_COLLECTIONS = 'REMOVE_PACKABLES_FROM_COLLECTIONS';
export const SET_COLLECTION_STATE = 'SET_COLLECTION_STATE';

export class setCollectionState  implements Action{
    readonly type = SET_COLLECTION_STATE;
    constructor(public payload: CollectionOriginal[]){};
}
export class updateOriginalCollection  implements Action{
    readonly type = UPDATE_ORIGINAL_COLLECTION;
    constructor(public payload:CollectionOriginal){};
}
export class removeOriginalCollections  implements Action{
    readonly type = REMOVE_ORIGINAL_COLLECTIONS;
    constructor(public payload: string[]){};
}
export class removePackablesFromAllCollections  implements Action{
    readonly type = REMOVE_PACKABLES_FROM_COLLECTIONS;
    constructor(public payload: string[]){};
}

export type theActions = updateOriginalCollection | removeOriginalCollections | removePackablesFromAllCollections | setCollectionState;