import { Action } from "@ngrx/store";
import { PackableOriginal } from '../../shared/models/packable.model';
import * as PackableActions from './packables.actions';

export interface State {
    packables: PackableOriginal[];
}

const initialState: State = {
    packables: [
        new PackableOriginal('Ski Pants', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Shorts', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Jumper', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Socks', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Radio', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Sunglasses', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Towel', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Gloves', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('lip balm', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Earphones', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('t-shirt', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Jacket', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Ski Goggles', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Hat', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }]),
        new PackableOriginal('Helmet', 'suitcase', [{ amount: 1, type: 'period', repAmount: 2 }])
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