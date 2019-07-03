import { Component, OnInit } from '@angular/core';
import { Trip } from '../../../shared/models/trip.model';
import { TripFactory } from '../../../shared/factories/trip.factory';
import { WindowService } from '../../../shared/services/window.service';
import { TripMemoryService } from '../../../shared/services/trip-memory.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-trip-profiles',
  templateUrl: './edit-trip-profiles.component.html',
  styleUrls: ['./edit-trip-profiles.component.css']
})
export class EditTripProfilesComponent implements OnInit {
  trip: Trip;
  isValid: boolean = false;
  touched:boolean = false;
  collectionsNeedUpdate: boolean = false;

  constructor(
    private tripFac: TripFactory,
    private tripService: TripMemoryService,
    public windowService: WindowService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.trip = this.tripService.tripEmitter.value
    this.validate()
  }
  setSelectedProfiles(ids: string[]) {
    this.trip.profiles = ids;
    this.touched = true
    this.validate()
  }
  validate(){
    this.isValid = this.tripFac.validateTripProperties(this.trip, ['profiles'])
    this.collectionsNeedUpdate = !this.tripFac.validateTripProperties(this.trip, ['collections'])
  }
  onConfirm() {
    if (this.isValid) {
      this.trip.collections.forEach(c => {
        c.profiles = c.profiles.filter(pId => this.trip.profiles.includes(pId))
      })
      if (this.collectionsNeedUpdate) {
        this.tripService.setTrip(this.trip)
        this.router.navigate(['../collections'], { relativeTo: this.route })
      } else {
        this.tripService.saveTrip(this.trip)
        this.touched = false
      }
    }
  }
}
