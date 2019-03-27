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
            let newCollections = action.payload
            newCollections.forEach(collection=>{
                const editIndex = stateCollections.idIndex(collection.id);
                if(editIndex > -1){
                    stateCollections[editIndex] = collection
                } else {
                    stateCollections.unshift(collection)
                }
            })
            console.log('collection state updated: ', stateCollections);
            
            return {
                ...state,
                collections: [...stateCollections]
            }
        case CollectionActions.REMOVE_ORIGINAL_COLLECTIONS:
            let ids = action.payload
            ids.forEach(id=>{
                let removeIndex = stateCollections.idIndex(id);
                if(removeIndex>-1){
                    let c = stateCollections[removeIndex]
                    if(c.userCreated){
                        stateCollections.splice(removeIndex,1)
                    } else {
                        c.deleted = true
                    }
                }
            })
            return {
                ...state,
                collections: [...stateCollections]
            }
        case CollectionActions.REMOVE_PACKABLES_FROM_COLLECTIONS:
            let pacIds = action.payload
            stateCollections.forEach(c => {
                c.packables = c.packables.filter(p=> !pacIds.includes(p.id))
            })
            return {
                ...state,
                collections: [...stateCollections]
            }
        default:
            return state;
    }
}