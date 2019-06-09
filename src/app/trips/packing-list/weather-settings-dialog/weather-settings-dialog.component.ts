import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TripWeatherData, WeatherService } from '../../../shared/services/weather.service';
import { weatherType } from '../../../shared/models/weather.model';
import { PackingListService } from '../packing-list.service';
import { Trip } from '../../../shared/models/trip.model';
import { addRemoveElementTrigger } from '../../../shared/animations';

export interface tripWeatherDialog_data{
  destinationName:string,
  weatherData:TripWeatherData,
  packingListService: PackingListService,
}
@Component({
  selector: 'app-weather-settings-dialog',
  templateUrl: './weather-settings-dialog.component.html',
  styleUrls: ['./weather-settings-dialog.component.css'],
  animations:[addRemoveElementTrigger]
})
export class WeatherSettingsDialogComponent implements OnInit {
  destinationName:string;
  weatherData:TripWeatherData;
  packingService:PackingListService;
  trip:Trip;
  dataInput: 'auto'| 'manual';
  errors:string[] = []
  loadingWeather: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: tripWeatherDialog_data,
    private dialogRef:MatDialogRef<WeatherSettingsDialogComponent>,
    private weatherService: WeatherService,
  ) { 
    this.destinationName = data.destinationName
    this.weatherData = new TripWeatherData(data.weatherData)
    this.packingService = data.packingListService
    this.trip = this.packingService.trip
    this.dataInput = this.weatherData.dataInput

    if(this.weatherData.isValid === false){
      this.errors.push('The weather data is not accurate')
    }
  }

  ngOnInit() {

  }
  onClose(weatherData:TripWeatherData = null) {
    this.dialogRef.close(weatherData)
  }

  onSetManual(weatherData:TripWeatherData){
    this.weatherData = weatherData
    this.dataInput = 'manual'
  }
  onReloadForecast(){
    this.loadingWeather = true;
    this.weatherService.createWeatherData(this.trip).then(weatherData=>{
      this.weatherData = weatherData
      this.dataInput = 'auto';
      this.loadingWeather = false;
    }).catch((()=>{
      this.errors = ['Could not get forecast =(']
      this.loadingWeather = false;
    }))
  }
  onConfirm(){
    this.weatherData.dataInput = this.dataInput
    this.onClose(this.weatherData)
  }
}
