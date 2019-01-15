import { Injectable } from '@angular/core';
export var disabledColor = "#c6c6c6"

@Injectable({
    providedIn: 'root'
})
export class appColors {
    public danger = new color('#dc3545','#bd2130')
    public action = new color('#007bff','#0056b3')
    public accent = new color('#ff4081','#bb1950')
    public active = new color('#31d441','#26a532')
}
export class color {
    inactive: string;
    hover: string;
    click: string;
    ripple: string;
    disabled: string;
    constructor(
            inactive: string,
            hover?: string,
            click?: string,
            disabled?: string){
        this.inactive = inactive;
        this.hover = hover || this.inactive;
        this.click = click || hover || this.inactive;
        this.ripple = this.inactive+"33"
        this.disabled = disabled || disabledColor;
        }
}