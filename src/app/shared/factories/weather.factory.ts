import { absoluteMin, absoluteMax, weatherData } from '../services/weather.service';
import { WeatherRule } from '../models/weather.model';
import { isDefined } from '../global-functions';
export class weatherFactory{
    isSet(wr:WeatherRule):boolean{
        return wr.minTemp>absoluteMin || wr.maxTemp<absoluteMax || wr.weatherTypes.length>0
    }
    deepCopy(wr:WeatherRule = new WeatherRule()):WeatherRule{
        return new WeatherRule(
            wr.minTemp || absoluteMin, 
            wr.maxTemp || absoluteMax, 
            isDefined(wr.weatherTypes) ? wr.weatherTypes.slice(): []
            )
    }
    weatherDataIsValid(wd:weatherData):boolean{
        return isDefined(wd.minTemp) && isDefined(wd.maxTemp) && isDefined(wd.weatherTypes);
    }
}