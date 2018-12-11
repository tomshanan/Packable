import { Component, OnInit, Inject } from '@angular/core';
import { CollectionComplete } from '../../../../shared/models/collection.model';
import { Profile } from '../../../../shared/models/profile.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as collectionActions from '@app/collections/store/collections.actions'
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { WindowService } from '../../../../shared/services/window.service';
import { titleCase } from '../../../../shared/global-functions';

export interface DialogData_ChooseProfiles {
  collection: CollectionComplete,
  profileGroup: Profile[],
  selectedProfiles: string[],
  header: string,
  content: string,
}

@Component({
  selector: 'app-choose-profile-dialog',
  templateUrl: './choose-profile-dialog.component.html',
  styleUrls: ['./choose-profile-dialog.component.css']
})
export class ChooseProfileDialogComponent implements OnInit {

  collection: CollectionComplete;
  allProfiles: Profile[];
  profileGroup: Profile[];
  selectedProfiles: string[];
  header: string;
  content: string;
  super:string; // for header

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData_ChooseProfiles,
    public dialogRef: MatDialogRef<ChooseProfileDialogComponent>,
    private store: Store<fromApp.appState>,
    private windowService: WindowService
  ) { 
    this.collection = data.collection
    this.profileGroup = data.profileGroup
    this.selectedProfiles = data.selectedProfiles || []
    this.header = data.header || ''
    this.content = data.content || ''
    this.super = `Updating ${titleCase(this.collection.name)}`
  }
  
  ngOnInit() {
    this.updateWindowWidth()
    this.windowService.change.subscribe(width => {
      this.updateWindowWidth()
    })
  }

  updateWindowWidth() {
    this.dialogRef.updateSize(this.windowService.max('xs') ? '99vw' : '500px')
  }

  profileSelect(select:'all'|'none'){
    if (select == 'all'){
      this.selectedProfiles = this.profileGroup.map(p=>p.id)
    } else {
      this.selectedProfiles = [];
    }
  }

  onClose(ids:string[] = []){
    this.dialogRef.close(ids)
  }
  onConfirm(){
    this.onClose(this.selectedProfiles)
  }
}
