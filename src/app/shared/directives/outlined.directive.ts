import { Directive, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: 'mat-icon[outlined],mat-icon[outline]'
})
export class OutlinedDirective {
el:any;
  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
  ) { 
    this.el = this.elRef.nativeElement
    this.renderer.addClass(this.el, 'material-icons-outlined')
  }

}
