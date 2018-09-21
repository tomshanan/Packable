import { absoluteMin, absoluteMax } from '../weather.service';
export type weatherType = 'rain'|'snow'|'sunny'|'hail'|'windy';
export const weatherOptions:weatherType[] = ['rain','snow','sunny','hail','windy'];

export class WeatherRule {
    private _minTemp: number = absoluteMin
    private _maxTemp: number = absoluteMax
    constructor(
        minTemp: string | number = absoluteMin,
        maxTemp: string | number = absoluteMax,
        public weatherTypes: weatherType[] = []
    ){
        this.minTemp = +minTemp
        this.maxTemp = +maxTemp
    }
    public deepCopy = ():WeatherRule=>{
        return new WeatherRule(this.minTemp, this.maxTemp, this.weatherTypes.slice())
    }
    get isSet():boolean{
        return this.minTemp>absoluteMin || this.maxTemp<absoluteMax || this.weatherTypes.length>0
    }

    set minTemp(input:number){
        this._minTemp = input
    }
    get minTemp(){
        return this._minTemp;
    }
    set maxTemp(input:number){
        this._maxTemp = input
    }
    get maxTemp(){
        return this._maxTemp;
    }
}