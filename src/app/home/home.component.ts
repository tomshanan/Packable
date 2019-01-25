import { Component, OnInit, Renderer2 } from '@angular/core';
import { IconService } from '@app/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { Profile } from '@shared/models/profile.model';
import { StorageService } from '../shared/storage/storage.service';
import { quickTransitionTrigger } from '../shared/animations';
import { WindowService } from '../shared/services/window.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../shared/css/mat-card-list.css','./home.component.css'],
  animations: [quickTransitionTrigger]
})
export class HomeComponent implements OnInit {
  profiles:Profile[];
  icons:string[] = [];
  selectedProfiles = [];
  selectedIcons:string[] = ['010-boy'];

  testSelected = true;
  
  constructor(
    private store:StoreSelectorService,
    private iconService:IconService,
    private storage: StorageService,
    private windowService: WindowService,
    private rendere: Renderer2,
  ) { 
    this.icons = iconService.profileIcons.icons.slice()
  }
  log(e){
    console.log(e);
  }
  ngOnInit() {
    this.profiles = this.store.profiles.slice();
    let james = this.profiles.find(p=>p.name == 'James')
    this.selectedProfiles.push(james.id)
  }
  generateData(){
    if(confirm("This Will override your user data, and save it! Are you sure?")){
      this.storage.generateDummyData();
    }
  }

}
