import { MatSlideToggleModule, MatChipsModule, MatAutocompleteModule } from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';



@NgModule({
    exports: [
        MatSlideToggleModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatCheckboxModule
    ],
})
export class AppMaterialModule { }