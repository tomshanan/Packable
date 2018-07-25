import { Component, OnInit } from '@angular/core';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Trip } from '../../shared/models/trip.model';
import { Router, ActivatedRoute } from '@angular/router';

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

  ) {
  }

  ngOnInit() {
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
}
