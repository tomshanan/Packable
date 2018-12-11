import { Subject } from 'rxjs';

interface screenSizes {
    xs: number,
    sm: number,
    md: number,
    lg: number,
    xl: number  
}
type size = keyof screenSizes;

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
    
    constructor(){
        this._width = window.innerWidth
        this.change.next(this._width)
        
        window.addEventListener('resize', (event)=>{
            this._width = window.innerWidth
            this.change.next(this._width)
        })
    }
    get width(){
        return this._width;
    }
    
    public min(size: size): boolean{
         return this.width >= screenSizes[size]
    }
    public max(size: size): boolean{
        return this.width <= screenSizes[size]
   }

   public between(min:size, max:size):boolean{
    return this.min(min) && this.max(max);
   }
}