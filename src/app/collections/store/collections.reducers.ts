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
        case CollectionActions.ADD_ORIGINAL_COLLECTION:
            return {
                ...state,
                collections: [...state.collections, action.payload]
            }
        case CollectionActions.EDIT_ORIGINAL_COLLECTION:
            const editId = action.payload.id;
            const editIndex = state.collections.findIndex(c => c.id == editId);
            const collection = state.collections[editIndex]
            const updatedCollection = {
                ...collection,
                ...action.payload
            }
            stateCollections[editIndex] = updatedCollection;
            return {
                ...state,
                collections: [...stateCollections]
            }
        case CollectionActions.REMOVE_ORIGINAL_COLLECTION:
            let removeIndex = state.collections.findIndex(c=>c.id==action.payload);
            const removeCollections = state.collections.slice();
            removeCollections.splice(removeIndex, 1);
            return {
                ...state,
                collections: [...removeCollections]
            }
        case CollectionActions.DELETE_COLLECTION_PACKABLES:
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