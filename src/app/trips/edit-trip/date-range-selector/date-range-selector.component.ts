import { Component, OnInit, ViewChild, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { NgbDateStruct, NgbCalendar, NgbInputDatepicker, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { WindowService } from '../../../shared/services/window.service';

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
  selector: 'app-date-range-selector',
  templateUrl: './date-range-selector.component.html',
  styleUrls: ['./date-range-selector.component.css']
})
export class DateRangeSelectorComponent implements OnInit {
  @ViewChild('d') d: NgbInputDatepicker;
  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.innerWidth = window.innerWidth;
  //   this.datepickerSize = this.innerWidth > 500 ? 2 : 1;
  // }
  @Output() datesSelected = new EventEmitter<{ from: moment.Moment, to: moment.Moment }>();

  public innerWidth: any;
  datepickerSize: number;
  hoveredDate: NgbDateStruct;
  @Input() setFromDate: moment.Moment;
  @Input() setToDate: moment.Moment;
  fromDate: NgbDateStruct;
  toDate: NgbDateStruct;
  prevDates: { from: NgbDateStruct, to: NgbDateStruct };
  formattedDate: string;
  selectorOpen = false;
  minDate: NgbDateStruct;

  constructor(private calendar: NgbCalendar, public windowSize:WindowService) {
    this.minDate = calendar.getToday();
  }

  ngOnInit() {
    if (this.setFromDate && this.setToDate) {
      console.log(this.setFromDate, this.setToDate)
      this.fromDate = this.momentToDatepicker(this.setFromDate)
      this.toDate = this.momentToDatepicker(this.setToDate)
      this.formattedDate = this.formatDate(this.fromDate, this.toDate)
    } else {
      this.fromDate = this.minDate;
      this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 3);
    }
    this.prevDates = {
      from: this.fromDate,
      to: this.toDate
    }
    this.innerWidth = window.innerWidth;
    this.datepickerSize = this.innerWidth > 500 ? 2 : 1;
  }

  toggleDatePicker(state?: string) {
    switch (state) {
      case 'open':
        this.d.open()
        this.prevDates.from = this.fromDate;
        this.prevDates.to = this.toDate;
        setTimeout(() => { this.selectorOpen = true; }, 1)
        break;
      case 'close':
        if (this.fromDate && !this.toDate) {
          this.fromDate = this.prevDates.from;
          this.toDate = this.prevDates.to;
        }
        this.formattedDate = this.formatDate(this.fromDate, this.toDate)
        this.datesSelected.emit({
          from: this.momentFromDatepicker(this.fromDate),
          to: this.momentFromDatepicker(this.toDate)
        })
        this.selectorOpen = false;
        setTimeout(() => this.d.close(), 100)
        break;
      default:
        this.d.isOpen() ? this.toggleDatePicker('close') : this.toggleDatePicker('open');
    }
  }

  onDateSelection(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      this.toggleDatePicker('close');
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }
  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  isBeforeMin = date => before(date, this.minDate);

  formatDate(from: NgbDateStruct, to: NgbDateStruct) {
    if (from.month == to.month) {
      return `${from.day} - ${to.day} ${this.getShortMonth(from.month)}`
    } else {
      return `${from.day} ${this.getShortMonth(from.month)} - ${to.day} ${this.getShortMonth(to.month)}`
    }
  }

  getShortMonth(month: number): string {
    let months = { 1: 'Jan', 2: "Feb", 3: 'Mar', 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec" }
    return months[month];
  }
  momentFromDatepicker(date: NgbDateStruct): moment.Moment {
    return moment([date.year, date.month - 1, date.day]);
  }
  momentToDatepicker(date: moment.Moment): NgbDateStruct {
    return {
      day: date.date(),
      month: date.month() + 1,
      year: date.year()
    }
  }
}
