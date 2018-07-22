import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { navParams, itemOption } from '../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-desktop-nav',
  templateUrl: './desktop-nav.component.html',
  styleUrls: ['./desktop-nav.component.css'],
})
export class DesktopNavComponent implements OnInit {

  @Input() nav:navParams;
  @Output() leftAction = new EventEmitter<void>();
  @Output() rightAction = new EventEmitter<void>();
  @Output() optionAction = new EventEmitter<string>();


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

