import { Component, OnInit, Inject } from '@angular/core';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { Profile } from '../../../shared/models/profile.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { WeatherRule } from '../../../shared/models/weather.model';
import { weatherFactory } from '../../../shared/factories/weather.factory';


export interface CollectionProfilesDialog_data {
  collection: CollectionComplete,
  profileGroup: Profile[],
  selectedProfiles: Profile[],
  content?: string
}
@Component({
  selector: 'app-select-collection-profiles-dialog',
  templateUrl: './select-collection-profiles-dialog.component.html',
  styleUrls: ['./select-collection-profiles-dialog.component.css']
})
export class SelectCollectionProfilesDialogComponent implements OnInit {

  collection: CollectionComplete;
  profileGroup: Profile[];
  selectedProfiles: string[];
  header:string;
  content:string;
  packablesString: string;
  wRules: WeatherRule;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CollectionProfilesDialog_data,
    public dialogRef: MatDialogRef<SelectCollectionProfilesDialogComponent>,
    public weatherFac: weatherFactory
  ) {
    this.collection = data.collection;
    this.profileGroup = data.profileGroup.slice()
    this.selectedProfiles = data.selectedProfiles.map(p=>p.id)
    this.header = this.collection.name
    this.content = data.content || '<b>Who should pack this collection?</b>'
    this.packablesString = this.collection.packables.map(p=>p.name).join(', ')
    this.wRules = this.collection.weatherRules
  }

  ngOnInit() {
  }
  onConfirm(){
    this.onClose(this.profileGroup.filter(p=>this.selectedProfiles.includes(p.id)))
  }
  onClose(profiles?:Profile[]){
    this.dialogRef.close(profiles)
  }
}
