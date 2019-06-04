import { Action } from '@ngrx/store';
import { userPermissions, State as UserState, UserSettings } from './userState.model';
import { PackingListSettings } from '../../shared/models/packing-list.model';

export const SET_USER_PERMISSIONS = "SET_USER_PERMISSIONS"
export const SET_USER_SETTINGS = "SET_USER_SETTINGS"
export const SET_PACKING_LIST_SETTINGS = "SET_PACKING_LIST_SETTINGS"
export const SET_USER_STATE = "SET_USER_STATE"

export class setUserPermissions implements Action {
    readonly type = SET_USER_PERMISSIONS;
    constructor(public payload: userPermissions){}
}
export class setUserSettings implements Action {
    readonly type = SET_USER_SETTINGS;
    constructor(public payload: UserSettings){}
}
export class setPackingListSettings implements Action {
    readonly type = SET_PACKING_LIST_SETTINGS;
    constructor(public payload: PackingListSettings){}
}
export class setUserState implements Action {
    readonly type = SET_USER_STATE;
    constructor(public payload: UserState){}
}

export type userActions = setUserPermissions | setUserState | setUserSettings | setPackingListSettings;