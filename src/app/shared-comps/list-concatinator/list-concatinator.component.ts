import { Component, OnInit, Input, HostBinding, ElementRef, ViewChild, Renderer2, OnChanges, SimpleChanges, AfterViewInit, AfterContentInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { isDefined } from '../../shared/global-functions';
import { Subscription } from 'rxjs';
import { color } from '../../shared/app-colors';

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
export class ListConcatinatorComponent implements OnInit, OnChanges,AfterContentInit,OnDestroy {

  @Input('list') stringArray: string[] = [];
  @Input('lines') lines: number = 1;
  @Input('color') color: color;
  @Input('showMore') showMore: boolean = true;
  @Output('open') concatinated = new EventEmitter<boolean>()
  @ViewChild('textContainer') textContainer: ElementRef;
  @ViewChild('testArea') testArea: ElementRef;
  @ViewChild('moreEl') moreEl: ElementRef;
  
  @HostBinding('style.lineHeight') lineHeight:string = '1.5'  // SET LINE HEIGHT FOR THE TEXT
  output: string = '';
  allStrings: string[] = [];
  viewStrings: viewObject[] = [];
  numberUsed: number = 0;
  numberUnused: number = 0;
  showAll: boolean = false;
  sub: Subscription;


  constructor(
    public windowService: WindowService,
    private element: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.setLines()
  }
  ngAfterContentInit(){
    this.assemble()
    this.sub = this.windowService.change.subscribe(()=>this.updateViewObject())
  }
  ngOnChanges(changes: SimpleChanges){
    if(changes['stringArray']){
      this.assemble()
    }
    if(changes['lines']){
      this.setLines()
      this.assemble()
    }
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  setLines(){
    let lineHeight = +this.lineHeight
    let height = lineHeight * this.lines
    this.renderer.setStyle(this.element.nativeElement,'height',height+'em')
  }
  unsetLines(){
    //this.renderer.setStyle(this.element.nativeElement,'height','auto')
    setTimeout(() => {
      let h = this.element.nativeElement.scrollHeight
      this.renderer.setStyle(this.element.nativeElement,'height',h+'px')
    }, 0);
  }
  assemble() {
    this.viewStrings = [];
    this.allStrings = this.stringArray.slice();
    this.numberUsed = 0
    for (let i = 0; this.allStrings.length > i; i++) {
      // populate test area to determine word sizing
      let string = this.allStrings[i]
      let newEl = this.renderer.createElement('span')
      let newText = this.renderer.createText(string+", ")
      this.renderer.appendChild(newEl, newText)
      let elSize = this.appendTestAndGetSize(newEl)
      //populate view object with data from test area
      this.viewStrings.push({
        text: string,
        size: elSize,
        show: false
      })
    }
    this.updateViewObject()
    this.removeTestObjects();
  }
  updateViewObject(){
    // determine container size
    let allowedWidth = this.containerWidth() // minus appendix
    // console.log('allowed width:'+allowedWidth)
    this.numberUsed = 0
    this.numberUnused = 0
    let lastIndex = this.viewStrings.length -1
    let currentLine = 1;
    // determine which words can fit the container and set their 'show' property accordingly
    this.viewStrings.reduce((total,obj,i,arr)=>{

      if(total+obj.size < allowedWidth  
        && (
          (i === lastIndex && this.numberUnused == 0)
          || currentLine < this.lines 
          || total + obj.size + this.appendixWidth() < allowedWidth)
        ){
        total += obj.size
        this.numberUsed++
        obj.show = true
      } else if(currentLine<this.lines){
        // console.log('started next line between: '+arr[i-1].text+" and "+obj.text,`\n totoal width before new line: ${total}`);
        currentLine++ //start next line
        total = obj.size //reset size and add object size
        this.numberUsed++
        obj.show = true
      } else {
        obj.show = false
        this.numberUnused++
        // console.log(
        //   `new total less than allowed? ${total+obj.size} < ${allowedWidth} = ${total+obj.size < allowedWidth}`,
        //   `\nis it last element? ${i} === ${lastIndex}  = ${i === lastIndex }`,
        //   `\nis there room for more? ${total + obj.size} + ${this.appendixWidth()} <= ${allowedWidth}  = ${total + obj.size + this.appendixWidth() <= allowedWidth}`,
        //   )
      }
      
      return total
    }, 0)
    // console.log(this.viewStrings)
  }
  removeTestObjects(){
    //remove objects from test area on the DOM in case it needs to repopulate with a new list
    const childElements = this.testArea.nativeElement.children;
    for (let child of childElements) {
      this.renderer.removeChild(this.testArea.nativeElement, child);
    }
  }
  
  containerWidth(): number {
    return this.element.nativeElement.clientWidth
  }
  appendixWidth(): number {
    return this.moreEl.nativeElement.scrollWidth
  }
  appendTestAndGetSize(element: any): number {
    // append the object in the test area and get the element width
    let widthBefore = this.testArea.nativeElement.scrollWidth
    this.renderer.appendChild(this.testArea.nativeElement, element)
    let width = this.testArea.nativeElement.scrollWidth - widthBefore
    return width
  }

  toggleShowAll(state?:boolean){
    if(isDefined(state)){
      this.showAll = state
    } else {
      this.showAll = !this.showAll
    }
    this.concatinated.emit(this.showAll)
    if(this.showAll){
      this.unsetLines()
    } else {
      this.setLines()
    }
  }
}
