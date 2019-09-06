import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, Validators} from '@angular/forms';
import { allowedNameRegEx, comparableName, hasNameAndId, hasOrigin, usedNamesValidator, MatchImmediately } from '@app/shared/global-functions';


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
  @Input() allowImport: boolean = false;
  @Input('usedNames') usedNamesInput: string[] = [];
  usedNames: string[] = [];
  @Output() valueChange = new EventEmitter<string>()
  @Output() changeEvent = new EventEmitter<NameInputChangeEvent>()
  @Output() importRequest = new EventEmitter<string>()
  @ViewChild('editNameInput') editNameInput: ElementRef;
  allowedName: string;
  matcher = new MatchImmediately()
  
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
  
  ngOnInit() {
    console.log(this.usedNamesInput)
    this.usedNames = this.usedNamesInput.map(used=>comparableName(used))
    this.allowedName = this.value;
    this.nameInput= new FormControl(this.value, [
      Validators.required, 
      Validators.pattern(allowedNameRegEx), 
      usedNamesValidator(this.usedNames,this.allowedName)
    ])
  }
  ngAfterViewInit(){
    if(!this.nameInput.valid){
      window.scrollTo(0,0)
      setTimeout(()=>{
        this.editNameInput.nativeElement.focus()
      },500)
    }
  }
  resetName(){
    this.nameInput.setValue('')
    this.emitChange()
  }
  import(){
    this.importRequest.emit(this.nameInput.value)
  }
  emitChange(){
    //console.log(this.nameInput)
    this.valueChange.emit(this.nameInput.value)
    this.changeEvent.emit({
      oldValue: this.value,
      value: this.nameInput.value,
      valid: this.nameInput.valid
    })
    this.value = this.nameInput.value
  }
}
