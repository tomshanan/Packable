import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PackingListPackable } from '@shared/models/packing-list.model';
import { WindowService } from '@shared/services/window.service';
import { appColors } from '../../../shared/app-colors';

@Component({
  selector: 'list-packable',
  templateUrl: './list-packable.component.html',
  styleUrls: ['./list-packable.component.css']
})
export class ListPackableComponent implements OnInit {
  @Input() packable: PackingListPackable;
  @Input('showInvalid') showInvalid: boolean = false;
  @Output('toggleCheck') ToggleCheckEmitter = new EventEmitter<PackingListPackable>()
  @Output('addInvalid') addInvalidEmitter = new EventEmitter<PackingListPackable>()
  @Output('updateQuantity') updateQuantityEmitter = new EventEmitter<PackingListPackable>()
  @Output('onRemove') removeEmitter = new EventEmitter<void>()

  editMode = false;

  constructor(
    public windowService: WindowService, // used by template
    public appColors:appColors,
  ) { }

  ngOnInit() {
  }
  pass():boolean{
    return this.packable.passChecks || this.packable.forcePass
  }
  toggleCheck(){
    this.ToggleCheckEmitter.emit(this.packable)
  }
  addInvalid(){
    this.packable.forcePass = true;
    this.addInvalidEmitter.emit(this.packable)
  }
  toggleEditMode(state?:boolean){
    this.editMode = state !== null ? state : !this.editMode;
  }

  onSetQuantity(quantity:number){
    if(this.packable.quantity != quantity && quantity > 0){
      this.packable.forceQuantity = true;
      this.packable.quantity = quantity
      this.updateQuantityEmitter.emit(this.packable)
    } else if (quantity === 0){
      this.removeEmitter.emit()
    }
  }
  editRules(){
    // OPEN MODAL
    // 
  }
}
