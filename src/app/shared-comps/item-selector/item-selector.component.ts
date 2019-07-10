import { Component, OnInit, Input, Output, EventEmitter, Type, TemplateRef, Renderer2, ElementRef, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FilteredArray, anySpaces, matchWordsScore, isDefined } from '../../shared/global-functions';
import { listItemTrigger, quickTransitionTrigger, animateSize } from '../../shared/animations';
import { AnimationEvent } from '@angular/animations';
import { WindowService } from '../../shared/services/window.service';

export type filterItemLocality = 'user' | 'local' | 'remote';

export interface filterItem {
  score: number,
  show: boolean,
  used: boolean,
  selected: boolean,
}
export interface searchableItem {
  id: string,
  name: string,
  allNames: string[],
  tags: string[]
}

type listItem = searchableItem & filterItem

@Component({
  selector: 'app-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './item-selector.component.css'],
  animations: [quickTransitionTrigger, listItemTrigger, animateSize]
})
export class ItemSelectorComponent implements OnInit {

  @Input('completeList') listOriginal: searchableItem[];
  @Input('usedList') listUsed: string[] = [];
  @Output('onSelect') selectedEvent = new EventEmitter<string[]>();
  @ViewChild('basket') basket: ElementRef;

  selected: searchableItem[] = []
  listFiltered: Array<listItem>;
  searchFilterInput: string = '';
  animateItemsState: number;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private windowService: WindowService,

  ) { }

  ngOnInit() {
    console.log(this.listUsed, this.listOriginal)
    this.listFiltered = this.listOriginal.map(item => {
      return {
        ...item,
        score: 0,
        show: this.listUsed.includes(item.id),
        used: this.listUsed.includes(item.id),
        selected: false,
      }
    })
    this.resetSearch()
  }
  resetSearch() {
    this.searchFilterInput = '';
    this.resetScores()
    this.hideUsed()
    this.sortByName()
  }
  hideUsed() {
    this.listFiltered.forEach(item => {
      item.show = !this.listUsed.includes(item.id)
    })
  }
  sortByName() {
    this.listFiltered.sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
  }


  debouncer = setTimeout(() => { }, 0)

  typeSearch(str:string) {
    this.searchFilterInput = str
    clearTimeout(this.debouncer)
    this.debouncer = setTimeout(() => {
      if(isDefined(this.searchFilterInput)){
        this.calculateScores()
      } else {
        this.resetSearch();
      }
    }, 150)
    
  }
  addItemFromSearch(item:listItem){
    if(item && this.searchFilterInput !='' && !item.selected){
      this.toggleItem(item);
      this.resetSearch()
    }
  }

  resetScores() {
    this.listFiltered.forEach(item=>item.score = 0)
  }
  calculateScores() {
    const searchTerms = this.searchFilterInput.split(anySpaces)
    this.listFiltered.forEach((item,i)=>{
      item.score = searchTerms.reduce((score,searchWord)=>{
        score += Math.max(...item.allNames.map(name=>matchWordsScore(searchWord,name,true,i<5)),0)
        let tagscore = Math.max(...item.tags.map(tag=>matchWordsScore(searchWord,tag,true,i<5)),0)
        score += tagscore>0 ? tagscore/2 : 0;
        return score
      },0)
      item.show = item.score > 0
    })
    this.listFiltered
    .sort((a,b)=>b.score-a.score)
    .sort((a,b)=>a.used?(b.used?0:1):(b.used?-1:0))
    console.log(`scored for search ${this.searchFilterInput}:\n`,this.listFiltered)
  }
  toggleItem(item:listItem){
    if(this.selected.hasId(item.id)){
      item.selected = false
      this.selected.removeElements([item])
    } else{
      item.selected = true
      this.selected.unshift(item)
    }
    this.selectedEvent.emit(this.selected.ids())
  }
  // applySearchFilter() {
  //   this.listFiltered.reset();
  //   this.listFiltered.filterFromSearch('name', this.searchFilterInput)
  // }

  // objectSelected(item: searchableItem):boolean{
  //   return this.selected.idIndex(item.id) > -1
  // }

  // objectUsed(item: searchableItem):boolean {
  //   return this.listUsed.idIndex(item.id) > -1
  // }
  unusedItems():number{
    return this.listFiltered.filter(item=>!item.used).length
  }
  availableItems():number{
    return this.listFiltered.filter(item=>!item.used && item.show).length 
  }

  // toggleItemInSelection(item:searchableItem, id:number){
  //   if(!this.objectUsed(item)){
  //     if(!this.objectSelected(item)){
  //       this.addItemToSelection(item);
  //     } else {
  //       this.removeItemFromSelection(item.id);
  //     }
  //   }
  // }
  // addItemToSelection(item: searchableItem) {
  //     this.selectedWas = this.selected.length;
  //     this.selected.unshift(item)
  //     this.emitSelected();
  // }
  
  // removeItemFromSelection(id: string) {
  //   this.selectedWas = this.selected.length;
  //   let index = this.selected.idIndex(id);
  //   this.selected.splice(index, 1);
  //   this.emitSelected();
  // }

  // emitSelected() {
  //   this.selectedEvent.emit(this.selected)
  // }
  // startHeight: number;
  // setStartHeight(){
  //   this.startHeight = this.basket.nativeElement.clientHeight
  // }
  // getEndHeight(){
  //   let selectedRef = this.basket.nativeElement.querySelector('.ps-selected-container')
  //   return  selectedRef.clientHeight + 10
  // }
  // animateItemStart(e:AnimationEvent){
  //   this.setStartHeight();
  // }
  // animateItemEnd(e:AnimationEvent){
  //   this.animateItemsState = this.getEndHeight()
  //   //his.setStartHight();
  // }
}
