import { Component, OnInit, Input, EventEmitter, OnChanges, SimpleChange, SimpleChanges, Output } from '@angular/core';
export type actionState = 'edit'|'loading'|'confirm'|'cancel'
@Component({
  selector: 'setting-toggle',
  templateUrl: './setting-toggle.component.html',
  styleUrls: ['./setting-toggle.component.css']
})
export class SettingToggleComponent implements OnInit,OnChanges {
  @Input() editMode:boolean = false;
  @Input('actionState') actionStateInput: actionState;
  actionState:actionState = 'edit';
  @Output() editModeChange = new EventEmitter<boolean>()
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes['actionStateInput']){
      this.actionState = this.actionStateInput
    }
    if(changes['editMode']){
      this.editMode = this.editMode
    }
  }
  onChangeEditMode(bool:boolean){
    this.editModeChange.emit(bool)
  }
  toggleEditMode(){
    if(!this.editMode){
      this.actionState = this.actionStateInput || 'cancel'
    } else {
      this.actionState = this.actionStateInput || "edit"
    }
    this.onChangeEditMode(!this.editMode)
  }
}
