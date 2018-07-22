import { ProfileComplete } from './models/profile.model';
import { CollectionComplete } from './models/collection.model';
import { PackableBlueprint } from './models/packable.model';


export class MemoryService {
    

    private _editingProfile: ProfileComplete;
    private _editingCollection: CollectionComplete;
    private _editingPackable: PackableBlueprint;
    
    setPackable(packable: PackableBlueprint) {
        this._editingPackable = packable;
        console.log('updated packable:', packable);
    }
    resetPackable() {
        this._editingPackable = null;
    }
    getPackable(): PackableBlueprint {
        return this._editingPackable ? {...this._editingPackable} : null;
    }

    setProfile(profile: ProfileComplete) {
        this._editingProfile = profile;
        console.log('updated profile:', profile);

    }
    resetProfile() {
        this._editingProfile = null;
    }
    getProfile() {
        return this._editingProfile ? {...this._editingProfile} : null;
    }

    setCollection(col: CollectionComplete) {
        this._editingCollection = col;
        console.log('> updated collection in memory:', col);
        
    }
    resetCollection() {
        this._editingCollection = null;
    }
    getCollection(): CollectionComplete {
        return this._editingCollection ? {...this._editingCollection} : null;
    }
    resetAll() {
        this.resetCollection();
        this.resetPackable();
        this.resetProfile();
        console.log('> reset memory');
        
    }
    get editState(): boolean {
        return (this._editingCollection != null || this._editingProfile != null || this._editingPackable != null);
    }


}