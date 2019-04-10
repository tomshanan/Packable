import { Action } from '@ngrx/store';
import { PackableOriginal } from '../../shared/models/packable.model';
import { CollectionOriginal } from '../../shared/models/collection.model';

export const ADD_ORIGINAL_PACKABLE = 'ADD_ORIGINAL_PACKABLE';
export const REMOVE_ORIGINAL_PACKABLES = 'REMOVE_ORIGINAL_PACKABLES';
export const UPDATE_ORIGINAL_PACKABLE = 'UPDATE_ORIGINAL_PACKABLE';
export const SET_PACKABLE_STATE = 'SET_PACKABLE_STATE';

export class setPackableState  implements Action{
    readonly type = SET_PACKABLE_STATE;
    constructor(public payload: PackableOriginal[]){};
}
export class updateOriginalPackables  implements Action{
    readonly type = UPDATE_ORIGINAL_PACKABLE;
    constructor(public payload: PackableOriginal[]){};
}
export class removeOriginalPackables  implements Action{
    readonly type = REMOVE_ORIGINAL_PACKABLES;
    constructor(public payload: string[]){};
}

export type theActions = updateOriginalPackables | removeOriginalPackables | setPackableState ;