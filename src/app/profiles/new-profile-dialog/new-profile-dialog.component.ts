import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as profileActions from '@app/profiles/store/profile.actions'
import * as fromApp from '@shared/app.reducers';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile } from '../../shared/models/profile.model';
import { transitionTrigger } from '../../shared/animations';
import { ProfileEditFormComponent } from '../profile-edit-form/profile-edit-form.component';
import { CollectionComplete } from '@app/shared/models/collection.model';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { Subscription } from 'rxjs';
import { ColorGeneratorService } from '../../shared/services/color-gen.service';

type profileCreationMethod = 'template' | 'copy' | 'new'
@Component({
  selector: 'app-new-profile-dialog',
  templateUrl: './new-profile-dialog.component.html',
  styleUrls: ['../../shared/css/dialog.css','./new-profile-dialog.component.css'],
  animations: [transitionTrigger]
})
export class NewProfileDialogComponent implements OnInit, OnDestroy {
  subscriptions: Subscription;
  step: number = 1;
  method: profileCreationMethod;
  profile = new Profile();
  @ViewChild('profileForm') profileForm: ProfileEditFormComponent;
  profileFormValid: boolean;
  searchString = '';
  collections: CollectionComplete[];
  selectedCollections: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {},
    public dialogRef: MatDialogRef<NewProfileDialogComponent>,
    private store: Store<fromApp.appState>,
    private proFac:ProfileFactory,
    private colFac: CollectionFactory,
    private storeSelector: StoreSelectorService,
    private colorGen: ColorGeneratorService,
  ) { }

  ngOnInit() {
    this.collections = this.colFac.getOriginalsFromStoreAndMakeComplete()
    // ADD REST FROM REMOTE DATABASE
    
  }
  ngOnDestroy(){
  }
  backStep(){
    this.step--
  }
  profileEditFormValidation(e:boolean){
    this.profileFormValid = e;
    console.log(`profile edit form validation = ${e}`)
  }
  stepHeading():string{
    switch(this.step){
      case 1: return 'New Traveler'; break;
      case 2: 
      case 3:
      return '';
    }
  }

// step  1: 
// check validity of profile
// set method
//this.step++
  onChooseMethod(method:profileCreationMethod){
    this.method = method;
    this.profile.avatar.color = this.colorGen.getUnused()
    if(this.profileForm.valid){
      this.step++
    }
  }

/* step 2: 
  get collections and apply to this.profile
  this.step++
*/
onChooseProfile(profile: Profile){
let collections = profile.collections
let completeCollections = this.colFac.makeCompleteArray(collections)
this.onChooseCollections(completeCollections)
}
onChooseCollections(collections:CollectionComplete[]){

}

  onClose(profile: Profile = null){
    /*step 3: 
    set selected collections to essential in this.profile 
    save profile in store
    close modal
  */
    this.dialogRef.close(profile)
  }
}
