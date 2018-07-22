import { MatSlideToggleModule, MatChipsModule, MatAutocompleteModule } from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';


@NgModule({
    exports: [
        MatSlideToggleModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule
    ],
})
export class AppMaterialModule { }