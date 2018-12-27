import { Component, OnInit, Input, Renderer2, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { IconService } from '@app/core';
import { Avatar } from '@app/shared/models/profile.model';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '../../shared/services/store-selector.service';

@Component({
  selector: 'profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.css']
})
export class ProfileIconComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }

  @Input() icon: string = '001-man';
  @Input('name') inputName: string = 'Traveler'
  @Input() showName: boolean = false;
  @Input() isInteractive: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isButton: boolean = false;
  @Input() dim: boolean = false;
  @Input() inputWidth: string = "50px";
  @Input('color') inputColor: string = 'white';
  @Input() profileId:string; // will override profile
  @Input() profile:Profile;  // will override avatar
  @Input() avatar:Avatar;  // will override icon and color
  @Input() inline:boolean = false;

  @ViewChild('profile') profileIcon: ElementRef;


  constructor(
    private iconService:IconService, //for template
    private renderer: Renderer2,
    private storeSelector: StoreSelectorService
  ) { 
    
  }

  ngOnInit() {
    this.init();
  }
  init(){
    this.renderer.setStyle(this.profileIcon.nativeElement, 'width', this.inputWidth)
    if(this.profileId){
      this.profile = this.storeSelector.getProfileById(this.profileId)
    }
    if(this.profile){
      this.avatar = this.profile.avatar
    } 
    if (this.avatar){
      this.icon = this.avatar.icon || this.icon;
      this.inputColor = this.avatar.color || this.inputColor;
    }
  }
}
