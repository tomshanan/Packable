


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

declare global {
    interface Array<T> {
        /**
        * find an element in array by its id property
        */
        findId(id: string): T;
        /** 
         * find the index of an element in array by it's id property
        */
        idIndex(id: string): number;
        /**
         * This will mutate an Array (this), removing elements missing from the comparison Array, and adding ones that are missing from the original (this).
         * @param compare The array to compare with. 
         */
        compareAddRemove(compare: T[]): T[];
        /**
         * Returns a new array without undefined and null objects, and without empty arrays and string
         */
        clearUndefined(): any[];
        /**
         * Given a removeArray, the method removes any elemets with matching IDs and returns a new array
         * @param removeArray The array of items you wish to clear from the original array. (all must have ID property)
         */
        removeIds(removeArray:T[]):T[];
    }
}
type itemWithId = { id: string }

if (!Array.prototype.findId) {
    Array.prototype.findId = function <T extends itemWithId>(this: T[], id: string): T {
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
    Array.prototype.idIndex = function <T extends itemWithId>(this: T[], id: string): number {
            return this.findIndex(e => {
                if (e && 'id' in e) {
                    return e.id === id
                } else {
                    return false
                }
            })
        
    }
}

if (!Array.prototype.compareAddRemove) {
    Array.prototype.compareAddRemove = function <T extends itemWithId>(this: T[], compare: T[]): T[] {
        compare.forEach(item => {
            if (!this.findId(item.id)) {
                this.unshift(item)
            }
        })
        this.slice().forEach((item) => {
            if (!compare.findId(item.id)) {
                const i = this.idIndex(item.id)
                this.splice(i, 1)
            }
        })
        return this
    }
}
if (!Array.prototype.clearUndefined) {
    Array.prototype.clearUndefined = function(this: any[]): any[] {
        let newarray = this.filter(el=>{
            return el != null && el != undefined && el != "" && el != []
        })
        return newarray
    }
}

if(!Array.prototype.removeIds){
    Array.prototype.removeIds = function <T extends itemWithId>(this:T[], removeArray:T[]):T[]{
        return this.clearUndefined().filter(item => {
            if(item !== undefined && item !== null && 'id' in item){
                return removeArray.idIndex(item.id) < 0
            } else {
                return false
            }
        })
    }
}