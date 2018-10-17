import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { TripsComponent } from '../trips/trips.component';
import { ProfilesComponent } from '../profiles/profiles.component';
import { PackablesComponent } from '../packables/packables.component';
import { PackableEditComponent } from '../packables/packable-edit/packable-edit.component';
import { CollectionsComponent } from '../collections/collections.component';
import { CollectionEditComponent } from '../collections/collection-edit/collection-edit.component';
import { ProfileEditComponent } from '../profiles/profile-edit/profile-edit.component';
import { ItemSelectorComponent } from '../shared-comps/item-selector/item-selector.component';
import { EditTripComponent } from '../trips/edit-trip/edit-trip.component';
import { PackingListComponent } from '../trips/packing-list/packing-list.component';
import { UserComponent } from '../user/user.component';
import { AuthGuard } from '../user/auth-guard.service';
import { HomeComponent } from '../home/home.component';

const appRoutes:Routes = [
    {path: '', pathMatch: 'full', component:HomeComponent},
    {path: 'user', pathMatch: 'full', component:UserComponent},
    {path: 'trips', pathMatch: 'full', component:TripsComponent, canActivate: [AuthGuard]},
    {path: 'trips/new', pathMatch: 'full', component:EditTripComponent, canActivate: [AuthGuard]},
    {path: 'trips/:trip', pathMatch: 'full', component:EditTripComponent, canActivate: [AuthGuard]},
    {path: 'trips/:trip/profiles', pathMatch: 'full', component:ItemSelectorComponent, canActivate: [AuthGuard]},
    {path: 'trips/:trip/activities', pathMatch: 'full', component:ItemSelectorComponent, canActivate: [AuthGuard]},
    {path: 'trips/:trip/packing-list', pathMatch: 'full', component:PackingListComponent, canActivate: [AuthGuard]},

    {path: 'profiles', pathMatch: 'full', component:ProfilesComponent, canActivate: [AuthGuard]},
    {path: 'profiles/new', pathMatch: 'full', component:ProfileEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile', pathMatch: 'full', component:ProfileEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/packables', pathMatch: 'full', component:ItemSelectorComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/packables/new', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/packables/:packable', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/collections', pathMatch: 'full', component:ItemSelectorComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/collections/new', pathMatch: 'full', component:CollectionEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/collections/:collection', pathMatch: 'full', component:CollectionEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/collections/:collection/packables', pathMatch: 'full', component:ItemSelectorComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/collections/:collection/packables/new', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/collections/:collection/packables/:packable', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: 'profiles/:profile/**', pathMatch: 'full', redirectTo: 'profiles/:profile'},

    {path: 'packables', pathMatch: 'full', component:PackablesComponent, canActivate: [AuthGuard]},
    {path: 'packables/new', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: 'packables/:packable', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    
    {path: 'collections', pathMatch: 'full', component:CollectionsComponent, canActivate: [AuthGuard]},
    {path: 'collections/new', pathMatch: 'full', component:CollectionEditComponent, canActivate: [AuthGuard]},
    {path: 'collections/:collection', pathMatch: 'full', component:CollectionEditComponent, canActivate: [AuthGuard]},
    {path: 'collections/:collection/packables', pathMatch: 'full', component:ItemSelectorComponent, canActivate: [AuthGuard]},
    {path: 'collections/:collection/packables/new', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: 'collections/:collection/packables/:packable', pathMatch: 'full', component:PackableEditComponent, canActivate: [AuthGuard]},
    {path: '**', redirectTo: 'user'}
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
    exports: [RouterModule],
})
export class AppRoutingModule {

}