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
import { EditPackableDialogComponent } from '@app/packables/packable-list/edit-packable-dialog/edit-packable-dialog.component';
import { ConfirmDialog } from './shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { ChooseProfileDialogComponent } from './collections/collection-list/collection-panel/choose-profile-dialog/choose-profile-dialog.component';
import { PushPackablesDialogComponent } from './packables/packable-list/push-packables-dialog/push-packables-dialog.component';
import { ImportPackablesDialogComponent } from './packables/packable-list/import-packables-dialog/import-packables-dialog.component';
import { NewCollectionDialogComponent } from './collections/collection-list/new-collection-dialog/new-collection-dialog.component';
import { EditProfileDialogComponent } from './profiles/edit-profile-dialog/edit-profile-dialog.component';



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
    EffectsModule.forRoot([AuthEffects, CollectionEffects, ProfileEffects, PackableEffects, TripEffects])
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalComponent,
    EditPackableDialogComponent,
    ConfirmDialog,
    ChooseProfileDialogComponent,
    PushPackablesDialogComponent,
    ChooseProfileDialogComponent,
    ImportPackablesDialogComponent,
    EditProfileDialogComponent,
    NewCollectionDialogComponent
  ]

})
export class AppModule { }
