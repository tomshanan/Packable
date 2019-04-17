
import { Trip } from '../models/trip.model';
export class TripFactory {
    constructor( ){}
    public duplicateTrip = (trip:Trip): Trip =>{
        console.log(`copying trip:`,trip);
        
        return new Trip(
            trip.id,
            trip.startDate,
            trip.endDate,
            trip.destinationId,
            trip.profiles || [],
            trip.collections || [],
            trip.dateModified
        )
    }
}