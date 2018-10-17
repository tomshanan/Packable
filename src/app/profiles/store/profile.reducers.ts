import { Action } from "@ngrx/store";
import { PackableOriginal, PackablePrivate } from '../../shared/models/packable.model';
import * as ProfileActions from './profile.actions';
import { Profile } from '../../shared/models/profile.model';
import { Guid } from "../../shared/global-functions";

export interface State {
    profiles: Profile[];
}

const initialState: State = {
    profiles: []
}
export function profileReducers(state = initialState, action: ProfileActions.theActions) {
    switch (action.type) {
        case ProfileActions.ADD_PROFILE:
            return {
                ...state,
                profiles: [...state.profiles, action.payload]
            }
        case ProfileActions.EDIT_PROFILE:
            const editId = action.payload.id;
            const editIndex = state.profiles.findIndex(p=>p.id === editId);
            const profile = state.profiles[editIndex];
            const updatedProfile = {
                ...profile,
                ...action.payload
            }
            const updatedProfiles = state.profiles.slice();
            updatedProfiles[editIndex] = updatedProfile;
            return {
                ...state,
                profiles: [...updatedProfiles]
            }
        case ProfileActions.REMOVE_PROFILE:
            let removeId = action.payload;
            let removeIndex = state.profiles.findIndex(p=>p.id == removeId)
            const removeProfiles = state.profiles.slice();
            removeProfiles.splice(removeIndex,1);
            return {
                ...state,
                profiles: [...removeProfiles]
            }
        case ProfileActions.DELETE_PROFILE_PACKABLE:
            const deletePackableId = action.payload;
            const deletePackableProfiles = state.profiles.slice();
            deletePackableProfiles.map(profile =>{
                profile.collections.map(collection=>{
                    collection.packables = collection.packables.filter(x => x.id !== deletePackableId)
                    return collection
                })
                return profile
            })
            return {
                ...state,
                profiles: [...deletePackableProfiles]
            }
        case ProfileActions.DELETE_PROFILE_COLLECTION:
            const dcp_id = action.payload
            let dpc_state_profiles = state.profiles.slice()
            dpc_state_profiles.map((profile)=>{
                profile.collections = profile.collections.filter(c=>c.id != dcp_id)
                return profile
            })
            return {
                ...state,
                profiles: [...dpc_state_profiles]
            }


        case ProfileActions.SET_PROFILE_STATE:
            return {
                ...state,
                profiles: action.payload
            }
        default:
            return state;
    }
}