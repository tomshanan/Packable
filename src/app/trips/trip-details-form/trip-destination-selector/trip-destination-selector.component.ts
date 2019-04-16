import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { DestinationDataService, Destination } from '@shared/services/location-data.service';
import { MatAutocompleteTrigger } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { startWith, map, debounce, debounceTime } from 'rxjs/operators';
import { isDefined } from '@app/shared/global-functions';

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
  filteredDestOptions: Observable<Destination[]>;
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
      this.trigger.panelClosingActions.subscribe(()=>{
        this.confirmDestination();
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
    return !!this.destService.DestinationById(id)
  }
  displayDestination(dest?: Destination): string | undefined {
    return dest ? dest.fullName : undefined;
  }
  isDestination(input:any): input is Destination {
    return typeof input === 'object' && input.id !== undefined && this.isDestinationIdValid(input.id);
  }
  confirmDestination() {
    let dest = this.destination.value;
    if (!this.isDestination(dest) && this.topDestOption) {
      this.destination.patchValue(this.topDestOption);
    }
  }
  destinationAutoComplete() {
    this.filteredDestOptions = this.destination.valueChanges
      .pipe(
        //tap(search=>console.warn(`Searching "${search}"`)),
        debounceTime(400),
        startWith<string | Destination>(''),
        map(value => typeof value === 'string' ? value : value.city),
        map(val => {
          val = val.toLowerCase().trim();
          //if (val.length > 2) {
            return this.destArray.filter(dest => {
              return this.destService.getScoreOfSearch(val, dest) > 0;
            }).sort((a, b) => {
              let aRank = (a.cityRank && a.cityRank != b.cityRank) ? a.cityRank / 2 : (a.countryRank ? a.countryRank * 3 : 1000);
              let bRank = (b.cityRank && a.cityRank != b.cityRank) ? b.cityRank / 2 : (b.countryRank ? b.countryRank * 3 : 1000);
              let aScore = this.destService.getScoreOfSearch(val, a) + (1000 / aRank)
              let bScore = this.destService.getScoreOfSearch(val, b) + (1000 / bRank)
              return bScore != aScore ? bScore - aScore : aRank - bRank;
            }).slice(0, 10)
            // .map(dest => {
            //   return { ...dest, fullName: `${dest.fullName.substring(0,15)} (${this.destService.getScoreOfSearch(val, dest,true)}) (${dest.cityRank} | ${dest.countryRank})` }
            // })
          // } else {
          //   return []
          // }
        })
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
    return !this.isDestination(control.value) ? {destinationInvalid:true} : null;
  }
}
