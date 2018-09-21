import { Component, OnInit, TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers';
import { Profile, ProfileComplete } from '../shared/models/profile.model';
import { Observable ,  Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/memory.service';
import { StoreSelectorService } from '../shared/store-selector.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { slugName } from '../shared/global-functions';
import { ProfileFactory } from '../shared/factories/profile.factory';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  profilesState_obs: Observable<{profiles: Profile[]}>;
  profilesState_sub: Subscription;
  profiles: ProfileComplete[];
  originalProfiles:Profile[];

  constructor(
    private store: Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService: MemoryService,
    private selectorService: StoreSelectorService,
    private modalService: NgbModal,
    private profileFactory: ProfileFactory
  ) { }

  ngOnInit() {
    this.profilesState_obs = this.store.select('profiles');
    this.profilesState_sub = this.profilesState_obs.subscribe(state =>{
      this.profiles = this.profileFactory.getCompleteProfiles(state.profiles);
      this.originalProfiles = state.profiles;
    })
  }
  editProfile(profile:ProfileComplete){
    this.memoryService.resetAll();
    this.memoryService.set('PROFILE',this.originalProfiles.find(p=>p.id == profile.id));
    this.router.navigate([slugName(profile.name)],{relativeTo:this.activatedRoute})
  }

  createNewProfile(){
    this.memoryService.resetAll();
    this.router.navigate(['new'],{relativeTo:this.activatedRoute})
  }
  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

}
