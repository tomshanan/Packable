import { MatSlideToggleModule, MatChipsModule, MatAutocompleteModule, MatExpansionModule, MatSelectModule } from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';




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
        MatCardModule
    ],
})
export class AppMaterialModule { }