import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WindowService } from '../window.service';
import { weatherOptions, WeatherRule, weatherType } from '../models/weather.model';
import { MatSelectChange, MatCheckboxChange } from '@angular/material';
import { tempOptions, absoluteMax, absoluteMin } from '../weather.service';

@Component({
  selector: 'app-weather-conditions-form',
  templateUrl: './weather-conditions-form.component.html',
  styleUrls: ['./weather-conditions-form.component.css']
})
export class WeatherConditionsFormComponent implements OnInit {
  @Input() inputWeatherRule:WeatherRule = new WeatherRule();
  @Output() change = new EventEmitter<WeatherRule>();
  tempOptions = tempOptions 
  weatherOptions = weatherOptions;
  weatherRule:WeatherRule;
  absoluteMaxTemp = absoluteMax;
  absoluteMinTemp = absoluteMin;

  constructor(
    private windowService: WindowService,
  ) {}

  indexOfWeather(weather:weatherType){
    return this.inputWeatherRule.weatherTypes.indexOf(weather)
  }
  isChecked(weather:weatherType){
    return !!~this.indexOfWeather(weather);
  }
  minChange(select:MatSelectChange|number|string){
    if(typeof select == 'number' || typeof select == 'string'){
      this.weatherRule.minTemp = select
    } else {
      this.weatherRule.minTemp = select.value;
    }    
    this.emitUpdate()
  }
  maxChange(select:MatSelectChange|number|string){
    if(typeof select == 'number' || typeof select == 'string'){
      this.weatherRule.maxTemp = select
    } else {
      this.weatherRule.maxTemp = select.value;
    }
    this.emitUpdate();
  }
  addWeatherType(weather:weatherType){
    if(!this.isChecked(weather)){
      this.weatherRule.weatherTypes.push(weather);
    }
  }
  removeWeatherType(weather:weatherType){
    if(this.isChecked(weather)){
      this.weatherRule.weatherTypes.splice(this.indexOfWeather(weather),1)
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

  select(action:'all'|'none'){
    if(action == 'all'){
      weatherOptions.forEach(w=>this.addWeatherType(w))
    } else {
      weatherOptions.forEach(w=>this.removeWeatherType(w))
    }
  }
  ngOnInit() {
    this.weatherRule = this.inputWeatherRule;
  }

  emitUpdate(){
    this.change.emit(this.weatherRule)
    console.log(this.weatherRule)
  }

  isNumber(t):boolean{
    return typeof t == 'number'
  }
}
