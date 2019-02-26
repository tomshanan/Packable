import { Action } from "@ngrx/store";
import * as CollectionActions from './collections.actions';
import { CollectionPrivate, CollectionOriginal } from '../../shared/models/collection.model';
import { PackablePrivate, PackableOriginal } from '../../shared/models/packable.model';
import {objectInArray} from '../../shared/global-functions';

export interface State {
    collections: CollectionOriginal[];
}

const initialState = {
    collections: [],
}

export function collectionsReducers(state: State = initialState, action: CollectionActions.theActions) {
    let stateCollections = state.collections.slice();

    switch (action.type) {
        case CollectionActions.SET_COLLECTION_STATE:
            return {
                ...state,
                collections: action.payload
            }
        case CollectionActions.UPDATE_ORIGINAL_COLLECTION:
            const editId = action.payload.id;
            const editIndex = stateCollections.idIndex(editId);
            if(editIndex > -1){
                stateCollections[editIndex] = action.payload
            } else {
                stateCollections.unshift(action.payload)
            }
            return {
                ...state,
                collections: [...stateCollections]
            }
        case CollectionActions.REMOVE_ORIGINAL_COLLECTIONS:
            let ids = action.payload
            ids.forEach(id=>{
                let removeIndex = stateCollections.idIndex(id);
                if(removeIndex>-1){
                    stateCollections.splice(removeIndex,1)
                }
            })
            return {
                ...state,
                collections: [...stateCollections]
            }
        case CollectionActions.REMOVE_PACKABLES_FROM_COLLECTIONS:
            action.payload.forEach(id=>{
                stateCollections.forEach(collection =>{
                    const index = collection.packables.findIndex(p =>p.id === id);
                    if(index != -1){
                        collection.packables.splice(index,1);
                    }
                })
            })
            return {
                ...state,
                collections: [...stateCollections]
            }
        default:
            return state;
    }
}