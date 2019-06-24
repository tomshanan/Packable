import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { WindowService } from '@shared/services/window.service';
import { weatherOptions, WeatherRule, weatherType, tempOptions, absoluteMax, absoluteMin  } from '@shared/models/weather.model';
import { MatSelectChange, MatCheckboxChange, MatSlideToggleChange } from '@angular/material';
import { Options, LabelType} from 'ng5-slider';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { quickTransitionTrigger } from '@app/shared/animations';

@Component({
  selector: 'app-weather-conditions-form',
  templateUrl: './weather-conditions-form.component.html',
  styleUrls: ['./weather-conditions-form.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [quickTransitionTrigger]
})
export class WeatherConditionsFormComponent implements OnInit, OnChanges {
  @Input('weather') inputWeather:WeatherRule = new WeatherRule();
  @Output('weatherChange') inputWeatherChange = new EventEmitter<WeatherRule>();
  
  tempOptions = tempOptions 
  weatherOptions = weatherOptions;
  absoluteMaxTemp = absoluteMax;
  absoluteMinTemp = absoluteMin;
  savedWeatherTypes: weatherType[] = [];
  limitWeather: boolean = false;
  savedTemp: {min:number,max:number} = {
    min: this.absoluteMinTemp,
    max: this.absoluteMaxTemp
  }
  limitTemp: boolean = false;
  
  constructor(
    public windowService: WindowService,
  ) {
    
  }
  ngOnInit() {
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['inputWeather']){
      this.init()
    }
  }
  init(){
    this.limitWeather = this.inputWeather.weatherTypes.length>0
    this.limitTemp = (this.inputWeather.minTemp != this.absoluteMinTemp || this.inputWeather.maxTemp != this.absoluteMaxTemp)
  }

  onToggleWeather(change:MatSlideToggleChange){
    this.toggleWeather(change.checked)
  }
  toggleWeather(checked:boolean){
    if(checked){
      this.limitWeather = true
      this.inputWeather.weatherTypes = this.savedWeatherTypes
    } else {
      this.limitWeather = false
      this.savedWeatherTypes = this.inputWeather.weatherTypes
      this.inputWeather.weatherTypes = [];
    }
    this.emitUpdate()
  }
  onToggleTemp(change:MatSlideToggleChange){
    this.toggleTemp(change.checked)
  }
  toggleTemp(checked:boolean){
    if(checked){
      this.limitTemp = true
      this.inputWeather.minTemp = this.savedTemp.min
      this.inputWeather.maxTemp = this.savedTemp.max
    } else {
      this.limitTemp = false
      this.savedTemp.min = this.inputWeather.minTemp
      this.savedTemp.max = this.inputWeather.maxTemp
      this.inputWeather.minTemp = this.absoluteMinTemp
      this.inputWeather.maxTemp = this.absoluteMaxTemp
    }
    this.emitUpdate()
  }

  options: Options = {
    floor: absoluteMin,
    ceil: absoluteMax,
    animate:false,
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


  indexOfWeather(weather:weatherType){
    return this.inputWeather.weatherTypes.indexOf(weather)
  }
  isChecked(weather:weatherType){
    return !!~this.indexOfWeather(weather);
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

  select(action:'all'|'none'){
    if(action == 'all'){
      weatherOptions.forEach(w=>this.addWeatherType(w))
    } else {
      weatherOptions.forEach(w=>this.removeWeatherType(w))
    }
  }


  emitUpdate(){
    this.inputWeatherChange.emit(this.inputWeather)
    this.savedWeatherTypes = this.inputWeather.weatherTypes
    console.log(this.inputWeather)
  }

  isNumber(t):boolean{
    return typeof t == 'number'
  }
}
