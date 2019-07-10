import { Component, OnInit, Input, ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'big-button',
  templateUrl: './big-button.component.html',
  styleUrls: ['./big-button.component.css']
})
export class BigButtonComponent implements OnInit,OnChanges {
  @Input('disabled') disabled: boolean = false;
  @Input('icon') icon:{svg?:string,mat?:string} = {svg:'circle'};
  @Input('size') size:string = "24px"
  @Input('innerPadding') innerPadding:string = null;
  

  constructor(
    private hostElement:ElementRef,
    private renderer:Renderer2,
  ) { }

  ngOnInit() {    
    this.initSizing()
  }
  ngOnChanges(changes:SimpleChanges){
    this.initSizing()
  }

  initSizing(){
    if(this.size != null){
      let sizeString:string;
      if(this.innerPadding){
        sizeString = `calc(${this.size} - ${this.innerPadding} * 2)`
        this.renderer.setStyle(this.hostElement.nativeElement,'padding',this.innerPadding)
      } else {
        sizeString = this.size
        this.renderer.removeStyle(this.hostElement.nativeElement,'padding')
      }
      this.renderer.setStyle(this.hostElement.nativeElement,'line-height',sizeString)
      this.renderer.setStyle(this.hostElement.nativeElement,'height',sizeString)
      this.renderer.setStyle(this.hostElement.nativeElement,'width',sizeString)
    }
  }

}
