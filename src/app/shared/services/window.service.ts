import { Subject } from 'rxjs';

export interface screenSizes {
    xs: number,
    sm: number,
    md: number,
    lg: number,
    xl: number  
}
export type screenSize = keyof screenSizes;

export var screenSizes:screenSizes = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
}


export class WindowService {
    private _width: number;
    public change: Subject<number> = new Subject();
    private timeout = setTimeout(()=>{},0)

    constructor(){
        this._width = window.innerWidth
        this.change.next(this._width)
        
        window.addEventListener('resize', (event)=>{
            console.log(`resize event emitted\n`,event)
            if(this._width != window.innerWidth){
                clearTimeout(this.timeout)
                this._width = window.innerWidth
                this.timeout= setTimeout(()=>{
                    this.change.next(this._width)
                    console.log('Window Service - change Size emitted: '+this._width);
                }, 300)
            }
        })
    }
    get width(){
        return this._width;
    }
    
    public min(size: screenSize): boolean{
         return this.width >= screenSizes[size]
    }
    public max(size: screenSize): boolean{
        return this.width <= screenSizes[size]
   }

   public between(min:screenSize, max:screenSize):boolean{
    return this.min(min) && this.max(max);
   }
}