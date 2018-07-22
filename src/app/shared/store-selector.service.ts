import { Store } from "@ngrx/store";
import * as fromApp from './app.reducers'
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { PackableOriginal, PackablePrivate, PackableAny, PackableBlueprint, ActivityRule } from './models/packable.model';
import { CollectionOriginal, CollectionAny, CollectionComplete } from './models/collection.model';
import { Profile, ProfileComplete } from "../shared/models/profile.model";

@Injectable()
export class StoreSelectorService{    
    public packables_obs:Observable<{packables: PackableOriginal[]}>;
    public collections_obs:Observable<{collections: CollectionOriginal[]}>;
    public profiles_obs:Observable<{profiles: Profile[]}>;

    public originalPackables: PackableOriginal[];
    public originalCollections: CollectionOriginal[];
    public profiles: Profile[];

    constructor(private store:Store<fromApp.appState>){
        this.packables_obs = this.store.select('packables');
        this.collections_obs = this.store.select('collections');
        this.profiles_obs = this.store.select('profiles');

        this.packables_obs.subscribe(packablesState =>{
            this.originalPackables = packablesState.packables;
        })
        this.collections_obs.subscribe(collectionState =>{
            this.originalCollections = collectionState.collections;
        })
        this.profiles_obs.subscribe(profileState =>{
            this.profiles = profileState.profiles;
        })
    }
    getPackableById(id:string):PackableOriginal {
        let index = this.originalPackables.findIndex(x => x.id === id);
        return index >= 0 ? this.originalPackables[index]: null;
    }
    getPackablesByIds(ids:string[]):PackableBlueprint[] {
        let originalPackables:PackableOriginal[] = [];
        ids.forEach((id,i,arr)=>{
            let packable = this.getPackableById(id);
            originalPackables.push(packable);
        })
        return originalPackables;
    }
    getProfileById(id:string):Profile{
        let foundPorfile:Profile;
        let index = this.profiles.findIndex(x => x.id === id)
        return index >= 0 ? this.profiles[index]: null;
    }
    getCompleteProfiles(profiles: Profile[]): ProfileComplete[]{
        return profiles.map(profile => {
            let completePackables = this.getCompletePackables(profile.packables);
            let completeCollections = this.getCompleteCollections(profile.collections)
            return {
                ...profile,
                packables: completePackables,
                collections: completeCollections
            }
        })
    }
    getCollectionById(id:string):CollectionOriginal {
        let index = this.originalCollections.findIndex(x => x.id === id);
        return index >= 0 ? this.originalCollections[index]: null;
    }
    getCompletePackables(packables:PackableAny[]):PackableBlueprint[]{
        console.log(packables);
        let returnPackables = packables.map(packable =>{
            let original = this.originalPackables.find(x=>x.id===packable.id);
            return {
                ...original,
                ...packable
            }
        })
        return returnPackables;
    }
    getCompleteCollections(collections:CollectionAny[]):CollectionComplete[]{
        console.log('>> Getting Complete Collection')
        let returnCollections = collections.map(collection =>{
            let original = this.originalCollections.find(x=>x.id===collection.id);
            console.log('original collection:',original)
            let completePackables = (<any[]>collection.packables).map(packable => {
                if(packable.hasOwnProperty('id')){
                    return this.getCompletePackables([packable])[0]
                } else {
                    let original = this.getPackableById(<string>packable);
                    let complete = this.getCompletePackables([original])[0]
                    return complete
                }
            })
            console.log('complete packables:',completePackables)
            return {
                ...original,
                ...collection,
                packables: completePackables
            }
        })
        return <CollectionComplete[]>returnCollections;
    }

    getUsedCollectionNames():string[]{
        let usedNames = [];
        for (let collection of this.originalCollections) {
            usedNames.push(collection.name.toLowerCase());
        }
        return usedNames;
    }
    getUsedPackableNames():string[]{
        let usedNames = [];
        for (let packable of this.originalPackables) {
            usedNames.push(packable.name.toLowerCase());
        }
        return usedNames;
    }
}