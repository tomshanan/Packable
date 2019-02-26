import { Action } from '@ngrx/store';
import { Profile } from '../../shared/models/profile.model';
import { PackableOriginal } from '../../shared/models/packable.model';

export const ADD_PROFILE = 'ADD_PROFILE';
export const REMOVE_PROFILE = 'REMOVE_PROFILE';
export const EDIT_PROFILES = 'EDIT_PROFILES';
export const DELETE_PACKABLES_FROM_PROFILES = 'DELETE_PACKABLES_FROM_PROFILES';
export const DELETE_COLLECTIONS_FROM_PROFILES = 'DELETE_COLLECTIONS_FROM_PROFILES';

export const SET_PROFILE_STATE = 'SET_PROFILE_STATE';

export class setProfileState  implements Action{
    readonly type = SET_PROFILE_STATE;
    constructor(public payload: Profile[]){};
}

export class addProfile  implements Action{
    readonly type = ADD_PROFILE;
    constructor(public payload: Profile){};
}
export class editProfiles  implements Action{
    readonly type = EDIT_PROFILES;
    constructor(public payload: Profile[]){};
}
export class removeProfile  implements Action{
    readonly type = REMOVE_PROFILE;
    constructor(public payload: string){};
}
export class deleteProfilePackables  implements Action{
    readonly type = DELETE_PACKABLES_FROM_PROFILES;
    constructor(public payload: string[]){};
}
export class deleteProfileCollection  implements Action{
    readonly type = DELETE_COLLECTIONS_FROM_PROFILES;
    constructor(public payload: string){};
}
export type theActions = addProfile | editProfiles | removeProfile |  deleteProfilePackables | setProfileState | deleteProfileCollection;