import { TripWeatherData } from '../services/weather.service';
import { absoluteMin, absoluteMax, WeatherRule, hotWeather, warmWeather, coolWeather, coldWeather, weatherType, tempC, weatherIconData } from '../models/weather.model';
import { isDefined, titleCase, decodeHtml, joinSpecial } from '../global-functions';



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
    weatherDataIsValid(wd:TripWeatherData):boolean{
        return isDefined(wd.minTemp) && isDefined(wd.maxTemp) && isDefined(wd.weatherTypes);
    }
    getTempRuleString({minTemp,maxTemp,weatherTypes}:WeatherRule):string{
        if(minTemp==absoluteMin && maxTemp == absoluteMax){
            return `Any Temperature`
        } else if (minTemp > absoluteMin && maxTemp == absoluteMax) {
            return `Above ${tempC(minTemp)}`
        } else if (minTemp == absoluteMin && maxTemp < absoluteMax) {
            return `Below ${tempC(maxTemp)}`
        } else if (minTemp > absoluteMin && maxTemp < absoluteMax) {
            return `${minTemp} &minus; ${tempC(maxTemp)}`
        } else {
            'Temperature invalid'
        }
    }
    getWeatherTypesToString(wRule:WeatherRule):string{
        return joinSpecial(wRule.weatherTypes,', ',' or ')
    }
    getWeatherRulesToString(wRule:WeatherRule):string{
        return this.getTempRuleString(wRule)+(wRule.weatherTypes.length>0 ? ', '+this.getWeatherTypesToString(wRule):"")
    }
    getWeatherIcons(wr:WeatherRule): weatherIconData[]{
        let returnArray:weatherIconData[] = []
        if(this.isSet(wr)){
            if(wr.minTemp!=absoluteMin || wr.maxTemp !=absoluteMax){
                let iconName = 'temp';
                if(wr.minTemp >= warmWeather&&  wr.maxTemp>=hotWeather){
                    iconName = 'temp-high'
                } else if (wr.maxTemp <= coolWeather && wr.maxTemp<warmWeather) {
                    iconName = 'temp-low'
                } else if (wr.minTemp>absoluteMin && wr.maxTemp<absoluteMax) {
                    iconName = 'temp-mid'
                }
                returnArray.push({icon: iconName,description: decodeHtml(this.getTempRuleString(wr))})
            }
            if (wr.weatherTypes.length>0){
                wr.weatherTypes.forEach(type => returnArray.push({icon: type, description: titleCase(type)}))
            }
        } 
        return returnArray;
    }
}