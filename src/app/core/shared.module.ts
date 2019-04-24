import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NavComponent } from '../nav/nav.component';
import { ProfilesComponent } from '../profiles/profiles.component';
import { TripsComponent } from '../trips/trips.component';
import { PackablesComponent } from '../packables/packables.component';
import { CollectionsComponent } from '../collections/collections.component';
import { MobileNavComponent } from '../shared-comps/mobile-nav/mobile-nav.component';
import { DesktopNavComponent } from '../shared-comps/desktop-nav/desktop-nav.component';
import { NavListComponent } from '../nav/nav-list/nav-list.component';
import { EditTripComponent } from '../trips/edit-trip/edit-trip.component';
import { DateRangeSelectorComponent } from '../trips/trip-details-form/date-range-selector/date-range-selector.component';
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
import { OptionsMenuComponent } from '../shared-comps/options-menu/options-menu.component';
import { DialogConfirmButtonComponent } from '../shared-comps/dialogs/dialog-confirm-button/dialog-confirm-button.component';
import { IconCheckboxComponent } from '../shared-comps/icon-checkbox/icon-checkbox.component';
import { PackableListComponent } from '../packables/packable-list/packable-list.component';
import { PackableEditFormComponent } from "@app/packables/packable-list/edit-packable-dialog/packable-edit-form/packable-edit-form.component";
import { QuantityRuleComponent } from "@app/packables/packable-list/edit-packable-dialog/packable-edit-form/quantity-rule-list/quantity-rule/quantity-rule.component";
import { QuantityRuleListComponent } from "@app/packables/packable-list/edit-packable-dialog/packable-edit-form/quantity-rule-list/quantity-rule-list.component";
import { EditPackableDialogComponent } from "@app/packables/packable-list/edit-packable-dialog/edit-packable-dialog.component";
import { ChooseCollectionsDialogComponent } from '../packables/packable-list/edit-packable-dialog/choose-collections-dialog/choose-collections-dialog.component';
import { CollectionListComponent } from '../collections/collection-list/collection-list.component';
import { CollectionPanelComponent } from '../collections/collection-list/collection-panel/collection-panel.component';
import { ConfirmDialog } from '@shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { ChooseProfileDialogComponent } from '../collections/collection-list/collection-panel/choose-profile-dialog/choose-profile-dialog.component';
import { DialogHeaderComponent } from '../shared-comps/dialogs/dialog-header/dialog-header.component';
import { PushPackablesDialogComponent } from '../packables/packable-list/push-packables-dialog/push-packables-dialog.component';
import { SlideToggleWithTextComponent } from '../shared-comps/slide-toggle-with-text/slide-toggle-with-text.component';
import { PackableCardComponent } from '../packables/packable-list/packable-card/packable-card.component';
import { AnimateSizeDirective } from '../shared/directives/animate-size.directive';
import { ImportPackablesDialogComponent } from '../packables/packable-list/import-packables-dialog/import-packables-dialog.component';
import { IconTextButtonComponent } from '../shared-comps/icon-text-button/icon-text-button.component';
import { CollectionDetailsCardComponent } from '../collections/collection-details-card/collection-details-card.component';
import { ListConcatinatorComponent } from '../shared-comps/list-concatinator/list-concatinator.component';
import { NewCollectionDialogComponent } from '../collections/collection-list/new-collection-dialog/new-collection-dialog.component';
import { ImportPackablesSelectorComponent } from '../packables/packable-list/import-packables-dialog/import-packables-selector/import-packables-selector.component';
import { ProfileSelectorPanelComponent } from '../profiles/profile-selector-panel/profile-selector-panel.component';
import { EditProfileDialogComponent } from '../profiles/edit-profile-dialog/edit-profile-dialog.component';
import { ProfileEditFormComponent } from '../profiles/profile-edit-form/profile-edit-form.component';
import { NameInputComponent } from '../shared-comps/name-input/name-input.component';
import { HorizontalIconSelectorComponent } from '../shared-comps/horizontal-icon-selector/horizontal-icon-selector.component';
import { AppColorDirective } from '../shared/directives/app-color.directive';
import { NewProfileDialogComponent } from '../profiles/new-profile-dialog/new-profile-dialog.component';
import { CollectionSelectorComponent } from '../collections/collection-selector/collection-selector.component';
import { CardButtonComponent } from '../shared-comps/card-button/card-button.component';
import { SearchFieldComponent } from '../shared-comps/search-field/search-field.component';
import { AdminComponent } from '../admin/admin.component';
import { AdminUserTableComponent } from '../admin/admin-user-table/admin-user-table.component';
import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { SetPermissionsDialogComponent } from '../admin/set-permissions-dialog/set-permissions-dialog.component';
import { UsersComponent } from '../admin/users/users.component';
import { EditCollectionDialogComponent } from '../collections/collection-list/edit-collection-dialog/edit-collection-dialog.component';
import { ImportCollectionDialogComponent } from '../collections/collection-list/import-collection-dialog/import-collection-dialog.component';
import { SimulateUserComponent } from '../admin/settings/simulate-user/simulate-user.component';
import { TripDetailsFormComponent } from '../trips/trip-details-form/trip-details-form.component';
import { TripDestinationSelectorComponent } from '../trips/trip-details-form/trip-destination-selector/trip-destination-selector.component';
import { NewTripWizardComponent } from '../trips/new-trip-wizard/new-trip-wizard.component';
import { StepperComponent } from '../shared-comps/stepper/stepper.component';
import { ProfileSelectionFormComponent } from '../trips/profile-selection-form/profile-selection-form.component';
import { CollectionSelectionFormComponent } from '../trips/collection-selection-form/collection-selection-form.component';
import { SelectCollectionProfilesDialogComponent } from '../trips/collection-selection-form/select-collection-profiles-dialog/select-collection-profiles-dialog.component';

let imports = [
    ProfilesComponent,
    TripsComponent,
    NavComponent,
    PackablesComponent,
    DropDownDirective,
    InnerLinkDirective,
    AutofocusDirective,
    CollectionsComponent,
    ItemSelectorComponent,
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
    DialogConfirmButtonComponent,
    IconCheckboxComponent, 
    PackableListComponent,
    CollectionListComponent,
    CollectionPanelComponent, 
    ConfirmDialog,
    ChooseProfileDialogComponent,
    DialogHeaderComponent, 
    PushPackablesDialogComponent, 
    SlideToggleWithTextComponent, 
    PackableCardComponent, 
    ImportPackablesDialogComponent,
    AdminUserTableComponent,
    AnimateSizeDirective, 
    IconTextButtonComponent,
    CollectionDetailsCardComponent, 
    ListConcatinatorComponent, 
    NewCollectionDialogComponent, 
    ImportPackablesSelectorComponent, 
    ProfileSelectorPanelComponent, 
    EditProfileDialogComponent, 
    ProfileEditFormComponent, 
    NameInputComponent, 
    HorizontalIconSelectorComponent, 
    AppColorDirective, 
    NewProfileDialogComponent, 
    CollectionSelectorComponent, 
    CardButtonComponent, 
    SearchFieldComponent, 
    AdminComponent,
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
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NgbModule.forRoot(),
    ],
    declarations: [...imports, SetPermissionsDialogComponent, UsersComponent, EditCollectionDialogComponent, ImportCollectionDialogComponent, SimulateUserComponent, TripDetailsFormComponent, TripDestinationSelectorComponent, NewTripWizardComponent, StepperComponent, ProfileSelectionFormComponent, CollectionSelectionFormComponent, SelectCollectionProfilesDialogComponent],
    exports: [...imports]
})
export class SharedModule {

}