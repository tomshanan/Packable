import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PackingListService } from '../packing-list.service';
import { Store } from '@ngrx/store';
import { appState } from '../../../shared/app.reducers';
import { State as userState } from '@app/user/store/userState.model'
import { PackingListSettings, pass, PackingList } from '../../../shared/models/packing-list.model';
import * as userActions from '../../../user/store/user.actions';
import { Subscription } from 'rxjs';
import { MatDialog, MatSliderChange, MatSlideToggleChange } from '@angular/material';
import { tripWeatherDialog_data, WeatherSettingsDialogComponent } from '../weather-settings-dialog/weather-settings-dialog.component';
import { take } from 'rxjs/operators';
import { TripWeatherData } from '../../../shared/services/weather.service';
import { Trip, DisplayTrip } from '../../../shared/models/trip.model';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared-comps/dialogs/confirm-dialog/confirm.dialog';
import * as tripActions from '../../store/trip.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { PrintOptions } from '../print/print.component';
import { isDefined, timeStamp } from '../../../shared/global-functions';
import { printDialog_data, PrintSettingsDialogComponent } from './print-settings-dialog/print-settings-dialog.component';
import { importCollections_result } from '@app/collections/collection-list/import-collection-dialog/import-collection-dialog.component';
import { ImportCollectionDialogComponent, importCollections_data } from '../../../collections/collection-list/import-collection-dialog/import-collection-dialog.component';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';

@Component({
  selector: 'packinglist-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  settings: PackingListSettings = new PackingListSettings()
  settings_sub: Subscription = new Subscription();

  @Input() trip: Trip;
  @Input() displayTrip:DisplayTrip;
  @Input() packingList:PackingList;

  constructor(
    private packingListService: PackingListService,
    private store: Store<appState>,
    private storeSelector: StoreSelectorService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.settings = this.packingListService.packingListSettings || new PackingListSettings();
    this.settings_sub.add(
      this.packingListService.settingsEmitter.subscribe(settings => {
      console.log('PackingListSettings received:', settings)
      this.settings = settings;
      })
    )
  }
  ngOnDestroy() {
    this.settings_sub && this.settings_sub.unsubscribe()
  }

  toggleSettings(setting: keyof PackingListSettings) {
    this.settings[setting] = !this.settings[setting]
    this.packingListService.storeSettings(this.settings)
    if (setting === 'showInvalid') {
      //this.packingListService.refreshPackingList()
    }
  }
  anySettingToggled():boolean{
    return this.settings.showCalculations || this.settings.showInvalid || this.settings.showWarnings
  }
  editWeather() {
    let data: tripWeatherDialog_data = {
      destinationName: 'whatever',
      weatherData: this.packingListService.tripWeather,
      packingListService: this.packingListService,
    }
    let editWeatherDialog = this.dialog.open(WeatherSettingsDialogComponent, {
      width: '500px',
      maxWidth: '99vw',
      maxHeight: '99vh',
      autoFocus: false,
      data: data
    })
    editWeatherDialog.afterClosed().pipe(take(1)).subscribe((weatherData: TripWeatherData) => {
      if (isDefined(weatherData)) {
        this.packingListService.updatePackingListBySetting(weatherData.dataInput, { weatherData: weatherData, save: true })
      }
    })
  }
  checkAll(bool:boolean = true) {
    let packinglist = this.packingListService.packingList
    let stamp = timeStamp()
    packinglist.packables.forEach(p => {
      if (pass(p)) {
        p.checked = bool;
        p.dateModified = stamp;
      }
    })
    this.packingListService.onUpdateList(packinglist)
  }

  resetList() {
    let data: ConfirmDialogData = {
      header: 'Reset List? ',
      content: '<p>Resetting the packing list will recalculate your packing list.</p><p>All Packables will be unchecked, and any manually added packables will be deleted.</p><p><b>Are you sure you want to continue?</b></p>',
      activeColor:'danger',
    }
    let confirmDialog = this.dialog.open(ConfirmDialog, {
      data: data
    })
    confirmDialog.afterClosed().pipe(take(1)).subscribe((confirm: boolean) => {
      if (confirm) {
        this.packingListService.setPackingList(null)
        this.packingListService.updatePackingListBySetting('auto', { save: true })
      }
    })
  }
  deleteTrip() {
    let data: ConfirmDialogData = {
      header: 'Delete this Trip? ',
      content: `You will lose all the changes you made to this Packing List. Changes to your Pakcable's quantity rules will not be affected.`,
      activeColor: 'danger',
    }
    let confirmDialog = this.dialog.open(ConfirmDialog, {
      data: data
    })
    confirmDialog.afterClosed().pipe(take(1)).subscribe((confirm: boolean) => {
      if (confirm) {
        this.store.dispatch(new tripActions.removeTrips([this.trip.id]))
      }
    })
  }
  
  print() {
    let printOptions = new PrintOptions({cleanCheckboxes:true})
    let data: printDialog_data = {
      destinationName: this.packingListService.displayTrip.destinationName,
      printSettings:printOptions,
    }
    let confirmDialog = this.dialog.open(PrintSettingsDialogComponent, {
      data: data
    })
    confirmDialog.afterClosed().pipe(take(1)).subscribe((settings:PrintOptions) => {
      console.log('Print Settings:',settings);
      if (settings) {
        this.router.navigate(
          [{outlets: { print: ['print', this.trip.id]}}],
          { queryParams: settings })
      }
    })
  }

  selectCollections(){
    this.router.navigate(['trips','edit',this.trip.id,'collections'])
  }
  selectTravelers(){
    this.router.navigate(['trips','edit',this.trip.id,'travelers'])
  }
  changeDestinationDates(){
    this.router.navigate(['trips','edit',this.trip.id,'destination'])
  }

}
