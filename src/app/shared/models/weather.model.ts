import { absoluteMin, absoluteMax } from '../services/weather.service';
export type weatherType = 'rain'|'snow'|'sunny'|'hail'|'windy';
export const weatherOptions:weatherType[] = ['rain','snow','sunny','hail','windy'];

export const hotWeather = 26;
export const warmWeather = 21;
export const coolWeather = 20;
export const coldWeather = 15;

export class WeatherRule {
    minTemp: number = absoluteMin
    maxTemp: number = absoluteMax
    weatherTypes: weatherType[] = []
    constructor(
        minTemp: string | number = absoluteMin,
        maxTemp: string | number = absoluteMax,
        weatherTypes: weatherType[] = []
    ){
        this.minTemp = +minTemp
        this.maxTemp = +maxTemp
        this.weatherTypes = weatherTypes
    }

}