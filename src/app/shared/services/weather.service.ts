
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, take, switchMap, mapTo, catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { weatherType, WeatherRule, tempC, temp } from '../models/weather.model';
import { isDefined, getAllDates, timeStamp, stringArraysAreSame, joinSpecial, titleCase } from '../global-functions';
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
export class TripWeatherData {
    weatherArray: DayWeatherData[] = []
    minTemp: number = null
    maxTemp: number = null
    rain: boolean = null
    weatherTypes: weatherType[] = []
    dateModified: number = timeStamp()
    dataInput: 'auto' | 'manual' = 'auto'
    constructor(data?: Partial<TripWeatherData>) {
        if (data) {
            Object.assign(this, data)
        }
    }
    get isValid(): boolean {
        return isDefined(this.minTemp) && isDefined(this.maxTemp) && !!this.weatherTypes;
    }
    forecastString(): string {
        return `${this.tempToHtmlString()}${this.weatherTypes.length > 0 ? ', ' + this.typesToString() : ''}`
    }
    tempToHtmlString(): string {
        return `<b>${tempC(this.maxTemp)}</b>&nbsp&nbsp<span class="low-temp">${tempC(this.minTemp)}</span>`
    }
    typesToString(): string {
        return joinSpecial(this.weatherTypes, ', ', ' and ').toTitleCase()
    }
}



export class DayWeatherData {
    minTemp: number;
    maxTemp: number;
    date: string;
    weaatherDesc: string;
    chanceOfRain: number;
    weatherType: weatherType;
    weatherIcon: number;

