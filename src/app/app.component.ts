import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { firebaseSettings } from './user/firebase-settings.object';
import { StorageService } from './shared/storage/storage.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None 

})
export class AppComponent implements OnInit {
  constructor(
    private storage: StorageService
  ){
  }
  ngOnInit(){
    this.storage.generateDummyData();
    firebase.initializeApp(firebaseSettings)
  }
    
}
