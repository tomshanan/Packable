import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { PackingList, PackingListPackable, PackingListSettings, DisplayPackingList, pass } from '../../shared/models/packing-list.model';
import { Trip, DisplayTrip } from '../../shared/models/trip.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { DestinationDataService } from '../../shared/services/location-data.service';
import { WindowService } from '../../shared/services/window.service';
import { navParams } from '../../shared-comps/mobile-nav/mobile-nav.component';
import { TripWeatherData } from '../../shared/services/weather.service';
import { weatherOptions, tempOptions, absoluteMax, absoluteMin } from '../../shared/models/weather.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListPackableComponent } from './list-packable/list-packable.component';
import { PackingListService} from './packing-list.service';
import { Icon } from '../../shared-comps/stepper/stepper.component';
import { TripFactory } from '../../shared/factories/trip.factory';
import { PrintOptions } from './print/print.component';
import { printDialog_data, PrintSettingsDialogComponent } from './settings/print-settings-dialog/print-settings-dialog.component';
import { take, defaultIfEmpty } from 'rxjs/operators';
import { MatDialog, MatExpansionPanel } from '@angular/material';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packing-list.component.css'],
  providers: [PackingListService]
})
export class PackingListComponent implements OnInit, OnDestroy {
  state_subscription: Subscription = new Subscription();
  saveTimeout = setTimeout(() => { }, 0);
  loading$:Observable<boolean>;
  navParams: navParams; // for template
  menuIcon:Icon = {icon:{type:'mat',name:'settings'},text:'Options'}
  editingPackable: ListPackableComponent; // for list-collection-component
  panelsOpen: {[id:string]:boolean} = {};

  forecastString:string = 'Loading Weather';
  customWeatherForm: FormGroup; 
  trip: Trip;
  displayTrip:DisplayTrip;
  packingList: PackingList;
  sortedList: DisplayPackingList[] = [];
  packingListSettings: PackingListSettings;
  @ViewChild('settingsComp') settingsComp:SettingsComponent;

  constructor(
    private router: Router,
    private tripFac: TripFactory,
    private destService: DestinationDataService,
    public windowService: WindowService, // used by template
    private fb: FormBuilder,
    private dialog:MatDialog,
    private packingListService: PackingListService,
  ) {
    /*
      MOVE CUSTOM WEATHER FORM TO COMPONENT 
    */
    this.customWeatherForm = this.fb.group({
      min: [null],
      max: [null],
      types: [[]]
    })

  }

  ngOnInit() {
    // if(!this.packingList && this.packingListService.packingList){
    //   this.updateView(this.packingListService.packingList)
    // }
    this.packingListSettings = this.packingListService.packingListSettings
    console.log('loaded list with settings:',this.packingListSettings)
    this.loading$ = this.packingListService.loadingEmit.pipe(defaultIfEmpty(true))
    this.state_subscription.add(this.packingListService.serviceSubscription)
    this.state_subscription.add(
      this.packingListService.packingListEmitter.subscribe(newPackinglist => {
        console.log(`PackingListComponent received newPackinglist`,newPackinglist)
        if (newPackinglist) {
          this.updateView(newPackinglist)
        } else {
          this.packingList = null;
        }
      })
    )
    this.state_subscription.add(
      this.packingListService.settingsEmitter.subscribe(settings=>{
        this.packingListSettings = new PackingListSettings(settings)
      })
    )
    
  }

  updateView(newPackinglist: PackingList) {
    this.packingList = newPackinglist
    this.trip = this.packingListService.trip
    this.displayTrip = this.packingListService.displayTrip
    this.forecastString = newPackinglist.data.weatherData.forecastString()
    if (!this.sortedList) {
      this.sortedList = this.tripFac.createDisplayPackingList(this.packingList.packables)
    } else {
      this.tripFac.createDisplayPackingList(this.packingList.packables, this.sortedList)
    }
  }



  // -- bulk actions 

  tickAllProfile(profile:DisplayPackingList){
    this.packingListService.delayedSave()
    this.modifyPackablesForProfile(profile,(packable)=>{
      packable.checked = true
  })
  }
  resetAllProfile(profile:DisplayPackingList){
    this.modifyPackablesForProfile(profile,(packable)=>{
        packable.forceQuantity = false
        packable.forcePass = false
        packable.checked = false
        packable.forceRemove = false
    })
    this.packingListService.generateAndStorePackingList()
  }
  modifyPackablesForProfile(profile:DisplayPackingList,changePackable:(p:PackingListPackable)=>void){
    let savePackables:PackingListPackable[] = []
    profile.collections.forEach(c=>{
      c.packables.forEach(p => {
        changePackable(p)
        savePackables.push(p)
      });
    })
    this.packingListService.onUpdatePackables(savePackables,true)
  }


  // ---- PACKABLE ACTIONS

  onUpdatePackable(newPackable: PackingListPackable) {
    this.packingListService.onUpdatePackables([newPackable])
  }


  // -- checklist tests

  countCompletedInProfile(profile: DisplayPackingList): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.packables.reduce((subtotal, packable) => {
        return (packable.checked && pass(packable)) ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }

  countPackablesInProfile(profile: DisplayPackingList): number {
    return profile.collections.reduce((total, col, i, arr) => {
      return total + col.validPackables()
    }, 0);
  }
  isProfileChecked(profile: DisplayPackingList): boolean {
    return this.countPackablesInProfile(profile) === this.countCompletedInProfile(profile)
  }

  ngOnDestroy() {
    this.state_subscription && this.state_subscription.unsubscribe();
  }

  return() {
    this.router.navigate(['/trips'])
  }
}
