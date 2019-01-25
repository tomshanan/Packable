import { Directive, ElementRef, HostBinding, Renderer2, HostListener, Input, OnInit } from '@angular/core';
import { color, appColors } from '../app-colors';

@Directive({
  selector: '[appColor]',
  host: {
    '[style.transition]': '"all 200ms"',
  }
})
export class AppColorDirective implements OnInit {
  element: any;
  @Input('appColor') inputColor:keyof appColors = 'action';
  color: color;

  @HostListener('mouseenter') onMouseEnter() {
    this.setColor(this.color.hover);
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.setColor(this.color.inactive);
  }
  @HostListener('click') onClick() {
    this.setColor(this.color.click);
  }
  constructor(
    private elRef: ElementRef,
    private appColors:appColors,
    private renderer: Renderer2
  ) { 
    this.element = this.elRef.nativeElement
  }
  ngOnInit(){
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
