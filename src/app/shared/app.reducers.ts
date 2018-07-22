import * as fromPackable from "../packables/store/packables.reducers";
import * as fromCollections from "../collections/store/collections.reducers";
import * as fromProfiles from "../profiles/store/profile.reducers";
import { ActionReducerMap } from "@ngrx/store";


export interface appState {
    packables: fromPackable.State,
    collections: fromCollections.State,
    profiles: fromProfiles.State
}

export const reducers:ActionReducerMap<appState> = {
    packables: fromPackable.packablesReducers,
    collections: fromCollections.collectionsReducers,
    profiles: fromProfiles.profileReducers
}