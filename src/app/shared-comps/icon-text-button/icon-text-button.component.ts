import { Component, OnInit, Input, Output, EventEmitter, Directive, ElementRef, Renderer2, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { RippleAnimationConfig } from '@angular/material';
import { WindowService, screenSize } from '../../shared/services/window.service';
import { isDefined } from '@app/shared/global-functions';
import { appColors, color } from '../../shared/app-colors';
import { Subscription } from 'rxjs';


@Component({
  selector: 'icon-text-button',
  templateUrl: './icon-text-button.component.html',
  styleUrls: ['./icon-text-button.component.css']
})
export class IconTextButtonComponent implements OnInit,OnChanges,OnDestroy {
  @Input('text') text: string = '';
  @Input('svgIcon') svgIcon: string;
  @Input('matIcon') matIcon: string;
  @Input() disabled: boolean = false;
  @Input() showTextFromSize: screenSize;
  @Input('color') inputColor: keyof appColors = 'action'
  color: color;
  rippleRadius: number;
  @Input() buttonWidth: string = null
  @Input() innerPadding: string = null
  @ViewChild('rippleTrigger') rippleTrigger: ElementRef;
  @Output('onClick') emitClick = new EventEmitter<void>()
  windowSub: Subscription;
  hoverState = false;
  /**
  <icon-text-button
  text="text"
  matIcon="ballot"
  svgIcon="t-shirt"
  [disabled]="false"
  showTextFromSize="sm"
  buttonWidth="24px"
  innerPadding="0.2em"
  (onClick)="">
  </icon-text-button>
   */
  constructor(
    public windowService: WindowService,
    private appColors: appColors,
    private hostElement: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.initSizing()
    this.windowSub = this.windowService.change.subscribe(()=>{
      this.initSizing()
    })
  }
  ngOnChanges(changes:SimpleChanges){
    this.initSizing()
  }
  ngOnDestroy(){
    this.windowSub.unsubscribe()
  }
  initSizing(){
    this.color = this.appColors[this.inputColor]
    if (this.setSize()){
      this.renderer.setStyle(this.hostElement.nativeElement, 'font-size', this.buttonWidth)
      let width = this.hostElement.nativeElement.clientWidth
      this.rippleRadius = width * 0.6;
    } else {
      this.renderer.setStyle(this.hostElement.nativeElement, 'font-size', 'inherit')
      this.rippleRadius = 24;
    }
    if(!!this.innerPadding){
      this.renderer.setStyle(this.rippleTrigger.nativeElement,'padding',this.innerPadding)
    }
  }
  setSize(): boolean {
    return !this.showText() && isDefined(this.buttonWidth)
  }

  
  onClick() {
    if (!this.disabled) {
      this.emitClick.emit()
    }

  }
  showText(): boolean {
    if (this.text != '') {
      if (isDefined(this.showTextFromSize)) {
        return this.windowService.min(this.showTextFromSize)
      } else {
        return true
      }
    } else {
      return false
    }
  }
  configRipple: RippleAnimationConfig = {
    enterDuration: 200, exitDuration: 100
  }
}
