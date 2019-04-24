
import { Injectable } from '@angular/core';
import { Trip, displayTrip } from '../models/trip.model';
import * as moment from 'moment'
import { DestinationDataService } from '../services/location-data.service';
import { StoreSelectorService } from '../services/store-selector.service';

@Injectable()
export class TripFactory {
    constructor( 
        private destServices: DestinationDataService,
        private storeSelector: StoreSelectorService,
    ){}
    public duplicateTrip = (trip:Trip): Trip =>{  
        return new Trip(
            trip.id,
            trip.startDate,
            trip.endDate,
            trip.destinationId,
            trip.profiles ? trip.profiles.slice() : [],
            trip.collections ? trip.collections.slice() : [],
            trip.dateModified
        )
    }
    public makeDisplayTrip = (trip:Trip): displayTrip =>{  
        let destination = this.destServices.cityById(trip.destinationId)
        let dates:string = this.tripDatesToDateString(trip)
        let profiles:string[] = this.storeSelector.profiles
            .filter(p=>trip.profiles.includes(p.id))
            .map(p=>p.name);
        let collections:string[] = this.storeSelector.originalCollections
            .filter(c=>trip.collections.idIndex(c.id)>-1)
            .map(c=>c.name);
            return new displayTrip(
                trip.id,
                dates,
                'tbc', // convert temperature to string
                destination,
                profiles,
                collections,
                trip.dateModified
            )
    }

    public tripDatesToDateString = (trip:Trip):string=>{
        let startDate = moment(trip.startDate)
        let endDate = moment(trip.endDate)
        if (startDate.month != endDate.month){
            return `${startDate.format('D MMM')} - ${endDate.format('D MMM')}`
        } else {
            return `${startDate.date()} - ${endDate.format('D MMMM')}`
        }
    }
}