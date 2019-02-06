import { Component, OnInit, Input, HostBinding, ElementRef, ViewChild, Renderer2, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { isDefined } from '../../shared/global-functions';

interface viewObject {
  text: string,
  size: number,
  show: boolean
}

@Component({
  selector: 'list-concatinator',
  templateUrl: './list-concatinator.component.html',
  styleUrls: ['./list-concatinator.component.css'],
})
export class ListConcatinatorComponent implements OnInit, OnChanges,AfterViewInit {
  @Input('list') stringArray: string[] = [];
  @ViewChild('textContainer') textContainer: ElementRef;
  @ViewChild('testArea') testArea: ElementRef;
  @ViewChild('moreEl') moreEl: ElementRef;

  output: string = '';
  allStrings: string[] = [];
  viewStrings: viewObject[] = [];
  numberUsed: number = 0;
  numberUnused: number = 0;
  showAll: boolean = false;



  constructor(
    private windowService: WindowService,
    private element: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.assemble()
    this.windowService.change.subscribe(()=>this.updateViewObject())
  }
  ngAfterViewInit(){
  }
  ngOnChanges(changes: SimpleChanges){
    if(changes['stringArray']){
      this.assemble()
    }
  }
  assemble(){
    this.removeAll();
  }

  removeAll(){
    this.viewStrings = [];
    const childElements = this.testArea.nativeElement.children;
    for (let child of childElements) {
      this.renderer.removeChild(this.testArea.nativeElement, child);
    }
    this.appendAll()
  }

  appendAll() {
    this.allStrings = this.stringArray.slice();
    this.numberUsed = 0
    for (let i = 0; this.allStrings.length > i; i++) {
      let string = this.allStrings[i]
      let newEl = this.renderer.createElement('span')
      let newText = this.renderer.createText(string+", ")
      this.renderer.appendChild(newEl, newText)
      let elSize = this.appendTestAndGetSize(newEl)
      this.viewStrings.push({
        text: string,
        size: elSize,
        show: false
      })
    }
    this.updateViewObject()
  }
  updateViewObject(){
    let allowedWidth = this.containerWidth() // minus appendix
    this.numberUsed = 0
    this.numberUnused = 0
    let items = this.viewStrings.length
    this.viewStrings.reduce((total,obj,i)=>{
      total += obj.size
      obj.show = total + this.appendixWidth() < allowedWidth || (i===items-1 && this.numberUnused == 0 && total<allowedWidth)
      obj.show ? this.numberUsed++ : (this.numberUnused++, total-=obj.size)
      return total
    }, 0)
  }
  
  containerWidth(): number {
    return this.element.nativeElement.clientWidth
  }
  appendixWidth(): number {
    return this.moreEl.nativeElement.scrollWidth

  }
  appendTestAndGetSize(element: any): number {
    let widthBefore = this.testArea.nativeElement.scrollWidth
    this.renderer.appendChild(this.testArea.nativeElement, element)
    let width = this.testArea.nativeElement.scrollWidth - widthBefore
    return width
  }

  appendToTest(element: any) {
    this.renderer.appendChild(this.testArea.nativeElement, element)
  }

  toggleShowAll(state?:boolean){
    if(isDefined(state)){
      this.showAll = state
    } else {
      this.showAll = !this.showAll
    }
  }
}
