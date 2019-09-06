import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TripsComponent } from '../trips/trips.component';
import { ProfilesComponent } from '../profiles/profiles.component';
import { PackablesComponent } from '../packables/packables.component';
import { CollectionsComponent } from '../collections/collections.component';
import { ItemSelectorComponent } from '../shared-comps/item-selector/item-selector.component';
import { PackingListComponent } from '../trips/packing-list/packing-list.component';
import { UserComponent } from '../user/user.component';
import { AuthGuard, UnauthGuard } from '../user/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { AdminComponent } from '../admin/admin.component';
import { UsersComponent } from '../admin/users/users.component';
import { NewTripWizardComponent } from '../trips/new-trip-wizard/new-trip-wizard.component';
import { PrintComponent } from '@app/trips/packing-list/print/print.component';
import { EditTripCollectionsComponent } from '../trips/edit-trip/edit-trip-collections/edit-trip-collections.component';
import { EditTripComponent } from '../trips/edit-trip/edit-trip.component';
import { EditTripProfilesComponent } from '@app/trips/edit-trip/edit-trip-profiles/edit-trip-profiles.component';
import { EditTripDestinationDatesComponent } from '@app/trips/edit-trip/edit-trip-destination-dates/edit-trip-destination-dates.component';
import { AuthComponent } from '@app/user/auth/auth.component';
import { LogoutComponent } from '../user/auth/logout/logout.component';
import { UserSettingsComponent } from '../user/user-settings/user-settings.component';
import { UserActionsComponent } from '../user/user-actions/user-actions.component';

const appRoutes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', pathMatch: 'full', component: HomeComponent },
    {
        path: 'user', component: UserComponent, children: [
            { path: '', pathMatch: 'full', redirectTo: 'settings' },
            { path: 'auth', component: AuthComponent, canActivate: [UnauthGuard] },
            { path: 'settings', component: UserSettingsComponent, canActivate: [AuthGuard] },
            { path: 'actions', component: UserActionsComponent},
            //{ path: '**', redirectTo: '' }
        ]
    },
    { path: 'logout', pathMatch: 'full', component: LogoutComponent, canActivate: [AuthGuard] },
    { path: 'trips', pathMatch: 'full', component: TripsComponent, canActivate: [AuthGuard] },
    { path: 'trips/new', pathMatch: 'full', component: NewTripWizardComponent, canActivate: [AuthGuard] },
    {
        path: 'trips/edit/:id', component: EditTripComponent, canActivate: [AuthGuard], children: [
            { path: '', pathMatch: 'full', redirectTo: 'destination' },
            { path: 'collections', component: EditTripCollectionsComponent },
            { path: 'travelers', component: EditTripProfilesComponent },
            { path: 'destination', component: EditTripDestinationDatesComponent },
        ]
    },
    { path: 'trips/packing-list/:id', pathMatch: 'full', component: PackingListComponent, canActivate: [AuthGuard] },
    { path: 'print/:id', pathMatch: 'full', outlet: 'print', component: PrintComponent, canActivate: [AuthGuard] },
    { path: 'travelers', pathMatch: 'full', component: ProfilesComponent, canActivate: [AuthGuard] },
    { path: 'packables', pathMatch: 'full', component: PackablesComponent, canActivate: [AuthGuard] },
    { path: 'collections', pathMatch: 'full', component: CollectionsComponent, canActivate: [AuthGuard] },
    { path: 'admin/settings', pathMatch: 'full', component: AdminComponent, canActivate: [AuthGuard] },
    { path: 'admin/users', pathMatch: 'full', component: UsersComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'home' }
];
@NgModule({
    imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
    exports: [RouterModule],
})
export class AppRoutingModule {

}