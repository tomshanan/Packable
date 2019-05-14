
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take, switchMap, mapTo } from 'rxjs/operators';
import * as moment from 'moment';
import { weatherType, WeatherRule, temp } from '../models/weather.model';
import { isDefined, getAllDates, timeStamp, stringArraysAreSame, joinSpecial } from '../global-functions';
import { Trip } from '../models/trip.model';
import { DestinationDataService } from './location-data.service';

interface WeatherForecast {
    forecastDate: string,
    maxTemp: string,
    maxTempF: string,
    minTemp: string,
    minTempF: string,
    weather: string,
    weatherIcon: number
}
interface ClimateForecast {
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
    dateModified:number = timeStamp()
    constructor(){}
    get isValid():boolean{
        return isDefined(this.minTemp) && isDefined(this.maxTemp) && isDefined(this.weatherTypes);
    } 
}

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
    constructor(private http: HttpClient, private destService:DestinationDataService) {
    }
    getCityWeather(destId: string | number): Observable<{}> {
        return this.http.get('api/weather/' + destId)
    }
    getDailyWeatherForCity(destId: string, dates: moment.Moment[]): Observable<WeatherObject[]> {
        let weatherId = this.destService.DestinationByCityId(destId).weatherId
        return this.getCityWeather(weatherId).pipe(
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
    createWeatherData(trip: Trip):Observable<weatherData> {
            let dates = getAllDates(trip.startDate, trip.endDate);
            let dailyWeatherArray = this.getDailyWeatherForCity(trip.destinationId, dates)
            return dailyWeatherArray.pipe(
                take(1),
                map((weatherArray:WeatherObject[]):weatherData=>{
                    let weatherDataObj = new weatherData();
                    this.willItRain(weatherArray) && weatherDataObj.weatherTypes.push('rain');
                    weatherDataObj.weatherArray = weatherArray;
                    weatherDataObj.minTemp = this.getMinTemp(weatherArray)
                    weatherDataObj.maxTemp = this.getMaxTemp(weatherArray)
                    weatherDataObj.weatherTypes.push(
                      ...weatherArray.map(wObj => wObj.weatherType).filter((x, pos, arr) => (x != 'rain' && x != null && arr.indexOf(x) == pos))
                    )
                    return weatherDataObj
                })
            )
    }
    isWeatherTheSame(a:weatherData,b:weatherData):boolean{
        if(
            a.isValid && b.isValid
            && a.maxTemp == b.maxTemp
            && a.minTemp == b.minTemp
            && a.rain == b.rain
            && stringArraysAreSame(a.weatherTypes,b.weatherTypes)
        ){
            return true
        }
        return false
    }
    checkWeatherRules = (weatherRules:WeatherRule,weatherData:weatherData): {conditionsMet:boolean,response:string[]} => {
        let rule = weatherRules;
        let wData = weatherData;
        let conditionsMet:boolean = true;
        let response:string[] = []
        if(wData.isValid){
          if(isDefined(rule.minTemp)){
            const test = wData.maxTemp >= rule.minTemp
            conditionsMet = test ? conditionsMet : false;
            !test && response.push(`The temperature won't be over ${temp(rule.minTemp)}`)
        }
        if(isDefined(rule.maxTemp)){
            const test = wData.minTemp < rule.maxTemp
            conditionsMet = test ? conditionsMet : false;
            !test && response.push(`The temperature won't be below ${temp(rule.maxTemp)}`)
          }
          if(isDefined(rule.weatherTypes) && rule.weatherTypes.length>0){
            const test = rule.weatherTypes.some(w=>wData.weatherTypes.includes(w))
            conditionsMet =  test ? conditionsMet :false;
            !test && response.push(joinSpecial(rule.weatherTypes,', ',' or ')+` will not be expected during this trip`)
          }
        } else {
            response.push('Weather Data was not accurate, try again in a future date')
        }
        return {conditionsMet:conditionsMet,response:response}
      }
    
}