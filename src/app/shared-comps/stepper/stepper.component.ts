import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface Icon {
  icon:{type:'svg'|'mat',name:string}
  text: string,
}

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit,OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ON STEP ',this.currentStep)
  }
  @Input('steps') steps:Icon[] = [];
  @Input('currentStep') currentStep:number = 1;
  @Output('stepClicked') clickEvent = new EventEmitter<number>()

  constructor() { }

  ngOnInit() {
  }
  onClickStep(step:number){
    if(step < this.currentStep){
      console.log('GO TO STEP ',step)
      this.clickEvent.emit(step)
    }
  }
}
