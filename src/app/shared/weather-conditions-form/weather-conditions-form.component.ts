import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { WindowService } from '../window.service';
import { weatherOptions, WeatherRule, weatherType } from '../models/weather.model';
import { MatSelectChange, MatCheckboxChange } from '@angular/material';
import { tempOptions, absoluteMax, absoluteMin } from '../weather.service';
import { Options, LabelType} from 'ng5-slider';

@Component({
  selector: 'app-weather-conditions-form',
  templateUrl: './weather-conditions-form.component.html',
  styleUrls: ['./weather-conditions-form.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WeatherConditionsFormComponent implements OnInit {
  @Input() inputWeatherRule:WeatherRule = new WeatherRule();
  @Output() change = new EventEmitter<WeatherRule>();
  tempOptions = tempOptions 
  weatherOptions = weatherOptions;
  weatherRule:WeatherRule;
  absoluteMaxTemp = absoluteMax;
  absoluteMinTemp = absoluteMin;
  minTempValue = absoluteMin;
  maxTempValue = absoluteMax;
  options: Options = {
    floor: absoluteMin,
    ceil: absoluteMax,
    step: 1,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return value>this.absoluteMinTemp ? value + '&#176;C' : 'Any';
        case LabelType.High:
          return value<this.absoluteMaxTemp ? value + '&#176;C' : 'Any';
        default:
          return value+'&#176;C';
      }
    }

  };

  rangeChanged(newValues){
    console.log(newValues);
    
  }
  constructor(
    private windowService: WindowService,
  ) {

  }

  indexOfWeather(weather:weatherType){
    return this.inputWeatherRule.weatherTypes.indexOf(weather)
  }
  isChecked(weather:weatherType){
    return !!~this.indexOfWeather(weather);
  }
  tempChange(){
    this.weatherRule.minTemp = this.minTempValue;
    this.weatherRule.maxTemp = this.maxTempValue;
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
    this.minTempValue = this.weatherRule.minTemp || this.absoluteMinTemp;
    this.maxTempValue = this.weatherRule.maxTemp || this.absoluteMaxTemp;
  }

  emitUpdate(){
    this.change.emit(this.weatherRule)
    console.log(this.weatherRule)
  }

  isNumber(t):boolean{
    return typeof t == 'number'
  }
}
