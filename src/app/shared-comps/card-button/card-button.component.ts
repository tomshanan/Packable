import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AppColors } from '@app/shared/app-colors';

@Component({
  selector: 'card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.css']
})
export class CardButtonComponent implements OnInit {
  @Input() disabled:boolean = false;
  constructor(
    public appColors:AppColors
  ) { }

  ngOnInit() {
  }

}
