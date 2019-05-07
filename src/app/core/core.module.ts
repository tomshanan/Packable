import { NgModule } from "@angular/core";

import { AuthInterceptor } from '../shared/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { CollectionFactory } from '@shared/factories/collection.factory';
import { PackableFactory } from '@factories/packable.factory';
import { ProfileFactory } from '@factories/profile.factory';
import { weatherFactory } from '@factories/weather.factory';
import { TripFactory } from '@factories/trip.factory';
import { ContextService } from '../shared/services/context.service';
import {
    AuthService, 
    AuthGuard, 
    WindowService, 
    MemoryService, 
    StoreSelectorService,
    DestinationDataService,
    WeatherService,
    StorageService,
    IconService,
    ColorGeneratorService
} from '@app/core';

@NgModule({
    providers: [
        AuthService, 
        AuthGuard,
        WindowService, 
        MemoryService, 
        StoreSelectorService,
        CollectionFactory,
        PackableFactory,
        ProfileFactory,
        DestinationDataService, 
        WeatherService,
        StorageService,
        TripFactory,
        weatherFactory,
        IconService,
        ColorGeneratorService,
        
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
    ]
})
export class CoreModule {}