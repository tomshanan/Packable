import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ToolbarComponent implements OnInit {
  @Input() editMode:boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
