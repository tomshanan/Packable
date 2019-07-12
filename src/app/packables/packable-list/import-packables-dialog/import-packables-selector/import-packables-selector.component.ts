import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { searchableItem } from '../../../../shared-comps/item-selector/item-selector.component';
import { StoreSelectorService } from '../../../../shared/services/store-selector.service';
import { PackableOriginal, PackableOriginalWithMetaData } from '../../../../shared/models/packable.model';
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
  usedList:string[] = []
  completeList:searchableItem[];
  selected: string[];
  remotePackables: PackableOriginalWithMetaData[];
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
    this.sub = this.storeSelector.libraryState$.subscribe(state=>{
      if(state.loading){
        this.setLoaded(false)
        console.log('State still loading',state)
      } else{
        if(state.error){
          console.warn(state.error)
        }
        this.initList()
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
    let originalsWithMeta = this.pacFac.getPackablesWithMetaData(this.originalPackables)
    let localList = this.createFilterObject(originalsWithMeta)
    let usedIds = this.originalPackables.map(p=>p.id)
    this.remotePackables = this.storeSelector.getRemotePackablesWithMetaData().filter(p=>!usedIds.includes(p.id)).sort(sortByMetaData)
    let remoteList = this.createFilterObject(this.remotePackables)
    this.completeList = [...localList,...remoteList] 
    if(this.collection){
      this.usedList = this.collection.packables.ids()
    } else {
      this.usedList = localList.ids()
    }
    this.setLoaded(true)
  }
  createFilterObject(packables:Array<PackableOriginalWithMetaData>):searchableItem[]{
    return packables.map((p) => {
      return {
        name: p.name,
        id: p.id,
        allNames: [p.name,...p.metaData.altNames],
        tags: p.metaData.tags      
      }
    })
  }
  updateSelected(selected:string[]){
    this.selected = selected;
    this.emitSelected.emit(this.selected)
  }
}
