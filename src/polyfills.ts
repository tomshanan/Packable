


/**
 * Required to support Web Animations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 */

// (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
// (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
// (window as any).__zone_symbol__BLACK_LISTED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames

/*
* in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
* with the following flag, it will bypass `zone.js` patch for IE/Edge
*/
// (window as any).__Zone_enable_cross_context_check = true;

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */
type comparableItem = { id: string, dateModified: number }
declare global {
    interface Array<T> {
        /**
        * find an element in array by its id property
        */
        findId(id: string): T;
        /**
        * get an array of all the element's ids
        */
       ids(): string[];
        /**
        * check if an array of Objects has an object with matching ID
        */
        hasId(id: string): boolean;
        /** 
         * find the index of an element in array by it's id property
        */
        idIndex(id: string): number;
        /**
         * This will mutate an Array (this), removing elements missing from the comparison Array, and adding ones that are missing from the original (this).
         * @param compare The array to compare with. 
         */
        compare(compare: T[], callback?: (changedItem:T,action:'add'|'remove'|'update')=>any): T[];
        /**
         * Returns a new array without undefined and null objects, and without empty arrays and string
         */
        clearUndefined(): T[];
        /**
         * Given a removeArray, the method removes any elemets with matching IDs and returns a new array
         * @param removeArray The array of items you wish to clear from the original array. (all must have ID property)
         */
        removeElements(removeArray:T[]):T[];
        /**
         * Find an element that matches another element by specifing an array of properties for comparison.
         * @param findObject the object for comparison
         * @param propArray array of properties to compare
         */
        findBy(findObject:T,propArray:Array<keyof T>):T;
        /**
         * Find an element's index that matches another element by specifing an array of properties for comparison.
         * @param findObject the object for comparison
         * @param propArray array of properties to compare
         */
        findIndexBy(findObject:T,propArray:Array<keyof T>):number;
    }

}

if (!Array.prototype.hasId) {
    Array.prototype.hasId = function <T extends comparableItem>(this: T[], id: string): boolean {
        return this.idIndex(id) > -1
    }
}

if (!Array.prototype.findId) {
    Array.prototype.findId = function <T extends comparableItem>(this: T[], id: string): T {
        return this.find(e => {
            if (e && 'id' in e) {
                return e.id === id
            } else {
                return false
            }
        })
    }
}

if (!Array.prototype.idIndex) {
    Array.prototype.idIndex = function <T extends comparableItem>(this: T[], id: string): number {
            return this.findIndex(e => {
                if (e && 'id' in e) {
                    return e.id === id
                } else {
                    return false
                }
            })
        
    }
}

if (!Array.prototype.compare) {
    Array.prototype.compare = function <T extends comparableItem>(this: T[], updatedArray: T[], callback:(changedItem:T,action:'add'|'remove'|'update')=>any): T[] {
        updatedArray.forEach((item,i,arr) => {
            if('id' in item){
                if (!this.findId(item.id)) {
                    callback != null ? callback(item,'add') : this.unshift(item)
                    // console.log('Added new item:'+item['name']);
                }
            } 
            else {
                arr.splice(i,1)
            }
        })
        this.slice().forEach((oldItem) => {
            if('id' in oldItem){
                const i = this.idIndex(oldItem.id)
                let newItem = updatedArray.findId(oldItem.id)
                if (!newItem) {
                    callback != null ? callback(oldItem,'remove') : this.splice(i, 1);
                    // console.log('Removed an item:'+oldItem['name']);
                } else if (('dateModified' in newItem && 'dateModified' in oldItem)&&(newItem.dateModified !== oldItem.dateModified)){
                    // console.log('Replacing old item:',oldItem,'\nwith new item:',newItem);
                    callback != null ? callback(newItem,'update') : this.splice(i,1,newItem)
                }
            }
        })
        return this
    }
}
if (!Array.prototype.clearUndefined) {
    Array.prototype.clearUndefined = function<T extends object|string|number>(this: T[]): T[] {
        let newarray = this.filter(el=>{
            return el != null && el != undefined && el !== "" && el !== []
        })
        return newarray
    }
}

if(!Array.prototype.removeElements){
    Array.prototype.removeElements = function <T extends comparableItem>(this:T[], removeArray:T[]):T[]{
        removeArray.forEach(item => {
            if('id' in item){
                let i = this.idIndex(item.id)
                if(i > -1){
                    this.splice(i,1)
                }
            }
        })
        return this
    }
}
if(!Array.prototype.ids){
    Array.prototype.ids = function <T extends {id:string}>(this:T[]):string[]{
        let returnArray:string[] = []
        this.forEach(item => {
            if('id' in item){
                returnArray.push(item.id)
            }
        })
        return returnArray
    }
}
if(!Array.prototype.findBy){
    Array.prototype.findBy = function <T>(this: T[], findObject:T,propArray:Array<keyof T>):T{
        return this.find(obj=>propArray.every(prop=>findObject[prop]===obj[prop]))
    }
}
if(!Array.prototype.findIndexBy){
    Array.prototype.findIndexBy = function <T>(this: T[], findObject:T,propArray:Array<keyof T>):number{
        return this.findIndex(obj=>propArray.every(prop=>findObject[prop]===obj[prop]))
    }
}