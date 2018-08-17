import { Subject } from 'rxjs/Subject';

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
    minSizes = {
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200
    }
    get width(){
        return this._width;
    }
    get min_sm(){
        return this.width >= this.minSizes.sm
    }
    get min_md(){
        return this.width >= this.minSizes.md
    }
    get min_lg(){
        return this.width >= this.minSizes.lg
    }
    get min_xl(){
        return this.width >= this.minSizes.xl
    }

    get max_xs(){
        return this.width < this.minSizes.sm
    }
    get max_sm(){
        return this.width < this.minSizes.md
    }
    get max_md(){
        return this.width < this.minSizes.lg
    }
    get max_lg(){
        return this.width < this.minSizes.xl
    }
}