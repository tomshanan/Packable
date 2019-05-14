export type weatherType = 'rain'|'snow'|'sunny'|'hail'|'windy';
export const weatherOptions:weatherType[] = ['rain','snow','sunny','hail','windy'];

export const hotWeather = 28;
export const warmWeather = 22;
export const coolWeather = 21;
export const coldWeather = 14;
export var absoluteMin = -15 // SET MIN AND MAX TEMPERATURE OPTIONS
export var absoluteMax = 45 // SET MIN AND MAX TEMPERATURE OPTIONS
export var tempOptions: number[] = ((min,max):number[]=>{
    let tempOptions = [];
    for (let t = min; t <= max; t++) { 
        tempOptions.push(t)
      }
    return tempOptions
})(absoluteMin,absoluteMax) 


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

export const degC = `&#176;C`
export function temp(n:number):string{
    return n+degC
}
export interface weatherIconData {
    icon: string,
    description: string
}