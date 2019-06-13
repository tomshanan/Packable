import { Directive, ElementRef, HostBinding, Renderer2, HostListener, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { color, appColors } from '../app-colors';
import { isDefined } from '../global-functions';

@Directive({
  selector: '[activeColor]',
  host: {
    '[style.transition]': '"all 200ms"',
    '[style.cursor]': 'disabled ? "initial" : "pointer"',
  }
})
export class ActiveColorDirective implements OnInit, OnChanges {
  element: any;
  @Input('activeColor') inputColor:keyof appColors = 'action';
  @Input('colorTarget') targetElement;
  @Input('disabled') disabled: boolean = false;
  color: color;

  @HostListener('mouseenter') onMouseEnter() {
    !this.disabled  && this.setColor(this.color.hover);
  }
  @HostListener('mouseleave') onMouseLeave() {
    !this.disabled  && this.setColor(this.color.inactive);
  }
  @HostListener('mouseup') onMouseUp() {
    !this.disabled  && this.setColor(this.color.hover);
  }
  @HostListener('click') onClick() {
    !this.disabled  && this.setColor(this.color.click);
  }
  @HostListener('touchend') onTouchEnd() {
    !this.disabled  && this.setColor(this.color.inactive);
  }
  @HostListener('touchcancel') onTouchCancel() {
    !this.disabled && this.setColor(this.color.inactive);
  }
  @HostListener('blur') onBlur() {
    !this.disabled && this.setColor(this.color.inactive);
  }
  @HostListener('touchstart') onTouchStart() {
    !this.disabled && this.setColor(this.color.click);
  }
  
  constructor(
    private elRef: ElementRef,
    private appColors:appColors,
    private renderer: Renderer2
  ) { 
  }

  ngOnInit(){
    this.initElement();
  }
  initElement(){
    if(this.element){
      this.renderer.removeStyle(this.element,'color')
    }
    this.element = this.targetElement || this.elRef.nativeElement;
    this.setInitialColor()
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes['responsive']){
      this.setInitialColor()
    }
    if(changes['disabled']){
      this.setInitialColor()
    }
    if(changes['inputColor']){
      this.initElement()
    }
    if(changes['targetElement']){
      this.initElement()
    }
  }
  setInitialColor(){
    this.color = this.appColors[this.inputColor]
    this.setColor(this.color.inactive)
  }
  // disableState(){
  //   let disabled = this.disabled
  //   return disabled === true
  // }
  private setColor(color:string){
    if(this.element){
      if(this.disabled){
        this.renderer.setStyle(this.element,'color',this.color.disabled)
      } else {
        this.renderer.setStyle(this.element,'color',color)
      }
    } 
  }
}

@Directive({
  selector: '[appColor]',
  host: {
    '[style.transition]': '"all 200ms"',
    '[style.cursor]': 'disabled ? "initial" : "pointer"',
  }
})
export class AppColorDirective implements OnInit, OnChanges {
  element: any;
  @Input('appColor') inputColor:keyof appColors = 'action';
  @Input('colorTarget') targetElement;
  @Input('disabled') disabled: boolean = false;
  color: color;
  constructor(
    private elRef: ElementRef,
    private appColors:appColors,
    private renderer: Renderer2
  ) { 
  }

  ngOnInit(){
    this.initElement();
  }
  initElement(){
    if(this.element){
      this.renderer.removeStyle(this.element,'color')
    }
    this.element = this.targetElement || this.elRef.nativeElement;
    this.setInitialColor()
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes['disabled']){
      this.setInitialColor()
    }
    if(changes['inputColor']){
      this.setInitialColor()
    }
    if(changes['targetElement']){
      this.initElement()
    }
  }
  setInitialColor(){
    this.color = this.appColors[this.inputColor]
    this.setColor(this.color.inactive)
  }

  private setColor(color:string){
    if(this.element){
      if(this.disabled){
        this.renderer.setStyle(this.element,'color',this.color.disabled)
      } else {
        this.renderer.setStyle(this.element,'color',color)
      }
    } 
  }
}
