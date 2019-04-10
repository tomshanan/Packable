import { Component, OnInit, Input, Renderer2, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { IconService } from '@app/core';
import { Avatar } from '@app/shared/models/profile.model';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Subscription } from 'rxjs';
import { isDefined } from '../../shared/global-functions';

@Component({
  selector: 'profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.css']
})
export class ProfileIconComponent implements OnInit, OnChanges, OnDestroy {
  

  @Input() showName: boolean = false;
  @Input() isInteractive: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isButton: boolean = false;
  @Input() dim: boolean = false;
  @Input() fullFrame: boolean = false;
  @Input('width') inputWidth: string = "50px";
  @Input() inline:boolean = false;

  @Input() profileId:string; 
  @Input('profile') profileInput:Profile;   // will override profileId
  profile:Profile;           
  @Input('avatar') avatarInput:Avatar;      // will override profile
  avatar:Avatar;             
  @Input('name') nameInput: string;         // will override profile
  name: string;   
  @Input('icon') iconInput: string;         // will override avatar
  icon: string;             
  @Input('color') inputColor: string;        // will override avatar
  color: string; 

  @ViewChild('profile') profileIcon: ElementRef;
  sub: Subscription;

  constructor(
    private iconService:IconService, //for template
    private renderer: Renderer2,
    private storeSelector: StoreSelectorService
  ) { 
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }
  ngOnInit() {
    this.init();
    this.sub = this.storeSelector.profiles_obs.subscribe((state)=>{
      this.init();
    })
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  init(){
    this.renderer.setStyle(this.profileIcon.nativeElement, 'width', this.inputWidth)
    this.profile = this.profileInput || (this.profileId ? this.storeSelector.getProfileById(this.profileId) : null);
    this.avatar = this.avatarInput || (this.profile ? this.profile.avatar : new Avatar())
    this.name = this.nameInput || (this.profile ? this.profile.name : 'Traveler')
    this.icon = this.iconInput || this.avatar.icon || 'default';
    this.color = this.inputColor || this.avatar.color || 'white';
  }
}
