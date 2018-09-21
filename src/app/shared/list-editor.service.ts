import { Injectable,  } from '@angular/core';
import { Subject } from "rxjs";
import { PackableComplete } from './models/packable.model';
import {Activity, CollectionPrivate, CollectionAny } from './models/collection.model';
import { objectInArray } from './global-functions';
import { MemoryService } from './memory.service';
import { PackableOriginal, PackableAny } from './models/packable.model';
import { Profile } from './models/profile.model';
import { CollectionFactory } from './factories/collection.factory';
import { PackableFactory } from './factories/packable.factory';


export type listType = 'ORIGINAL_PACKABLES' | 'PRIVATE_PACKABLES' | 'PRIVATE_COLLECTIONS' | 'ACTIVITIES' | 'PROFILES';

export interface listEditorParams {
  itemName: string,
  listType: listType,
  usedList: item[],
  originalList: item[],
  addNew?:boolean
}
export type item = {
  id: string
}

@Injectable()
export class ListEditorService {
  constructor(
    private memoryService: MemoryService,
    private collectionFactory: CollectionFactory,
    private packableFactory: PackableFactory) { }
  updateListParams = new Subject();

  private changedList: boolean;
  private params_set: boolean;
  private _usedList: item[];
  private _originalList: item[];
  private _listType: listType;
  private _itemName: string;
  private _addNew: boolean;
  

  setParams(newParams: listEditorParams) {
    this._usedList = [...newParams.usedList];
    this._originalList = [...newParams.originalList];
    this._listType = newParams.listType;
    this._itemName = newParams.itemName;
    this._addNew = newParams.addNew != undefined ? newParams.addNew : true;
    this.params_set = true;
    this.updateListParams.next(this.params);
    this.changedList = false;
    console.log('params set:', this.params)
  }

  setUsedList(items: item[]) {
    this._usedList = [...items];
    this.updateListParams.next(this.params);
    this.updateMemory();
  }

  addNewItems(items: item[]) {
    items.forEach(item => {
      if (!objectInArray(this._usedList, item, 'id')) {
        this._usedList.push(item);
      }
    })
    this.updateListParams.next(this.params);
    this.updateMemory();
  }

  changed(){
    this.changedList = true;
  }
  get params() {
    if (this.params_set) {
      return {
        itemName: this._itemName ? this._itemName.slice() : null,
        listType: this._listType ? this._listType : null,
        usedList: this._usedList ? this._usedList.slice() : null,
        originalList: this._originalList ? this._originalList.slice() : null,
        addNew: this._addNew
      }
    } else {
      return null;
    }
  }

  matchSelection(itemsFromMemory:item[],usedItems:item[],originalItems:item[] ):item[]{
    let changed:boolean = false;
    usedItems.forEach(item=>{
      if(!objectInArray(itemsFromMemory,item,'id')){
        let newItem = originalItems.find(x=>x.id==item.id)
        itemsFromMemory.push(newItem)
        changed = true;
      } 
    })
    itemsFromMemory.forEach((item,index)=>{
      let i = usedItems.findIndex(x=>x.id == item.id)
      if(i===-1){
        itemsFromMemory.splice(index,1);
        changed = true;
      }
    })
    if (changed){ this.changedList = true;}
    return itemsFromMemory;
  }

  updateMemory() {
    if (this.memoryService.editState) {
      let listType = this._listType;
      let originalList = this._originalList
      let usedList = this._usedList;
      let memory = this.memoryService.getAll
      switch(listType){
        case 'ORIGINAL_PACKABLES':
          if (memory.originalCollection){
            let collection = memory.originalCollection
            let packableObjects = collection.packables.map(p=>{ return {'id':p}})
            let updatedSelection = this.matchSelection(packableObjects,usedList,originalList).map(p=>p.id)
            collection.packables = updatedSelection;
            this.memoryService.set('ORIGINAL_COLLECTION',collection)
            if(this.changedList){this.memoryService.set('UNSAVED_COLLECTION',true)}
          } else {
            console.warn('Could not save list: Original collection not set in memory.\nIn memory:',memory)
          }
          break;
        case 'PRIVATE_PACKABLES':
          if (memory.profile){
            if(memory.privateCollection){
              let collection = memory.privateCollection
              let updatedSelection = this.matchSelection(collection.packables,usedList,originalList)
              .map(p=>this.packableFactory.makePrivate(<PackableAny>p))
              collection.packables = updatedSelection
              this.memoryService.set('PRIVATE_COLLECTION',collection)
              if(this.changedList){this.memoryService.set('UNSAVED_COLLECTION',true)}

            } else {
              let profile = memory.profile;
              let updatedSelection = this.matchSelection(profile.packables,usedList,originalList)
              .map(p=>this.packableFactory.makePrivate(<PackableAny>p))
              profile.packables = updatedSelection
              this.memoryService.set('PROFILE',profile)
              if(this.changedList){this.memoryService.set('UNSAVED_PROFILE',true)}

            }
          } else {
            console.warn('Could not save list: Profile was not set in memory.\nIn memory:',memory)
          }
          break;
        case 'PRIVATE_COLLECTIONS':
          if (memory.profile){
            let profile = memory.profile;
            let updatedSelection = this.matchSelection(profile.collections,usedList,originalList)
              .map(c=>this.collectionFactory.makePrivate(<CollectionAny>c))
            profile.collections = updatedSelection
            this.memoryService.set('PROFILE',profile)
            if(this.changedList){this.memoryService.set('UNSAVED_PROFILE',true)}

          } else {
            console.warn('Could not save list: Profile was not set in memory.\nIn memory:',memory)
          }
          break;
        case 'ACTIVITIES':
          if (memory.trip){
            let trip = memory.trip;
            trip.activities = (<Activity[]>usedList).map(a=>a.id);
            this.memoryService.set('TRIP',trip);
            if(this.changedList){this.memoryService.set('UNSAVED_TRIP',true)}
          } else {
            console.warn('Could not save list: Trip was not set in memory.\nIn memory:',memory)
          }
          break;
        case 'PROFILES':
          if (memory.trip){
            let trip = memory.trip;
            trip.profiles = (<Profile[]>usedList).map(p=>p.id);
            this.memoryService.set('TRIP',trip);
            if(this.changedList){this.memoryService.set('UNSAVED_TRIP',true)}
          } else {
            console.warn('Could not save list: Trip was not set in memory.\nIn memory:',memory)
          }
      }
    }
  }
}
