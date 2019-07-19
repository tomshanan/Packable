import { Component, OnInit, Input, ViewChild, TemplateRef, ViewContainerRef, AfterViewInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface button {
  name: string,
  action?: string,
  class: string
}
export interface modalConfig {
  left?: button,
  right?: button,
  header?: string,
  close?: boolean,
  content?: string
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit,AfterViewInit {
  @Input() inputTemplate: TemplateRef<any>;
  @Input() config: modalConfig = {close:true}
  
  @ViewChild('htmlContent', {read:ViewContainerRef}) anchor: ViewContainerRef;
leftAction = new EventEmitter<any>();
rightAction = new EventEmitter<any>();
  
  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit() {
  }
  ngAfterViewInit() {
    if(this.anchor && this.inputTemplate && !this.config.content){
      this.anchor.createEmbeddedView(this.inputTemplate);
    }
  }
  onLeft(){
    let action = this.config.left.action || null;
    this.leftAction.emit(action);
  }
  onRight(){
    let action = this.config.right.action || null;
    this.rightAction.emit(action);
  }
}
