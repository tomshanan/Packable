import { Component, OnInit, Input, Output, EventEmitter, Renderer2, OnDestroy } from '@angular/core';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['../shared/css/full-flex.css','./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  @Input() header: string;
  @Input() icon: string;
  @Output() info= new EventEmitter<void>();
  navOpen:boolean = false;

  constructor(private renderer: Renderer2) {
    
   }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'modal-open');
  }

  ngOnInit() {
  }

  toggleNav(state?:boolean){
    if(state!=null){
      this.navOpen = state;
    } else{
      this.navOpen = !this.navOpen;
    }
    if(this.navOpen){
      this.renderer.addClass(document.body, 'modal-open');
    } else{
      this.renderer.removeClass(document.body, 'modal-open');
    }
  }
  onRight(){
    this.info.emit();
  }
}
