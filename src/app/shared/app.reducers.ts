import * as fromPackables from "../packables/store/packables.reducers";
import * as fromCollections from "../collections/store/collections.reducers";
import * as fromProfiles from "../profiles/store/profile.reducers";
import * as fromTrips from "../trips/store/trip.reducers";
import * as fromAuth from "../user/store/auth.reducers"
import { ActionReducerMap } from "@ngrx/store";


export interface appState {
    packables: fromPackables.State,
    collections: fromCollections.State,
    profiles: fromProfiles.State,
    trips: fromTrips.State,
    auth: fromAuth.State
}

export const reducers:ActionReducerMap<appState> = {
    packables: fromPackables.packablesReducers,
    collections: fromCollections.collectionsReducers,
    profiles: fromProfiles.profileReducers,
    trips: fromTrips.tripReducers,
    auth: fromAuth.AuthReducers
}