import { Component, OnInit, Input, Output, EventEmitter, Directive, ElementRef, Renderer2, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { RippleAnimationConfig } from '@angular/material';
import { WindowService, screenSize } from '../../shared/services/window.service';
import { isDefined } from '@app/shared/global-functions';
import { AppColors, Color } from '../../shared/app-colors';
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
  @Input('color') inputColor: keyof AppColors = 'action'
  @Input('reverse') reverse: boolean = false

  color: Color;
  rippleRadius: number;
  @Input() buttonWidth: string = null
  @Input() innerPadding: string = null
  // @ViewChild('rippleTrigger') rippleTrigger: ElementRef;
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
    private appColors: AppColors,
    private hostElement: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    // this.initSizing()
    // this.windowSub = this.windowService.change.subscribe(()=>{
    //   this.initSizing()
    // })
  }
  ngOnChanges(changes:SimpleChanges){
    //this.initSizing()
  }
  ngOnDestroy(){
    // this.windowSub && this.windowSub.unsubscribe()
  }
  initSizing(){
    // this.color = this.appColors[this.inputColor]
    // if (this.setSize()){
    //   this.renderer.setStyle(this.hostElement.nativeElement, 'font-size', this.buttonWidth)
    //   this.renderer.setStyle(this.hostElement.nativeElement, 'line-height', '1em')
    //   this.renderer.setStyle(this.hostElement.nativeElement, 'height', '1em')
    //   let width = this.hostElement.nativeElement.clientWidth
    // } else {
    //   this.renderer.setStyle(this.hostElement.nativeElement, 'font-size', 'inherit')
    //   this.renderer.removeClass(this.hostElement.nativeElement,'line-height')
    //   this.renderer.removeClass(this.hostElement.nativeElement,'height')
    // }
    // if(!!this.innerPadding){
    //   // this.renderer.setStyle(this.rippleTrigger.nativeElement,'padding',this.innerPadding)
    // }
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
    // if (this.text != '') {
      if (isDefined(this.showTextFromSize)) {
        return this.windowService.min(this.showTextFromSize)
      } else {
        return true
      }
    // } else {
    //   return false
    // }
  }
  configRipple: RippleAnimationConfig = {
    enterDuration: 200, exitDuration: 100
  }
}
