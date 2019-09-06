import { State, userPermissions, defaultUserPermissions, defaultUserState } from "./userState.model";
import * as userActions from "./user.actions";

export function userReducers(state = defaultUserState, action: userActions.userActions){
    let statePermissions = {...state.permissions}
    let stateSettings = {...state.settings}
    switch(action.type){
        case userActions.SET_USER_STATE:
            return {
                ...state,
                ...action.payload,
                loaded:true,
                loading:false
            }
        case userActions.SET_USER_PERMISSIONS:
                statePermissions = {...statePermissions, ...action.payload}
            return {
                ...state, 
                permissions: statePermissions
            }
        case userActions.SET_USER_SETTINGS:
            return  {
                ...state,
                settings: action.payload
            }
        case userActions.SET_PACKING_LIST_SETTINGS:
                stateSettings.packinglistSettings = action.payload
            return  {
                ...state,
                settings: stateSettings
            }
        default:
            return state;
    }

}