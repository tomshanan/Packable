import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { filterItemLocality, filterItem } from '../../../../shared-comps/item-selector/item-selector.component';
import { StoreSelectorService } from '../../../../shared/services/store-selector.service';
import { PackableOriginal } from '../../../../shared/models/packable.model';

export interface importPackables_selection {
  remoteItems:PackableOriginal[],
  localItems:PackableOriginal[]
}

@Component({
  selector: 'import-packables-selector',
  templateUrl: './import-packables-selector.component.html',
  styleUrls: ['./import-packables-selector.component.css']
})
export class ImportPackablesSelectorComponent implements OnInit {
  @Input() collection:CollectionComplete;
  usedList:filterItem[] = []
  completeList:filterItem[];
  selected: filterItem[];

  @Output() confirm = new EventEmitter<importPackables_selection>()

  constructor(
    private storeSelector: StoreSelectorService,
  ) { }

  ngOnInit() {
    /* 
    ONCE WE HAVE REMOTE PACKABLES, ADD:
     let remotePackables = this.storeSelector.remotePackables
     let remoteList = this.createFilterObject(remotePackables,'remote')
    */
    let originalPackables= this.storeSelector.originalPackables
    let storeList = this.createFilterObject(originalPackables,'local')
    this.completeList = [...storeList] // <--- add remoteList to completeList
    
    if(this.collection){
      this.usedList = this.createFilterObject(this.collection.packables, 'local')
    }
  }
  createFilterObject(inputObjects:{id:string,name:string}[],locality:filterItemLocality):filterItem[]{
    return inputObjects.map((obj) => {
      return {
        id: obj.id,
        name: obj.name,
        type: !!obj['userCreated'] ? 'user' : locality
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
        /*
        let remotePackable = this.storeSelector.remotePackables.findId(item.id)
        remoteItems.push(remotePackable)
        */
      } else {
        let packable = this.storeSelector.originalPackables.findId(item.id)
        localItems.push(packable)
      }
    })
    this.confirm.emit({
      remoteItems: remoteItems,
      localItems:localItems
    })
  }

}
