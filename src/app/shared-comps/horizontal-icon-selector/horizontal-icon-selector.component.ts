import { Component, OnInit, Renderer2, ViewChild, ElementRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { appColors } from '../../shared/app-colors';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'horizontal-icon-selector',
  templateUrl: './horizontal-icon-selector.component.html',
  styleUrls: ['./horizontal-icon-selector.component.css']
})
export class HorizontalIconSelectorComponent implements OnInit, OnDestroy {
  @Input('stepWidth') steps:number = 50;
  @Output('scrollEvent') emitScrollEvent = new EventEmitter<number>();
  public scrolling = new Subject<number>()

  private moreLeft:boolean;
  private moreRight:boolean;
  private windowSub:Subscription;

  @ViewChild('selectorContainer') selectorContainer: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @ViewChild('scrollArea') scrollArea: ElementRef;

  constructor(
    private windowService:WindowService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    setTimeout(()=>{
      this.scrollEvent();
    }, 1)
    this.windowSub = this.windowService.change.subscribe(()=>{
      this.scrollEvent();
    })
  }
  ngOnDestroy(){
    this.windowSub.unsubscribe();
    this.scrolling.complete()
  }
  scrollEvent(){
    this.emitScrollEvent.emit(this.scrollPosition)
    this.scrolling.next(this.scrollPosition)
    this.moreLeft = this.scrollPosition > 0
    this.moreRight = this.rightSpace>0;
  }
  scrollRight(){
    let newScrollPisition = this.containerWidth - 40 + this.scrollPosition
    newScrollPisition = newScrollPisition -(newScrollPisition%this.steps) - 40
    this.renderer.setProperty(this.scrollArea.nativeElement,'scrollLeft',newScrollPisition)
  }
  scrollLeft(){
    let newScrollPisition = this.scrollPosition - this.containerWidth + 40
    newScrollPisition = newScrollPisition + (newScrollPisition%this.steps)
    this.renderer.setProperty(this.scrollArea.nativeElement,'scrollLeft',newScrollPisition)
  }
  scrollToTop(){
    this.renderer.setProperty(this.scrollArea.nativeElement,'scrollLeft','0')
    this.scrollEvent()
  }  

  get scrollPosition() {
    return this.scrollArea.nativeElement.scrollLeft
  }
  get containerWidth() {
    return this.scrollArea.nativeElement.clientWidth
  }
  get scrollAreaWidth(){
    return this.scrollArea.nativeElement.scrollWidth
  }
  get rightSpace () {
    return this.scrollAreaWidth - this.containerWidth - this.scrollPosition
  }
}
