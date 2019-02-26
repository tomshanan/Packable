import { Directive, OnChanges, Input, HostBinding, ElementRef, SimpleChanges, Renderer2 } from '@angular/core';


@Directive({
  selector: '[animateSize]',
  host: { 
    '[style.display]': '"block"', 
    '[style.overflow]': '"hidden"',
    '(@grow.done)':'lockSize()'
}
})
export class AnimateSizeDirective implements OnChanges {
  @Input() animateSize:number = 0;
  pulse: boolean;
  @Input() startHeight: number = 0;
  endHeight: number;

  constructor(
    private element: ElementRef,
    private renderer:Renderer2
    ) {
      this.animateSize = this.getHeight();
    }

  @HostBinding('@grow')
  get grow() {
    return { value: this.pulse, params: { 
      startHeight: this.startHeight,
      endHeight: this.animateSize 
    } };
  }

  getHeight() {
    return this.element.nativeElement.clientHeight;
  }
  doPulse(){
    this.pulse = !this.pulse;
  }
  ngOnChanges(changes:SimpleChanges) {
    if(changes['animateSize']){
      //this.renderer.removeStyle(this.element.nativeElement,'height')
      this.doPulse();
    }
  }
  lockSize(){
    console.log(`lock container size: ${this.animateSize}`)
    this.renderer.setStyle(this.element.nativeElement,'height',this.animateSize+'px')
  }
  

}