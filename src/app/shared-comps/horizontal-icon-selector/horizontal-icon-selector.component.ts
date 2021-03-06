import { Component, OnInit, Renderer2, ViewChild, ElementRef, OnDestroy, Input, Output, EventEmitter, AfterContentInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { AppColors } from '../../shared/app-colors';
import { Subscription, Subject } from 'rxjs';
import { fadeInOut } from '../../shared/animations';


@Component({
  selector: 'horizontal-icon-selector',
  templateUrl: './horizontal-icon-selector.component.html',
  styleUrls: ['./horizontal-icon-selector.component.css'],
  animations: [fadeInOut]
})
export class HorizontalIconSelectorComponent implements OnInit, OnDestroy,AfterViewInit, AfterContentInit {
  @Input('stepWidth') steps:number = 50;
  @Output('scrollEvent') emitScrollEvent = new EventEmitter<number>();
  public scrolling = new Subject<number>()

  public moreLeft:boolean = false;
  public moreRight:boolean = false;
  public windowSub:Subscription;

  @ViewChild('selectorContainer') selectorContainer: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @ViewChild('scrollArea') scrollArea: ElementRef;

  constructor(
    public windowService:WindowService,
    private renderer: Renderer2,
    private cd:ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }
  ngAfterViewInit(){
  }
  ngAfterContentInit(){
    // allow ng-content to load before checking if we need arrows
    this.scrollEvent();
    this.windowSub = this.windowService.change.subscribe(()=>{
      this.scrollEvent();
    })
  }
  ngOnDestroy(){
    this.windowSub.unsubscribe();
    this.scrolling.complete();
  }
  scrollEvent(){
    this.emitScrollEvent.emit(this.scrollPosition())
    this.scrolling.next(this.scrollPosition())
    setTimeout(() => {
      this.moreLeft = this.scrollPosition() > 0
      this.moreRight = this.rightSpace()>0;
    }, 0);
    this.cd.markForCheck()
  }
  scrollRight(){
    let newScrollPisition = this.containerWidth() - 40 + this.scrollPosition()
    newScrollPisition = newScrollPisition -(newScrollPisition%this.steps) - 40
    this.renderer.setProperty(this.scrollArea.nativeElement,'scrollLeft',newScrollPisition)
  }
  scrollLeft(){
    let newScrollPisition = this.scrollPosition() - this.containerWidth() + 40
    newScrollPisition = newScrollPisition + (newScrollPisition%this.steps)
    this.renderer.setProperty(this.scrollArea.nativeElement,'scrollLeft',newScrollPisition)
  }
  scrollToTop(){
    this.renderer.setProperty(this.scrollArea.nativeElement,'scrollLeft','0')
    this.scrollEvent()
  }  

  scrollPosition() {
    return this.scrollArea.nativeElement.scrollLeft
  }
  containerWidth() {
    return this.scrollArea.nativeElement.clientWidth
  }
  scrollAreaWidth(){
    return this.scrollArea.nativeElement.scrollWidth
  }
  rightSpace () {
    return this.scrollAreaWidth() - this.containerWidth() - this.scrollPosition()
  }
}
