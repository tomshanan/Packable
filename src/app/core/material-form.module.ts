import { MatSlideToggleModule, MatChipsModule, MatAutocompleteModule, MatExpansionModule, MatSelectModule, MatDialogModule, MatRippleModule, MatMenuModule, MatListModule, MAT_DIALOG_DEFAULT_OPTIONS, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
    exports: [
        MatSlideToggleModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatButtonModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatRippleModule,
        MatListModule,
        MatMenuModule,
        MatTabsModule
    ], providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, maxWidth: '100%', maxHeight: '100%', autoFocus: false } }

    ]

})
export class AppMaterialModule { }