import { Injectable, OnInit } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Profile } from "../../shared/models/profile.model";
import { PackablePrivate, PackableFactory } from '../../shared/models/packable.model';
import { CollectionOriginal, CollectionPrivate, CollectionFactory } from '../../shared/models/collection.model';
import { objectInArray } from '../global-functions';
import { MemoryService } from '../memory.service';
import { PackableOriginal, PackableAny } from '../models/packable.model';
import { CollectionAny, CollectionComplete } from '../models/collection.model';

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
				itemName: this.getItemName(),
				listType: this.getListType(),
				usedList: this.getUsed(),
				originalList: this.getOriginal()
			}
		} else {
			return null;
		}

	}
	getUsed() {
		if (this._usedList) {
			return this._usedList.slice();
		} else {
			return null;
		}

	}
	getOriginal() {
		if (this._originalList) {
			return this._originalList.slice();
		} else {
			return null;
		}
	}
	getListType() {
		if (this._listType) {
			return this._listType.slice();
		} else {
			return null;
		}
	}
	getItemName() {
		if (this._itemName) {
			return this._itemName.slice();
		} else {
			return null;
		}
	}
	updateMemory() {
		if (this.memoryService.editState) {
			let collection = this.memoryService.getCollection();
			let profile = this.memoryService.getProfile();
			let usedList = this.params.usedList;
			if (collection && this._listType == 'packables') {
				
					console.log('working on Original Collection > Packable ID List');
					collection.packables = this.packableFactory.makeCompleteFromArray(<PackableAny[]>usedList)
				
				this.memoryService.setCollection(collection);
				console.log('collection memory updated:', collection)
			} else {
				if (profile && this._listType == "packables") {
					console.log('working on profile > packables');
					profile.packables = usedList.map(item =>{
						let newComplete = this.packableFactory.makeComplete(<PackableAny>item)
						return newComplete
					})
				} else {
					console.log('working on profile > Collections');
					profile.collections = <CollectionComplete[]>usedList.map(item => {
						return this.collectionFactory.makeComplete(<CollectionAny>item)
					})
				}
				this.memoryService.setProfile(profile)
				console.log('profile memory updated:', profile)
			}
		}
	}
}
