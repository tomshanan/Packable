import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Profile, ProfileComplete } from '../../shared/models/profile.model';
import { FormControl } from '@angular/forms';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { NameInputChangeEvent, NameInputComponent } from '../../shared-comps/name-input/name-input.component';
import { IconService } from '../../shared/services/icon.service';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { isDefined, hasNameAndId } from '../../shared/global-functions';

@Component({
  selector: 'profile-edit-form',
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.css']
})
export class ProfileEditFormComponent implements OnInit {
  @Input() profile: ProfileComplete;
  @Output() profileChange = new EventEmitter<Profile>()
  @Output() validChange = new EventEmitter<boolean>()
  edittedProfile: ProfileComplete;
  valid: boolean = true;
  usedProfileNames:string[] = []
  icons: string[] = []
  templateIcons: boolean = false;
  @ViewChild('nameInput') nameInput: NameInputComponent;

  profileName: string;
  selectedIcon: string[] = [];

  constructor(
    private storeSelector: StoreSelectorService,
    private iconService: IconService,
    private proFac: ProfileFactory,
  ) { 
    if(this.storeSelector.isLibraryStore){
      this.icons = this.iconService.profileTemplateIcons.icons.slice()
      this.templateIcons = true;
    } else {
      this.icons = this.iconService.profileIcons.icons.slice().filter(icon=>icon!='default')
      this.templateIcons = false;
    }
  }

  ngOnInit() {
    this.edittedProfile = new ProfileComplete(this.profile.id, this.profile.name, this.profile.collections.slice(),this.profile.avatar)
    this.profileName = this.edittedProfile.name
    this.usedProfileNames = this.storeSelector.profiles.map(p=>p.name)
    let icon = this.edittedProfile.avatar.icon
    this.selectedIcon = icon !='default' ? [icon] : [];
    this.initialValidation();
  }

  initialValidation(){
    if(isDefined(this.profileName) && isDefined(this.selectedIcon)){
      this.valid = true
    } else {
      this.valid = false
    }
    this.validChange.emit(this.valid)
  }

  onChangeName(e:NameInputChangeEvent){
    this.edittedProfile.name = this.profileName
    this.emitChange()
  }
  onChangeIcon(){
    this.edittedProfile.avatar.icon = this.selectedIcon[0]
    this.emitChange()
  }
  checkValidation(){
    if(this.selectedIcon.clearUndefined().length>0 && this.nameInput.nameInput.valid){
      this.valid = true
    } else {
      this.valid = false
    }
    this.validChange.emit(this.valid)
  }
  emitChange(){
    this.profileChange.emit(this.edittedProfile)
    this.checkValidation()
  }
}
