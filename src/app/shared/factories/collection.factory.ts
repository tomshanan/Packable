import { Injectable } from '@angular/core';
import { StoreSelectorService } from '../services/store-selector.service';
import { PackableFactory } from './packable.factory';
import { CollectionAny, CollectionOriginal, CollectionPrivate, CollectionComplete, CollectionRef, isCollectionOriginal, CollectionWithMetadata, CollectionCompleteWithMetadata } from '../models/collection.model';
import { PackableComplete, PackablePrivate } from '../models/packable.model';
import { weatherFactory } from './weather.factory';
import { indexOfId, isDefined } from '../global-functions';
import { CollectionProfile } from '../../packables/packable-list/edit-packable-dialog/choose-collections-form/choose-collections-form.component';
import { MetaDataNode, Metadata } from '../library/library.model';

type T = { packables: PackablePrivate[] }
function log (...args){
    //console.log('COLFAC',...args)
}
@Injectable()
export class CollectionFactory {
    constructor(
        private storeSelector: StoreSelectorService,
        private pacFac: PackableFactory,
        private weatherFactory: weatherFactory,
    ) { }
    public isOriginal = (collection: CollectionAny): collection is CollectionOriginal => {
        return (<CollectionOriginal>collection).name !== undefined;
    }
    public duplicatePrivateCollection = (packable: CollectionPrivate): CollectionPrivate => {
        return new CollectionPrivate(
            packable.id,
            packable.packables ? packable.packables.map(p => this.pacFac.clonePackablePrivate(p)) : [],
            packable.essential,
            this.weatherFactory.deepCopy(packable.weatherRules),
            packable.dateModified,
            packable.weatherOverride,
        )

    }
    public duplicateOriginalCollection = (original: CollectionOriginal): CollectionOriginal => {
        return new CollectionOriginal(
            original.id,
            original.name,
            original.packables ? original.packables.slice() : [],
            this.weatherFactory.deepCopy(original.weatherRules),
            original.userCreated,
            original.dateModified,
            original.locations,
            original.deleted,
            original.weatherOverride,
        )
    }
    public remoteToComplete = (complete:CollectionWithMetadata[]):CollectionComplete[] => {
        let originals = complete.map(c=>this.duplicateOriginalCollection(c))
        return originals.map(c=>{
            return new CollectionComplete(
                c.id,
                c.name,
                false,
                this.pacFac.makeCompleteFromArray(c.packables),
                this.weatherFactory.deepCopy(c.weatherRules),
                c.userCreated,
                c.dateModified,
                c.locations,
                c.deleted,
                c.weatherOverride,
            )
        })
    }
    public newPrivateCollection = (original: CollectionOriginal, patchValues: Partial<CollectionPrivate> = {}): CollectionPrivate => {
        let privatePackables = original.packables.map(p => this.pacFac.makePrivate(p))
        let newCollection = new CollectionPrivate(
            original.id,
            privatePackables,
            false,
            this.weatherFactory.deepCopy(original.weatherRules),
            original.dateModified,
            original.weatherOverride,
        );
        Object.assign(newCollection,patchValues)
        return newCollection
    }
    public restorePrivate = (collection: CollectionPrivate): CollectionPrivate => {
        let original = this.storeSelector.getCollectionById(collection.id);
        return this.newPrivateCollection(original);
    }
    public makePrivate = (collection: CollectionAny, patchValue?: {}): CollectionPrivate => {
        if (this.isOriginal(collection)) {
            return this.newPrivateCollection(collection, patchValue);
        } else {
            return collection
        }
    }
    public completeToPrivate = (complete:CollectionComplete):CollectionPrivate => {
        return new CollectionPrivate(
            complete.id,
            complete.packables.map(p=>this.pacFac.completeToPrivate(p)),
            complete.essential,
            this.weatherFactory.deepCopy(complete.weatherRules),
            complete.dateModified,
            complete.weatherOverride,
        )
    }
    public completeToOriginal = (complete:CollectionComplete):CollectionOriginal => {
        return new CollectionOriginal(
            complete.id,
            complete.name,
            complete.packables.map(p=>this.pacFac.completeToPrivate(p)),
            this.weatherFactory.deepCopy(complete.weatherRules),
            complete.userCreated,
            complete.dateModified,
            complete.locations,
            complete.deleted,
            complete.weatherOverride,
        )
    }
    public makeComplete = (collection: CollectionAny): CollectionComplete => {
        if(collection){
            if (isCollectionOriginal(collection)) {
                return new CollectionComplete(
                    collection.id,
                    collection.name,
                    false,
                    this.pacFac.makeCompleteFromArray(collection.packables),
                    this.weatherFactory.deepCopy(collection.weatherRules),
                    collection.userCreated,
                    collection.dateModified,
                    collection.locations,
                    collection.deleted,
                    collection.weatherOverride,
                )
            } else {
                let original = this.storeSelector.getCollectionById(collection.id) || this.storeSelector.getRemoteCollectionsWithMetadata([collection.id])[0]
                let completePackables = this.pacFac.makeCompleteFromArray(collection.packables)
                return new CollectionComplete(
                    collection.id,
                    original.name,
                    collection.essential,
                    completePackables,
                    this.weatherFactory.deepCopy(collection.weatherRules),
                    original.userCreated,
                    collection.dateModified,
                    original.locations,
                    original.deleted,
                    collection.weatherOverride,
                )
            }
        } else {
            // log('colFac.makeComplete: collection was not defined. Returned UNDEFINED');
            return undefined
        }
    }
    public makeCompleteArray = (collections: CollectionAny[]): CollectionComplete[] => {
        return collections.map(c => this.makeComplete(c))
    }

