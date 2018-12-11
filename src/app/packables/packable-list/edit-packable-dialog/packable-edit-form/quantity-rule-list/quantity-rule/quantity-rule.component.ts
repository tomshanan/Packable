import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { QuantityRule,QuantityType } from '@shared/models/packable.model';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';

export interface RuleChange{
  rule:QuantityRule,
  valid:boolean
}

@Component({
  selector: 'quantity-rule',
  templateUrl: './quantity-rule.component.html',
  styleUrls: ['./quantity-rule.component.css']
})
export class QuantityRuleComponent implements OnInit, OnDestroy {
  @Input() rule: QuantityRule = new QuantityRule();
  @Output() ruleChange = new EventEmitter<RuleChange>()
  @Input() canDelete: boolean = true;
  @Output() onDelete = new EventEmitter<void>();

  
  type: FormControl;
  amount: FormControl;
  repAmount: FormControl;

  get valid():boolean{
    return this.type.valid && this.repAmount.valid && this.amount.valid
  }

  constructor(private fb:FormBuilder) {}

  ngOnInit() {
    this.type = this.fb.control(this.rule.type, Validators.required)
    this.amount = this.fb.control(this.rule.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
    this.repAmount = this.fb.control(this.rule.repAmount, this.validate_quantity_repAmount.bind(this))
    
  }
  ngOnDestroy(){
  }
  validate(){
    this.repAmount.updateValueAndValidity()
    this.amount.updateValueAndValidity()
    this.type.updateValueAndValidity()
  }
  emitUpdate(){
  this.repAmount.updateValueAndValidity()
      this.ruleChange.emit({
        rule:{
          type: this.type.value,
          amount: this.amount.value,
          repAmount: this.repAmount.value || this.rule.repAmount
        },
        valid: this.valid
      })
  }
  delete(){
    this.onDelete.emit()
  }

  validate_quantity_repAmount(control: FormControl): { [s: string]: boolean } {
    let controlValue = control.value;
    if(this.type.value == 'period'){
      if (controlValue == null) {
        return { 'repAmountMissing': true };
      } else if( controlValue < 1){
        return { 'lessThanOne':true }
      }
    }
    return null;
  }
}
