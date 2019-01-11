
export class SelectedList {

    constructor(...elements:string[]){
        this._selected = [...elements];
    }

    private _selected: string[];
    get array(){ 
        return this._selected.slice()
    }
    set array(arr:string[]){
        this._selected = arr;
    }
    add(...elements:string[]){
        elements.forEach(el=>{
            if(!this.isSelected(el)){
                this._selected.push(el)
            }
        })
        return this.array
    }
    remove(...elements:string[]){
        elements.forEach(el=>{
            if(this.isSelected(el)){
                let index = this.array.findIndex(x=>x===el)
                this._selected.splice(index,1)
            }
        })
        return this.array
    }
    toggle(...elements:string[]){
        elements.forEach(el=>{
            if(this.isSelected(el)){
                let index = this.array.findIndex(x=>x===el)
                this._selected.splice(index,1)
            } else {
                this._selected.push(el)
            }
        })
        return this.array
    }

    clear(){
        this.array = [];
        return this.array
    }
    isSelected(id:string):boolean{
        return this.array.includes(id)
    }
    get length():number{
        return this.array.length
    }
    get isEmpty():boolean{
        return this.length === 0
    }
}