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

}
