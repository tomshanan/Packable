
import { Injectable } from '@angular/core';
import { Trip, displayTrip } from '../models/trip.model';
import * as moment from 'moment'
import { DestinationDataService } from '../services/location-data.service';
import { StoreSelectorService } from '../services/store-selector.service';
import { isDefined } from '../global-functions';
export type tripProperties = keyof Trip
@Injectable()
export class TripFactory {
    constructor( 
        private destServices: DestinationDataService,
        private storeSelector: StoreSelectorService,
    ){}
    public duplicateTrip = (trip:Trip): Trip =>{  
         let newTrip =  new Trip(
            trip.id,
            trip.startDate,
            trip.endDate,
            trip.destinationId,
            trip.profiles ? trip.profiles.slice() : [],
            trip.collections ? trip.collections.slice() : [],
            trip.dateModified
        )
        newTrip.collections.forEach(c=>{
            if(!isDefined(c.profiles)){
                c['profiles'] = [];
            }
        })
        return newTrip
    }
    public makeDisplayTrip = (trip:Trip): displayTrip =>{  
        let destination = this.destServices.destinations.findId(trip.destinationId)
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
                destination.fullName,
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
    
    public validateTrip = (trip:Trip):tripProperties[]=>{
        let validArray: tripProperties[] = []
        let id = trip.destinationId
        let destisValid = !!this.destServices.DestinationByCityId(id)
        destisValid && validArray.push('destinationId')
        let now = moment()
        let startDate = moment(trip.startDate)
        let startDateIsFuture = startDate.year() >= now.year() && startDate.dayOfYear() >= now.dayOfYear()
        startDateIsFuture && validArray.push('startDate')
        let endDateIsAfterStart = moment(trip.endDate).isAfter(startDate)
        endDateIsAfterStart && validArray.push('endDate')
        trip.profiles.length > 0 && validArray.push('profiles')
        if(trip.collections.length > 0 && trip.profiles.every(pid=>trip.collections.some(c=>c.profiles.includes(pid)))){
            validArray.push('collections')
        }
        console.log('TRIP VALIDATION:',validArray.join(' ,'))
        return validArray
    }
    public validateTripProperties = (trip:Trip,required:tripProperties[]):boolean=>{
        const tripValidArray = this.validateTrip(trip)
        return required.every(v=>tripValidArray.includes(v))
    }
}
