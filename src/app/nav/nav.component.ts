import { Component, OnInit, Input, Output, EventEmitter, Renderer2, OnDestroy } from '@angular/core';
import { Icon } from '@app/shared-comps/stepper/stepper.component';
import { WindowService } from '../shared/services/window.service';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['../shared/css/full-flex.css','./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() header: string;
  @Input() rightIcon: Icon = {icon:{type:'mat',name:'help_outline'},text:'Help'}
  @Input() rightDisabled: boolean = false;
  @Input() useNgContent: boolean = false;
  @Output() rightClick= new EventEmitter<void>();
  navOpen:boolean = false;

  constructor(private renderer: Renderer2, public windowService: WindowService) {
    
   }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'modal-open');
  }

  ngOnInit() {
    this.applyBodyStyle(false)
  }

  toggleNav(state?:boolean){
    if(state!=null){
      this.navOpen = state;
    } else{
      this.navOpen = !this.navOpen;
    }
    this.applyBodyStyle(this.navOpen)
  }
  applyBodyStyle(open:boolean){
    if(open){
      this.renderer.addClass(document.body, 'modal-open');
      this.renderer.addClass(document.documentElement, 'modal-open');
    } else{
      this.renderer.removeClass(document.body, 'modal-open');
      this.renderer.removeClass(document.documentElement, 'modal-open');
    }
  }
  onRight(){
    this.rightClick.emit();
  }
}
