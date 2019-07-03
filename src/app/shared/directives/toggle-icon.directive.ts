import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: 'mat-slide-toggle[toggleIcon]'
})
export class ToggleIconDirective {

  constructor(
    private elRef:ElementRef,
    private renderer: Renderer2,
  ) { 
    
  }

}
