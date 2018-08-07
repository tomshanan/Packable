import { Injectable, OnInit } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { PackableFactory } from '../../shared/models/packable.model';
import { CollectionFactory } from '../../shared/models/collection.model';
import { objectInArray } from '../global-functions';
import { MemoryService } from '../memory.service';
import { PackableOriginal, PackableAny } from '../models/packable.model';
import { CollectionAny, CollectionComplete } from '../models/collection.model';
import { editProfile } from '../../profiles/store/profile.actions';

export interface listEditorParams {
  itemName: string,
  listType: string,
  usedList: item[],
  originalList: item[]
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


  private params_set: boolean;
  private _usedList: item[];
  private _originalList: item[];
  private _listType: string;
  private _itemName: string;

  setParams(newParams: listEditorParams) {
    this._usedList = [...newParams.usedList];
    this._originalList = [...newParams.originalList];
    this._listType = newParams.listType;
    this._itemName = newParams.itemName;
    this.params_set = true;
    this.updateListParams.next(this.params);
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

  get params() {
    if (this.params_set) {
      return {
        itemName: this._itemName ? this._itemName.slice() : null,
        listType: this._listType ? this._listType : null,
        usedList: this._usedList ? this._usedList.slice() : null,
        originalList: this._originalList ? this._originalList.slice() : null
      }
    } else {
      return null;
    }

  }

  updateMemory() {
    if (this.memoryService.editState) {
      let list = this._listType;
      let collection = this.memoryService.getCollection();
      let profile = this.memoryService.getProfile();
      let trip = this.memoryService.getTrip();
      let usedList = this.params.usedList;
      if(list == 'packables'){
        let completePackables = this.packableFactory.makeCompleteFromArray(<PackableAny[]>usedList);
        if(collection) {
          collection.packables = completePackables;
          this.memoryService.setCollection(collection);
        } else if (profile) {
          profile.packables = completePackables;
          this.memoryService.setProfile(profile)
        }
      } else if(list == 'collections') {
        let completeCollections =  <CollectionComplete[]>usedList.map(item => {
          return this.collectionFactory.makeComplete(<CollectionAny>item)
        })
        profile.collections = completeCollections;
        this.memoryService.setProfile(profile)
      } else if (list == 'activities' || list == 'profiles') {
        trip[list] = (<any>usedList).map(item=>item.id);
        this.memoryService.setTrip(trip);
        console.log('trip:', trip)
      }
    }
  }
}
