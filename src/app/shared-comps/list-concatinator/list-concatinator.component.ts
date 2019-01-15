import { Component, OnInit, Input, HostBinding, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { WindowService } from '../../shared/services/window.service';
import { element } from 'protractor';

@Component({
  selector: 'list-concatinator',
  templateUrl: './list-concatinator.component.html',
  styleUrls: ['./list-concatinator.component.css'],
})
export class ListConcatinatorComponent implements OnInit {
  @Input('list') stringArray: string[] = [];
  @ViewChild('textContainer') textContainer: ElementRef;
  @ViewChild('testArea') testArea: ElementRef;
  output: string = '';
  allStrings: string[] = [];
  numberUsed: number = 0;
  get numberUnused() { return this.allStrings.length - this.numberUsed }

  constructor(
    private windowService: WindowService,
    private element: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    let timeout = setTimeout(() => { }, 0)
    this.assemble()
    this.windowService.change.subscribe(() => {
      clearTimeout(timeout)
      timeout = setTimeout(() => { this.assemble() }, 400)
    })
  }
  assemble() {
    this.removeAll();
    this.allStrings = this.stringArray.slice();
    this.numberUsed = 0
    for (let i = 0; this.allStrings.length > i; i++) {
      let newEl = this.renderer.createElement('span')
      let newText = this.renderer.createText(this.allStrings[i])
      this.renderer.appendChild(newEl, newText)
      let elSize = this.getSize(newEl)
      console.log(`${elSize} + ${this.textWidth()} = ${elSize + this.textWidth()} (${this.containerWidth()})`)
      if (elSize + this.textWidth() <= this.containerWidth()) {
        this.append(newEl)
        console.log('added:',newEl)
        this.numberUsed++
      } else {
        break;
      }
    }
    console.log(`unused: ${this.numberUnused}`);
  }
  removeAll(){
    const childElements = this.textContainer.nativeElement.children;
    for (let child of childElements) {
      this.renderer.removeChild(this.textContainer.nativeElement, child);
      console.log(`removed:`,child)
    }
  }
  containerWidth(): number {
    return this.element.nativeElement.clientWidth
  }
  textWidth(): number {
    return this.textContainer.nativeElement.scrollWidth
  }

  getSize(element: any): number {
    this.renderer.appendChild(this.testArea.nativeElement, element)
    let width = this.testArea.nativeElement.scrollWidth
    this.renderer.removeChild(this.testArea.nativeElement, element)
    return width
  }
  append(element: any) {
    this.renderer.appendChild(this.textContainer.nativeElement, element)
  }

}
