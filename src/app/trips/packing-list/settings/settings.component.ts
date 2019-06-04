import { Component, OnInit, OnDestroy } from '@angular/core';
import { PackingListService } from '../packing-list.service';
import { Store } from '@ngrx/store';
import { appState } from '../../../shared/app.reducers';
import {State as userState} from '@app/user/store/userState.model'
import { PackingListSettings } from '../../../shared/models/packing-list.model';
import * as userActions  from '../../../user/store/user.actions';
import { Subscription } from 'rxjs';
import { settings } from 'cluster';

@Component({
  selector: 'packinglist-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit,OnDestroy {
  settings: PackingListSettings = new PackingListSettings()
  packinglist_sub: Subscription;

  constructor(
    private packingListService: PackingListService,
    private store: Store<appState>,
  ) { }

  ngOnInit() {
    this.settings = this.packingListService.packingListSettings || new PackingListSettings();
    this.packinglist_sub = this.packingListService.settingsEmitter.subscribe(settings=>{
      console.log('PackingListSettings received:',settings)
      this.settings = settings;
    })
  }
  ngOnDestroy(){
    this.packinglist_sub && this.packinglist_sub.unsubscribe()
  }
  toggleSettings(setting: keyof PackingListSettings){
    this.settings[setting] = !this.settings[setting]
    this.packingListService.storeSettings(this.settings)
  }
  
}
