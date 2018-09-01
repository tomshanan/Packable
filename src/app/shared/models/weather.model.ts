export type weatherType = 'rain'|'snow'|'sunny'|'hail'|'windy';
export const weatherOptions:weatherType[] = ['rain','snow','sunny','hail','windy'];

export class WeatherRule {
    private _minTemp: string | number = null
    private _maxTemp: string | number = null
    constructor(
        minTemp: string | number = null,
        maxTemp: string | number = null,
        public weatherTypes: weatherType[] = []
    ){
        this.minTemp = minTemp
        this.maxTemp = maxTemp
    }
    public deepCopy = ():WeatherRule=>{
        return new WeatherRule(this.minTemp, this.maxTemp, this.weatherTypes.slice())
    }
    get isSet():boolean{
        return this.minTemp!=null || this.maxTemp!=null || this.weatherTypes.length>0
    }

    set minTemp(input){
        if(typeof input == "string"){
            this._minTemp = +input;
        } else {
            this._minTemp = input
        }
    }
    get minTemp(){
        return this._minTemp;
    }
    set maxTemp(input){
        if(typeof input == "string"){
            this._maxTemp = +input;
        } else {
            this._maxTemp = input
        }
    }
    get maxTemp(){
        return this._maxTemp;
    }
}