import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';
import { FormControl } from '@angular/forms';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { NameInputChangeEvent } from '../../shared-comps/name-input/name-input.component';

@Component({
  selector: 'profile-edit-form',
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.css']
})
export class ProfileEditFormComponent implements OnInit {
  @Input() profile: Profile;
  @Output() profileChange = new EventEmitter<Profile>()

  valid: boolean;
  profileName: string;
  usedProfileNames:string[] = []
  profileIcon: string;

  constructor(
    private storeSelector: StoreSelectorService,
  ) { }

  ngOnInit() {
    this.profileName = this.profile.name
    this.usedProfileNames = this.storeSelector.profiles.map(p=>p.name.toLowerCase())
  }

  onChangeName(e:NameInputChangeEvent){
    if(e.valid){
      this.valid = true
      this.emitChange()
    } else{
      this.valid = false;
    }
  }
  emitChange(){
    this.profileChange.emit(this.profile)
  }
}
