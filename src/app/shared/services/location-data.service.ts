import { cities, countries, countryData, cityData } from '../location-data-object';
import { Injectable } from '@angular/core';
import { Pipe } from '@angular/core';
import { round } from '../global-functions';
export interface Destination {
  cityId: string,
  countryId: string,

  countryNames: string[],
  cityNames: string[],

  countryRank: number,
  cityRank: number,

  fullName: string,
  weatherId: string
}


@Injectable()
export class DestinationDataService {
  private _destinations: Destination[];
  constructor() {
    this._destinations = cities.map((city: cityData): Destination => {
      let country = countries.findId(city.countryId)
      return {
        cityId: city.id,
        weatherId: city.weatherId,
        countryId: city.countryId,
        countryNames: country.allNames.slice(),
        cityNames: city.allNames.slice(),
        countryRank: country.rank,
        cityRank: city.rank,
        fullName: `${city.displayName}, ${country.displayName}`
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
  cityNameById(id: string): string {
    let city = cities.find(x => x.id == id);
    return city.displayName || undefined;
  }
  countryNameById(id: string): string {
    return countries.find(x => x.id == id).displayName
  }
  findDestination(cityId: string): Destination {
    return this._destinations.find(x => x.cityId == cityId);
  }
  private nonLetters = /[\s\.\,\-\'\;\:]+/g


  getScoreOfSearch(searchString: string, dest: Destination, doDebug: boolean = false): number {
    let score = 0;
    let searchWords: string[] = searchString ? searchString.toLowerCase().split(this.nonLetters) : []
    let debug: boolean = doDebug
    let cityScores = []
    let countryScores = []
    searchWords.forEach((searchWord, i) => {
      let cityMatches = dest.cityNames.map(city => this.matchWordsScore(searchWord, city, debug))
      let countryMatches = dest.countryNames.map(country => this.matchWordsScore(searchWord, country, debug))
      if (Math.max(...cityMatches) < Math.max(...countryMatches)) {
        countryScores.push(Math.max(...countryMatches))
      } else {
        cityScores.push(Math.max(...cityMatches))
      }
    })
    let fullnameScore = this.matchWordsScore(searchString.replace(this.nonLetters, ''), dest.fullName.replace(this.nonLetters, ''), debug)
    score = Math.max(Math.max(...cityScores) + Math.max(...countryScores), fullnameScore)
    debug && console.log(`${dest.fullName}\n= ${score}`)
    return score;
  }
  matchWordsScore(searchString: string, resultString: string, debug: boolean = false): number {
    searchString = searchString.toLowerCase()
    resultString = resultString.toLowerCase()
    let score = 0
    let addScore = (num: number, reason: string = '') => {
      score += num
      debugText += (reason + ` --> Score += ${num} (${score})\n`)
    }
    let maxScore = searchString.length
    let scoreLetterByIndex = (indexFound): number => {
      let x = indexFound
      let z = maxScore
      return round(z / (x + 1 - (x * 0.7)),2)
    }
    let debugText = ''
    debugText += (`"${searchString}" / "${resultString} (max score = ${maxScore})"\n`)

    let arrayOfLetters = resultString.split('')
    let baseIndex = 0;

    for (let letterIndex = 0; letterIndex < searchString.length; letterIndex++) {
      let letter = searchString[letterIndex]
      debugText += `[${letterIndex}: ${letter}]`
      let searchArray = arrayOfLetters.slice().splice(baseIndex, arrayOfLetters.length - 1)
      if (searchArray.includes(letter)) {
        let foundAtIndex = searchArray.indexOf(letter) + baseIndex
        let p = scoreLetterByIndex(foundAtIndex) + scoreLetterByIndex(letterIndex)
        addScore(p,` Found at ${foundAtIndex}`)
        baseIndex = foundAtIndex
      } else {
        debugText += (` Not Found\n`)
      }
    }
    score = round(score,2)
    debugText += (`FINAL SCORE (${searchString}/${resultString}): ${score}`)
    debug && console.log(debugText)
    return score
  }
    // getScoreOfSearch(search: string, dest: Destination, debug = false): number {
    //   let consoleOutput = '';
    //   consoleOutput += `${dest.fullName} \n`;
    //   const specialChars = /[^a-zA-Z0-9\-]+/g;
    //   let destinationConcat = dest.fullName.toLowerCase().replace(specialChars, '');
    //   let destinationArray = dest.fullName.toLowerCase().split(specialChars);
    //   let score = 0;
    //   let searchWords = [];
    //   if (specialChars.test(search)) {
    //     searchWords = search.split(specialChars);
    //   } else {
    //     searchWords = [search]
    //   }
    //   searchWords.forEach((searchWord) => {
    //     let indexInDestConcat = destinationConcat.indexOf(searchWord);
    //     let lengthValue = searchWord.length * 50;
    //     let indexScore = 0,
    //       penalty = 0,
    //       lengthScore = 0;
    //     if (indexInDestConcat > -1) {
    //       destinationArray.forEach((word, wordIndex) => {
    //         if (word.indexOf(searchWord) > -1) {
    //           indexScore += 200 / (word.indexOf(searchWord) + 1);
    //           penalty += indexScore * 0.2;
    //           // consoleOutput += `for  "${searchWord}" in "${word}" \n`;
    //           // consoleOutput += `+${indexScore} = 200 / (${word.indexOf(searchWord)} + 1) \n`;
    //           // consoleOutput += `-${penalty} = ${indexScore} * 0.2  \n`;
    //         }
    //       })
    //       let startOfCityOrCountry = (dest.city.toLowerCase().indexOf(searchWord) == 0 || dest.country.toLowerCase().indexOf(searchWord) == 0) ? 50 : 0;
    //       indexScore += startOfCityOrCountry * searchWord.length;
    //       // consoleOutput += `for "${searchWord}" in "${dest.city}" or in "${dest.country}" \n`;
    //       // consoleOutput += `+${startOfCityOrCountry} \n`;
    //       lengthScore += lengthValue;
    //       // consoleOutput += `for length score of "${searchWord}":\n+${lengthValue} \n`;
    //     } else {
    //       lengthScore -= lengthValue;
    //       // consoleOutput += `for not finding "${searchWord}":\n-${lengthValue} \n`;
    //     }
    //     score += (indexScore + lengthScore - penalty); // *(1+searchwordIndex*25/100)
    //     // consoleOutput += `Totals for "${searchWord}":\n +${indexScore + lengthScore - penalty} = (${indexScore} + ${lengthScore} - ${penalty})\n`;
    //   })

    //   if (debug == true) {
    //     // consoleOutput += `final Score: ${score}`
    //     // console.log(consoleOutput)
    //   }
    //   return score;
    // }

  }