    /** Get a complete collection from the Store by collection ID
     * @param ids the Collection Id
     * @param profileIds optional: Profile ID, will return the collection from the profile, or return null if not found in profile. Omit to find the original collection.
     */
    public getCompleteById(colId: string, profileId?:string): CollectionComplete {
        if(profileId){
            let profile = this.storeSelector.getProfileById(profileId)
            return this.makeComplete(profile.collections.findId(colId))
        } else {
            return this.makeComplete((this.storeSelector.getCollectionById(colId) || this.storeSelector.getRemoteCollectionsWithMetadata([colId])[0]))
        }
    }

    public getCompleteByIdArray(ids: string[]): CollectionComplete[] {
        return ids.map(id => this.getCompleteById(id))
    }
    public getAllCompleteFromProfile(profileId:string):CollectionComplete[]{
        let profile = this.storeSelector.getProfileById(profileId)
        return this.makeCompleteArray(profile.collections)
    }
    public getAllComplete(filterDeleted: boolean = true):CollectionComplete[]{
        let allComplete = this.makeCompleteArray(this.storeSelector.originalCollections)
        if(filterDeleted === true){
            return allComplete.filter(c=>!c.deleted)
        } else {
            return allComplete
        }
    }
    public getAllCompleteRemote():CollectionComplete[]{
        return this.makeCompleteArray(this.storeSelector.getRemoteCollectionsWithMetadata())
    }
    public getImportCollectionList():CollectionComplete[]{
        let localCollections = this.getAllComplete()
        // log('getImportCollectionList: localCollections:', localCollections);
        
        let idsImported = localCollections.map(c=>c.id)
    
        let allRemoteCollections = this.storeSelector.getRemoteCollectionsWithMetadata()
    
        let filteredRemoteCollections = allRemoteCollections.filter(c=>!idsImported.includes(c.id)).sort((a,b)=>{
          return a.metaData.metaScore - b.metaData.metaScore
        })
        // log('getImportCollectionList: filteredRemoteCollections:', filteredRemoteCollections);

        let completeRemote = this.makeCompleteArray(filteredRemoteCollections)
        return [...localCollections,...completeRemote]
    }

    public makeCompleteWithMetaData(cols:Array<CollectionOriginal>):CollectionCompleteWithMetadata[] {
        // log(`makeCompleteWithMetaData called with `,cols)
        return cols.map(col=>{
            let completeCol = this.makeComplete(col)
            let metaData = this.storeSelector.getMetaDataForId(col.id) || new Metadata(col.id);
            return new CollectionCompleteWithMetadata(completeCol,metaData)
        })
    }
    
    public addEditPackablesByCP(collections: CollectionOriginal[], packables: PackablePrivate[], cps: CollectionProfile[]): CollectionOriginal[] {
        let uniqueCollections = []
        cps.forEach(cp => {
            if (!uniqueCollections.includes(cp.cId)) {
                uniqueCollections.push(cp.cId)
            }
        })
        uniqueCollections.forEach(cId => { 
            let collection = collections.find(c=>c.id == cId)
            collection = this.addEditPackables(collection, packables)
        })
        return collections

    }
    public addEditPackables<T extends { packables: PackablePrivate[] }>(collection: T, packables: PackablePrivate[]): T {
        packables.forEach(packable => {
            let pacIndex = collection.packables.idIndex(packable.id)
            if (pacIndex === -1) {
                collection.packables.unshift(packable)
                // log('adding packable', packable);
            } else {
                collection.packables.splice(pacIndex, 1, packable)
                // log('updating packable', packable);
            }
        });
        return collection
    }

}