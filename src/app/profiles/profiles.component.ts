import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers';
import { Profile, ProfileComplete } from '../shared/models/profile.model';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/services/memory.service';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';
import { slugName, isDefined } from '../shared/global-functions';
import { ProfileFactory } from '../shared/factories/profile.factory';
import { StorageService } from '../shared/storage/storage.service';
import { take } from 'rxjs/operators';
import { WindowService } from '../shared/services/window.service';
import { ContextService } from '../shared/services/context.service';
import { CollectionComplete } from '../shared/models/collection.model';
import { EditProfileDialogComponent } from './edit-profile-dialog/edit-profile-dialog.component';
import { MatDialog } from '@angular/material';
import { blockInitialAnimations } from '../shared/animations';
import { CollectionFactory } from '../shared/factories/collection.factory';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css'],
  animations: [blockInitialAnimations]
})
export class ProfilesComponent implements OnInit, OnDestroy {

  profilesState_obs: Observable<{ profiles: Profile[] }>;
  subs: Subscription;
  profiles: Profile[] = []
  selectedProfileId: string;
  selectedProfile: Profile;
  completeProfile: ProfileComplete;
  profileCollections: CollectionComplete[];

  
  constructor(
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    private storage:StorageService,

    private modalService: NgbModal,
    private profileFactory: ProfileFactory,
    private colFac: CollectionFactory,
    public windowService: WindowService,
    private context: ContextService,
    public dialog: MatDialog,

  ) { }
  dialogSettings = {
    width: "500px",
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  ngOnInit() {
    this.context.reset();
    this.subs = this.storeSelector.profiles_obs.subscribe(state => {
      // update list of profiles if Profile State
      console.log('profile state emitted', state);
      this.profiles = state.profiles
      this.setProfileAndCollections()

      // console.log('complete profiles to display:',this.completeProfiles)
      // if(this.selectedProfileId != null && this.profiles.idIndex(this.selectedProfileId) === -1){
      //   this.context.reset();
      //   this.selectedProfileId = null;
      // } else {
      //   this.setProfileAndCollections()
      // }
    })
    // this.subs.add(this.context.changes.subscribe(()=>{
    //   if(this.context.profileId){
    //     this.setProfileAndCollections()
    //   }
    // }))
  }
  onSelectedProfiles() { // when profile selector emits a new profile
    this.context.setBoth(null, this.selectedProfileId)
    this.setProfileAndCollections()
  }
  setProfileAndCollections() { 
    // set components loaded profile
    this.selectedProfile = this.context.getProfile();
    this.selectedProfileId = this.context.profileId
    console.log("PROFILES: selected profile contexts:",this.selectedProfile, this.selectedProfileId)
    if(!isDefined(this.selectedProfile)){
      this.context.reset();
      this.profileCollections = []
    } else{
      this.completeProfile = this.profileFactory.makeComplete([this.selectedProfile])[0]
      this.profileCollections = this.completeProfile.collections
    } 
  }
  ngOnDestroy() {
    this.subs.unsubscribe()
  }
  openModal(tempRef: TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

  editProfile() {
    this.context.setBoth(null, this.selectedProfileId)
    let data = {
      profile: this.selectedProfile
    }
    let editProfileDialog = this.dialog.open(EditProfileDialogComponent, {
      ...this.dialogSettings,
      data: data
    })
    // editProfileDialog.afterClosed().pipe(take(1)).subscribe((profile:Profile)=>{
    //   if(isDefined(profile)){

    //   }
    // })
  }
}
