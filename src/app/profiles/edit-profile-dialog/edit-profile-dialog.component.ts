import { Component, OnInit, Inject } from '@angular/core';
import { Profile, Avatar } from '../../shared/models/profile.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../shared/services/store-selector.service';

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent implements OnInit {
  profile:Profile;
  profileName:string = '';

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

  onClose(){
    // save data
    this.dialogRef.close()
  }
}
