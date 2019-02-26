import { State, userPermissions, defaultUserPermissions, defaultUserConfigState } from "./userState.model";
import * as userActions from "./user.actions";

export function userReducers(state = defaultUserConfigState, action: userActions.userActions){
    let statePermissions = {...state.permissions}
    switch(action.type){
        case userActions.SET_USER_STATE:
            return {...action.payload}
        case userActions.SET_USER_PERMISSIONS:
            return {
                ...state, 
                permissions: action.payload
            }
        case userActions.SET_USER_SETTINGS:
            return  {
                ...state,
                userConfig: action.payload
            }
        default:
            return state;
    }

}