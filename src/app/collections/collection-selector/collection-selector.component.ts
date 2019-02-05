import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { SelectedList } from '../../shared/services/selected-list';
import { buttonAction } from '../collection-details-card/collection-details-card.component';
import { iif } from 'rxjs';
import { L } from '@angular/core/src/render3';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NewProfileDialogComponent } from '@app/profiles/new-profile-dialog/new-profile-dialog.component';

@Component({
  selector: 'collection-selector',
  templateUrl: './collection-selector.component.html',
  styleUrls: ['./collection-selector.component.css'],
})
export class CollectionSelectorComponent implements OnInit, OnChanges,OnDestroy {
  @Input() useFilter: boolean = false;
  @Input() collections: CollectionComplete[];
  @Input() selected: string[] = [];
  @Output() selectedChange = new EventEmitter<string[]>()

  filterInput: string = ''
  list: SelectedList;
  viewCollections: CollectionComplete[];

  constructor(
    public dialogRef:MatDialogRef<any>
  ) { }

  ngOnInit() {
    this.list = new SelectedList(...this.selected)
    this.initViewCollections();
    this.dialogRef.updateSize('99vw','100%')
  }
  ngOnDestroy(){
    this.dialogRef.updateSize('99vw','auto')
  }
  initViewCollections() {
    this.viewCollections = this.collections.slice();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected'] && this.selected && this.list) {
      this.list.array = this.selected
    }
    if (changes['collections'] && this.viewCollections) {
      this.initViewCollections()
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

  /* FILTER */
  inputChange() {
    //console.log(this.filterInput);
    if(this.filterInput != ''){
      this.filterViewCollections(this.filterInput)
    } else {
      this.initViewCollections();
    }
  }
  clearInput(){
    this.filterInput = '';
    this.inputChange();
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
          let penalty = 10*track.nonConsec**2 + 2*inputIndex
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
