import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WindowService } from '../window.service';
import { weatherOptions, WeatherRule, weatherType } from '../models/weather.model';
import { MatSelectChange, MatCheckboxChange } from '@angular/material';

@Component({
  selector: 'app-weather-conditions-form',
  templateUrl: './weather-conditions-form.component.html',
  styleUrls: ['./weather-conditions-form.component.css']
})
export class WeatherConditionsFormComponent implements OnInit {
  @Input() inputWeatherRule:WeatherRule = new WeatherRule();
  @Output() change = new EventEmitter<WeatherRule>();
  tempOptions = [];
  weatherOptions = weatherOptions;
  weatherRule:WeatherRule;

  constructor(
    private windowService: WindowService,
  ) {
    for (let t = -60; t <= 50; t++) { // min temperature is -60 and max is 50
      this.tempOptions.push(t)
    }
  }

  indexOfWeather(weather:weatherType){
    return this.inputWeatherRule.weatherTypes.indexOf(weather)
  }
  isChecked(weather:weatherType){
    return !!~this.indexOfWeather(weather);
  }
  minChange(select:MatSelectChange){
    this.weatherRule.minTemp = +select.value;
    this.emitUpdate()
  }
  maxChange(select:MatSelectChange){
    this.weatherRule.maxTemp = +select.value;
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
  }

}
