import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, ElementRef, AfterViewInit, Renderer2, ViewChild } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { SelectedList } from '../../shared/services/selected-list';
import { buttonAction } from '../collection-details-card/collection-details-card.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NewProfileDialogComponent } from '@app/profiles/new-profile-dialog/new-profile-dialog.component';
import { WindowService } from '../../shared/services/window.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'collection-selector',
  templateUrl: './collection-selector.component.html',
  styleUrls: ['./collection-selector.component.css'],
})
export class CollectionSelectorComponent implements OnInit, OnChanges,OnDestroy, AfterViewInit {
  @Input() useFilter: boolean = false;
  @Input() filterInput: string = '';
  @Input() collections: CollectionComplete[];
  @Input() used: CollectionComplete[] = []
  @Input() selected: string[] = [];
  @Input() starIcons: boolean = false;
  @Output() selectedChange = new EventEmitter<string[]>()
  @ViewChild('collectionList') collectionList: ElementRef;
  list: SelectedList;
  viewCollections: CollectionComplete[];
  subscription: Subscription;

  constructor(
    public dialogRef:MatDialogRef<any>,
    private hostElement: ElementRef,
    private renderer: Renderer2,
    public windowService: WindowService
  ) { }

  ngOnInit() {
    this.list = new SelectedList(...this.selected)
    this.initViewCollections();
    this.dialogRef.addPanelClass('dialog-full-height')
  }
  ngAfterViewInit(){
    console.log('collection selector ngAfterViewInit')
    this.resizeHostElement()
    this.subscription = this.windowService.change.subscribe(()=>{
      this.resizeHostElement()
    })
  }
  resizeHostElement(){
    let parent = this.hostElement.nativeElement.parentElement
    let height = parent.offsetHeight
    this.renderer.setStyle(this.hostElement.nativeElement, 'min-height', (height-95)+"px")
  }
  ngOnDestroy(){
    this.dialogRef.removePanelClass('dialog-full-height')
    this.subscription.unsubscribe();
  }
  initViewCollections() {
    this.viewCollections = this.collections.slice();
    this.filterUsed()
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected'] && this.selected && this.list) {
      this.list.array = this.selected
    }
    if (changes['collections'] && this.viewCollections) {
      this.initViewCollections()
    }
    if(changes['filterInput']){
      this.inputChange()
    }
  }
  toggleSelection(id: string, action: buttonAction) {
    if (action == 'deselect') {
      this.list.remove(id)
    } else if (action == 'select') {
      this.list.add(id)
    }
    this.selectedChange.emit(this.list.array)
  }
  /* USED FILTER */
  filterUsed(){
    if(this.used && this.used.length>0){
      this.viewCollections = this.viewCollections.filter(c=> !this.isUsed(c))
    }
  }
  isUsed(collection:CollectionComplete):boolean{
    return this.used.idIndex(collection.id) >= 0
  }

  /* FILTER */
  inputChange() {
    //console.log(this.filterInput);
    if(this.filterInput != ''){
      this.filterViewCollections(this.filterInput)
    } else {
      this.initViewCollections();
    }
  }


  filterViewCollections(input: string) {
    let regex = new RegExp(/([^a-z0-9])+/, 'gi')
    let removeSpaces = (str) => {
      return str.toLowerCase().replace(regex, '')
    }
    let evalScore=(critiria:string,target:String):{score:number,reasons:string[]}=>{
      let reasons = [];
      let score = 100;
      let letters = critiria.split('')
      let track = {lastIndex:-1, cons:0 , nonConsec:0}
      letters.forEach((letter,inputIndex)=>{
        let targetIndex = target.indexOf(letter,track.lastIndex)
        if(targetIndex != -1){
          let offset = Math.abs(inputIndex - targetIndex)
          let offsetPenalty = offset*2
          score -= offsetPenalty
          reasons.push(`-${offsetPenalty} = '${letter.toUpperCase()}' offset(${offset})`)
          track.cons = targetIndex === track.lastIndex + 1 ? track.cons+1 : 0;
          if(track.cons>0){
            let bonus = 10*track.cons**3
            score += bonus
            reasons.push(`+${bonus} = consecutive x ${track.cons}`)
            track.nonConsec = 0;
          } else {
            track.nonConsec++
            let penalty = 5*track.nonConsec + 2*inputIndex
            score -= penalty;
            reasons.push(`-${penalty} = non-consecutive x ${track.nonConsec}`)
          }
        } else {
          track.cons = 0
          track.nonConsec++
          let penalty = 30*track.nonConsec + 10*inputIndex
          score -= penalty;
          reasons.push(`-${penalty} = '${letter}' missing and non consecutive x ${track.nonConsec}`)
        }
        track.lastIndex = targetIndex
      })
      return {score: score > 0 ? score : 0, reasons: reasons};
    }
    input = removeSpaces(input)
    let scoreLog: { id: string, name: string, score: number, reasons:string[]}[] = []
    this.viewCollections = this.collections.filter(c => {
      let packableReasons = [];
      let name = removeSpaces(c.name)
      let packables = c.packables.map(p => removeSpaces(p.name))
      let reducer = (acc,current) => {
        let score = evalScore(input,current).score/4
        if(score>0){
          packableReasons.push(`+${score} (${current})`)
        }
        return +acc+score
      };
      let packableScore = packables.reduce(reducer,0)
      let scoreObject = evalScore(input,name)
      let finalScore = scoreObject.score + packableScore
      scoreLog.push({id: c.id, name: c.name, 'score': finalScore, 'reasons':[...scoreObject.reasons, ...packableReasons]})
      return finalScore > 0
    }).sort((a,b)=>{
      return scoreLog.findId(b.id).score - scoreLog.findId(a.id).score
    })
    // console.log(scoreLog)
  }
} 
