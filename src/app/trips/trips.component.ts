import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/services/memory.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../shared/app.reducers'
import { Trip, DisplayTrip } from '../shared/models/trip.model';
import { Observable ,  Subscription } from 'rxjs';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { TripMemoryService } from '../shared/services/trip-memory.service';
import { State as tripState } from './store/trip.reducers';
import { sortByMostRecent } from '@app/shared/global-functions';
import * as tripActions from './store/trip.actions';
import { evaporateTransitionTrigger } from '../shared/animations';
import { TripFactory } from '../shared/factories/trip.factory';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css'],
  animations: [evaporateTransitionTrigger]
})
export class TripsComponent implements OnInit, OnDestroy {

  state_subscription: Subscription;
  trips$: Observable<tripState>;
  trips: DisplayTrip[] = []
  incomplete: DisplayTrip[] = []
  loadingTrips:boolean = false;
  constructor(
    private modalService:NgbModal, 
    private activeRoute:ActivatedRoute,
    private router:Router, 
    private tripMemory:TripMemoryService,
    private storeSelector: StoreSelectorService,
    private store: Store<fromApp.appState>,
    private tripFac:TripFactory,
  ) { }

  ngOnInit() {
    this.trips$ = this.store.select('trips');
    this.state_subscription = this.trips$.subscribe((tripState)=>{
      this.loadingTrips = true
      this.tripFac.getDisplayTrips(tripState.trips.ids()).then(trips=>{
        this.setTrips(trips)
        this.loadingTrips = false
      }).catch(e=>{
        console.warn(e)
        this.loadingTrips = false
      })
      
      let incompleteDisplay =tripState.incomplete.map(trip => this.tripFac.makeDisplayTrip(trip))
      this.incomplete.compare(incompleteDisplay)
      this.incomplete.sort(sortByMostRecent)
      console.log(this.incomplete)
    })
  }
  setTrips(trips:DisplayTrip[]){
    this.trips.compare(trips)
    this.trips.sort((a,b)=>{
      return a.firstDate < b.firstDate ? -1 : 1;
    })
  }
  ngOnDestroy(){
    this.state_subscription.unsubscribe()
  }
  openModal(tempRef: TemplateRef<any> ) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
  continueIncomplete(id:string){
    let incTrip = this.storeSelector.getIncompleteTripById(id)
    this.tripMemory.saveTempTrip(incTrip)
    this.router.navigate(['new'], {relativeTo: this.activeRoute})
  }
  removeIncomplete(trip:DisplayTrip){
    this.incomplete.removeElements([trip])
    this.store.dispatch(new tripActions.removeIncomplete([trip.id]))
  }
  deleteTrip(trip:DisplayTrip){
    this.trips.removeElements([trip])
    this.store.dispatch(new tripActions.removeTrips([trip.id]))
  }
  newTrip(){
    this.tripMemory.clear()
    this.router.navigate(['trips','new'])
  }
  editTrip(id:string){
    this.tripMemory.clear()
    this.router.navigate(['trips','edit',id])
  }
  loadPackingList(tripId:string){
    this.tripMemory.clear()
    this.router.navigate(['packing-list',tripId],{relativeTo: this.activeRoute})
  }
}
