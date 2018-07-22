import { Action } from '@ngrx/store';
import { Profile } from '../../shared/models/profile.model';
import { PackableOriginal } from '../../shared/models/packable.model';

export const ADD_PROFILE = 'ADD_PROFILE';
export const REMOVE_PROFILE = 'REMOVE_PROFILE';
export const EDIT_PROFILE = 'EDIT_PROFILE';
export const REPLACE_PACKABLE = 'REPLACE_PACKABLE';
export const DELETE_PACKABLE = 'DELETE_PACKABLE';

export class addProfile  implements Action{
    readonly type = ADD_PROFILE;
    constructor(public payload: Profile){};
}
export class editProfile  implements Action{
    readonly type = EDIT_PROFILE;
    constructor(public payload: Profile){};
}
export class removeProfile  implements Action{
    readonly type = REMOVE_PROFILE;
    constructor(public payload: string){};
}
export class deletePackable  implements Action{
    readonly type = DELETE_PACKABLE;
    constructor(public payload: string){};
}
export type theActions = addProfile | editProfile | removeProfile |  deletePackable;