import { Action } from '@ngrx/store';
import { userPermissions } from '../../user/store/userState.model';
import { State } from './adminState.model';

export const ADMIN_SET_STATE = "ADMIN_SET_STATE"
export const ADMIN_SET_PERMISSIONS = "ADMIN_SET_PERMISSIONS"
export const ADMIN_DELETE_USER = "ADMIN_DELETE_USER"

export class adminSetState implements Action {
    readonly type = ADMIN_SET_STATE;
    constructor(public payload: State){}
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


export type adminActions = adminSetState | adminDeleteUser | adminSetPermissions;