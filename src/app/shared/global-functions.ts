import { item } from './services/list-editor.service';
import { filterItem } from '@app/shared-comps/item-selector/item-selector.component';

export function timeStamp():number{
  let newStamp = new Date().valueOf()
  return newStamp
}
export function isDefined(property:any, object:any = {}){
  return object && property!==null && property !==undefined && property!=='' && property != []
}
export function indexOfId(obj:Array<{id:string}>, id:string):number{
  return obj.findIndex(x=>x.id == id)
}

export function objectInArray(arr: {}[], obj: {}, p: string):boolean {
    let i = arr.findIndex(x => {
      return x[p] === obj[p];
    })
    return i>-1;
}
export function slugName(string:string):string{
  return string.replace(/[^A-Za-z0-9]/g,'-')
}

export function randomBetween(min:number,max:number):number {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export function path(...arr:string[]):string{
  return arr.join('/')
}

export class FilteredArray {
  private _original: filterItem[];
  public filtered: filterItem[];

  constructor(...args){
    this._original = [...args];
    this.filtered = [...args].sort(this.sortPackables);
  }

  public push = function(...args){
    this._original.push(...args);
    this.reset();
  }
  set original(array){
    this._original = [...array];
    this.reset();
  }

  sortPackables(a,b) {
    if (a.name < b.name)
      return -1;
    if (a.name > b.name)
      return 1;
    return 0;
  }
  
  public reset = function(){
    this.filtered = [...this._original].sort(this.sortPackables);
    return this;
  }

  public filterUsed = function(property: string, ...usedArrays:any[]): any {
    let filtered = this.filtered;
    if (filtered.length === 0) {
      return this;
    }
    let usedArray = [].concat(...usedArrays)
    usedArray.forEach(item=>{
      if(objectInArray(filtered,item,property)){
        const index = filtered.findIndex(x => x[property]==item[property]);
        filtered.splice(index,1)
      }
    })
    console.log('Original List:',this.original, '\nUSED:',usedArray,'\n Filter resulted in:',filtered)
    if(filtered.length === 0){
      this.reset()
    } 
    return this;
  }

  public filterFromSearch = function(property: string, searchInput: string): any {
    let filteredList:item[] = this.filtered;
    if (filteredList.length === 0 || !isDefined(searchInput)) {
      return this;
    } else {
      let returnArray = [];
      const preg = /[\s\-\_\(\)]/;
      let searchArray = searchInput.split(preg);
      filteredList.forEach((item,i,array)=>{
        let match = false;
        const itemString = item[property].split(preg).join('');
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
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
  }
}

export function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

export function decodeHtml(html:string) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}