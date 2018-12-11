import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { CollectionPanelView } from './collection-panel/collection-panel.component';
import { indexOfId } from '@app/shared/global-functions';
import { transitionTrigger } from '../../shared/animations';

interface CollectionViewObject {
  id:string,
  name: string,
  essential: boolean,
  expanded: boolean,
  panel: CollectionPanelView,
  complete: CollectionComplete
}
@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css'],
  animations: [transitionTrigger]
})
export class CollectionListComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if(this.collectionList && changes['collections']){
      this.updateCollectionList(this.collections)
    }
  }


  @Input() collections: CollectionComplete[];
  collectionList: CollectionViewObject[];

  selectedPanel: CollectionPanelView;

  constructor() { }

  ngOnInit() {
    this.collectionList = this.buildCollectionList(this.collections)
  }


  updateCollectionList(collections: CollectionComplete[]){
    collections.forEach(c=>{
      if(this.collectionList && indexOfId(this.collectionList,c.id) == -1){
        this.collectionList.splice(0,0,this.buildViewObject(c))
      }
    })
  }
  buildCollectionList(collections: CollectionComplete[]):CollectionViewObject[]{
    return collections.map(c=>this.buildViewObject(c))
  }
  buildViewObject(c:CollectionComplete):CollectionViewObject {
    return {
      id: c.id,
      name: c.name,
      essential: c.essential,
      expanded: false,
      panel: 'list',
      complete: c
    }
  }
  togglePanel(id:string, panel:CollectionPanelView){
    let col = this.collectionList[indexOfId(this.collectionList,id)]
    let panelWas = col.panel
    col.panel = panel
    if(col.expanded && panelWas == panel){
      col.expanded = false;
    } else if (!col.expanded){
      col.expanded = true;
    }
  }
  isPanelOpen(id:string,panel:CollectionPanelView){
    let col = this.collectionList[indexOfId(this.collectionList,id)]
    return col.expanded && col.panel == panel
  }

}
