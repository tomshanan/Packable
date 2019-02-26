import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Profile, Avatar, ProfileComplete } from '../../shared/models/profile.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { ProfileEditFormComponent } from '../profile-edit-form/profile-edit-form.component';
import { timeStamp } from '@app/shared/global-functions';

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent implements OnInit {
  profile:ProfileComplete;
  profileName:string = '';
  @ViewChild('profileForm') profileForm:ProfileEditFormComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {profile:Profile},
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    private store: Store<fromApp.appState>,
    private proFac:ProfileFactory,
    private storeSelector: StoreSelectorService,
  ) { 
    this.profile = this.proFac.makeComplete([data.profile])[0]
    this.profileName = this.profile.name
  }

  ngOnInit() {
  }
  
  valid():boolean{
    return this.profileForm.valid
  }

  onConfirm(){
    if(this.valid()){
      let newProfile = this.proFac.completeToPrivate(this.profile)
      newProfile.dateModified = timeStamp()
      this.store.dispatch(new profileActions.editProfiles([newProfile]))
      this.onClose();
    }
  }
  onClose(){
    // save data
    this.dialogRef.close()
  }
}
