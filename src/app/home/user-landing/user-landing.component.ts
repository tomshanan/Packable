import { Component, OnInit } from '@angular/core';
import { Trip } from '../../shared/models/trip.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TripMemoryService } from '../../shared/services/trip-memory.service';
import { StoreSelectorService } from '../../shared/services/store-selector.service';

@Component({
  selector: 'user-landing',
  templateUrl: './user-landing.component.html',
  styleUrls: ['./user-landing.component.css']
})
export class UserLandingComponent implements OnInit {
  newTrip:Trip;

  constructor(
    private router:Router, 
    private tripMemory:TripMemoryService,
    private activeRoute:ActivatedRoute,
    private storeSelector:StoreSelectorService
  ) { }

  ngOnInit() {
  }
  onTripChange(trip:Trip){
    this.newTrip = trip;
  }
  confirmNewTrip(){
    this.tripMemory.saveTempTrip(this.newTrip)
    this.router.navigate(['trips','new'])
  }
}
