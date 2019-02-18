import { State } from './adminState.model'
import * as adminActions from './admin.actions'

const initialState: State = {
    users: []
}

export function adminReducers(state = initialState, action: adminActions.adminActions) {
    let userState = state.users.slice()
    switch (action.type) {
        case adminActions.ADMIN_SET_STATE:
            return { ...action.payload }
        case adminActions.ADMIN_SET_PERMISSIONS:
            let permissionsChanges = action.payload
            permissionsChanges.forEach(change => {
                let user = userState.findId(change.id)
                user.permissions = {...change.permissions}
            })
            let newState = { ...state, users: userState }
            console.log(`new state:\n`, newState);
            return newState
        case adminActions.ADMIN_DELETE_USER:
            let deleteIds = action.payload
            deleteIds.forEach(id => {
                userState = userState.filter(user=> user.id!==id)
            })
            return { ...state, users: userState }
        default:
            return state;
    }

}