import * as fromPackables from "../packables/store/packables.reducers";
import * as fromCollections from "../collections/store/collections.reducers";
import * as fromProfiles from "../profiles/store/profile.reducers";
import * as fromTrips from "../trips/store/trip.reducers";
import * as fromAuth from "../user/store/auth.reducers"
import * as fromUserModel from "../user/store/userState.model"
import * as fromUserReducers from "../user/store/user.reducers"
import * as fromaAdminModel from "../admin/store/adminState.model"
import * as fromaAdmin from "../admin/store/admin.reducers"
import * as fromLibraryModel from "@shared/library/library.model"
import * as fromLibrary from "@shared/library/library.reducers"
import { ActionReducerMap } from "@ngrx/store";


export interface appState {
    packables: fromPackables.State,
    collections: fromCollections.State,
    profiles: fromProfiles.State,
    trips: fromTrips.State,
    auth: fromAuth.State,
    user: fromUserModel.State,
    admin: fromaAdminModel.State,
    library: fromLibraryModel.State
}

export const reducers:ActionReducerMap<appState> = {
    packables: fromPackables.packablesReducers,
    collections: fromCollections.collectionsReducers,
    profiles: fromProfiles.profileReducers,
    trips: fromTrips.tripReducers,
    auth: fromAuth.AuthReducers,
    user: fromUserReducers.userReducers,
    admin: fromaAdmin.adminReducers,
    library: fromLibrary.libarayReducers
}