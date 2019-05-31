import { Component, OnInit, AfterViewInit, ElementRef, Input, ViewChild, Renderer2, OnChanges, SimpleChanges, AfterViewChecked } from '@angular/core';

interface childData {
  node:any,
  size: number,
}


@Component({
  selector: 'app-column-divider',
  templateUrl: './column-divider.component.html',
  styleUrls: ['./column-divider.component.css']
})
export class ColumnDividerComponent implements OnInit,AfterViewInit,OnChanges {
  @Input() cols: number = 1;
  hostElement:any;
  @ViewChild('content') contentElementRef: ElementRef;
  contentElement: any;
  colContainer:any;
  childData: childData[] = []
  columnData: childData[] = []
  constructor(
    private elRef:ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.hostElement = this.elRef.nativeElement
  }
  ngOnChanges(changes:SimpleChanges){
    if(this.colContainer && changes['cols'].previousValue !== changes['cols'].currentValue){
      this.distribute(this.childData)
    } 
  }
  ngAfterViewInit(){
    this.contentElement = this.contentElementRef.nativeElement
    this.childData = this.getChildData()
    this.distribute(this.childData)
  }

  distribute(childData:childData[]){
    this.createContainer()
    this.setColumns(this.cols)
    childData.sort((a,b)=>{
      return b.size - a.size
    })
    childData.forEach((child) => {
      let shortest = this.columnData.reduce( (a, b) => {
         return a.size <= b.size ? a : b; 
      });
      shortest.size += child.size
      this.renderer.appendChild(shortest.node,child.node)
    })
    this.columnData.sort((a,b)=>{
      return b.size - a.size
    }).forEach(col=>{
      this.renderer.appendChild(this.colContainer,col.node)
    })
    this.renderer.appendChild(this.hostElement,this.colContainer)
  }

  createContainer(){
    let existing = this.hostElement.querySelector('.colContainer')
    if(existing){
      this.renderer.removeChild(this.hostElement,existing)
    }
    this.colContainer = this.renderer.createElement('div')
    this.renderer.addClass(this.colContainer,'colContainer')
  }
  setColumns(cols:number){
    this.columnData = []
    let size = (Math.floor(100/cols * 1000) / 1000)
    let gutter = cols>1 ? Math.floor((cols-1)*10/cols*1000)/1000 : 0
    let sizeString = gutter>0 ? `calc(${size}% - ${gutter}px)` : size+"%";
    let i:number;
    for(i=0;i<cols;i++){
      let col = this.renderer.createElement('div')
      this.renderer.addClass(col,'column')
      this.renderer.setStyle(col,'flex-basis',sizeString)
      this.renderer.setStyle(col,'max-width',sizeString)
      this.columnData.push({node:col,size:0})
    }    
    
  }
  getChildData(){
    let collections: HTMLCollection = this.contentElement.children
    let childData:childData[] = [];
    [].forEach.call(collections, child => {
      let size = child.querySelectorAll('li').length + 1
      let name = child.querySelector('h6')
      childData.push({
        node: child,
        size: size,
      })
    });
    return childData
  }
}
