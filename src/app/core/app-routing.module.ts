import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { TripsComponent } from '../trips/trips.component';
import { ProfilesComponent } from '../profiles/profiles.component';
import { PackablesComponent } from '../packables/packables.component';
import { CollectionsComponent } from '../collections/collections.component';
import { ProfileEditComponent } from '../profiles/profile-edit/profile-edit.component';
import { ItemSelectorComponent } from '../shared-comps/item-selector/item-selector.component';
import { EditTripComponent } from '../trips/edit-trip/edit-trip.component';
import { PackingListComponent } from '../trips/packing-list/packing-list.component';
import { UserComponent } from '../user/user.component';
import { AuthGuard } from '../user/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { AdminComponent } from '../admin/admin.component';
import { UsersComponent } from '../admin/users/users.component';

const appRoutes:Routes = [
    {path: '', pathMatch: 'full', component:HomeComponent},
    {path: 'user', pathMatch: 'full', component:UserComponent},
    {path: 'trips', pathMatch: 'full', component:TripsComponent, canActivate: [AuthGuard]},
    {path: 'trips/new', pathMatch: 'full', component:EditTripComponent, canActivate: [AuthGuard]},
    {path: 'travelers', pathMatch: 'full', component:ProfilesComponent, canActivate: [AuthGuard]},
    {path: 'packables', pathMatch: 'full', component:PackablesComponent, canActivate: [AuthGuard]},
    {path: 'collections', pathMatch: 'full', component:CollectionsComponent, canActivate: [AuthGuard]},
    {path: 'admin/settings', pathMatch: 'full', component:AdminComponent, canActivate: [AuthGuard]},
    {path: 'admin/users', pathMatch: 'full', component:UsersComponent, canActivate: [AuthGuard]},
    {path: '**', redirectTo: 'user'}
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
    exports: [RouterModule],
})
export class AppRoutingModule {

}