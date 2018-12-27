import { Component, OnInit, Input, Output, EventEmitter, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { IconService } from '@app/core';
import { RippleAnimationConfig } from '@angular/material';
import { WindowService } from '../../shared/services/window.service';

@Component({
  selector: 'app-icon-checkbox',
  templateUrl: './icon-checkbox.component.html',
  styleUrls: ['./icon-checkbox.component.css']
})
export class IconCheckboxComponent implements OnInit {

  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() icon: string;
  @Input() iconOn:string;
  @Input() svg:boolean = true;
  @Input() smallScreen: boolean = false;
  @Input() spacer: string = "0px";
  @Output() checkedChange = new EventEmitter<boolean>()
  @Output() change = new EventEmitter<boolean>()
  @ViewChild('checkboxContainer')  checkboxContainer: ElementRef
  rippleColor= "rgba(233,30,99,0.2)"
  animationConfig: RippleAnimationConfig;

  constructor(
    private iconService: IconService,
    private wService: WindowService,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) { }

  ngOnInit() {
    this.animationConfig = {
      enterDuration:150,
    }
    this.renderer.setStyle(this.checkboxContainer.nativeElement,'margin-right',this.spacer)
  }

  toggle(state:boolean = null){
    if (!this.disabled){
      this.checked = state==null ? !this.checked : state;
      this.onChange();
    }
  }

  onChange(){
    this.change.emit(this.checked)
    this.checkedChange.emit(this.checked)
  }
}
