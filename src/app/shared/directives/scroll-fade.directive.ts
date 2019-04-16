import { Directive, ElementRef, HostBinding, Renderer2, HostListener, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[scrollFade]',
})
export class scrollFadeDirective implements OnInit {
  @Input('scrollFade') fade: boolean = true
  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) { 
  }

  ngOnInit(){
    
  }
  
}
