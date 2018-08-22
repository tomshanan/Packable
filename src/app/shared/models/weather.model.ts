export type weatherType = 'rain'|'snow'|'sunny'|'hail'|'windy';
export const weatherOptions:weatherType[] = ['rain','snow','sunny','hail','windy'];

export class WeatherRule {
    constructor(
        public minTemp: string | number = null,
        public maxTemp: string | number = null,
        public weatherTypes: weatherType[] = []
    ){
        if(typeof minTemp == "string"){
            this.minTemp = +minTemp;
        }
        if(typeof maxTemp == "string"){
            this.maxTemp = +maxTemp;
        }
    }
    public deepCopy = ():WeatherRule=>{
        return new WeatherRule(this.minTemp, this.maxTemp, this.weatherTypes.slice())
    }
}