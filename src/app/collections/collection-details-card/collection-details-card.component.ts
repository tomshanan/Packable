import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { emit } from 'cluster';
import { WindowService } from '../../shared/services/window.service';
import { Subscription } from 'rxjs';


export type actionType = 'button' | 'selection'
export type selectionState  = boolean
export type buttonState = 'added' | 'delete' | 'add' | 'remove'
export type buttonAction = 'select' | 'deselect' | 'delete' | 'add' | 'remove';

@Component({
  selector: 'collection-details-card',
  templateUrl: './collection-details-card.component.html',
  styleUrls: ['./collection-details-card.component.css']
})
export class CollectionDetailsCardComponent implements OnInit,OnDestroy {

@Input('collection') collection: CollectionComplete;
@Input('actionType') actionType: actionType = 'button';
@Input('selectionState') selectionState: selectionState = false
@Input('buttonState') buttonState: buttonState = 'add'
@Input('disabled') disabled: boolean = false;
@Output('actionClick') actionClick = new EventEmitter<buttonAction>()
buttonWidth(): string {
  return this.windowService.max('xs') ? '45' : '55';
};
sub: Subscription;

buttonStates = ['added' , 'delete' , 'add' , 'remove']
packableNameList: string[] = []
packableNameListString: string;
  constructor(
    private windowService: WindowService, // used in template
    private changeDetection: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.packableNameList = this.collection.packables.map(p=> p.name)
    this.packableNameListString = this.packableNameList.join(', ')
    // this.sub = this.windowService.change.subscribe(()=>this.changeDetection.detectChanges())
  }
  ngOnDestroy(){
    // this.sub.unsubscribe()
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
          case 'remove':
          action = 'remove'
          break;
        }
      } else{
        switch(this.selectionState){
          case true:
          action = 'deselect'
          this.selectionState = false
          break;
          case false:
          action = 'select'
          this.selectionState = false
          break;
        }
      }
      this.actionClick.emit(action)
    }
  }



}
