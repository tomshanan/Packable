import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { isDefined } from '../../../../shared/global-functions';
import { AppColors } from '../../../../shared/app-colors';
import { RippleAnimationConfig } from '@angular/material';

@Component({
  selector: 'number-spinner',
  templateUrl: './number-spinner.component.html',
  styleUrls: ['./number-spinner.component.css']
})
export class NumberSpinnerComponent implements OnInit {
  @Input() number:number = 1;
  private storedNumber:number;
  @Input() min:number = 0;
  @Input() max:number = null;
  @Output() numberChange= new EventEmitter<number>();
  rippleAnimationConfig:RippleAnimationConfig = {enterDuration:150,exitDuration:200}

  constructor(
    public appColors:AppColors
  ) { }

  ngOnInit() {
    if(!this.isValid(this.number)){
      this.number = this.min || this.max
      setTimeout(()=>{
        this.emit()
      },0)
    } else {
      this.storedNumber = this.number
    }
  }
  add(){
    if(this.isValid(this.number+1)){
      this.number++
      this.emit()
    }
  }
  subtract(){
    if(this.isValid(this.number-1)){
      this.number--
      this.emit()
    }
  }
  manualInput(){
    if(this.isValid(this.number)){
      this.emit()
    } else {
      this.number = this.storedNumber
    }
  }
  isValid(n:number):boolean{
    return (this.max === null || n <= this.max) && (this.min === null || n >= this.min)
  }
  emit(){
    this.numberChange.emit(this.number)
    this.storedNumber = this.number
  }
}
