import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { emit } from 'cluster';


export type actionType = 'button' | 'selection'
export type selectionState = 'selected' | 'unselected'
export type buttonState = 'added' | 'delete' | 'add'
export type buttonAction = 'select' | 'deselect' | 'delete' | 'add' | 'remove';

@Component({
  selector: 'collection-details-card',
  templateUrl: './collection-details-card.component.html',
  styleUrls: ['./collection-details-card.component.css']
})
export class CollectionDetailsCardComponent implements OnInit {
@Input('collection') collection: CollectionComplete;
@Input('actionType') actionType: actionType = 'button';
@Input('selectionState') selectionState: selectionState = 'unselected'
@Input('buttonState') buttonState: buttonState = 'add'
@Input('disabled') disabled: boolean = false;
@Output('actionClick') actionClick = new EventEmitter<buttonAction>()


packableNameList: string[] = []
packableNameListString: string;
  constructor() { }

  ngOnInit() {
    this.packableNameList = this.collection.packables.map(p=> p.name)
    this.packableNameListString = this.packableNameList.join(', ')
  }

  action(){
    if(!this.disabled){
      let action:buttonAction;
      if(this.actionType == 'button'){
        switch(this.buttonState){
          case 'add':
          action = 'add';
          break;
          case 'added':
          action = 'remove';
          break;
          case 'delete':
          action = 'delete'
          break;
        }
      } else{
        switch(this.selectionState){
          case 'selected':
          action = 'deselect'
          this.selectionState = 'unselected'
          break;
          case 'unselected':
          action = 'select'
          this.selectionState = 'selected'
          break;
        }
      }
      this.actionClick.emit(action)
    }
  }



}
