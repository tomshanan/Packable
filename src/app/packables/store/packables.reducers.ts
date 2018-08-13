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
    switch (action.type) {
        case PackableActions.ADD_ORIGINAL_PACKABLE:
            return {
                ...state,
                packables: [...state.packables, action.payload]
            }
        case PackableActions.EDIT_ORIGINAL_PACKABLE:
            
            let editPackable = action.payload;
            let editIndex = state.packables.findIndex(p => p.id == editPackable.id);
            const packable = state.packables[editIndex];
            const updatedPackable = {
                ...packable,
                ...action.payload
            }
            const updatedOriginalPackables = state.packables.slice();
            updatedOriginalPackables[editIndex] = updatedPackable;
            return {
                ...state,
                packables: [...updatedOriginalPackables]
            }
        case PackableActions.REMOVE_ORIGINAL_PACKABLE:
            const removeOriginalPackables = state.packables.slice();
            let removeIndex = removeOriginalPackables.findIndex(x=>x.id=== action.payload);
            removeOriginalPackables.splice(removeIndex, 1);
            return {
                ...state,
                packables: [...removeOriginalPackables]
            }
        default:
            return state;
    }
}