import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers'
import * as authActions from '@app/user/store/auth.actions'

import { firebaseSettings } from './user/firebase-settings.object';
import { StorageService } from './shared/storage/storage.service';
import { MatDialogRef, MatDialog } from '@angular/material';
import { WindowService } from './shared/services/window.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class AppComponent implements OnInit {
  constructor(
    private storage: StorageService,
    public windowService:WindowService,
    private store: Store<fromApp.appState>,
  ) {
  }
  ngOnInit() {
    //this.storage.generateDummyData();
    firebase.initializeApp(firebaseSettings)
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        user.getIdToken().then((token) => {
          this.store.dispatch(new authActions.Login())
          this.store.dispatch(new authActions.SetToken(token))
        })
      }
    });
  }
}
