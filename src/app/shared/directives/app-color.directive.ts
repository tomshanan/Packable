import { Directive, ElementRef, HostBinding, Renderer2, HostListener, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { color, appColors } from '../app-colors';
import { isDefined } from '../global-functions';

@Directive({
  selector: '[appColor]',
  host: {
    '[style.transition]': '"all 200ms"',
    '[style.cursor]': 'disableState() ? "initial" : "pointer"',
  }
})
export class AppColorDirective implements OnInit, OnChanges {
  element: any;
  @Input('appColor') inputColor:keyof appColors = 'action';
  @Input('appColorTarget') targetElement;
  @Input('disabled') disabled: boolean = false;
  color: color;

  @HostListener('mouseenter') onMouseEnter() {
    this.setColor(this.color.hover);
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.setColor(this.color.inactive);
  }
  @HostListener('mouseup') onMouseUp() {
    this.setColor(this.color.hover);
  }
  @HostListener('click') onClick() {
    this.setColor(this.color.click);
  }
  @HostListener('touchend') onTouchEnd() {
    this.setColor(this.color.inactive);
  }
  @HostListener('touchcancel') onTouchCancel() {
    this.setColor(this.color.inactive);
  }
  @HostListener('blur') onBlur() {
    this.setColor(this.color.inactive);
  }
  @HostListener('touchstart') onTouchStart() {
    this.setColor(this.color.click);
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
  disableState(){
    let disabled = this.disabled
    return disabled === true
  }
  private setColor(color:string){
    if(this.element){
      if(this.disableState()){
        this.renderer.setStyle(this.element,'color',this.color.disabled)
      } else {
        this.renderer.setStyle(this.element,'color',color)
      }
    } 
  }
}
