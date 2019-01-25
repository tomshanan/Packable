import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers';
import { Profile, ProfileComplete } from '../shared/models/profile.model';
import { Observable ,  Subscription } from 'rxjs';
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

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit,OnDestroy {

  profilesState_obs: Observable<{profiles: Profile[]}>;
  stateSubscriptions: Subscription;
  completeProfiles: ProfileComplete[];
  profiles:Profile[];
  selectedProfileId: string;
  selectedProfile: Profile;
  profileCollections: CollectionComplete[];

  onSelectedProfiles(){
    this.cotnext.setBoth(null,this.selectedProfileId)
  }
  constructor(
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    private modalService: NgbModal,
    private profileFactory: ProfileFactory,
    private windowService: WindowService,
    private cotnext:ContextService,
    public dialog: MatDialog,

  ) { }
  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  ngOnInit() {
    this.stateSubscriptions = this.storeSelector.profiles_obs.subscribe(state =>{
      console.log('profile state emitted',state);
      this.profiles = state.profiles;
      this.completeProfiles = this.profileFactory.getCompleteProfiles(state.profiles);
      this.selectedProfile=this.cotnext.getProfile()
    })
    this.stateSubscriptions.add(
      this.cotnext.changes.subscribe(changes => {
        this.selectedProfile=this.cotnext.getProfile()
      })
    )

    this.cotnext.reset();
    if(isDefined(this.selectedProfileId)){
      this.cotnext.setBoth(null,this.selectedProfileId)
    }
  }
 
  ngOnDestroy(){
    this.stateSubscriptions.unsubscribe()
  }
  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

  editProfile(){
    let data = {
      profile: this.selectedProfile
    }
    let editProfileDialog = this.dialog.open(EditProfileDialogComponent, {
      ...this.dialogSettings,
      data:data
    })
    // editProfileDialog.afterClosed().pipe(take(1)).subscribe((profile:Profile)=>{
    //   if(isDefined(profile)){

    //   }
    // })
  }
}
