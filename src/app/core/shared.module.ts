import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NavComponent } from '../nav/nav.component';
import { ProfilesComponent } from '../profiles/profiles.component';
import { TripsComponent } from '../trips/trips.component';
import { PackablesComponent } from '../packables/packables.component';
import { PackableEditComponent } from '../packables/packable-edit/packable-edit.component';
import { CollectionsComponent } from '../collections/collections.component';
import { CollectionEditComponent } from '../collections/collection-edit/collection-edit.component';
import { ProfileEditComponent } from '../profiles/profile-edit/profile-edit.component';
import { MobileNavComponent } from '../shared-comps/mobile-nav/mobile-nav.component';
import { DesktopNavComponent } from '../shared-comps/desktop-nav/desktop-nav.component';
import { NavListComponent } from '../nav/nav-list/nav-list.component';
import { EditTripComponent } from '../trips/edit-trip/edit-trip.component';
import { DateRangeSelectorComponent } from '../trips/edit-trip/date-range-selector/date-range-selector.component';
import { PackingListComponent } from '../trips/packing-list/packing-list.component';
import { WeatherConditionsFormComponent } from '../shared-comps/weather-conditions-form/weather-conditions-form.component';
import { LoginComponent } from '../user/login/login.component';
import { RegisterComponent } from '../user/register/register.component';
import { UserComponent } from '../user/user.component';
import { ItemSelectorComponent } from '../shared-comps/item-selector/item-selector.component';
import { HomeComponent } from '../home/home.component';

import { DropDownDirective } from '../shared/directives/drop-down.directive';
import { InnerLinkDirective } from '../shared/directives/inner-link.directive';
import { AutofocusDirective } from "@app/shared/directives/autofocus.directive";

import { joinPipe } from '@shared/pipes/join.pipe';
import { FullPlaceNamePipe } from '@shared/pipes/full-place-name.pipe';

import { ModalComponent } from '@shared-comps/modal/modal.component';
import { Ng5SliderModule } from 'ng5-slider';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppMaterialModule } from './material-form.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProfileIconComponent } from '@shared-comps/profile-icon/profile-icon.component';
import { ProfileSelectorComponent } from '@shared-comps/profile-selector/profile-selector.component';
import { IconSelectorComponent } from "@shared-comps/icon-selector/icon-selector.component";
import { PackableEditFormComponent } from '../packables/packable-edit-form/packable-edit-form.component';
import { OptionsMenuComponent } from '../shared-comps/options-menu/options-menu.component';
import { QuantityRuleListComponent } from '../packables/packable-edit-form/quantity-rule-list/quantity-rule-list.component';
import { QuantityRuleComponent } from "@app/packables/packable-edit-form/quantity-rule-list/quantity-rule/quantity-rule.component";
import { EditPackableDialogComponent } from '../shared-comps/dialogs/edit-packable-dialog/edit-packable-dialog.component';
import { ChooseCollectionsDialogComponent } from '../shared-comps/dialogs/choose-collections-dialog/choose-collections-dialog.component';
import { DialogConfirmButtonComponent } from '../shared-comps/dialogs/dialog-confirm-button/dialog-confirm-button.component';
import { IconCheckboxComponent } from '../shared-comps/icon-checkbox/icon-checkbox.component';

let imports = [
    ProfilesComponent,
    TripsComponent,
    NavComponent,
    PackablesComponent,
    DropDownDirective,
    InnerLinkDirective,
    AutofocusDirective,
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
    HomeComponent,
    ProfileIconComponent,
    ProfileSelectorComponent,
    IconSelectorComponent,
    PackableEditFormComponent,
    QuantityRuleComponent, 
    OptionsMenuComponent,
    QuantityRuleListComponent,
    EditPackableDialogComponent,
    ChooseCollectionsDialogComponent,
    DialogConfirmButtonComponent
]
@NgModule({
    imports: [
        CommonModule,
        Ng5SliderModule,
        ReactiveFormsModule,
        FormsModule,
        AppMaterialModule,
        HttpClientModule,
        RouterModule,
        NgbModule.forRoot(),
    ],
    declarations: [...imports, IconCheckboxComponent],
    exports: [...imports]
})
export class SharedModule {

}