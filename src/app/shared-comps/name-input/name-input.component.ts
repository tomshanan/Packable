import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatInput } from '@angular/material';

export interface NameInputChangeEvent {
  oldValue:string,
  value: string,
  valid: boolean
}
@Component({
  selector: 'name-input',
  templateUrl: './name-input.component.html',
  styleUrls: ['./name-input.component.css']
})
export class NameInputComponent implements OnInit,AfterViewInit {
  @Input() title: string = 'Item';
  @Input() value: string = '';
  @Input() usedNames: string[] = [];
  @Output() valueChange = new EventEmitter<string>()
  @Output() changeEvent = new EventEmitter<NameInputChangeEvent>()
  @ViewChild('editNameInput') editNameInput: ElementRef;
  allowedName: string;
 
/**
 <name-input
  title="Packable"
  [value]='myNameValue'
  [usedNames]='getUsedNames()'
  (valueChange)='changeOfValue($event:string)'
  (change)='changeEvent($event:NameInputChangeEvent)'>
  </name-input>
 */
  nameInput: FormControl = new FormControl('')

  constructor() {
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.includes(input) && input !== this.allowedName.toLowerCase() ) {
      return { 'usedName': true };
    }
    return null;
  }
  ngOnInit() {
    this.allowedName = this.value;
    this.nameInput= new FormControl(this.value, [
      Validators.required, 
      Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), 
      this.validate_usedName.bind(this)
    ])
  }
  ngAfterViewInit(){
    setTimeout(()=>{
      this.editNameInput.nativeElement.focus()
    },100)
  }
  emitChange(){
    this.valueChange.emit(this.nameInput.value)
    this.changeEvent.emit({
      oldValue: this.value,
      value: this.nameInput.value,
      valid: this.nameInput.valid
    })
    this.value = this.nameInput.value
    console.log('name input change:\n',this.nameInput)
  }
}
