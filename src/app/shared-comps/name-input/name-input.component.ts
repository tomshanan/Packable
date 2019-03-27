import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatInput } from '@angular/material';
import { allowedNameRegEx, comparableName } from '@app/shared/global-functions';

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
  @Input('usedNames') usedNamesInput: string[] = [];
  usedNames: string[] = [];
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
  (changeEvent)='changeEvent($event:NameInputChangeEvent)'>
  </name-input>
 */
  nameInput: FormControl = new FormControl('')

  constructor() {
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = comparableName(control.value)
    if (this.usedNames.includes(input) && input !== comparableName(this.allowedName)) {
      return { 'usedName': true };
    }
    return null;
  }
  ngOnInit() {
    this.usedNames = this.usedNamesInput.map(str=>comparableName(str))
    this.allowedName = this.value;
    this.nameInput= new FormControl(this.value, [
      Validators.required, 
      Validators.pattern(allowedNameRegEx), 
      this.validate_usedName.bind(this)
    ])
  }
  ngAfterViewInit(){
    setTimeout(()=>{
      this.editNameInput.nativeElement.focus()
    },100)
  }
  resetName(){
    this.nameInput.setValue('')
    this.emitChange()
  }
  emitChange(){
    this.valueChange.emit(this.nameInput.value)
    this.changeEvent.emit({
      oldValue: this.value,
      value: this.nameInput.value,
      valid: this.nameInput.valid
    })
    this.value = this.nameInput.value
  }
}
