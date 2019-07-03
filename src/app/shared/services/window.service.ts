import { Subject } from 'rxjs';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmDialog } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';

export interface screenSizes {
    xxs: number,
    xs: number,
    sm: number,
    md: number,
    lg: number,
    xl: number,
    xxl: number,
}
export type screenSize = keyof screenSizes;

export var screenSizes: screenSizes = {
    xxs: 360,
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
}

function log(...args) {
    console.log('💻', ...args)
}

@Injectable()
export class WindowService {
    private _width: number;
    private _height: number;
    public change: Subject<number> = new Subject();
    private timeout = setTimeout(() => { }, 0)
    private renderer: Renderer2;

    constructor(
        private dialog: MatDialog,
        rendererFactory: RendererFactory2,
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        this._height = window.innerHeight
        this._width = window.innerWidth
        this.change.next(this._width)
        // window.addEventListener( 'touchmove', function() {
        //     event.preventDefault()
        //     log('touch start')
        // })
        window.addEventListener('resize', (event) => {
            if (this._width != window.innerWidth || this._height != window.innerHeight) {
                clearTimeout(this.timeout)
                this._width = window.innerWidth
                this._height = window.innerHeight
                this.timeout = setTimeout(() => {
                    log('resize change event:' + this._width)
                    this.change.next(this._width)
                }, 300)
            }
        })
        this.dialog.afterOpened.subscribe((dialogRef) => {
            log(`dialog.afterOpened event`)
            this.updateDialogsSize(dialogRef, true)
        })
        this.change.subscribe(() => {
            log(`size change event (update dialogs)`)
            this.updateOpenDialogs()
        })
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }

    public min(size: screenSize): boolean {
        return this.width >= screenSizes[size]
    }
    public max(size: screenSize): boolean {
        return this.width <= screenSizes[size]
    }

    public between(min: screenSize, max: screenSize): boolean {
        return this.min(min) && this.max(max);
    }
    public updateOpenDialogs() {
        log('request to update dialogs')
        this.dialog.openDialogs.forEach(dialogRef => {
            this.updateDialogsSize(dialogRef)
        })
    }
    public unsetOpenDialogs() {
        log('request to unset dialogs')
        this.dialog.openDialogs.forEach(dialogRef => {
            dialogRef.updateSize(null, null)
        })
    }
    public updateDialogsSize = (dialogRef: MatDialogRef<any|ConfirmDialog>, newDialog: boolean = false) => {
        dialogRef.updateSize(null, null)
        if (this.max("md") && (dialogRef.componentInstance instanceof ConfirmDialog) === false) {
            dialogRef.addPanelClass('dialog-full-screen')
            dialogRef.removePanelClass('dialog-default')
        } else {
            dialogRef.addPanelClass('dialog-default')
            dialogRef.removePanelClass('dialog-full-screen')
            dialogRef.updateSize(null, null)
            if (newDialog) {
                setTimeout(() => {
                    this.checkInnerSize(dialogRef)
                }, 0);
            } else {
                this.checkInnerSize(dialogRef)
            }
        }
    }
    private checkInnerSize = (dialogRef: MatDialogRef<any>) => {
        let windowHeight = this.height
        let dialogEl = document.querySelector('#' + dialogRef.id)
        if (dialogEl) {
            let dialogHeight = dialogEl.scrollHeight
            if (dialogHeight >= windowHeight) {
                dialogRef.addPanelClass('dialog-tall')
            } 

        }
    }
}