import { Action } from "@ngrx/store";
import * as CollectionActions from './collections.actions';
import { CollectionPrivate, CollectionOriginal } from '../../shared/models/collection.model';
import { PackablePrivate, PackableOriginal } from '../../shared/models/packable.model';
import {objectInArray} from '../../shared/global-functions';

export interface State {
    collections: CollectionOriginal[];
}

const initialState = {
    collections: [
        new CollectionOriginal(
            'Winter Clothes',
            false,
            [],
            [],
            []
        ),
        new CollectionOriginal(
            'Summer Clothes',
            true,
            [],
            [],
            []
        )
    ],
}

export function collectionsReducers(state: State = initialState, action: CollectionActions.theActions) {
    switch (action.type) {
        case CollectionActions.ADD_ORIGINAL_COLLECTION:
            return {
                ...state,
                collections: [...state.collections, action.payload]
            }
        case CollectionActions.EDIT_ORIGINAL_COLLECTION:
            console.log('Payload:',action.payload);
            const editId = action.payload.id;
            const editIndex = state.collections.findIndex(c => c.id == editId);
            const collection = state.collections[editIndex]
            const updatedCollection = {
                ...collection,
                ...action.payload
            }
            const updatedCollections = state.collections.slice();
            updatedCollections[editIndex] = updatedCollection;
            return {
                ...state,
                collections: [...updatedCollections]
            }
        case CollectionActions.REMOVE_ORIGINAL_COLLECTION:
            let removeIndex = state.collections.findIndex(c=>c.id==action.payload);
            const removeCollections = state.collections.slice();
            removeCollections.splice(removeIndex, 1);
            return {
                ...state,
                collections: [...removeCollections]
            }
        case CollectionActions.DELETE_PACKABLE:
            const deletePackableId = action.payload;
            const deletePackableCollections = state.collections.slice();
            deletePackableCollections.forEach(collection =>{
                const index = collection.packables.findIndex(x =>x === deletePackableId);
                if(index != -1){
                    collection.packables.splice(index,1);
                }
            })
            return {
                ...state,
                collections: [...deletePackableCollections]
            }
        default:
            return state;
    }
}