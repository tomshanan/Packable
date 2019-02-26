import { State, initialLibraryState } from './library.model';
import * as libraryActions  from './library.actions';

export function libarayReducers(state = initialLibraryState, action: libraryActions.actionsTypes):State{
    switch(action.type){
        case libraryActions.SET_LIBRARY_STATE:
            return {
                library: action.payload.library,
                metaData: action.payload.metaData
            }
        case libraryActions.UPDATE_META_DATA:
            return {
                ...state,
                metaData: {...state.metaData, ...action.payload}
            }
        default:
            return state
    }
}