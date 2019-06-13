import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QuantityRule } from '@shared/models/packable.model';
import { isDefined } from '@shared/global-functions';
import { RuleChange } from './quantity-rule/quantity-rule.component';
import { dropInTrigger } from '@app/shared/animations';

@Component({
  selector: 'quantity-rule-list',
  templateUrl: './quantity-rule-list.component.html',
  styleUrls: ['./quantity-rule-list.component.css'],
  animations: [dropInTrigger]
})
export class QuantityRuleListComponent implements OnInit {
@Input() rules: QuantityRule[] = [];
RulesForView: QuantityRule[] = [];
@Output() rulesChange = new EventEmitter<QuantityRule[]>();
get valid(): boolean{
  return this.rulesWithValidators.every(rule=>{
    return rule.valid
  })
}

rulesWithValidators: {rule:QuantityRule,valid:boolean}[] = [];

  constructor() {
  }

  ngOnInit() {
    if (!isDefined(this.rules)){
      this.rules.push(new QuantityRule())
    }
    this.rules.forEach(rule=>
      this.rulesWithValidators.push({rule:rule,valid:true})
    )
    this.RulesForView = this.rules.slice();
  }

  updateRule(index:number, ruleChange:RuleChange){
    this.rulesWithValidators[index] = ruleChange
    if(ruleChange.valid){
      this.rules[index] = ruleChange.rule;
      this.rulesChange.emit(this.rules)
    } 
  }
  deleteRule(index:number){
    this.rules.splice(index,1)
    this.rulesWithValidators.splice(index,1)
    this.RulesForView.splice(index,1)
    this.rulesChange.emit(this.rules)
  }
  addRule(){
    let newRule = new QuantityRule();
    this.rules.push(newRule)
    this.RulesForView.push(newRule)
    this.rulesWithValidators.push({rule:newRule,valid:true})
    this.rulesChange.emit(this.rules)
  }
}
