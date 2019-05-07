import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs';
import { DestinationDataService } from '../shared/services/location-data.service';
import { cities } from '@app/shared/location-data-object';
import { countries } from '../shared/location-data-object';

interface cityData { id:string, displayName:string, allNames:string[], countryId:string, weatherId:string, rank:number}
interface countryData { id:string, displayName:string, allNames:string[], rank:number}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  sub:Subscription;
  outputText:string = 'hi\nHow are you'
  
  constructor(
    public user: UserService,
    public destData: DestinationDataService,
  ) { 

  }

  ngOnInit() {

  }
}
