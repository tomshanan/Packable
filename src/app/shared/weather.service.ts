
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable()
export class WeatherService {
    constructor(private http:HttpClient){
    }
    getCityWeather(destId:string|number):Observable<{}>{
        return this.http.get('api/weather/'+destId)
    }
    getDailyWeatherForCity(destId:string|number,dates:moment.Moment[]): Observable<{}[]> {
        return this.getCityWeather(destId).map(data => {
                let weatherArray= [];
                dates.forEach((date,i)=>{
                    if(moment().diff(date,'d')<5){
                        let forecastObject = data['city']['forecast']['forecastDay'].find(obj=>obj.forecastDate == date.format('YYYY-MM-DD'))
                        weatherArray.push(forecastObject)
                    } else {
                        let forecastObject = data['city']['climate']['climateMonth'].find(m=>m.month==date.format('M'))
                        weatherArray.push(forecastObject)
                    }
                })
                return weatherArray
            })
        
    }

}