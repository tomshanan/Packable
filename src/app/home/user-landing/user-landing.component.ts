import { Component, OnInit } from '@angular/core';
import { Trip } from '../../shared/models/trip.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TripMemoryService } from '../../shared/services/trip-memory.service';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile } from '../../shared/models/profile.model';
import { Observable } from 'rxjs';
import { map, first, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { NewProfileDialogComponent } from '../../profiles/new-profile-dialog/new-profile-dialog.component';
import { isDefined } from '../../shared/global-functions';
import { SelectedList } from '../../shared/services/selected-list';

@Component({
  selector: 'user-landing',
  templateUrl: './user-landing.component.html',
  styleUrls: ['./user-landing.component.css']
})
export class UserLandingComponent implements OnInit {
  newTrip:Trip;
  travelers$:Observable<Profile[]>;
  constructor(
    private router:Router, 
    private tripMemory:TripMemoryService,
    private activeRoute:ActivatedRoute,
    private storeSelector:StoreSelectorService,
    private dialog:MatDialog,

  ) { }

  ngOnInit() {
    this.travelers$ = this.storeSelector.profiles$.pipe(map(state=>state.profiles))
  }
  onTripChange(trip:Trip){
    this.newTrip = trip;
  }
  confirmNewTrip(){
    this.tripMemory.saveTempTrip(this.newTrip)
    this.router.navigate(['trips','new'])
  }
  newProfile(){
    let newProfileDialog = this.dialog.open(NewProfileDialogComponent, {
      disableClose: true,
    })
  }
}
