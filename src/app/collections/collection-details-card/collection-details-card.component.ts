import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { WindowService } from '../../shared/services/window.service';
import { Subscription } from 'rxjs';
import { Profile } from '../../shared/models/profile.model';
import { transitionTrigger, horizontalShringAndFade, addRemoveElementTrigger } from '../../shared/animations';
import { PackableComplete } from '../../shared/models/packable.model';
import { appColors } from '@app/shared/app-colors';


export type actionType = 'button' | 'selection' | 'none'
export type selectionState  = boolean
export type buttonState = 'added' | 'delete' | 'add' | 'remove'
export type buttonAction = 'select' | 'deselect' | 'delete' | 'add' | 'remove';

@Component({
  selector: 'collection-details-card',
  templateUrl: './collection-details-card.component.html',
  styleUrls: ['./collection-details-card.component.css'],
  animations:[transitionTrigger,horizontalShringAndFade,addRemoveElementTrigger]
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
@Input('boxClickActive') boxClickActive: boolean = false;
@Output('boxClick') boxClick = new EventEmitter<void>()
buttonWidth(): string {
  return this.windowService.max('xs') ? '45' : '55';
};
sub: Subscription;

buttonStates = ['added' , 'delete' , 'add' , 'remove']
packableNameList: string[] = []
packableNameListString: string;
  constructor(
    public windowService: WindowService, // used in template
    public colors: appColors, // in tempalte
    private changeDetection: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.profileGroup = this.inputProfileGroup ? this.inputProfileGroup.slice() : [];
  }
  ngOnDestroy(){
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['inputProfileGroup']){
      this.profileGroup.compare(this.inputProfileGroup)
      this.updatePackableNames(this.collection.packables)
    }
    if(changes['collection'] && this.collection && this.collection.packables){
      this.updatePackableNames(this.collection.packables)
    }
  }
  updatePackableNames(packables:PackableComplete[]){
    this.packableNameList = packables.clearUndefined().map(p=> {
      if(this.profileGroup.length>0){
        return this.profileGroup.every( profile => {
            let col = profile.collections.findId(this.collection.id)
            if(col){
              return col.packables.hasId(p.id)
            } else {
              return true
            }
        }) ? p.name : p.name+"*"
      } else {
        return p.name
      }
    })
    this.packableNameListString = this.packableNameList.join(', ')
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
          // this.selectionState = false
          break;
          case false:
          action = 'select'
          // this.selectionState = true
          break;
        }
      }
      this.actionClick.emit(action)
    }
  }
  onBoxClick(){
    if(this.boxClickActive && !this.disabled){
      this.boxClick.emit()
    }
  }
  showWarning:boolean = false;
  toggleWarning(b:boolean){    
    this.showWarning = b;
  }
}
