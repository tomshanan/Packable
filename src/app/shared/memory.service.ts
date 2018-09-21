import { ProfileComplete, Profile } from './models/profile.model';
import { CollectionOriginal, CollectionPrivate } from './models/collection.model';
import { PackableOriginal, PackablePrivate } from './models/packable.model';
import { Trip } from './models/trip.model';
import { isDefined } from './global-functions';

export type memoryProperty = 'PRIVATE_PACKABLE' | 'ORIGINAL_PACKABLE' | 'ORIGINAL_COLLECTION' | 'PRIVATE_COLLECTION' | 'PROFILE' | 'TRIP' | 'UNSAVED_PACKABLE' | 'UNSAVED_COLLECTION' | 'UNSAVED_PROFILE' | 'UNSAVED_TRIP';
export interface memoryObject {
    privatePackable: PackablePrivate,
    originalPackable: PackableOriginal,
    originalCollection: CollectionOriginal,
    privateCollection: CollectionPrivate,
    profile: Profile,
    trip: Trip,
    unsaved_profile: boolean,
    unsaved_collection: boolean,
    unsaved_packable: boolean,
    unsaved_trip: boolean,
}
export class MemoryService {
    

    private _editingProfile: Profile;
    private _editingOriginalCollection: CollectionOriginal;
    private _editingOriginalPackable: PackableOriginal;
    private _editingPrivateCollection: CollectionPrivate;
    private _editingPrivatePackable: PackablePrivate;
    private _editingTrip: Trip;
    private _unsaved_profile: boolean = null;
    private _unsaved_collection: boolean = null;
    private _unsaved_packable: boolean = null;
    private _unsaved_trip: boolean = null;
 
    
    set(property:memoryProperty, value:any){
        switch(property){
            case 'ORIGINAL_COLLECTION': this._editingOriginalCollection = value; break;
            case 'ORIGINAL_PACKABLE': this._editingOriginalPackable = value; break;
            case 'PRIVATE_COLLECTION': this._editingPrivateCollection = value; break;
            case 'PRIVATE_PACKABLE': this._editingPrivatePackable = value; break;
            case 'PROFILE': this._editingProfile = value; break;
            case 'TRIP': this._editingTrip = value; break;
            case 'UNSAVED_COLLECTION': this._unsaved_collection = value; break;
            case 'UNSAVED_PACKABLE': this._unsaved_packable = value; break;
            case 'UNSAVED_PROFILE': this._unsaved_profile = value; break;
            case 'UNSAVED_TRIP': this._unsaved_trip = value; break;
        }
        value && console.log(`set ${property} in memory:`,value)
    }
    get(property:memoryProperty){
        switch(property){
            case 'ORIGINAL_COLLECTION': return this._editingOriginalCollection ? {...this._editingOriginalCollection} : null
            case 'ORIGINAL_PACKABLE': return this._editingOriginalPackable ? {...this._editingOriginalPackable} : null
            case 'PRIVATE_COLLECTION': return this._editingPrivateCollection ? {...this._editingPrivateCollection } : null
            case 'PRIVATE_PACKABLE': return this._editingPrivatePackable ? {...this._editingPrivatePackable} : null
            case 'PROFILE': return this._editingProfile ? {...this._editingProfile} : null
            case 'TRIP': return this._editingTrip ? {...this._editingTrip} : null
            case 'UNSAVED_COLLECTION': return this._unsaved_collection
            case 'UNSAVED_PACKABLE': return this._unsaved_packable
            case 'UNSAVED_PROFILE': return this._unsaved_profile
            case 'UNSAVED_TRIP': return this._unsaved_trip
        }
    }

    reset(property:memoryProperty){
        this.set(property,null)
    }

    // // UNSAVED______________________________________________
    // setUnsaved(bool: boolean) {
    //     this._unsaved = bool;
    //     console.log('updated  unsaved in mem:', bool); 
    // }
    // resetUnsaved() {
    //     this._unsaved = null;
    // }
    // get unsaved(): boolean {
    //     return this._unsaved;
    // }