    constructor(weatherForecast: WeatherForecast, climateForecast: ClimateForecast, date: moment.Moment, dates: moment.Moment[]) {
        this.minTemp = (!!weatherForecast && !!weatherForecast.minTemp) ? Math.floor(+weatherForecast.minTemp) : ((!!climateForecast && !!climateForecast.minTemp) ? Math.floor(+climateForecast.minTemp) : null)
        this.maxTemp = (!!weatherForecast && !!weatherForecast.maxTemp) ? Math.floor(+weatherForecast.maxTemp) : ((!!climateForecast && !!climateForecast.maxTemp) ? Math.floor(+climateForecast.maxTemp) : null)
        this.date = date.format('YYYY-MM-DD');

        if (weatherForecast) {
            this.chanceOfRain = this.getWeatherType(weatherForecast.weather) == 'rain' ? 1 : 0;
            this.weaatherDesc = weatherForecast.weather
            this.weatherType = this.getWeatherType(weatherForecast.weather)
            this.weatherIcon = weatherForecast.weatherIcon
        } else if (climateForecast) {
            this.weaatherDesc = "Unknown"
            this.chanceOfRain = this.getChanceOfRain(date, +climateForecast.raindays)
            this.weatherType = this.chanceOfRain > 0.5 ? 'rain' : null;
            this.weatherIcon = this.getChanceOfRain(date, +climateForecast.raindays) ? 1 : 0;
        } else {
            this.weaatherDesc = "Unknown"
            this.weatherType = null
            this.weatherIcon = null;
            this.chanceOfRain = null;
        }
    }
    private getChanceOfRain(date: moment.Moment, raindays: number): number {
        return Math.floor(raindays / date.daysInMonth() * 100) / 100
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

export type weatherCheckResponse = { conditionsMet: boolean, response: string[] }

@Injectable()
export class WeatherService {
    constructor(private http: HttpClient, private destService: DestinationDataService) {
    }
    getCityWeather(destId: string | number): Promise<{}> {
        return this.http.get('https://www.packable.app/api.php?cityId=' + destId).toPromise()
    }
    getDailyWeatherForCity(destId: string, dates: moment.Moment[]): Promise<DayWeatherData[]> {
        let weatherId = this.destService.findDestination(destId).weatherId
        return this.getCityWeather(weatherId).then(data => {
            let weatherArray = [];
            dates.forEach((date, i) => {
                let forecastObject = data['city']['forecast']['forecastDay'].find(obj => obj.forecastDate == date.format('YYYY-MM-DD'))
                let climateObject = data['city']['climate']['climateMonth'].find(m => m.month == date.month() + 1)
                weatherArray.push(new DayWeatherData(forecastObject, climateObject, date, dates))
            })
            return weatherArray
        }).catch(e => {
            console.warn(`🌩️ Could Not Get Weather Data - Please Check Server ⚠️`)
            let weatherArray = [];
            dates.forEach((date, i) => {
                weatherArray.push(new DayWeatherData(null, null, date, dates))
            })
            return weatherArray
        })

    }
    willItRain(dayWeatherArray: DayWeatherData[]): boolean {
        if (
            dayWeatherArray.some(dayWeather => dayWeather.chanceOfRain == 1) ||
            dayWeatherArray.reduce((total, current) => {
                total += current.chanceOfRain > 0.6 ? 1 : 0
                return total;
            }, 0) > 2
        ) {
            return true
        } else {
            return false
        }
    }
    getMinTemp(dayWeatherArray: DayWeatherData[]): number {
        if (dayWeatherArray.every(dayWeather => typeof dayWeather.minTemp === 'number')) {
            return Math.min(...dayWeatherArray.map(dayWeather => dayWeather.minTemp))
        } else {
            return null;
        }
    }
    getMaxTemp(dayWeatherArray: DayWeatherData[]): number {
        if (dayWeatherArray.every(dayWeather => typeof dayWeather.maxTemp === 'number')) {
            return Math.max(...dayWeatherArray.map(dayWeather => dayWeather.maxTemp))
        } else {
            return null;
        }
    }
    getTripWeatherData(trip: Trip): Promise<TripWeatherData> {
        const dates:moment.Moment[] = getAllDates(trip.startDate, trip.endDate);
        return this.getDailyWeatherForCity(trip.destinationId, dates)
            .then((weatherArray: DayWeatherData[]): TripWeatherData => {
                let tripWeatherData = new TripWeatherData();
                this.willItRain(weatherArray) && tripWeatherData.weatherTypes.push('rain');
                tripWeatherData.weatherArray = weatherArray;
                tripWeatherData.minTemp = this.getMinTemp(weatherArray)
                tripWeatherData.maxTemp = this.getMaxTemp(weatherArray)
                tripWeatherData.weatherTypes.push(
                    ...weatherArray.map(dayWeather => dayWeather.weatherType).filter((x, pos, arr) => (x != 'rain' && x != null && arr.indexOf(x) == pos))
                )
                return tripWeatherData
            }).catch(err => {
                console.log(err)
                return new TripWeatherData()
            })
    }
    isWeatherTheSame(a: TripWeatherData, b: TripWeatherData): boolean {
        if (
            a.isValid && b.isValid
            && a.maxTemp == b.maxTemp
            && a.minTemp == b.minTemp
            && a.rain == b.rain
            && stringArraysAreSame(a.weatherTypes, b.weatherTypes)
        ) {
            return true
        }
        return false
    }

    checkWeatherRules = (weatherRules: WeatherRule, weatherData: TripWeatherData): weatherCheckResponse => {
        let rule = weatherRules;
        let wData = weatherData;
        let conditionsMet: boolean = true;
        let response: string[] = []
        if (wData && wData.isValid) {
            if (isDefined(rule.minTemp)) {
                const test = wData.maxTemp >= rule.minTemp
                conditionsMet = test ? conditionsMet : false;
                !test && response.push(`The temperature won't be over ${tempC(rule.minTemp)}`)
            }
            if (isDefined(rule.maxTemp)) {
                const test = wData.minTemp < rule.maxTemp
                conditionsMet = test ? conditionsMet : false;
                !test && response.push(`The temperature won't be below ${tempC(rule.maxTemp)}`)
            }
            if (isDefined(rule.weatherTypes) && rule.weatherTypes.length > 0) {
                const test = rule.weatherTypes.some(w => wData.weatherTypes.includes(w))
                conditionsMet = test ? conditionsMet : false;
                !test && response.push(joinSpecial(rule.weatherTypes, ', ', ' or ') + ` will not be expected during this trip`)
            }
        } else {
            response.push('<b>Could not validate Weather Rules.</b><br>This Trip\'s weather data is invalid')
        }
        return { conditionsMet: conditionsMet, response: response }
    }
    private getConditionsMetObject<T extends { id: string, weatherRules: WeatherRule }>(items: T[], weatherData: TripWeatherData): { [id: string]: weatherCheckResponse } {
        let conditionsMet: { [id: string]: weatherCheckResponse } = {}
        items.forEach(item => {
            conditionsMet[item.id] = this.checkWeatherRules(item.weatherRules, weatherData)
        });
        return conditionsMet
    }
    sortByConditionsMet<T extends { id: string, weatherRules: WeatherRule }>(items: T[], weatherData: TripWeatherData): void {
        let conditionsMet = this.getConditionsMetObject(items,weatherData)
        items.sort((a, b) => {
            let aMet = conditionsMet[a.id].conditionsMet
            let bMet = conditionsMet[b.id].conditionsMet
            return aMet ? (bMet ? 0 : -1) : 1
        })
    }
    filterConditionsMet<T extends { id: string, weatherRules: WeatherRule }>(items: T[], weatherData: TripWeatherData): T[] {
        let conditionsMet = this.getConditionsMetObject(items,weatherData)
        return items.filter(item=>conditionsMet[item.id].conditionsMet)
    }
}

