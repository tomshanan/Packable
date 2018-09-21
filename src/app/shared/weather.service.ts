
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { weatherType } from './models/weather.model';
import { isDefined } from './global-functions';

export interface WeatherForecast {
    forecastDate: string,
    maxTemp: string,
    maxTempF: string,
    minTemp: string,
    minTempF: string,
    weather: string,
    weatherIcon: number
}
export interface ClimateForecast {
    climateFromMemDate: string,
    maxTemp: string,
    maxTempF: string,
    meanTemp: string,
    meanTempF: string,
    minTemp: string,
    minTempF: string,
    month: number,
    raindays: string,
    rainfall: string,
}
export class weatherData {
    weatherArray: WeatherObject[] = []
    minTemp: number = null
    maxTemp: number= null
    rain: boolean = null
    weatherTypes: weatherType[] = []
    constructor(){}
    get isValid(){
        return isDefined(this.minTemp) && isDefined(this.maxTemp) && isDefined(this.weatherTypes);
    } 
}
export var absoluteMin = -15 // SET MIN AND MAX TEMPERATURE OPTIONS
export var absoluteMax = 45 // SET MIN AND MAX TEMPERATURE OPTIONS
export var tempOptions: number[] = ((min,max):number[]=>{
    let tempOptions = [];
    for (let t = min; t <= max; t++) { 
        tempOptions.push(t)
      }
    return tempOptions
})(absoluteMin,absoluteMax) 

export class WeatherObject {
    minTemp: number;
    maxTemp: number;
    date: string;
    weaatherDesc: string;
    chanceOfRain: number;
    weatherType: weatherType;
    weatherIcon: number;

    constructor(weatherForecast: WeatherForecast, climateForecast:ClimateForecast, date: moment.Moment, dates: moment.Moment[]) {
        this.minTemp = (!!weatherForecast && !!weatherForecast.minTemp) ? Math.floor(+weatherForecast.minTemp) : ((!!climateForecast && !!climateForecast.minTemp) ? Math.floor(+climateForecast.minTemp) : null)
        this.maxTemp = (!!weatherForecast && !!weatherForecast.maxTemp) ? Math.floor(+weatherForecast.maxTemp) : ((!!climateForecast && !!climateForecast.maxTemp) ? Math.floor(+climateForecast.maxTemp) : null)
        this.date = date.format('YYYY-MM-DD');

        if (weatherForecast){
            this.chanceOfRain = this.getWeatherType(weatherForecast.weather) == 'rain' ? 1 : 0;
            this.weaatherDesc = weatherForecast.weather
            this.weatherType = this.getWeatherType(weatherForecast.weather)
            this.weatherIcon = weatherForecast.weatherIcon
        } else if (climateForecast) {
            this.weaatherDesc = "Unknown"
            this.chanceOfRain = this.getChanceOfRain(date,+climateForecast.raindays)
            this.weatherType = this.chanceOfRain > 0.5 ? 'rain' : null;
            this.weatherIcon = this.getChanceOfRain(date,+climateForecast.raindays) ? 1 : 0;
        } else {
            this.weaatherDesc = "Unknown"
            this.weatherType = null
            this.weatherIcon = null;
            this.chanceOfRain = null;
        }
    }
    private getChanceOfRain(date: moment.Moment,raindays:number):number{
        return Math.floor(raindays/date.daysInMonth()*100)/100
    }

    private getWeatherType(string: string): weatherType {
        let rainyWeather = ['Thunderstorms', 'Thundershowers', 'Storm', 'Snow Showers', 'Flurries', 'Sleet', 'Showers', 'Heavy Showers', 'Rainshower', 'Occasional Showers', 'Scattered Showers', 'Isolated Showers', 'Light Showers', 'Freezing Rain', 'Rain', 'Drizzle', 'Light Rain']
        let hailWeather = ['Hail']
        let sunnyWeather = ['Sunny Periods', 'Partly Cloudy', 'Partly Bright', 'Mild', 'Sunny Intervals', 'No Rain', 'Clearing', 'Bright', 'Sunny', 'Fair', 'Fine', 'Clear']
        let snowyWeather = ['Blowing Snow', 'Blizzard', 'Snowdrift', 'Snowstorm', 'Snow Showers', 'Flurries', 'Snow', 'Heavy Snow', 'Snowfall', 'Light Snow', 'Sleet']
        let windyWeather = ['Windy', 'Squall', 'Stormy', 'Gale', 'Blowing Snow', 'Blizzard', 'Snowdrift', 'Snowstorm', 'Sandstorm', 'Duststorm']
        if (!!~rainyWeather.indexOf(string)) {
            return 'rain'
        } else if (!!~hailWeather.indexOf(string)) {
            return 'hail'
        } else if (!!~sunnyWeather.indexOf(string)) {
            return 'sunny'
        } else if (!!~snowyWeather.indexOf(string)) {
            return 'snow'
        } else if (!!~windyWeather.indexOf(string)) {
            return 'windy'
        } else {
            return null
        }
    }
}

@Injectable()
export class WeatherService {
    constructor(private http: HttpClient) {
    }
    getCityWeather(destId: string | number): Observable<{}> {
        return this.http.get('api/weather/' + destId)
    }
    getDailyWeatherForCity(destId: string | number, dates: moment.Moment[]): Observable<WeatherObject[]> {
        return this.getCityWeather(destId).pipe(
            map(data => {
                console.log(data);

                let weatherArray = [];
                dates.forEach((date, i) => {
                    let forecastObject = data['city']['forecast']['forecastDay'].find(obj => obj.forecastDate == date.format('YYYY-MM-DD'))
                    let climateObject = data['city']['climate']['climateMonth'].find(m => m.month == date.month() + 1)
                    weatherArray.push(new WeatherObject(forecastObject,climateObject,date,dates))
                })
                return weatherArray
            }))

    }
    willItRain(weatherObject:WeatherObject[]):boolean{
        if(
            weatherObject.some(wObj=> wObj.chanceOfRain==1) ||
            weatherObject.reduce((total,current)=>{
                total += current.chanceOfRain>0.6 ? 1 : 0
                return total;
            }, 0) > 2
        ){
            return true
        } else {
            return false
        }
    }
    getMinTemp(weatherObject:WeatherObject[]):number{
        if (weatherObject.every(wObj => typeof wObj.minTemp == 'number')){
            return Math.min(...weatherObject.map(wObj=> wObj.minTemp))
        } else {
            return null;
        }
        
    }
    getMaxTemp(weatherObject:WeatherObject[]):number{
        if (weatherObject.every(wObj => typeof wObj.maxTemp == 'number')){
            return Math.max(...weatherObject.map(wObj=> wObj.maxTemp))
        } else {
            return null;
        }
    }

}