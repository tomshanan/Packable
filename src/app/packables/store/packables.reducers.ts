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
            return {
                ...state,
                packables: action.payload
            }
        case PackableActions.UPDATE_ORIGINAL_PACKABLE:
            let payloadPackable: PackableOriginal = action.payload;
            let editIndex: number = statePackables.idIndex(payloadPackable.id);
            if(editIndex > -1){
                statePackables[editIndex] = payloadPackable
            } else{
                statePackables.unshift(payloadPackable)
            }
            return {
                ...state,
                packables: [...statePackables]
            }
        case PackableActions.REMOVE_ORIGINAL_PACKABLES:
            action.payload.forEach(id=>{
                let removeIndex = statePackables.findIndex(x=>x.id=== id);
                statePackables.splice(removeIndex, 1);
            })
            return {
                ...state,
                packables: [...statePackables]
            }
        default:
            return state;
    }
}