import { Action } from "@ngrx/store";
import { PackableOriginal, PackablePrivate } from '../../shared/models/packable.model';
import * as ProfileActions from './profile.actions';
import { Profile } from '../../shared/models/profile.model';
import { Guid, indexOfId } from '../../shared/global-functions';

export interface State {
    profiles: Profile[];
}

const initialState: State = {
    profiles: []
}
export function profileReducers(state = initialState, action: ProfileActions.theActions) {
    let id: string;
    let index: number;
    let profile:Profile;
    let updatedProfile: Profile;
    let stateProfiles = state.profiles.slice();

    switch (action.type) {
        case ProfileActions.ADD_PROFILE:
            profile = action.payload;
            return {
                ...state,
                profiles: [...state.profiles, profile]
            }
        case ProfileActions.EDIT_PROFILE:
            id = action.payload.id;
            index = state.profiles.findIndex(p=>p.id === id);
            profile = stateProfiles[index];
            updatedProfile = {
                ...profile,
                ...action.payload
            }
            stateProfiles[index] = updatedProfile;
            return {
                ...state,
                profiles: [...stateProfiles]
            }
        case ProfileActions.REMOVE_PROFILE:
            id = action.payload;
            index = state.profiles.findIndex(p=>p.id == id)
            stateProfiles.splice(index,1);
            return {
                ...state,
                profiles: [...stateProfiles]
            }
        case ProfileActions.DELETE_PROFILE_PACKABLES:
            let ids = action.payload;
            ids.forEach(id=>{
                stateProfiles.forEach(profile => {
                    profile.collections.forEach(collection =>{
                        let i = indexOfId(collection.packables,id)
                        if (i>-1){
                            collection.packables.splice(i,1)
                        }
                    })
                });
            });
            return {
                ...state,
                profiles: [...stateProfiles]
            }
        case ProfileActions.DELETE_PROFILE_COLLECTION:
            id = action.payload
            stateProfiles.map((profile)=>{
                profile.collections = profile.collections.filter(c=>c.id != id)
                return profile
            })
            return {
                ...state,
                profiles: [...stateProfiles]
            }
        case ProfileActions.SET_PROFILE_STATE:
            stateProfiles = action.payload
            return {
                ...state,
                profiles: stateProfiles
            }
        default:
            return state;
    }
}