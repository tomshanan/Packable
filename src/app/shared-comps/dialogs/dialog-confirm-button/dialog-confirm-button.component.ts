import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'dialog-confirm-button',
  templateUrl: './dialog-confirm-button.component.html',
  styleUrls: ['./dialog-confirm-button.component.css']
})
export class DialogConfirmButtonComponent implements OnInit,OnChanges {
  @Input() absoluteBottom:boolean = false;

  constructor(
    private elRef:ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes:SimpleChanges){
    if(this.absoluteBottom){
      this.renderer.addClass(this.elRef.nativeElement,'alwaysBottom')
    } else {
      this.renderer.removeClass(this.elRef.nativeElement,'alwaysBottom')
    }
  }

}
