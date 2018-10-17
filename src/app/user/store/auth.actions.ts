import { Action } from '@ngrx/store';

export const TRY_REGISTER = 'TRY_REGISTER'
export const REGISTER = 'REGISTER'
export const TRY_LOGIN = 'TRY_LOGIN'
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const TRY_SET_TOKEN = 'TRY_SET_TOKEN'
export const SET_TOKEN = 'SET_TOKEN'
export const AUTH_FAIL = 'AUTH_FAIL'
export const AUTH_CLEAN = 'AUTH_CLEAN'

export class TryRegister implements Action {
    readonly type = TRY_REGISTER
    constructor(public payload: {email:string, password:string}){}
}
export class TryLogin implements Action {
    readonly type = TRY_LOGIN
    constructor(public payload: {email:string, password:string}){}
}

export class TrySetToken implements Action {
    readonly type = TRY_SET_TOKEN
    constructor (public payload: string){}
}

export class AuthFail implements Action {
    readonly type = AUTH_FAIL
    constructor (public payload: string){}
}
export class AuthClean implements Action {
    readonly type = AUTH_CLEAN
}

export class Register implements Action {
    readonly type = REGISTER
}
export class Login implements Action {
    readonly type = LOGIN
}
export class Logout implements Action { 
    readonly type = LOGOUT
}
export class SetToken implements Action {
    readonly type = SET_TOKEN
    constructor (public payload: string){}
}

export type Actions = Register | Login | Logout | SetToken | TryLogin | TryRegister | TrySetToken | AuthFail | AuthClean;