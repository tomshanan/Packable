import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { filterItem } from '../../../../shared-comps/item-selector/item-selector.component';
import { StoreSelectorService } from '../../../../shared/services/store-selector.service';
import { PackableOriginal, remotePackable } from '../../../../shared/models/packable.model';
import { PackableFactory } from '../../../../shared/factories/packable.factory';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../../shared/storage/storage.service';
import * as libraryActions from '@shared/library/library.actions'
import {State as libraryState} from '@shared/library/library.model'
import { Store } from '@ngrx/store';
import { sortByMostRecent, sortByMetaData } from '../../../../shared/global-functions';
import { WindowService } from '../../../../shared/services/window.service';
import { transitionTrigger } from '../../../../shared/animations';


@Component({
  selector: 'import-packables-selector',
  templateUrl: './import-packables-selector.component.html',
  styleUrls: ['./import-packables-selector.component.css'],
  animations:[transitionTrigger]
})
export class ImportPackablesSelectorComponent implements OnInit, OnDestroy{
  @Input() collection:CollectionComplete;
  loaded: boolean = false;
  usedList:filterItem[] = []
  completeList:filterItem[];
  selected: filterItem[];
  remotePackables: remotePackable[];
  originalPackables: PackableOriginal[];
  sub:Subscription;
  @Output('loaded') emitLoaded = new EventEmitter<boolean>()
  @Output('updateSelected') emitSelected = new EventEmitter<string[]>()

  finishedLoading:boolean = false;
  constructor(
    private storeSelector: StoreSelectorService,
    private windowService: WindowService,
    private storage: StorageService,
    private pacFac: PackableFactory,
    private store:Store<libraryState>,
    
  ) { }
  setLoaded(bool:boolean){
    this.loaded = bool;
    this.emitLoaded.emit(this.loaded)
  }
  ngOnInit() {
    this.sub = this.storeSelector.libraryState_obs.subscribe(state=>{
      if(state.loading){
        this.setLoaded(false)
        console.log('State still loading',state)
      } else{
        if(state.error){
          console.warn(state.error)
        }
        //this.initList()
        this.finishedLoading = true
      }
    })
    this.store.dispatch(new libraryActions.loadLibrary())
  }
  ngOnDestroy(){
    this.sub.unsubscribe()
  }
  initList(){
    this.originalPackables= this.storeSelector.originalPackables.filter(p=>!p.deleted).sort(sortByMostRecent)
    let localList = this.createFilterObject(this.originalPackables)
    let usedIds = this.originalPackables.map(p=>p.id)
    this.remotePackables = this.storeSelector.getRemotePackables().filter(p=>!usedIds.includes(p.id)).sort(sortByMetaData)
    let remoteList = this.createFilterObject(this.remotePackables)
    this.completeList = [...localList,...remoteList] 
    console.log('import packables collection input:',this.collection)
    if(this.collection){
      this.usedList = this.createFilterObject(this.collection.packables)
    } else {
      this.usedList = [...localList]
    }
    console.log('Used List:',this.usedList,'\nCompelte List::',this.completeList)
    this.setLoaded(true)
  }
  createFilterObject(inputObjects:Array<PackableOriginal|remotePackable>):filterItem[]{
    return inputObjects.map((obj) => {
      return {
        id: obj.id,
        name: obj.name,
      }
    })
  }
  updateSelected(filterItems:filterItem[]){
    this.selected = filterItems;
    this.emitSelected.emit(this.selected.ids())
  }

}
