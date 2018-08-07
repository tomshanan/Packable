import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { TripsComponent } from './trips/trips.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { PackablesComponent } from './packables/packables.component';
import { PackableEditComponent } from './packables/packable-edit/packable-edit.component';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionEditComponent } from './collections/collection-edit/collection-edit.component';
import { ProfileEditComponent } from './profiles/profile-edit/profile-edit.component';
import { ItemSelectorComponent } from './shared/item-selector/item-selector.component';
import { EditTripComponent } from './trips/edit-trip/edit-trip.component';

const appRoutes:Routes = [
    {path: '', pathMatch: 'full', redirectTo: 'trips'},
    {path: 'trips', pathMatch: 'full', component:TripsComponent},
    {path: 'trips/new', pathMatch: 'full', component:EditTripComponent},
    {path: 'trips/:trip', pathMatch: 'full', component:EditTripComponent},
    {path: 'trips/:trip/profiles', pathMatch: 'full', component:ItemSelectorComponent},
    {path: 'trips/:trip/activities', pathMatch: 'full', component:ItemSelectorComponent},
    {path: 'profiles', pathMatch: 'full', component:ProfilesComponent},
    {path: 'profiles/new', pathMatch: 'full', component:ProfileEditComponent},
    {path: 'profiles/:profile', pathMatch: 'full', component:ProfileEditComponent},
    {path: 'profiles/:profile/packables', pathMatch: 'full', component:ItemSelectorComponent},
    {path: 'profiles/:profile/packables/new', pathMatch: 'full', component:PackableEditComponent},
    {path: 'profiles/:profile/packables/:packable', pathMatch: 'full', component:PackableEditComponent},
    {path: 'profiles/:profile/packables', pathMatch: 'full', 
        redirectTo: 'profiles/:profile'},
    {path: 'profiles/:profile/collections', pathMatch: 'full', component:ItemSelectorComponent},
    {path: 'profiles/:profile/collections/new', pathMatch: 'full', component:CollectionEditComponent},
    {path: 'profiles/:profile/collections/:collection', pathMatch: 'full', component:CollectionEditComponent},
    {path: 'profiles/:profile/collections/:collection/packables', pathMatch: 'full', component:ItemSelectorComponent},
    {path: 'profiles/:profile/collections/:collection/packables/new', pathMatch: 'full', component:PackableEditComponent},
    {path: 'profiles/:profile/collections/:collection/packables/:packable', pathMatch: 'full', component:PackableEditComponent},
    {path: 'profiles/**', pathMatch: 'full', component:ProfilesComponent},
    {path: 'packables', pathMatch: 'full', component:PackablesComponent},
    {path: 'packables/new', pathMatch: 'full', component:PackableEditComponent},
    {path: 'packables/:packable', pathMatch: 'full', component:PackableEditComponent},
    {path: 'collections', pathMatch: 'full', component:CollectionsComponent},
    {path: 'collections/new', pathMatch: 'full', component:CollectionEditComponent},
    {path: 'collections/:collection', pathMatch: 'full', component:CollectionEditComponent},
    {path: 'collections/:collection/packables', pathMatch: 'full', component:ItemSelectorComponent},
    {path: 'collections/:collection/packables/new', pathMatch: 'full', component:PackableEditComponent},
    {path: '**', redirectTo: 'trips'}
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
    exports: [RouterModule],
})
export class AppRoutingModule {

}