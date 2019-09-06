import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { WindowService } from './shared/services/window.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent implements OnInit {
  constructor(
    public windowService:WindowService,
  ) {
  }
  ngOnInit() {

  }
}
