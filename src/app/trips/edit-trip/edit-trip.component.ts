import { Component, OnInit } from '@angular/core';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['../../shared/css/full-flex.css','./edit-trip.component.css']
})
export class EditTripComponent implements OnInit {


  navParams:navParams;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  constructor() { 
  }

  ngOnInit() {

  }
  onDatesSelected(newDates: {from:NgbDateStruct, to:NgbDateStruct}){
    this.fromDate = newDates.from;
    this.toDate = newDates.to;
  }
}
