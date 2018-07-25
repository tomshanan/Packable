import { Component, OnInit, Input, Output, EventEmitter, Type, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers';
import { FilteredArray, objectInArray } from '../../shared/global-functions';
import { ListEditorService, listEditorParams, item } from '../list-editor/list-editor.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MemoryService } from '../memory.service';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { modalConfig, ModalComponent } from '../../modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


export interface itemSelectorParams {
  original: item[],
  used: item[],
  title: string,
}

@Component({
  selector: 'app-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['../css/full-flex.css', './item-selector.component.css']
})
export class ItemSelectorComponent implements OnInit {

  listFiltered: FilteredArray = new FilteredArray()
  listOriginal: item[];
  title: string;
  listSelected: item[] = [];
  searchFilterInput: string = '';
  alertCounter:number = 0;
  navParams: navParams;
  desktopNavParams: navParams;


  constructor(
    private store: Store<fromApp.appState>,
    private listEditorService: ListEditorService,
    private activatedRoute: ActivatedRoute,
    private router:Router,
    private modalService: NgbModal,
    private memoryService:MemoryService
  ) { }

  ngOnInit() {
    let params = this.listEditorService.params;
    if (!params){
      this.router.navigate(['../'],{relativeTo:this.activatedRoute}) 
    } else {
      this.listOriginal = params.originalList;
      this.listSelected = params.usedList;
      this.title = params.itemName;
      this.listFiltered.original = this.listOriginal;
      this.navSetup();
    }
  }
  navSetup(){
    this.navParams = {
      header: "Select "+this.title,
      left: {
        enabled: true,
        text: 'Done',
        iconClass:'fas fa-chevron-left'
      },
      right: {
        enabled: false,
        text: '',
        iconClass:''
      },
    }
    this.desktopNavParams = {
      header: "Select "+this.title,
      left: {
        enabled: null,
        text: null,
        iconClass:null
      },
      right: {
        enabled: true,
        text: 'Done',
        iconClass:'fas fa-plus'
      },
    }
  }
  
  resetFilter(){
    this.searchFilterInput ='';
    this.applyFilter();
  }

  applyFilter() {
    this.listFiltered.reset();
    this.listFiltered.filterFromSearch('name', this.searchFilterInput)
  }

  objectUsed(item: item){
    return objectInArray(this.listSelected,item,'id')
  }
  availableItems(){
    let num = 0;
    this.listFiltered.filtered.forEach(item=>{
      if(!objectInArray(this.listSelected,item,'id')){
        num++;
      }
    })
    return num;
  }

  toggleItemInSelection(item:item, id:number){
    if(!this.objectUsed(item)){
      this.addItemToSelection(item);
    } else {
      let index = this.listSelected.findIndex(x => x.id == item.id);
      this.removeItemFromSelection(index);
    }
  }
  addItemToSelection(item: item) {
      this.listSelected.push(item)
      this.searchFilterInput = '';
      this.applyFilter();
  }

  addItemFromSearch(item:item){
    if(this.searchFilterInput !='' && !this.objectUsed(item)){
      this.addItemToSelection(item);
    }
  }
  removeItemFromSelection(id: number) {
    let profile = this.memoryService.getProfile();
    if(!profile || this.alertCounter > 0){
      this.listSelected.splice(id, 1);
      this.applyFilter();  
      this.alertCounter++;
    } else {
      let config: modalConfig = {
        right: { name: 'Remove', class: 'btn-outline-danger' },
        header: 'Remove this item?',
        content: 'When you remove '+this.title+" from a Profile you lose all the changes you made to their settings.\nAre you sure you want to remove this?"
      }
      this.openConfirmModal(null, config, () => {
        this.listSelected.splice(id, 1);
        this.applyFilter();  
        this.alertCounter++;
      });
    }
  }

  sendSelectedItems() {
    console.log("selected list:",this.listSelected)
    this.listEditorService.setUsedList(this.listSelected)
    this.return();
  }
  createNew(){
    this.listEditorService.setUsedList(this.listSelected);
    this.router.navigate(['new'], {relativeTo: this.activatedRoute});
  }
  openConfirmModal(tempRef: TemplateRef<any>, config: modalConfig, callback: () => void) {
    config.left = { name: 'Cancel', class: 'btn-outline-secondary' }
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
    modal.componentInstance.config = config;
    modal.componentInstance.leftAction.subscribe((action) => {
      modal.close();
    })
    modal.componentInstance.rightAction.subscribe((action) => {
      callback();
      modal.close();
    })
  }


  return() {
    this.router.navigate(['../'], {relativeTo: this.activatedRoute});
  }


}
