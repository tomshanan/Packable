import { Component, OnInit, Input, Output, EventEmitter, Directive, ElementRef, Renderer2 } from '@angular/core';
import { RippleAnimationConfig } from '@angular/material';
import { WindowService, screenSize } from '../../shared/services/window.service';
import { isDefined } from '@app/shared/global-functions';


@Component({
  selector: 'icon-text-button',
  templateUrl: './icon-text-button.component.html',
  styleUrls: ['./icon-text-button.component.css']
})
export class IconTextButtonComponent implements OnInit {
  @Input('text') text: string = '';
  @Input('svgIcon') svgIcon: string;
  @Input('matIcon') matIcon: string;
  @Input() disabled: boolean = false;
  @Input() showTextFromSize: screenSize;
  @Input() bigButton: boolean = false;
  @Output('onClick') emitClick = new EventEmitter<void>()
/**
<icon-text-button
text="text"
matIcon="ballot"
svgIcon="t-shirt"
[disabled]="false"
showTextFromSize="sm"
(onClick)="">
</icon-text-button>
 */
  constructor(
    private windowService: WindowService,
  ) { }

  ngOnInit() {
  }
  onClick(){
    if(!this.disabled){
      this.emitClick.emit()
    }
  }
  showText():boolean{
    if(this.text != ''){
      if(isDefined(this.showTextFromSize)){
        return this.windowService.min(this.showTextFromSize)
      } else{
        return true
      }
    } else{
      return false
    }
  }
  configRipple: RippleAnimationConfig = {
    enterDuration: 200, exitDuration: 100
  }
}
