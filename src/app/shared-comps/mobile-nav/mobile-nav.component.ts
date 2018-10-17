import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';


export interface itemOption{
  name: string,
  actionName: string
}
export interface navParams {
  left: {
    text: string,
    iconClass: string,
    enabled: boolean
  },
  right: {
    text: string,
    iconClass: string,
    enabled: boolean
  },
  header:string,
  options?: itemOption[]
}

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['../../shared/css/full-flex.css','./mobile-nav.component.css']
})

export class MobileNavComponent implements OnInit {
  @Input() nav:navParams;
  @Output() leftAction = new EventEmitter<void>();
  @Output() rightAction = new EventEmitter<void>();
  @Output() optionAction = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }
  onRight(){
    this.rightAction.emit();
  }
  onLeft(){
    this.leftAction.emit();
  }
  onOption(option:itemOption){
    let action = option.actionName;
    this.optionAction.emit(action);
  }
}
