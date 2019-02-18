import { Action } from '@ngrx/store';
import { userPermissions } from '../../user/store/userState.model';
import { State, User } from './adminState.model';

export const ADMIN_SET_USER = "ADMIN_SET_USER"
export const ADMIN_SET_PERMISSIONS = "ADMIN_SET_PERMISSIONS"
export const ADMIN_DELETE_USER = "ADMIN_DELETE_USER"
export const ADMIN_SIMULATE_USER = "ADMIN_SIMULATE_USER"

export class adminSimulateUser implements Action {
    readonly type = ADMIN_SIMULATE_USER;
    constructor(public payload: boolean){}
}

export class adminSetUsers implements Action {
    readonly type = ADMIN_SET_USER;
    constructor(public payload: User[]){}
}
export class adminSetPermissions implements Action {
    readonly type = ADMIN_SET_PERMISSIONS;
    constructor(public payload: {id: string, permissions:userPermissions}[]){
        console.log('dispatched adminSetPermissions action',payload)
    }
}
export class adminDeleteUser implements Action {
    readonly type = ADMIN_DELETE_USER;
    constructor(public payload: string[]){}
}


export type adminActions = adminSetUsers | adminDeleteUser | adminSetPermissions | adminSimulateUser;