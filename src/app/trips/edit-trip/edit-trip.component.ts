import { Component, OnInit, OnDestroy } from '@angular/core';
import { Trip, DisplayTrip } from '../../shared/models/trip.model';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { StorageService } from '../../shared/storage/storage.service';
import { DestinationDataService } from '../../shared/services/location-data.service';
import { WeatherService, TripWeatherData } from '../../shared/services/weather.service';
import { TripFactory } from '../../shared/factories/trip.factory';
import { WindowService } from '../../shared/services/window.service';
import { Observable, from, Subscription } from 'rxjs';
import { destMetaData } from '../../shared/library/library.model';
import { filter, map, take, first } from 'rxjs/operators';
import { Location } from '@angular/common';
import { TripMemoryService } from '../../shared/services/trip-memory.service';
import { isDefined } from '@app/shared/global-functions';
import { Icon } from '@app/shared-comps/stepper/stepper.component';

@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['./edit-trip.component.css']
})
export class EditTripComponent implements OnInit,OnDestroy {
  destWeatherData$: Observable<TripWeatherData>;
  destMetaData$: Observable<destMetaData>;
  displayTrip: DisplayTrip;
  sub:Subscription;

  tripLinks=[
    {path:'destination',text:'Place and Dates',svgIcon:'place-edit'},
    {path:'travelers',text:'Travelers',svgIcon:'together'},
    {path:'collections',text:'Collections',svgIcon:'collection-alt'},
  ]
  packingIcon:Icon = { icon: { type: 'svg', name: 'minimalist' }, text: 'Pack' }

  
  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private _location:Location,
    private storeSelector: StoreSelectorService,
    private storageService: StorageService,
    private destService: DestinationDataService,
    private weatherService: WeatherService,
    private tripFac:TripFactory,
    private tripService: TripMemoryService,
    public windowService: WindowService,
    ) { }

  ngOnInit() {
    this.storageService.getLibrary()
    let id = this.route.snapshot.paramMap.get('id')
    if(!isDefined(id)){
      console.warn('trip id was not set')
      this._location.back()
    }
    this.tripService.setTripById(id)
    this.sub = this.tripService.tripEmitter.pipe(first(trip=>isDefined(trip))).subscribe(trip=>{
      this.displayTrip = this.tripService.displayTrip
    })
  }
  ngOnDestroy(){
    this.sub && this.sub.unsubscribe();
  }
  goToPackinglist(){
    this.router.navigate(['trips/packing-list',this.displayTrip.id])
  }
}
