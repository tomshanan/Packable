import { Action } from "@ngrx/store";
import { PackableOriginal } from '../../shared/models/packable.model';
import * as PackableActions from './packables.actions';

export interface State {
    packables: PackableOriginal[];
}

const initialState: State = {
    packables: [
    ]
}
export function packablesReducers(state = initialState, action: PackableActions.theActions) {
    let statePackables = state.packables.slice();
    switch (action.type) {
        case PackableActions.SET_PACKABLE_STATE:
            let state_set = {
                ...state,
                packables: action.payload
            }
            console.log(`PACKABLE REDUCERS: Set state:`, state_set);
            return state_set

        case PackableActions.UPDATE_ORIGINAL_PACKABLE:
            let payloadPackables: PackableOriginal[] = action.payload;
            payloadPackables.forEach(p=>{
                let editIndex: number = statePackables.idIndex(p.id);
                if(editIndex > -1){
                    statePackables[editIndex] = p
                } else{
                    statePackables.unshift(p)
                }
            })
            return {
                ...state,
                packables: [...statePackables]  
            }
        case PackableActions.REMOVE_ORIGINAL_PACKABLES:
            action.payload.forEach(id=>{
                let removeIndex = statePackables.idIndex(id);
                if(statePackables[removeIndex].userCreated){
                    statePackables.splice(removeIndex, 1);
                } else {
                    statePackables[removeIndex].deleted = true
                }
            })
            return {
                ...state,
                packables: [...statePackables]
            }
        case PackableActions.ADD_MISSING_PACKABLES_FROM_COLLECTIONS:
            let collectionPackables: PackableOriginal[] = action.payload;
            collectionPackables.forEach(newPac=>{
                let index = statePackables.idIndex(newPac.id)
                if(index === -1){
                    statePackables.unshift(newPac)
                } else if (statePackables[index].deleted && !statePackables[index].userCreated){
                    statePackables[index] = newPac
                }
            })
            return {
                ...state,
                packables: [...statePackables]
            }
        default:
            return state;
    }
}