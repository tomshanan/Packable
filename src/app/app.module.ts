import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { AppMaterialModule } from './material-form.module';
import { reducers } from './shared/app.reducers';

import { DropDownDirective } from './shared/directives/drop-down.directive';
import { InnerLinkDirective } from './shared/directives/inner-link.directive';
import { joinPipe } from './shared/pipes/join.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { TripsComponent } from './trips/trips.component';
import { PackablesComponent } from './packables/packables.component';
import { PackableEditComponent } from './packables/packable-edit/packable-edit.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionEditComponent } from './collections/collection-edit/collection-edit.component';
import { ItemSelectorComponent } from './shared/item-selector/item-selector.component';
import { ProfileEditComponent } from './profiles/profile-edit/profile-edit.component';
import { ListEditorService } from './shared/list-editor.service';
import { MemoryService } from './shared/memory.service';
import { StoreSelectorService } from './shared/store-selector.service';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';
import { DesktopNavComponent } from './desktop-nav/desktop-nav.component';
import { ModalComponent } from './modal/modal.component';
import { NavListComponent } from './nav/nav-list/nav-list.component';
import { EditTripComponent } from './trips/edit-trip/edit-trip.component';
import { DateRangeSelectorComponent } from './trips/edit-trip/date-range-selector/date-range-selector.component';
import { DestinationDataService } from './shared/location-data.service';
import { FullPlaceNamePipe } from './shared/pipes/full-place-name.pipe';
import { PackingListComponent } from './trips/packing-list/packing-list.component';
import { WindowService } from './shared/window.service';
import { WeatherService } from './shared/weather.service';
import { WeatherConditionsFormComponent } from './shared/weather-conditions-form/weather-conditions-form.component';
import { Ng5SliderModule } from 'ng5-slider';
import { CollectionFactory } from './shared/factories/collection.factory';
import { PackableFactory } from './shared/factories/packable.factory';
import { ProfileFactory } from './shared/factories/profile.factory';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { UserComponent } from './user/user.component';
import { AuthService } from './user/auth.service';
import { AuthGuard } from './user/auth-guard.service';


@NgModule({
  declarations: [
    AppComponent,
    ProfilesComponent,
    TripsComponent,
    NavComponent,
    PackablesComponent,
    DropDownDirective,
    InnerLinkDirective,
    PackableEditComponent,
    CollectionsComponent,
    CollectionEditComponent,
    ItemSelectorComponent,
    ProfileEditComponent,
    joinPipe,
    MobileNavComponent,
    DesktopNavComponent,
    ModalComponent,
    NavListComponent,
    EditTripComponent,
    DateRangeSelectorComponent,
    FullPlaceNamePipe,
    PackingListComponent,
    WeatherConditionsFormComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
      ],
  imports: [
    BrowserModule,
    Ng5SliderModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    NgbModule.forRoot(),
    StoreModule.forRoot(reducers)

  ],
  providers: [AuthService, AuthGuard,WindowService, ListEditorService,MemoryService, StoreSelectorService,CollectionFactory,PackableFactory,ProfileFactory,DestinationDataService, WeatherService],
  bootstrap: [AppComponent],
  entryComponents: [ModalComponent]
})
export class AppModule { }
