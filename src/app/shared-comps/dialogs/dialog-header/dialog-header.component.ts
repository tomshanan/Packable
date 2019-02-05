import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Renderer2, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { isDefined } from '@app/shared/global-functions';

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.css']
})
export class DialogHeaderComponent implements OnInit,OnChanges {
@Input() header: string = ''
@Input() super: string = null;
@Input() maxWidth: number|string = 'none';
@Input() showReturn: boolean = false;
@ViewChild('headerElement') headerElement: ElementRef;
@Output() close = new EventEmitter<void>();
@Output() return = new EventEmitter<void>();
noHeader: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.resize()
    this.noHeader = !isDefined(this.header) && !isDefined(this.super);
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['maxWidth']){
      this.resize()
    }
    if(changes['header'] || changes['super']){
      this.noHeader = !isDefined(this.header) && !isDefined(this.super);
    }
  }
  resize(){
    if(this.maxWidth){
      this.renderer.setStyle(this.headerElement.nativeElement, 'maxWidth',this.maxWidth)
    } else {
      this.renderer.setStyle(this.headerElement.nativeElement, 'maxWidth','none')
    }
  }

  onClose(){
    this.close.emit();
  }
  onReturn(){
    this.return.emit();
  }
}
