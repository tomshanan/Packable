import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { filterItemLocality, filterItem } from '../../../../shared-comps/item-selector/item-selector.component';
import { StoreSelectorService } from '../../../../shared/services/store-selector.service';
import { PackableOriginal } from '../../../../shared/models/packable.model';
import { remotePackable } from '../../../../shared/library/library.model';
import { PackableFactory } from '../../../../shared/factories/packable.factory';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../../shared/storage/storage.service';
import * as libraryActions from '@shared/library/library.actions'
import {State as libraryState} from '@shared/library/library.model'
import { Store } from '@ngrx/store';

export interface importPackables_selection {
  remoteItems:PackableOriginal[],
  localItems:PackableOriginal[]
}

@Component({
  selector: 'import-packables-selector',
  templateUrl: './import-packables-selector.component.html',
  styleUrls: ['./import-packables-selector.component.css']
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
  @Output() confirm = new EventEmitter<importPackables_selection>()

  constructor(
    private storeSelector: StoreSelectorService,
    private storage: StorageService,
    private pacFac: PackableFactory,
    private store:Store<libraryState>
  ) { }

  ngOnInit() {
    this.sub = this.storeSelector.libraryState_obs.subscribe(state=>{
      if(state.loading){
        this.loaded = false
        console.log('State still loading',state)
      } else{
        if(state.error){
          console.warn(state.error)
        }
        this.initList()
      }
    })
    this.store.dispatch(new libraryActions.loadLibrary())
  }
  ngOnDestroy(){
    this.sub.unsubscribe()
  }
  initList(){
    this.originalPackables= this.storeSelector.originalPackables.filter(p=>!p.deleted)
    let localList = this.createFilterObject(this.originalPackables,'local')
    let usedIds = this.originalPackables.map(p=>p.id)
    this.remotePackables = this.storeSelector.getRemotePackables().filter(p=>!usedIds.includes(p.id))
    let remoteList = this.createFilterObject(this.remotePackables,'remote')
    console.log('import packables collection input:',this.collection)
    if(this.collection){
      this.usedList = this.createFilterObject(this.collection.packables, 'local')
      this.completeList = [...localList,...remoteList] 
    } else {
      this.usedList = [...localList]
      this.completeList = [...localList,...remoteList] 
    }
    console.log('Used List:',this.usedList,'\nCompelte List::',this.completeList)
    this.loaded = true
  }
  createFilterObject(inputObjects:{id:string,name:string}[],locality:filterItemLocality):filterItem[]{
    if(locality === 'remote'){
      (<remotePackable[]>inputObjects).sort((a,b)=>{
        return a.metaData.metascore - b.metaData.metascore
      })
    } else {
      (<PackableOriginal[]>inputObjects).sort((a,b)=>{
        return a.dateModified - b.dateModified
      })
    }
    return inputObjects.map((obj,i) => {
      return {
        id: obj.id,
        name: obj.name,
        type: !!obj['userCreated'] ? 'user' : locality,
        sortPosition: i+1
      }
    })
  }
  updateSelected(filterItems:filterItem[]){
    this.selected = filterItems;
  }
  onConfirm(){
    let remoteItems:PackableOriginal[]=[]
    let localItems:PackableOriginal[]=[]
    this.selected.forEach(item=>{
      if(item.type=="remote"){
        let remotePackable = this.remotePackables.findId(item.id)
        remoteItems.push(this.pacFac.clonePackableOriginal(remotePackable))
      } else {
        let packable = this.originalPackables.findId(item.id)
        localItems.push(packable)
      }
    })
    this.confirm.emit({
      remoteItems: remoteItems,
      localItems:localItems
    })
  }

}
