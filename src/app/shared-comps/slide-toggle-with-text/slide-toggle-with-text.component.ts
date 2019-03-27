import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material';
import { quickTransitionTrigger } from '../../shared/animations';
import { tap } from 'rxjs/operators';

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
  @ViewChild('toggle') matToggle: MatSlideToggle;
  @ViewChild('toggle') toggleElement: ElementRef;
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
  toggle(){
    //this.isChecked != this.isChecked
    //this.toggleElement.nativeElement.click()
    this.matToggle.checked = !this.isChecked
    this.isChecked = !this.isChecked
    this.isCheckedChange.emit(this.isChecked)
    this.change.emit({
      checked:this.isChecked,
      source: this.matToggle
    })
    // this.matToggle.toggleChange.emit()
  }
  toggleChange(e:MatSlideToggleChange){
    this.isChecked = e ? e.checked : !this.isChecked;
    this.isCheckedChange.emit(this.isChecked)
    this.change.emit(e)
  }

}