    // // PRIVATE PACKABLE_______________________________________________
    // setPrivatePackable(packable: PackablePrivate) {
    //     this._editingPrivatePackable = packable;
    //     console.log('updated  private packable in mem:', packable);
    // }
    // resetPrivatePackable() {
    //     this._editingPrivatePackable = null;
    // }
    // getPrivatePackable(): PackablePrivate {
    //     return this._editingPrivatePackable ? {...this._editingPrivatePackable} : null;
    // }

    // // ORIGINAL PACKABLE_______________________________________________
    // setOriginalPackable(packable: PackableOriginal) {
    //     this._editingOriginalPackable = packable;
    //     console.log('updated original packable in mem:', packable);
    // }
    // resetOriginalPackable() {
    //     this._editingOriginalPackable = null;
    // }
    // getOriginalPackable(): PackableOriginal {
    //     return this._editingOriginalPackable ? {...this._editingOriginalPackable} : null;
    // }

    // // PRIVATE COLLECTION_______________________________________________
    // setPrivateCollection(col: CollectionPrivate) {
    //     this._editingPrivateCollection = col;
    //     console.log('> updated private collection in mem:', col);
    // }
    // resetPrivateCollection() {
    //     this._editingPrivateCollection = null;
    // }
    // getPrivateCollection(): CollectionPrivate {
    //     return this._editingPrivateCollection ? {...this._editingPrivateCollection} : null;
    // }

    // // ORIGINAL COLLECTION_______________________________________________
    // setOriginalCollection(col: CollectionOriginal) {
    //     this._editingOriginalCollection = col;
    //     console.log('> updated original collection in mem:', col);
    // }
    // resetOriginalCollection() {
    //     this._editingOriginalCollection = null;
    // }
    // getOriginalCollection(): CollectionOriginal {
    //     return this._editingOriginalCollection ? {...this._editingOriginalCollection} : null;
    // }
    
    // // PROFILE_______________________________________________
    // setProfile(profile: Profile) {
    //     this._editingProfile = profile;
    //     console.log('updated profile in memory:', profile);
    // }
    // resetProfile() {
    //     this._editingProfile = null;
    // }
    // getProfile() {
    //     return this._editingProfile ? {...this._editingProfile} : null;
    // }
    // // TRIP_______________________________________________
    // setTrip(trip: Trip) {
    //     this._editingTrip = trip;
    //     console.log('updated trip in memory:', trip);
    // }
    // resetTrip() {
    //     this._editingTrip = null;
    // }
    // getTrip(): Trip {
    //     return this._editingTrip ? {...this._editingTrip} : null;
    // }
    // // _______________________________________________

    resetAll() {
        this.reset('ORIGINAL_PACKABLE');
        this.reset('PRIVATE_PACKABLE');
        this.reset('ORIGINAL_COLLECTION');
        this.reset('PRIVATE_COLLECTION');
        this.reset('PROFILE');
        this.reset('TRIP');
        this.reset('UNSAVED_COLLECTION');
        this.reset('UNSAVED_PACKABLE');
        this.reset('UNSAVED_PROFILE');
        console.log('> reset memory');
    }
    get getAll():memoryObject{
        return {
            privateCollection: <CollectionPrivate>this.get('PRIVATE_COLLECTION'),
            originalCollection: <CollectionOriginal>this.get('ORIGINAL_COLLECTION'),
            privatePackable: <PackablePrivate>this.get('PRIVATE_PACKABLE'),
            originalPackable:<PackableOriginal>this.get('ORIGINAL_PACKABLE'),
            profile: <Profile>this.get('PROFILE'),
            trip: <Trip>this.get('TRIP'),
            unsaved_profile: <boolean>this.get('UNSAVED_PROFILE'),
            unsaved_collection: <boolean>this.get('UNSAVED_COLLECTION'),
            unsaved_packable: <boolean>this.get('UNSAVED_PACKABLE'),
            unsaved_trip: <boolean>this.get('UNSAVED_PROFILE'),
        }
    }
    get editState(): boolean {
        return Object.values(this.getAll).some(x => isDefined(x))
    }
}