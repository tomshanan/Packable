import { Component, OnInit } from '@angular/core';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Trip } from '../../shared/models/trip.model';
import { Router, ActivatedRoute } from '@angular/router';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DestinationDataService, Destination, DestinationConcatinated } from '../../shared/location-data.service';
import { Observable } from 'rxjs/Observable';
import {  map,startWith } from 'rxjs/operators';



@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './edit-trip.component.css']
})
export class EditTripComponent implements OnInit {
  navParams: navParams;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  editMode = false;

  destination: string;
  destArray: DestinationConcatinated[];
  filteredDestOptions: Observable<DestinationConcatinated[]>;

  tripForm:FormGroup;
  editingTrip: Trip = {
    id: '',
    startDate: '',
    endDate: '',
    destinationId: '',
    profiles: [],
    activities: [],
    updated: ''
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private destService:DestinationDataService
  ) {
    this.tripForm = fb.group({
      destinationId: [''],
      startDate: [''],
      endDate: [''], 
      profiles: this.fb.array([]),
      activities: this.fb.array([])
    })
  }

  ngOnInit() {
    this.destArray = this.destService.concatDestinations;
    this.destinationAutoComplete();
    this.navSetup();
  }
  navSetup() {
    this.navParams = {
      header: this.destination ? 'Trip to '+this.destination : 'New Trip',
      left: {
        enabled: true,
        text: 'Cancel',
        iconClass: 'fas fa-times'
      },
      right: {
        enabled: false,
        text: this.editMode ? 'Save' : 'Create',
        iconClass: 'fas fa-check'
      },
      options: []
    }
    // this.editMode
    //   && this.navParams.options.push({ 
    //     name: (this.advancedForm ? 'Remove' : 'Delete') +' Packable', 
    //     actionName: 'delete' 
    //   })
    //   && this.advancedForm
    //   && this.navParams.options.push({ name: 'Restore Default Settings', actionName: 'restore' });
    // this.packableForm.statusChanges.subscribe(status => {
    //   this.navParams.right.enabled = status == 'VALID' ? true : false;
    // })
  }

  return() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  onDatesSelected(newDates: { from: NgbDateStruct, to: NgbDateStruct }) {
    this.fromDate = newDates.from;
    this.toDate = newDates.to;
  }
  displayPlace(dest?: DestinationConcatinated): string | undefined {
    return dest ? dest.destination : undefined;
  }

  findIndexInDestination(search:string,dest:DestinationConcatinated):number{
    const regex = /[^a-zA-Z0-9\-]+/g;
    let destination = dest.destination.toLowerCase().replace(regex,'');
    let index = -1;
    if(regex.test(search)){
      let searchWords = search.split(regex);
      searchWords.forEach(searchWord=>{
        let i = destination.indexOf(searchWord);
        index = i > -1 && i < index ? i : index;
      })
    } else{
      index = destination.indexOf(search);
    }
    return index;
  }
  
  destinationAutoComplete(){
    this.filteredDestOptions = this.tripForm.get('destinationId').valueChanges
    .pipe(
      startWith<string | Destination>(''),
      map(value => typeof value === 'string' ? value : value.city),
      map(val => {
        val = val.toLowerCase().trim();
        if(val.length>2){
          return this.destArray.filter(dest=>{
            return this.findIndexInDestination(val,dest) > -1;
          }).sort((a,b)=>{
            let aIndex = this.findIndexInDestination(val,a)
            let bIndex  = this.findIndexInDestination(val,b)
            return aIndex - bIndex;
          })
        } else {
          return []
        }
      }),
    )
  }

}
