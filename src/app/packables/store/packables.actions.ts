import { Action } from '@ngrx/store';
import { PackableOriginal } from '../../shared/models/packable.model';

export const ADD_ORIGINAL_PACKABLE = 'ADD_ORIGINAL_PACKABLE';
export const REMOVE_ORIGINAL_PACKABLE = 'REMOVE_ORIGINAL_PACKABLE';
export const EDIT_ORIGINAL_PACKABLE = 'EDIT_ORIGINAL_PACKABLE';

export class addOriginalPackable  implements Action{
    readonly type = ADD_ORIGINAL_PACKABLE;
    constructor(public payload: PackableOriginal){};
}
export class editOriginalPackable  implements Action{
    readonly type = EDIT_ORIGINAL_PACKABLE;
    constructor(public payload: PackableOriginal){};
}
export class removeOriginalPackable  implements Action{
    readonly type = REMOVE_ORIGINAL_PACKABLE;
    constructor(public payload: string){};
}

export type theActions = addOriginalPackable | editOriginalPackable | removeOriginalPackable;