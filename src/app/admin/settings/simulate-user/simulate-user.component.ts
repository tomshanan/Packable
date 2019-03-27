import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '@shared/services/user.service';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers'
import * as adminActions from '@app/admin/store/admin.actions'
import { Subscription } from 'rxjs';
import { StoreSelectorService } from '@app/core';
import { MatSlideToggleChange } from '@angular/material';
import { StorageService } from '@shared/storage/storage.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'settings-simulate-user',
  templateUrl: './simulate-user.component.html',
  styleUrls: ['./simulate-user.component.css']
})
export class SimulateUserComponent implements OnInit,OnDestroy {
  simulateState: boolean;
  loadingSimulate: boolean = false
  sub:Subscription;
  constructor(
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    private storageService: StorageService,

  ) { }

  ngOnInit() {
    this.sub = this.storeSelector.adminState_obs.subscribe(state =>{
      this.simulateState = state.simulateUser
      console.log('state change: ',state)
    })
  }
  ngOnDestroy(){
    this.sub.unsubscribe()
  }
  onChangeSimulate(e:MatSlideToggleChange){
    this.loadingSimulate = true;
    let bool = e.checked
    this.store.dispatch(new adminActions.adminSimulateUser(bool))
  }
}
