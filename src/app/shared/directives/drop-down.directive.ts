import { Directive, OnInit, ElementRef, Renderer2, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: '[DropDown]'
})
export class DropDownDirective implements OnInit {

  ngOnInit() {
  }
  constructor(private elRef: ElementRef, private renderer:Renderer2) { }
  @HostBinding('class.show') isOpen = false;
  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
    let child = this.elRef.nativeElement.querySelector('.dropdown-menu');
    if (this.isOpen) {
      this.renderer.addClass(child,'show');
    } else {
      this.renderer.removeClass(child,'show');
    }
  }
}
