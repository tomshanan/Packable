import { Directive, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { MatInput } from '@angular/material';
 
@Directive({
  selector: '[matInput-autofocus]'
})
export class AutofocusDirective implements OnInit {
 
  constructor(private el: MatInput) {
  }
 
  ngOnInit() {
    this.el.focus()
  }
 
}