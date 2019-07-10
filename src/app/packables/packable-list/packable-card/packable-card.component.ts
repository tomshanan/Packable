import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PackableComplete } from '../../../shared/models/packable.model';
import { MatCheckboxChange } from '@angular/material';
import { weatherFactory } from '../../../shared/factories/weather.factory';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { expandAndFadeTrigger, addRemoveElementTrigger } from '../../../shared/animations';
import { timeStamp } from '@app/shared/global-functions';
import * as moment from 'moment'

export interface ruleIcon {
  icon: string,
  description: string,
}

interface packableDetails {
  id: string,
  name: string,
  rules: string[],
  icons: ruleIcon[],
  new: boolean
}

@Component({
  selector: 'packable-card',
  templateUrl: './packable-card.component.html',
  styleUrls: [
    '../../../shared/css/mat-card-list.css',
    './packable-card.component.css'],
  animations: [expandAndFadeTrigger, addRemoveElementTrigger]

})
export class PackableCardComponent implements OnInit, OnChanges {
  
/* 
RECEIVE A COMPLETE PACKABLE
SEMD SINGLE PACKABLE ACTIONS:
DELETE  -> Send request to packable-list
SELECT  -> Send request to packable-list
EDIT    -> handle modal window for packable
        -> Send updated packable to packable-list
        -> UPDATE ITSELF WHEN CHANGED

<packable-card
  [packable]="packableComplete"
  [useCard]="boolean"
  [editList]="boolean"
  [selected]="boolean"
  (packableChange)="event(PackableComplete)"
  (remove)="event(void)"
  (click)="event(void)"
  (checkboxChange)="event(bolean)">
 </packable-card>
*/
  @Input('packable') inputPackable: PackableComplete;
  @Output() packableChange= new EventEmitter<PackableComplete>()
  @Output() remove = new EventEmitter<void>() 
  @Output() clickPackable = new EventEmitter<void>()
  @Output() checkboxChange = new EventEmitter<boolean>()

  @Input() useCard: boolean = true;
  @Input() editList: boolean = false;
  @Input() selected: boolean = false;

  timeout = setTimeout(()=>{},0)

  constructor(
    private wcFactory: weatherFactory,
    private pacFactory: PackableFactory,

  ) { }
  
  packable: packableDetails;

  ngOnInit() {
    this.useCard = false
    // use input packable and build backable view object
    this.packable = this.buildViewObject(this.inputPackable)
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['inputPackable'] || changes['packable']){
      //console.log('PACKABLE CARD:', 'received new packable',this.inputPackable);
      this.packable = this.buildViewObject(this.inputPackable)
    }
  }
  onPackableChange(){
    this.packableChange.emit(this.inputPackable)
    this.buildViewObject(this.inputPackable)
  }
  // if packable needs to change send it back up to the list (as complete)
  buildViewObject(p: PackableComplete, options?: { [P in keyof packableDetails]?: any }): packableDetails {
    let aMinuteAgo = timeStamp() - 60000
    let isNew = p.dateModified > aMinuteAgo;
    if(isNew){
      clearTimeout(this.timeout)
      this.timeout = setTimeout(()=>{
        this.packable.new = false;
      },60000)
    }
    return {
      id: p.id,
      name: p.name,
      rules: this.pacFactory.getQuantityStrings(p.quantityRules),
      icons: this.wcFactory.getWeatherIcons(p.weatherRules),
      new: isNew,
      ...options
    }
  }

  toggleSelected(state?:boolean){
    this.selected = state != null ? state : !this.selected;
    this.checkboxChange.emit(this.selected)
  }
  onCheckboxChange(e: MatCheckboxChange) {
    this.toggleSelected(e.checked)
  }

  onClickPackable(){
    this.clickPackable.emit()
    // edit packable?
    console.log(`clicked packable: ${this.packable.name}`)
    
  }
}
