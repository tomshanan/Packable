import { Component, OnInit, Input, Renderer2, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter, AfterContentInit, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { IconService } from '@app/core';
import { Avatar } from '@app/shared/models/profile.model';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Subscription } from 'rxjs';
import { isDefined } from '../../shared/global-functions';
import { take } from 'rxjs/operators';

function log(...args){
  console.log('👨',...args)
}

@Component({
  selector: 'profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.css']
})
export class ProfileIconComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy,AfterViewChecked {
  

  @Input() showName: boolean = false;
  @Input() isInteractive: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isButton: boolean = false;
  @Input() dim: boolean = false;
  @Input() fullFrame: boolean = false;
  @Input('width') inputWidth: string = "50px";
  @Input() inline:boolean = false;
  @Input() debug:boolean = false;

  @Input() profileId:string; 
  @Input('profile') profileInput:Profile;   // will override profileId
  profile:Profile;           
  @Input('avatar') avatarInput:Avatar;      // will override profile
  avatar:Avatar;             
  @Input('name') nameInput: string;         // will override profile
  name: string;   
  @Input('icon') iconInput: string;         // will override avatar
  icon: string;             
  @Input('color') inputColor: string|string[];        // will override avatar
  colors: string[]; 
  @Output('onClick') click = new EventEmitter<void>()
  @ViewChild('profile') profileIcon: ElementRef;
  sub: Subscription;


  constructor(
    private iconService:IconService, //for template
    private renderer: Renderer2,
    private storeSelector: StoreSelectorService,
    private cd:ChangeDetectorRef,
  ) { 
    
  }
  emitClick(){
    if(this.isInteractive){
      this.click.emit()
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }
  ngAfterViewInit(){
    this.loadSvg()
    this.cd.markForCheck()
  }
  ngAfterViewChecked(){

  }
  loadSvg(){
    log('loadSvg called')
    let svgHost:HTMLElement = this.profileIcon.nativeElement.querySelector('.svgHost')
    let svgEl = svgHost.querySelector('svg')
    if(svgEl){
      this.renderer.removeChild(svgHost,svgEl)
    }
    let svgElementObs = this.iconService.registry.getNamedSvgIcon(this.icon)
    svgElementObs.pipe(take(1)).subscribe((svgElement)=>{
      this.renderer.appendChild(svgHost,svgElement)
    })
  }
  ngOnInit() {
    this.init();
    this.sub = this.storeSelector.profiles$.subscribe((state)=>{
      this.init();
    })
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  init(){
    this.renderer.setStyle(this.profileIcon.nativeElement, 'width', this.inputWidth)
    this.profile = this.profileInput || (this.profileId ? this.storeSelector.getProfileById(this.profileId) : null);
    this.debug && console.log(`Profile Icon Loaded Profile:`,this.profile.id)
    this.avatar = this.avatarInput || (this.profile ? this.profile.avatar : new Avatar())
    this.debug && console.log(`Profile Icon Loaded AVATAR:`,this.avatar.icon,this.avatar.color)
    this.name = this.nameInput || (this.profile ? this.profile.name : 'Traveler')
    this.icon = this.iconInput || this.avatar.icon || 'default';
    this.debug && console.log(`Profile Icon Loaded ICON:`,this.icon)
    let color: string|string[] = this.inputColor || this.avatar.color || ['#dae2f8', '#d6a4a4'];
    this.debug && console.log(`Profile Icon Loaded ICON:`,color)
    this.colors = Array.isArray(color) ? color : [color];
  }
  offset(i:number):number{
    return this.colors.length>1 ? (i * (100 / (this.colors.length-1))) : 1
  }
}
