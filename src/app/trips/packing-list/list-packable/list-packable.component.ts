import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { PackingListPackable, pass } from '@shared/models/packing-list.model';
import { WindowService } from '@shared/services/window.service';
import { appColors } from '../../../shared/app-colors';
import { isDefined } from '../../../shared/global-functions';

@Component({
  selector: 'list-packable',
  templateUrl: './list-packable.component.html',
  styleUrls: ['./list-packable.component.css']
})
export class ListPackableComponent implements OnInit,OnChanges {
  @Input('packable') inputPackable: PackingListPackable;
  packable: PackingListPackable;
  @Input('showInvalid') showInvalid: boolean = false;
  @Output('toggleCheck') ToggleCheckEmitter = new EventEmitter<PackingListPackable>()
  @Output('addInvalid') addInvalidEmitter = new EventEmitter<PackingListPackable>()
  @Output('updateQuantity') updateQuantityEmitter = new EventEmitter<PackingListPackable>()
  @Output('editRules') editRulesEmitter = new EventEmitter<void>()
  @Output('toggleEdit') toggleEditEmitter = new EventEmitter<boolean>()

  editMode = false;
  spinnerQuantity: number;
  constructor(
    public windowService: WindowService, // used by template
    public appColors:appColors,
    private eRef: ElementRef
  ) { }

  ngOnInit() {
    console.log('loaded',(this.inputPackable && this.inputPackable.name))
    this.packable = this.inputPackable
    this.spinnerQuantity = this.packable.quantity
  }
  ngOnChanges(changes:SimpleChanges){
    if(this.packable && changes['inputPackable']){
      console.log('reloaded',(this.inputPackable && this.inputPackable.name))
      Object.assign(this.packable, this.inputPackable)
    }
  }
  pass():boolean{
    return pass(this.packable)
  }
  toggleCheck(){
    this.ToggleCheckEmitter.emit(this.packable)
  }
  addInvalid(){
    this.packable.forcePass = true;
    if(this.packable.quantity > 0){
      this.addInvalidEmitter.emit(this.packable)
    } else {
      this.toggleEditMode(true)
    }
  }
  toggleEditMode(state?:boolean){
    this.editMode = isDefined(state) ? state : !this.editMode;
    if(this.editMode){
      this.spinnerQuantity = this.packable.quantity
    }
    this.toggleEditEmitter.emit(this.editMode);
  }

  onSetQuantity(quantity:number){
    this.toggleEditMode(false)
    if(this.packable.quantity != quantity){
      this.packable.forceQuantity = true;
      this.packable.quantity = quantity
      this.updateQuantityEmitter.emit(this.packable)
    }
  }
  editRules(){
    this.editRulesEmitter.emit()
  }
}
