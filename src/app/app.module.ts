import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './core/app-routing.module';
import { SharedModule } from './core/shared.module';
import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { ModalComponent } from './shared-comps/modal/modal.component';

import { reducers } from './shared/app.reducers';
import { AuthEffects } from './user/store/auth.effects';
import { CollectionEffects } from './collections/store/collection.effects';
import { ProfileEffects } from './profiles/store/profile.effects';
import { PackableEffects } from './packables/store/packable.effects';
import { TripEffects } from './trips/store/trip.effects';



@NgModule({
  declarations: [
    AppComponent,
      ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([AuthEffects, CollectionEffects, ProfileEffects,PackableEffects,TripEffects])
  ],
  bootstrap: [AppComponent],
  entryComponents: [ModalComponent]
})
export class AppModule { }
