import * as authActions from './auth.actions'

export interface State {
    loading: boolean;
    error: string,
    authenticated: boolean,
    token: string
}

const initialState:State = {
    loading:false,
    error: null,
    authenticated: false,
    token: null
}

export function AuthReducers(state: State = initialState, action: authActions.Actions):State {
    switch (action.type){
        case authActions.LOGIN:
        case authActions.REGISTER:
            return {
                ...state,
                authenticated: true
            }
        case authActions.SET_TOKEN:
            return {
                ...state,
                token: action.payload
            }
        case authActions.TRY_LOGIN:
        case authActions.TRY_REGISTER:
        case authActions.TRY_SET_TOKEN:
            return {
                ...state,
                loading: true,
                error:null
            }
        case authActions.LOGOUT:
            return {
                ...state,
                loading: false,
                error: null,
                token: null,
                authenticated: false
            }
        case authActions.AUTH_CLEAN:
            return {
                ...state,
                loading: false,
                error: null,
            }
        case authActions.AUTH_FAIL:
            return {
                ...state,
                authenticated: false,
                token: null,
                loading: false,
                error: action.payload
            }
        default:
        return state
    }
}