import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { quickTransitionTrigger } from '../../shared/animations';

@Component({
  selector: 'slide-toggle-with-text',
  templateUrl: './slide-toggle-with-text.component.html',
  styleUrls: ['./slide-toggle-with-text.component.css'],
  animations: [quickTransitionTrigger]
})
export class SlideToggleWithTextComponent implements OnInit {

  @Input() text: string = ''
  @Input() helpText: string;
  @Input('checked') isChecked: boolean = false
  @Output('checkedChange') isCheckedChange = new EventEmitter<boolean>()
  @Output() change = new EventEmitter<MatSlideToggleChange>()
  @Output('textClick') onTextClick = new EventEmitter<void>()
/*
  <slide-toggle-with-text 
  [checked]="booleanVar"
   text="text" 
   helpText="Some help text" 
   (textClick)="textClick(void)" 
   (change)="changeEvent($event)">
   </slide-toggle-with-text>
*/
  constructor() { }

  ngOnInit() {
  }
  textClick(){
    this.onTextClick.emit()
  }
  toggleChange(e:MatSlideToggleChange){
    this.isChecked = e.checked;
    this.isCheckedChange.emit(this.isChecked)
    this.change.emit(e)
  }

}
