import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { WindowService } from '../../shared/services/window.service';
import { Subscription } from 'rxjs';
import { Profile } from '../../shared/models/profile.model';
import { transitionTrigger, horizontalShringAndFade } from '../../shared/animations';


export type actionType = 'button' | 'selection' | 'none'
export type selectionState  = boolean
export type buttonState = 'added' | 'delete' | 'add' | 'remove'
export type buttonAction = 'select' | 'deselect' | 'delete' | 'add' | 'remove';

@Component({
  selector: 'collection-details-card',
  templateUrl: './collection-details-card.component.html',
  styleUrls: ['./collection-details-card.component.css'],
  animations:[transitionTrigger,horizontalShringAndFade]
})
export class CollectionDetailsCardComponent implements OnInit,OnDestroy,OnChanges {

@Input('collection') collection: CollectionComplete;
@Input('profileGroup') inputProfileGroup: Profile[] = [];
profileGroup: Profile[] = [];
essentialGroup: Profile[] = []

@Input('actionType') actionType: actionType = 'button';
@Input('selectionState') selectionState: selectionState = false;

@Input('selectionOnIcon') selectionOnIcon: string = 'added';
@Input('selectionOffIcon') selectionOffIcon: string = 'unselected';
@Input('staticIcon') staticIcon: string = 'check';

@Input('buttonState') buttonState: buttonState = 'add';
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
    public windowService: WindowService, // used in template
    private changeDetection: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('Details Card recieved collection:', this.collection);
    this.packableNameList = this.collection.packables.map(p=> p.name)
    this.packableNameListString = this.packableNameList.join(', ')
    // this.sub = this.windowService.change.subscribe(()=>this.changeDetection.detectChanges())
  }
  ngOnDestroy(){
    // this.sub.unsubscribe()
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['inputProfileGroup']){
      this.profileGroup.compare(this.inputProfileGroup)
      this.essentialGroup = this.profileGroup.filter(p=>p.collections.findId(this.collection.id).essential)
      if(this.profileGroup.length > 0 && this.profileGroup.length === this.essentialGroup.length && this.actionType === 'selection'){
        this.selectionState = true
        this.actionClick.emit('select')
      }
    }
  }
  action(){
    if(!this.disabled && this.actionType !='none'){
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
