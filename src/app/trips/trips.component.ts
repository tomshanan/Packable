import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/services/memory.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers'
import { Trip, displayTrip } from '../shared/models/trip.model';
import { Observable ,  Subscription } from 'rxjs';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { TripMemoryService } from '../shared/services/trip-memory.service';
import { State as tripState } from './store/trip.reducers';
import { sortByMostRecent } from '@app/shared/global-functions';
import * as tripActions from './store/trip.actions';
import { evaporateTransitionTrigger } from '../shared/animations';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css'],
  animations: [evaporateTransitionTrigger]
})
export class TripsComponent implements OnInit, OnDestroy {

  state_subscription: Subscription;
  trips_obs: Observable<tripState>;
  trips: displayTrip[] = []
  incomplete: displayTrip[] = []
  newTrip:Trip;

  constructor(
    private modalService:NgbModal, 
    private router:Router, 
    private activeRoute:ActivatedRoute,
    private tripMemory:TripMemoryService,
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>
  ) { }

  ngOnInit() {
    this.trips_obs = this.store.select('trips');
    this.state_subscription = this.trips_obs.subscribe((tripState)=>{
      this.trips.compare(this.storeSelector.getDisplayTrips(tripState.trips))
      this.incomplete.compare(this.storeSelector.getDisplayTrips(tripState.incomplete))
      this.incomplete.sort(sortByMostRecent)
      console.log(this.incomplete)
    })
  }
  ngOnDestroy(){
    this.state_subscription.unsubscribe()
  }
  onTripChange(trip:Trip){
    this.newTrip = trip;
  }
  openModal(tempRef: TemplateRef<any> ) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
  confirmNewTrip(){
    this.tripMemory.saveTempTrip(this.newTrip)
    this.router.navigate(['new'], {relativeTo: this.activeRoute})
  }
  continueIncomplete(id:string){
    let incTrip = this.storeSelector.getIncompleteTripById(id)
    this.tripMemory.saveTempTrip(incTrip)
    this.router.navigate(['new'], {relativeTo: this.activeRoute})
  }
  removeIncomplete(trip:displayTrip){
    this.incomplete.removeElements([trip])
    this.store.dispatch(new tripActions.removeIncomplete([trip.id]))
  }
  loadPackingList(tripId:string){
    const trip = this.storeSelector.getTripById(tripId)
    this.tripMemory.setTrip(trip)
    this.router.navigate(['packing-list'], {relativeTo: this.activeRoute})
  }
  // makeTripName(displayTrip: displayTrip, trip: Trip){
  //   let reverseDate = (dateString:string):string=>{ return dateString.split('-').reverse().join('')}
  //   return `${displayTrip.destinationName.replace(/[^A-Za-z]/g,'')}${reverseDate(trip.startDate)}-${reverseDate(trip.endDate)}`
  // }
  // editTrip(displayTrip: displayTrip){
  //   let trip = this.storeSelector.getTripById(displayTrip.id)
  //   let TripName = this.makeTripName(displayTrip,trip)
  //   this.memoryService.set('TRIP',trip);
  //   this.router.navigate([TripName], {relativeTo: this.activeRoute})
  // }
  // viewPackingList(displayTrip: displayTrip){
  //   let trip = this.storeSelector.getTripById(displayTrip.id)
  //   let TripName = this.makeTripName(displayTrip,trip)
  //   this.memoryService.set('TRIP',trip);
  //   this.router.navigate([TripName,'packing-list'], {relativeTo: this.activeRoute})
  // }
}
