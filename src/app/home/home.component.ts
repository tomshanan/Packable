import { Component, OnInit, Renderer2 } from '@angular/core';
import { IconService } from '@app/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { Profile } from '@shared/models/profile.model';
import { StorageService } from '../shared/storage/storage.service';
import { quickTransitionTrigger } from '../shared/animations';
import { WindowService } from '../shared/services/window.service';
import { CollectionComplete } from '../shared/models/collection.model';
import { CollectionFactory } from '../shared/factories/collection.factory';
import { randomBetween } from '@app/shared/global-functions';
import { ProfileFactory } from '../shared/factories/profile.factory';
import { TripWeatherData } from '../shared/services/weather.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../shared/css/mat-card-list.css','./home.component.css'],
  animations: [quickTransitionTrigger]
})
export class HomeComponent implements OnInit {
  loadingWeather:boolean = false;
  weatherData = new TripWeatherData()

  constructor(
    private store:StoreSelectorService,
    private colFac:CollectionFactory,
    private proFac: ProfileFactory,
    private iconService:IconService,
    private storage: StorageService,
    public windowService: WindowService,
    private rendere: Renderer2,
  ) { 
    // this.icons = iconService.profileIcons.icons.slice()
  }
  log(e){
    console.log(e);
  }
  ngOnInit() {
   
  }

  
  generateData(){
    if(confirm("This Will override your user data, Are you sure?")){
      this.storage.generateDummyData();
    }
  }
  saveDummyDate(){
    if(confirm("This Will SAVE the dummy data! Are you sure?")){
      this.storage.setAllUserItemsAndSettings();
    }
  }

}
