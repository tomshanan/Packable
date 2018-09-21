import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/memory.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers'
import { Trip, displayTrip } from '../shared/models/trip.model';
import { Observable ,  Subscription } from 'rxjs';
import { StoreSelectorService } from '../shared/store-selector.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css']
})
export class TripsComponent implements OnInit {

  state_subscription: Subscription;
  trips_obs: Observable<{trips:Trip[]}>;
  trips: displayTrip[];
  constructor(
    private modalService:NgbModal, 
    private router:Router, 
    private activeRoute:ActivatedRoute,
    private memoryService: MemoryService,
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>
  ) { }

  ngOnInit() {
    this.trips_obs = this.store.select('trips');
    this.state_subscription = this.trips_obs.subscribe((tripState)=>{
      this.trips = this.storeSelector.getDisplayTrips(tripState.trips)
    })
  }

  openModal(tempRef: TemplateRef<any> ) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
  newTrip(){
    this.memoryService.resetAll();
    this.router.navigate(['new'], {relativeTo: this.activeRoute})
  }
  makeTripName(displayTrip: displayTrip, trip: Trip){
    let reverseDate = (dateString:string):string=>{ return dateString.split('-').reverse().join('')}
    return `${displayTrip.destinationName.replace(/[^A-Za-z]/g,'')}${reverseDate(trip.startDate)}-${reverseDate(trip.endDate)}`
  }
  editTrip(displayTrip: displayTrip){
    let trip = this.storeSelector.getTripById(displayTrip.id)
    let TripName = this.makeTripName(displayTrip,trip)
    this.memoryService.set('TRIP',trip);
    this.router.navigate([TripName], {relativeTo: this.activeRoute})
  }
  viewPackingList(displayTrip: displayTrip){
    let trip = this.storeSelector.getTripById(displayTrip.id)
    let TripName = this.makeTripName(displayTrip,trip)
    this.memoryService.set('TRIP',trip);
    this.router.navigate([TripName,'packing-list'], {relativeTo: this.activeRoute})
  }
}
