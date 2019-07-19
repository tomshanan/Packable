import { searchableItem } from '@app/shared-comps/item-selector/item-selector.component';
import * as moment from 'moment'
import { Metadata, HasMetaData } from './library/library.model';
import { FormControl, ValidatorFn, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';

export type hasId = {
  id: string
}
export type hasNameAndId = {
  name:string
  id: string
}
type origin = 'local'|'remote'
export interface hasOrigin {
  origin:origin
}

export function timeStamp(): number {
  let newStamp = new Date().valueOf()
  return newStamp
}
export function isDefined(...objs) {
  return objs.every(obj => {
    return obj !== null && obj !== undefined && obj !== '' && (!Array.isArray(obj) || obj.length > 0)
  })
}
export function indexOfId(obj: Array<{ id: string }>, id: string): number {
  return obj.findIndex(x => x.id == id)
}

export function objectInArray(arr: {}[], obj: {}, p: string): boolean {
  let i = arr.findIndex(x => {
    return x[p] === obj[p];
  })
  return i > -1;
}
export function slugName(string: string): string {
  return string.replace(/[^A-Za-z0-9]/g, '-')
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function path(...arr: string[]): string {
  arr = arr.clearUndefined()
  return arr.join('/')
}
export function joinSpecial(arr: string[] = [], del: string, lastDel: string): string {
  let newArray = arr.slice()
  let last = newArray.pop()
  return newArray.join(del) + (newArray.length > 0 ? lastDel : '') + (last ? last : '')
}
export function round(number: number, decimals: number = 0): number {
  return number !== 0 ? Math.floor(number * 10 ** decimals) / 10 ** decimals : 0
}
export class FilteredArray {
  private _original: searchableItem[];
  public filtered: searchableItem[];

  constructor(...args) {
    this._original = [...args];
    this.filtered = [...args].sort(this.sortPackables);
  }

  public push = function (...args) {
    this._original.push(...args);
    this.reset();
  }
  set original(array) {
    this._original = [...array];
    this.reset();
  }

  sortPackables(a, b) {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }

  public reset = function () {
    this.filtered = [...this._original].sort(this.sortPackables);
    return this;
  }

  public filterUsed = function (property: string, ...usedArrays: any[]): any {
    let filtered = this.filtered;
    if (filtered.length === 0) {
      return this;
    }
    let usedArray = [].concat(...usedArrays)
    usedArray.forEach(item => {
      if (objectInArray(filtered, item, property)) {
        const index = filtered.findIndex(x => x[property] == item[property]);
        filtered.splice(index, 1)
      }
    })
    console.log('Original List:', this.original, '\nUSED:', usedArray, '\n Filter resulted in:', filtered)
    if (filtered.length === 0) {
      this.reset()
    }
    return this;
  }

  public filterFromSearch = function (property: string, searchInput: string): any {
    let filteredList: hasId[] = this.filtered;
    if (filteredList.length === 0 || !isDefined(searchInput)) {
      return this;
    } else {
      let returnArray = [];
      let searchArray = searchInput.split(allowedSpacesRegEx);
      filteredList.forEach((item, i, array) => {
        let match = false;
        const itemString = item[property].split(allowedSpacesRegEx).join('');
        for (let searchItem of searchArray) {
          const regex = new RegExp(searchItem, 'i');
          const test = itemString.match(regex);
          if (!test) {
            match = false;
            break;
          } else {
            match = true;
          }
        }
        match && returnArray.push(item);
      })
      this.filtered = [...returnArray];

      return this;
    }
  }
}

export class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export function titleCase(str: string) {
  return str.toTitleCase()
}

export function decodeHtml(html: string) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export function comparableName(str: string) {
  return str.trim().toUpperCase().replace(anySpaces, '');
}


export function usedNamesValidator(usedNames:string[]=[],allowedName?:string):ValidatorFn{
  return (control: FormControl): { [s: string]: boolean } | null => {
    let input = comparableName(control.value)
    if (usedNames.includes(input) && input !== comparableName(allowedName)) {
      return { 'usedName': true };
    }
    return null;
  }
}
export class MatchImmediately implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

type hasDateModified = { dateModified: number }
export function sortByMostRecent(a: hasDateModified, b: hasDateModified): number {
  return a.dateModified > b.dateModified ? -1 : 1;
}
export function sortByMetaScore(a: HasMetaData, b: HasMetaData): number {
  return b.metaData.metaScore - a.metaData.metaScore
}
export function sortByName(a, b):number {
  if (a.name < b.name) { return -1; }
  if (a.name > b.name) { return 1; }
  return 0;
}
export const anySpaces = /[\s\.\,\_\-\'\;\:]+/g
export const allowedSpacesRegEx = /[\s\-\_\(\)]+/;
export const allowedNameRegEx = /^[A-Za-z0-9\s\-\_\(\)\']+$/;

export function getAllDates(startDate: string, EndDate: string, incl: { first?: boolean, last?: boolean } = { first: true, last: true }): moment.Moment[] {
  let startMoment = moment(startDate, 'YYYY-MM-DD');
  let endMoment = moment(EndDate, 'YYYY-MM-DD');
  let daysTotal = endMoment.diff(startMoment, 'days');
  let allDates: moment.Moment[] = [];
  for (let i = (incl.first ? 0 : 1); (incl.last ? i : i + 1) <= daysTotal; i++) { // INCLUDES FIRST DAY - change i = 1 to exclude first day
    allDates.push(moment(startMoment).add(i, 'd'))
  }
  return allDates
}

export function stringArraysAreSame(a: Array<string>, b: Array<string>): boolean {
  let match = true
  a.forEach(str => {
    !b.includes(str) && (match = false)
  })
  b.forEach(str => {
    !a.includes(str) && (match = false)
  })
  return match
}


export function copyProperties<T extends Object>(to: T, from: T, props: Array<keyof T>) {
  let debugText:string[] = []
  props.forEach(prop => {
    if (prop in from) {
      to[prop] = from[prop]
    }
  })
}
export function propertiesAreSame<T extends Object>(obj1: T, obj2: T, props: Array<keyof T>): boolean {
  return props.every(prop => {
    if (obj1 && obj2 && prop in obj1 && prop in obj2) {
      return obj1[prop] === obj2[prop]
    } else {
      return false
    }
  })
}

export function XOR(a: boolean, b: boolean): boolean {
  return (a && !b) || (b && !a)
}

export function matchWordsScore(searchInput: string, searchTarget: string, mustFind: boolean = false, debug: boolean = false): number {
  searchInput = searchInput.toUpperCase().split(/[^a-zA-Z0-9]/g).join('')
  searchTarget = searchTarget.toUpperCase().split(/[^a-zA-Z0-9]/g).join('')
  let score = 0
  let addScore = (num: number, reason: string = '') => {
    score += round(num, 2)
    debugText += (reason + ` --> Score += ${round(num, 2)} (${score})\n`)
  }
  let maxScore = searchInput.length
  let scoreLetterByIndex = (indexFound, consec): number => {
    let i = indexFound
    let L = maxScore
    const modifier = 8
    consec = Math.min(consec, modifier)
    if (L > 0) {
      return L / (i + 1 - (i * ((8 - consec) / 10)))
    } else {
      return 0
    }
  }
  let debugText = ''
  debugText += (`"${searchInput}" / "${searchTarget} (max score = ${maxScore})"\n`)

  let arrayOfLetters = searchTarget.split('')
  let baseIndex = 0;
  let consecutive = 0
  let letterIndex: number,
    letter: string,
    searchArray: string[],
    foundAtIndex: number,
    isConsec: boolean,
    letterScore: number
  for (letterIndex = 0; letterIndex < searchInput.length; letterIndex++) {
    letter = searchInput[letterIndex]
    debugText += `[${letterIndex}: ${letter}]`
    searchArray = arrayOfLetters.slice().splice(baseIndex, arrayOfLetters.length - 1)
    if (searchArray.includes(letter)) {
      foundAtIndex = searchArray.indexOf(letter) + baseIndex
      isConsec = baseIndex === foundAtIndex
      letterScore = scoreLetterByIndex(foundAtIndex, consecutive) + scoreLetterByIndex(letterIndex, 0)
      addScore(letterScore, ` Found at ${foundAtIndex}`)
      if (isConsec) {
        consecutive++
        addScore(consecutive * 2, `additional consecutive score`)
      } else {
        consecutive = 0
      }
      baseIndex = foundAtIndex
    } else {
      if (mustFind) {
        score = 0
        break;
      }
      consecutive = 0
      debugText += (` Not Found\n`)
    }
  }
  score = round(score, 2)
  debugText += (`FINAL SCORE (${searchInput}/${searchTarget}): ${score}`)
  debug && console.log(debugText)
  return score
}