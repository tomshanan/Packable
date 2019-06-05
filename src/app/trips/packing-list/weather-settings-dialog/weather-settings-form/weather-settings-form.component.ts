import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { WindowService } from '@shared/services/window.service';
import { weatherOptions, WeatherRule, weatherType, tempOptions, absoluteMax, absoluteMin, tempC  } from '@shared/models/weather.model';
import { MatSelectChange, MatCheckboxChange, MatSlideToggleChange } from '@angular/material';
import { Options, LabelType} from 'ng5-slider';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { quickTransitionTrigger } from '@app/shared/animations';
import { TripWeatherData } from '../../../../shared/services/weather.service';


@Component({
  selector: 'trip-weather-settings-form',
  templateUrl: './weather-settings-form.component.html',
  styleUrls: ['./weather-settings-form.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [quickTransitionTrigger]
})
export class WeatherSettingsFormComponent implements OnInit {
  @Input('weather') inputWeather:TripWeatherData = new TripWeatherData();
  @Output('weatherChange') inputWeatherChange = new EventEmitter<WeatherRule>();
  
  tempOptions = tempOptions 
  weatherOptions = weatherOptions;
  absoluteMaxTemp = absoluteMax;
  absoluteMinTemp = absoluteMin;

  savedTemp: {min:number,max:number} = {
    min: this.absoluteMinTemp,
    max: this.absoluteMaxTemp
  }
  
  constructor(
    public windowService: WindowService,
  ) {
    
  }
  ngOnInit() {
  }


  options: Options = {
    floor: absoluteMin,
    ceil: absoluteMax,
    step: 1,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return 'Low: ' + tempC(value);
        case LabelType.High:
          return 'High: ' + tempC(value);
        default:
          return tempC(value);
      }
    }

  };

  rangeChanged(newValues){
    console.log(newValues);
    
  }

  getNumberOfChecked():number{
    return this.inputWeather.weatherTypes.length
  }
  indexOfWeather(weather:weatherType){
    return this.inputWeather.weatherTypes.indexOf(weather)
  }
  isChecked(weather:weatherType){
    return this.indexOfWeather(weather) != -1;
  }
  tempChange(){
    this.emitUpdate();
  }
  addWeatherType(weather:weatherType){
    if(!this.isChecked(weather)){
      this.inputWeather.weatherTypes.push(weather);
    }
  }
  removeWeatherType(weather:weatherType){
    if(this.isChecked(weather)){
      this.inputWeather.weatherTypes.splice(this.indexOfWeather(weather),1)
    }
  }
  toggleCheckbox(weather:weatherType){
    if(this.isChecked(weather)){
      this.removeWeatherType(weather);
    } else {
      this.addWeatherType(weather);
    }
    this.emitUpdate();
  }
  onNoneTypes(){
    this.inputWeather.weatherTypes = []
    this.emitUpdate();
  }
  select(action:'all'|'none'){
    if(action == 'all'){
      weatherOptions.forEach(w=>this.addWeatherType(w))
    } else {
      weatherOptions.forEach(w=>this.removeWeatherType(w))
    }
  }


  emitUpdate(){
    this.inputWeatherChange.emit(this.inputWeather)
    console.log(this.inputWeather)
  }

  isNumber(t):boolean{
    return typeof t == 'number'
  }
}
