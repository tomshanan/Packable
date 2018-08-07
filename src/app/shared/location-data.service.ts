import { destinations, cityRanks, countryRanks } from './location-data-object';
import { Injectable } from '../../../node_modules/@angular/core';
import { Pipe } from '@angular/core';
export interface Destination {
  country: string,
  city: string,
  id: string,
  cityRank: number,
  countryRank: number,
  fullName: string
}

var getCityRank = (dest): number => {
  let city = cityRanks.find(x => x.city.toLowerCase() == dest.city.toLowerCase())
  return city ? city.rank : null;
}
var getCountryRank = (dest): number => {
  let country = countryRanks.find(x => x.country.toLowerCase() == dest.country.toLowerCase())
  return country ? country.rank : null;
}

@Injectable()
export class DestinationDataService {
  private _destinations: Destination[];
  constructor() {
    this._destinations = destinations.map((dest) => {
      return {
        ...dest,
        cityRank: getCityRank(dest),
        countryRank: getCountryRank(dest),
        fullName: this.placeToString(dest)
      }

    })
    //console.log(this._destinations.filter(x=>x.cityRank !=null).sort((a,b)=>a.cityRank-b.cityRank))
    // console.log(cityRanks.filter(x => {
    //     let test = this._destinations.find(dest => dest.city == x.city);
    //     return test ? false : true;
    // }))
  }
  get destinations(): Destination[] {
    return this._destinations.slice();
  }
  cityById(id: string): string {
    let dest = this._destinations.find(x => x.id == id);
    return dest ? this._destinations.find(x => x.id == id).city : undefined;
  }
  countryById(id: string): string {
    return this._destinations.find(x => x.id == id).country
  }
  DestinationById(id: string): Destination {
    return this._destinations.find(x => x.id == id);
  }
  placeToString(dest: { city: string, country: string }): string {
    return `${dest.city}, ${dest.country}`
  }

  getScoreOfSearch(search: string, dest: Destination, debug = false): number {
    let consoleOutput = '';
    consoleOutput += `${dest.fullName} \n`;
    const specialChars = /[^a-zA-Z0-9\-]+/g;
    let destinationConcat = dest.fullName.toLowerCase().replace(specialChars, '');
    let destinationArray = dest.fullName.toLowerCase().split(specialChars);
    let score = 0;
    let searchWords = [];
    if (specialChars.test(search)) {
      searchWords = search.split(specialChars);
    } else {
      searchWords = [search]
    }
    searchWords.forEach((searchWord, searchwordIndex) => {
      let indexInDestConcat = destinationConcat.indexOf(searchWord);
      let lengthValue = searchWord.length * 50;
      let indexScore = 0,
        penalty = 0,
        lengthScore = 0;
      if (indexInDestConcat > -1) {
        destinationArray.forEach((word, wordIndex) => {
          if (word.indexOf(searchWord) > -1) {
            indexScore += 200 / (word.indexOf(searchWord) + 1);
            penalty += indexScore * 0.2;
            consoleOutput += `for  "${searchWord}" in "${word}" \n`;
            consoleOutput += `+${indexScore} = 200 / (${word.indexOf(searchWord)} + 1) \n`;
            consoleOutput += `-${penalty} = ${indexScore} * 0.2  \n`;
          }
        })
        let startOfCityOrCountry = (dest.city.toLowerCase().indexOf(searchWord) == 0 || dest.country.toLowerCase().indexOf(searchWord) == 0) ? 50 : 0;
        indexScore += startOfCityOrCountry * searchWord.length;
        consoleOutput += `for "${searchWord}" in "${dest.city}" or in "${dest.country}" \n`;
        consoleOutput += `+${startOfCityOrCountry} \n`;
        lengthScore += lengthValue;
        consoleOutput += `for length score of "${searchWord}":\n+${lengthValue} \n`;
      } else {
        lengthScore -= lengthValue;
        consoleOutput += `for not finding "${searchWord}":\n-${lengthValue} \n`;
      }
      score += (indexScore + lengthScore - penalty); // *(1+searchwordIndex*25/100)
      consoleOutput += `Totals for "${searchWord}":\n +${indexScore + lengthScore - penalty} = (${indexScore} + ${lengthScore} - ${penalty})\n`;
    })

    if (debug == true) {
      consoleOutput += `final Score: ${score}`
      console.log(consoleOutput)
    }
    return score;
  }

}

