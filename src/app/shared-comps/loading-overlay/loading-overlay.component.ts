import { Component, OnInit, ElementRef, Input, Renderer2, OnChanges, SimpleChanges, AfterViewInit, AfterContentChecked, AfterContentInit } from '@angular/core';

@Component({
  selector: 'loading-wrapper',
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.css']
})
export class LoadingOverlayComponent implements OnInit,OnChanges,AfterContentInit {
  @Input() loading:boolean = false;
  diameter:number = 40;
  parent: Element;

  constructor(
    private elRef:ElementRef,
    private renderer: Renderer2
  ) { 
    
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['loading']){
      if(this.loading){
        this.renderer.addClass(this.elRef.nativeElement,'loading')
      } else {
        this.renderer.removeClass(this.elRef.nativeElement,'loading')
      }
    }
  }

  ngOnInit() {
  }
  ngAfterContentInit(){
    this.setHeight()
  }

  setHeight(){
    let height = this.elRef.nativeElement.clientHeight
    console.log('offset hight = '+height)
    this.diameter = height < this.diameter ? (height>20?height:20) : this.diameter;
  }

}
