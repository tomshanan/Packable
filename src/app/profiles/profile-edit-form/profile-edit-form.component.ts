import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';
import { FormControl } from '@angular/forms';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { NameInputChangeEvent } from '../../shared-comps/name-input/name-input.component';
import { IconService } from '../../shared/services/icon.service';
import { ProfileFactory } from '../../shared/factories/profile.factory';

@Component({
  selector: 'profile-edit-form',
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.css']
})
export class ProfileEditFormComponent implements OnInit {
  @Input() profile: Profile;
  @Output() profileChange = new EventEmitter<Profile>()
  edittedProfile: Profile;
  valid: boolean = true;
  usedProfileNames:string[] = []
  icons: string[] = []
  
  profileName: string;
  selectedIcon: string[] = [];

  constructor(
    private storeSelector: StoreSelectorService,
    private iconService: IconService,
    private proFac: ProfileFactory,
  ) { 
    this.icons = this.iconService.profileIcons.icons.slice().filter(icon=>icon!="default");
  }

  ngOnInit() {
    this.edittedProfile = this.proFac.duplicateProfile(this.profile)
    this.profileName = this.edittedProfile.name
    this.usedProfileNames = this.storeSelector.profiles.map(p=>p.name.toLowerCase())
    this.selectedIcon = [this.edittedProfile.avatar.icon]
  }

  onChangeName(e:NameInputChangeEvent){
    this.edittedProfile.name = this.profileName
    this.valid = e.valid
    this.emitChange()
  }
  onChangeIcon(){
    this.edittedProfile.avatar.icon = this.selectedIcon[0]
    this.emitChange()
  }
  emitChange(){
    this.profileChange.emit(this.edittedProfile)
  }
}
