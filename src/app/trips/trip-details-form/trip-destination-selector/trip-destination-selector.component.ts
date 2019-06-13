import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { DestinationDataService, Destination } from '@shared/services/location-data.service';
import { MatAutocompleteTrigger, MatOptionSelectionChange } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { startWith, map, debounce, debounceTime, tap } from 'rxjs/operators';
import { isDefined, round } from '@app/shared/global-functions';
import { cities, countries } from '../../../shared/location-data-object';

interface score {
  score:number
}
type DestinationWithScore = Destination & score

@Component({
  selector: 'trip-destination-selector',
  templateUrl: './trip-destination-selector.component.html',
  styleUrls: ['./trip-destination-selector.component.css']
})
export class TripDestinationSelectorComponent implements OnInit, AfterViewInit,OnDestroy,OnChanges {

  @Input('destination') setDestination: Destination;
  @Input('disabled') disabled: boolean = false;

  @Output('changeDestination') changeDestinationEvent = new EventEmitter<Destination>()

  destination:FormControl
  destinationName: string;
  destArray: Destination[];
  filteredDestOptions: Observable<DestinationWithScore[]>;
  topDestOption: Destination;
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;
  @ViewChild('inputDestination') inputDestination: ElementRef;  
  subs: Subscription = new Subscription()
  constructor(
    private destService: DestinationDataService,
    private fb: FormBuilder,
  ) { 
    this.destination = fb.control('',this.validator_destinationInvalid.bind(this))
    this.setDisabledState()
  }
  
  ngOnInit() {
    this.destArray = this.destService.destinations;
    if(isDefined(this.setDestination)){
      this.destination.setValue(this.setDestination)
    }
    this.destinationAutoComplete();
  }
  ngAfterViewInit (){
    this.subs.add(
      this.trigger.panelClosingActions.subscribe((selectionChange:MatOptionSelectionChange)=>{
        console.log('SELECTED',selectionChange)
        if(!selectionChange && this.destination.value != ''){
          this.confirmDestination();
        }
      })
    )
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['setDestination'] && isDefined(this.setDestination) && isDefined(this.destination)){
      this.destination.setValue(this.setDestination)
      this.destination.updateValueAndValidity()
    }
    if(changes['disabled'] && isDefined(this.disabled) && isDefined(this.destination)){
      this.setDisabledState()
      this.destination.updateValueAndValidity()
    }
  }
  setDisabledState(){
    if(this.disabled === true){
      this.destination.disable()
    } else {
      this.destination.enable()
    }
  }
  ngOnDestroy(){
    this.subs.unsubscribe()
  }
  isDestinationIdValid(id:string):boolean {
    return !!this.destService.findDestination(id)
  }
  displayDestination(dest?: Destination): string | undefined {
    return dest ? dest.fullName : undefined;
  }
  isDestination(input:any): input is Destination {
    console.log('isDestination input',input)
    const isObject = typeof input === 'object'
    const cityIdDefined = input && isDefined(input['cityId'])
    const isDestinationIdValid = cityIdDefined && this.isDestinationIdValid(input.cityId)
    console.log(`isObject`,isObject);
    console.log(`cityIdDefined`,isObject);
    console.log(`isDestinationIdValid`,isDestinationIdValid);
    return isObject && cityIdDefined && isDestinationIdValid;
  }
  confirmDestination(value?:string) {
    let dest = this.destination.value;
    if (!this.isDestination(dest) && this.topDestOption) {
      this.destination.patchValue(this.topDestOption);
    }
  }
  destinationAutoComplete() {
    let logComparison = ''
    let searchterm:string = ''
    this.filteredDestOptions = this.destination.valueChanges
      .pipe(
        tap(val=>console.log(`this.destination=`,val)),
        debounceTime(300),
        startWith<string | Destination>(''),
        map(value => typeof value === 'string' ? value : value.fullName),
        map(val => {
          logComparison = ''
          searchterm = val
          val = val.toLowerCase().trim();
          //if (val.length > 2) {
            return this.destArray
            .map(dest=>{
              let score = this.destService.getScoreOfSearch(val, dest)
              return {...dest,score:score}//,fullName:dest.fullName+` (${score})`} // add the score to the output string
            })
            .sort((a, b) => { // sort by score
              return b.score - a.score
            })
            .slice(0, 10)
            .sort((a, b) => { // sort by ranking
              if (round(a.score) == round(b.score)){
                // prioritise city rank over country rank
                let aRank = a.cityRank ? a.cityRank : (a.countryRank ? 1000 + a.countryRank : null)
                let bRank = b.cityRank ? b.cityRank : (b.countryRank ? 1000 + b.countryRank : null)
                return aRank ? (bRank ? aRank-bRank : -1) : (bRank ? 1 : 0)
              } else {
                // logComparison += `${a.cityNames[0]} = ${a.score} (ranks ${a.cityRank},${a.countryRank}) ~=`
                // logComparison += `${b.cityNames[0]} = ${b.score} (ranks ${b.cityRank},${b.countryRank}) \n`
                return 0
              }
            })
        }),
        // show the score calculations for first result and output Comparison Log
        // tap(results=>{
        //   let firstResult = (results && results[0] && this.destService.DestinationByCityId(results[0].cityId)) || null
        //   firstResult && console.log("First Result: "+firstResult.fullName + "="+this.destService.getScoreOfSearch(searchterm,firstResult,true))
        //   console.log('---COMPARIOSON TESTS---\n'+logComparison)
        // })
      )
    this.subs.add(
      this.filteredDestOptions.subscribe(list => {
        this.topDestOption = list[0];
      })
    )
    this.subs.add(
      this.destination.valueChanges.subscribe(val=>{
        this.changeDestinationEvent.emit(this.destination.value)
      })
    )

  }
  validator_destinationInvalid(control:AbstractControl):{[key:string]:boolean} | null{
    const isDest = this.isDestination(control.value)
    console.log('validation:',isDest, control.value)
    return !isDest ? {destinationInvalid:true} : null;
  }
}
