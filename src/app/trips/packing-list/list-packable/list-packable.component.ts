import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { PackingListPackable, PackingListSettings, pass } from '@shared/models/packing-list.model';
import { WindowService } from '@shared/services/window.service';
import { AppColors } from '../../../shared/app-colors';
import { isDefined } from '../../../shared/global-functions';
import { PackingListService } from '../packing-list.service';

@Component({
  selector: 'list-packable',
  templateUrl: './list-packable.component.html',
  styleUrls: ['./list-packable.component.css']
})
export class ListPackableComponent implements OnInit,OnChanges {
  @Input('packable') inputPackable: PackingListPackable;
  packable: PackingListPackable;
  @Output('toggleCheck') ToggleCheckEmitter = new EventEmitter<PackingListPackable>();
  @Output('addInvalid') addInvalidEmitter = new EventEmitter<PackingListPackable>();
  @Output('updateQuantity') updateQuantityEmitter = new EventEmitter<PackingListPackable>();
  @Output('editRules') editRulesEmitter = new EventEmitter<void>();
  @Output('toggleEdit') toggleEditEmitter = new EventEmitter<boolean>();
  @Input() listSettings: PackingListSettings = new PackingListSettings();

  editToggle = false;
  editMode = false;
  spinnerQuantity: number;
  
  constructor(
    public windowService: WindowService, // used by template
    public appColors:AppColors,
    private packingListService: PackingListService,
    private eRef: ElementRef
  ) { }

  ngOnInit() {
    this.packable = this.inputPackable
    this.spinnerQuantity = this.packable.quantity
    this.editMode = this.listSettings.editMode
  }
  ngOnChanges(changes:SimpleChanges){
    if(this.packable && changes['inputPackable']){
      Object.assign(this.packable, this.inputPackable)
    }
    if(changes['listSettings'] && isDefined(this.editToggle)){
      this.editMode = this.listSettings.editMode
    }
  }
  pass():boolean{
    return pass(this.packable)
  }
  toggleCheck(){
    this.ToggleCheckEmitter.emit(this.packable)
  }
  removePackable(){
    this.packable.checked = false
    this.packable.forcePass = false
    this.packable.passChecks = false
    this.packable.forceRemove = true
    this.updateQuantityEmitter.emit(this.packable)
  }
  addInvalid(){
    this.packable.forcePass = true;
    this.packable.forceRemove = false;
    if(this.packable.quantity > 0){
      this.addInvalidEmitter.emit(this.packable)
    } else {
      this.toggleEditing(true)
    }
  }
  toggleEditing(state?:boolean){
    if(this.editMode){
      this.editToggle = isDefined(state) ? state : !this.editToggle;
      if(this.editToggle){
        this.spinnerQuantity = this.packable.quantity
      }
      this.toggleEditEmitter.emit(this.editToggle);
    }
  }

  onSetQuantity(quantity:number){
    this.toggleEditing(false)
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
