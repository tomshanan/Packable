import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TripWeatherData, WeatherService } from '../../../shared/services/weather.service';
import { weatherType } from '../../../shared/models/weather.model';

export interface tripWeatherDialog_data{
  destinationName:string,
  weatherData:TripWeatherData,
}
@Component({
  selector: 'app-weather-settings-dialog',
  templateUrl: './weather-settings-dialog.component.html',
  styleUrls: ['./weather-settings-dialog.component.css']
})
export class WeatherSettingsDialogComponent implements OnInit {
  destinationName:string;
  weatherData:TripWeatherData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: tripWeatherDialog_data,
    private dialogRef:MatDialogRef<WeatherSettingsDialogComponent>,
  ) { 
    this.destinationName = data.destinationName
    this.weatherData = data.weatherData
  }

  ngOnInit() {

  }
  onClose(weatherData:TripWeatherData = null) {
    this.dialogRef.close(weatherData)
  }
  onSetManual(){
    this.weatherData.dataInput= 'manual'
    this.onClose(this.weatherData)
  }
  onReloadForecast(){
    this.weatherData.dataInput= 'auto'
    this.onClose(this.weatherData)
  }

}
