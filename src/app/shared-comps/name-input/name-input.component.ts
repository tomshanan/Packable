import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

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
export class NameInputComponent implements OnInit {
  @Input() title: string = 'Item';
  @Input() value: string = '';
  @Input() usedNames: string[] = [];
  @Input() allowedNames: string[] = [];
  @Output() valueChange = new EventEmitter<string>()
  @Output() change = new EventEmitter<NameInputChangeEvent>()
 
/**
 <name-input
  title="Packable"
  [value]='myNameValue'
  [usedNames]='getUsedNames()'
  [allowedNames]='[myNameValue]'
  (valueChange)='changeOfValue($event:string)'
  (change)='changeEvent($event:NameInputChangeEvent)'>
  </name-input>
 */
  nameInput: FormControl = new FormControl('')

  constructor() {
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.includes(input) && !this.allowedNames.includes(input)) {
      return { 'usedName': true };
    }
    return null;
  }
  ngOnInit() {
    this.nameInput= new FormControl(this.value, [
      Validators.required, 
      Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), 
      this.validate_usedName.bind(this)
    ])
  }
  emitChange(){
    this.valueChange.emit(this.nameInput.value)
    this.change.emit({
      oldValue: this.value,
      value: this.nameInput.value,
      valid: this.nameInput.valid
    })
    this.value = this.nameInput.value
  }
}
