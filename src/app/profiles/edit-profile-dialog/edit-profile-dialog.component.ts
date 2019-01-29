import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Profile, Avatar } from '../../shared/models/profile.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { ProfileEditFormComponent } from '../profile-edit-form/profile-edit-form.component';

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent implements OnInit {
  profile:Profile;
  profileName:string = '';
  @ViewChild('profileForm') profileForm:ProfileEditFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {profile:Profile},
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    private store: Store<fromApp.appState>,
    private proFac:ProfileFactory,
    private storeSelector: StoreSelectorService,
  ) { 
    this.profile = data.profile
    this.profileName = this.profile.name
  }

  ngOnInit() {
  }
  
  valid():boolean{
    return this.profileForm.valid
  }
  logProfile(){
    console.log(this.profileForm);
  }
  onConfirm(){
    if(this.valid()){
      this.store.dispatch(new profileActions.editProfile(this.profile))
      this.onClose();
    }
  }
  onClose(){
    // save data
    this.dialogRef.close()
  }
}
