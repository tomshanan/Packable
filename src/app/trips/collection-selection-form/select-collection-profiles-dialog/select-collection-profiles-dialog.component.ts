import { Component, OnInit, Inject } from '@angular/core';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { Profile } from '../../../shared/models/profile.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { WeatherRule } from '../../../shared/models/weather.model';
import { weatherFactory } from '../../../shared/factories/weather.factory';
import { WeatherService, TripWeatherData } from '../../../shared/services/weather.service';


export interface CollectionProfilesDialog_data {
  collection: CollectionComplete,
  profileGroup: Profile[],
  selectedProfiles: Profile[],
  weatherData: TripWeatherData,
  content?: string
}
@Component({
  selector: 'app-select-collection-profiles-dialog',
  templateUrl: './select-collection-profiles-dialog.component.html',
  styleUrls: ['./select-collection-profiles-dialog.component.css']
})
export class SelectCollectionProfilesDialogComponent implements OnInit {

  collection: CollectionComplete;
  profileGroup: Profile[];
  selectedProfiles: string[];
  header:string;
  content:string;
  packablesString: string;
  wRules: WeatherRule;
  packablesVary:boolean = false;
  wData:TripWeatherData;
  weatherCheck: {conditionsMet:boolean,response:string[]};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CollectionProfilesDialog_data,
    public dialogRef: MatDialogRef<SelectCollectionProfilesDialogComponent>,
    public weatherFac: weatherFactory,
    public WeatherService:WeatherService,
  ) {
    this.collection = data.collection;
    this.profileGroup = data.profileGroup.slice()
    this.selectedProfiles = data.selectedProfiles.ids()
    this.header = this.collection.name
    this.content = data.content || '<b>Who should pack this collection?</b>'
    this.packablesString = this.collection.packables.map(p=>p.name).join(', ')
    this.wData = data.weatherData
    this.wRules = this.collection.weatherRules
    this.weatherCheck = this.WeatherService.checkWeatherRules(this.wRules,this.wData)
    if(this.profileGroup.some(p =>{
      return p.collections.hasId(this.collection.id)
    })) {
      this.packablesVary = true;
    }
    
  }

  ngOnInit() {
  }
  onConfirm(){
    this.onClose(this.profileGroup.filter(p=>this.selectedProfiles.includes(p.id)))
  }
  onClose(profiles?:Profile[]){
    this.dialogRef.close(profiles)
  }
}
