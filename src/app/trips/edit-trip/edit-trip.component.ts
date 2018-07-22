import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbDateStruct, NgbCalendar, NgbInputDatepicker, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false 
  : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;


@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['../../shared/css/full-flex.css','./edit-trip.component.css']
})
export class EditTripComponent implements OnInit {
  @ViewChild('d') d: NgbInputDatepicker;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    console.log(this.innerWidth);
    this.datepickerSize = this.innerWidth > 500 ? 2 : 1;
  }

  public innerWidth: any;
  datepickerSize: number;
  navParams:navParams;
  hoveredDate: NgbDateStruct;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;

  constructor(calendar: NgbCalendar) { 
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 3);
  }

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.datepickerSize = this.innerWidth > 500 ? 2 : 1;

  }
  toggleDatePicker(){
    this.d.toggle()
  }

  onDateSelection(date: NgbDateStruct,d:NgbInputDatepicker) {
     if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      d.toggle();
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }
  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);

}
