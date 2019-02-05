import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { appColors } from '@app/shared/app-colors';

@Component({
  selector: 'card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.css']
})
export class CardButtonComponent implements OnInit {
  @Input() disabled:boolean = false;
  constructor(
    private appColors:appColors
  ) { }

  ngOnInit() {
  }

}
