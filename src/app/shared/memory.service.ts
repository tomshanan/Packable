import { ProfileComplete } from './models/profile.model';
import { CollectionComplete } from './models/collection.model';
import { PackableBlueprint } from './models/packable.model';
import { Trip } from './models/trip.model';


export class MemoryService {
    

    private _editingProfile: ProfileComplete;
    private _editingCollection: CollectionComplete;
    private _editingPackable: PackableBlueprint;
    private _editingTrip: Trip;
    
    setTrip(trip: Trip) {
        this._editingTrip = trip;
        console.log('updated trip in memory:', trip);
    }
    resetTrip() {
        this._editingTrip = null;
    }
    getTrip(): Trip {
        return this._editingTrip ? {...this._editingTrip} : null;
    }

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
        this.resetTrip();
        console.log('> reset memory');
        
    }
    get editState(): boolean {
        return (!!this._editingCollection || !!this._editingProfile || !!this._editingPackable || !!this._editingTrip);
    }


}