import { Directive, ElementRef, HostBinding, Renderer2, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { color, appColors } from '../app-colors';
import { isDefined } from '../global-functions';

@Directive({
  selector: '[appColor]',
  host: {
    '[style.transition]': '"all 200ms"',
    '[style.cursor]': '"pointer"',
  }
})
export class AppColorDirective implements OnInit {
  element: any;
  @Input('appColor') inputColor:keyof appColors = 'action';
  @Input('appColorTarget') targetElement;
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
    this.element = this.elRef.nativeElement;
  }
  ngOnInit(){
    console.log()
    if(this.targetElement){
      this.element = this.targetElement
    }
    this.color = this.appColors[this.inputColor]
    this.renderer.setStyle(this.element,'color',this.color.inactive)
  }
  get disableState(){
    return this.element.getAttribute('disabled')
  }
  private setColor(color){
    if(this.disableState === true){
      this.renderer.setStyle(this.element,'color',this.color.disabled)
    } else {
      this.renderer.setStyle(this.element,'color',color)
    }
  }
}
