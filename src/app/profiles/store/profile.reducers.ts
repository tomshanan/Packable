import { Action } from "@ngrx/store";
import { PackableOriginal, PackablePrivate } from '../../shared/models/packable.model';
import * as ProfileActions from './profile.actions';
import { Profile } from '../../shared/models/profile.model';
import { Guid } from "../../shared/global-functions";

export interface State {
    profiles: Profile[];
}

let profile1 = new Profile(Guid.newGuid(),'Tom',[],[])
let profile2 = new Profile(Guid.newGuid(),'Dan',[],[])

const initialState: State = {
    profiles: [ profile1, profile2]
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
        case ProfileActions.DELETE_PACKABLE:
            const deletePackableId = action.payload;
            const deletePackableProfiles = state.profiles.slice();
            deletePackableProfiles.forEach(profile =>{
                const index = profile.packables.findIndex(x => x.id === deletePackableId);
                if(index != -1){
                    profile.packables.splice(index,1);
                }
                profile.collections.forEach(collection=>{
                    const i = collection.packables.findIndex(x => x.id === deletePackableId)
                    if(index != -1){
                        collection.packables.splice(i,1);
                    }
                })
            })
            return {
                ...state,
                collections: [...deletePackableProfiles]
            }
        default:
            return state;
    }
}