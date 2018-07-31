import { Component, OnInit } from '@angular/core';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Trip } from '../../shared/models/trip.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DestinationDataService, Destination } from '../../shared/location-data.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { tap } from "rxjs/operators";





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
  destArray: Destination[];
  filteredDestOptions: Observable<Destination[]>;

  tripForm: FormGroup;
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
    private destService: DestinationDataService
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
    this.destArray = this.destService.destinations;
    this.destinationAutoComplete();
    this.navSetup();
  }
  navSetup() {
    this.navParams = {
      header: this.destination ? 'Trip to ' + this.destination : 'New Trip',
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
  displayPlace(dest?: Destination): string | undefined {
    return dest ? dest.fullName : undefined;
  }


  destinationAutoComplete() {
    this.filteredDestOptions = this.tripForm.get('destinationId').valueChanges
      .pipe(
        //tap(search=>console.warn(`Searching "${search}"`)),
        startWith<string | Destination>(''),
        map(value => typeof value === 'string' ? value : value.city),
        map(val => {
          val = val.toLowerCase().trim();
          if (val.length > 2) {
            return this.destArray.filter(dest => {
              return this.destService.getScoreOfSearch(val, dest) > 0;
            }).sort((a, b) => {
              let aRank = (a.cityRank && a.cityRank != b.cityRank) ? a.cityRank/2 : (a.countryRank ? a.countryRank*3 : 1000);
              let bRank = (b.cityRank && a.cityRank != b.cityRank) ? b.cityRank/2 : (b.countryRank ? b.countryRank*3 : 1000);
              let aScore = this.destService.getScoreOfSearch(val, a) + (1000 / aRank)
              let bScore = this.destService.getScoreOfSearch(val, b) + (1000 / bRank)
              return bScore != aScore ? bScore - aScore :  aRank - bRank ;
            }).slice(0, 10)
            // .map(dest => {
            //   return { ...dest, fullName: `${dest.fullName.substring(0,15)} (${this.destService.getScoreOfSearch(val, dest)}) (${dest.cityRank} | ${dest.countryRank})` }
            // })
          } else {
            return []
          }
        })
    )
  }

}
