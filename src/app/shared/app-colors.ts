import { Injectable } from '@angular/core';
// var ColorFac = require('color');
import * as ColorFac from 'color'
export var disabledColor = "#c6c6c6"

@Injectable({
    providedIn: 'root'
})
export class AppColors {
    public danger = new Color('#ff4400')//,'#e23b00')
    public action = new Color('#007bff')//,'#0056b3')
    public accent = new Color('#ff4081')//,'#bb1950')
    public active = new Color('#31d441')//,'#26a532')
    public muted = new Color('#939ea8')//, '#79848d')
}
export class Color {
    inactive: string;
    hover: string;
    click: string;
    ripple: string;
    disabled: string;
    muted:string;
    constructor(
            inactive: string,
            hover?: string,
            click?: string){
        this.inactive = inactive;
        this.hover = hover || ColorFac(inactive).lighten(0.2) ;
        this.click = click || ColorFac(inactive).lighten(0.2);
        this.ripple = ColorFac(inactive).fade(0.7)
        this.muted = ColorFac(inactive).desaturate(0.5).lighten(0.3)
        this.disabled = disabledColor;
        }
}