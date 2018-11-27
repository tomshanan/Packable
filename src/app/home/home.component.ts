import { Component, OnInit } from '@angular/core';
import { IconService } from '@app/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { Profile } from '@shared/models/profile.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  profiles:Profile[];
  icons:string[] = [];
  selectedProfiles = [];
  selectedIcons:string[] = ['010-boy'];

  testChecked = true;
  testDisabled = true;
  testIcon = "hail"

  constructor(
    private store:StoreSelectorService,
    private iconService:IconService
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

}
