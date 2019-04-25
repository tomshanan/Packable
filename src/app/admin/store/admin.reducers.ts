import { State } from './adminState.model'
import * as adminActions from './admin.actions'

const initialState: State = {
    users: [],
    simulateUser: true
}

export function adminReducers(state = initialState, action: adminActions.adminActions) {
    let userState = state.users.slice()
    switch (action.type) {
        case adminActions.ADMIN_SIMULATE_USER:
            return { 
                ...state, 
                simulateUser: action.payload
            }
        case adminActions.ADMIN_SET_USER:
            return { 
                ...state, 
                users: action.payload 
            }
        case adminActions.ADMIN_SET_PERMISSIONS:
            let permissionsChanges = action.payload
            permissionsChanges.forEach(change => {
                let user = userState.findId(change.id)
                user.permissions = {...change.permissions}
            })
            return { 
                ...state, 
                users: userState 
            }
        case adminActions.ADMIN_DELETE_USER:
            let deleteIds = action.payload
            deleteIds.forEach(id => {
                userState = userState.filter(user=> user.id!==id)
            })
            return { 
                ...state, 
                users: userState 
            }
        default:
            return state;
    }

}