
import { Injectable } from '@angular/core';
import { Trip, DisplayTrip } from '../models/trip.model';
import * as moment from 'moment'
import { DestinationDataService } from '../services/location-data.service';
import { StoreSelectorService } from '../services/store-selector.service';
import { isDefined } from '../global-functions';
import { TripWeatherData, WeatherService } from '../services/weather.service';
import { tempC } from '../models/weather.model';
import { PackingListPackable, DisplayPackingList as DisplayPackingList, pass, listCollection, PackingList } from '../models/packing-list.model';
import { ColorGeneratorService } from '../services/color-gen.service';
import { Avatar, Profile } from '../models/profile.model';

export const SHARED = 'SHARED'
export type tripProperties = keyof Trip
@Injectable()
export class TripFactory {
    constructor(
        private destServices: DestinationDataService,
        private storeSelector: StoreSelectorService,
        private weatherService: WeatherService,
        private colorGen: ColorGeneratorService,

    ) { }
    public duplicateTrip = (trip: Trip): Trip => {
        let newTrip = new Trip(
            trip.id,
            trip.startDate,
            trip.endDate,
            trip.destinationId,
            trip.profiles ? trip.profiles.slice() : [],
            trip.collections ? trip.collections.slice() : [],
            trip.dateModified
        )
        newTrip.collections.forEach(c => {
            if (!isDefined(c.profiles)) {
                c['profiles'] = [];
            }
        })
        return newTrip
    }
    public cleanUpList(packingList: PackingList): PackingList {
        packingList.data.weatherData = new TripWeatherData(packingList.data.weatherData)
        return packingList
    }

    public getDisplayTrips = (ids: string[]): Promise<DisplayTrip[]> => {
        const trips: { trip: Trip, data: TripWeatherData | Promise<TripWeatherData> }[] = []
        ids.forEach(id => {
            const trip = this.storeSelector.getTripById(id)
            const packinglist = this.storeSelector.getPackinglistById(id)
            let weatherData: TripWeatherData | Promise<TripWeatherData>;
            if (isDefined(packinglist)
                && isDefined(packinglist.data.weatherData)
                && packinglist.data.weatherData.isValid
                && moment(packinglist.data.weatherData.dateModified).diff(moment(), 'hours') < 12
            ) {
                weatherData = new TripWeatherData(packinglist.data.weatherData)
            } else {
                weatherData = this.weatherService.getTripWeatherData(trip)
            }
            trips.push({ trip: trip, data: weatherData })
        })
        return Promise.all(trips.map(t => t.data)).then((data) => {
            return data.map((data, i) => {
                return this.makeDisplayTrip(trips[i].trip, data)
            })
        })
    }

    public makeDisplayTrip = (trip: Trip, weatherData?: TripWeatherData): DisplayTrip => {
        let destination = this.destServices.findDestination(trip.destinationId)
        let dates: string = this.tripDatesToDateString(trip)
        let profiles: Profile[] = this.storeSelector.profiles
            .filter(p => trip.profiles.includes(p.id))
        let collections: string[] = this.storeSelector.originalCollections
            .filter(c => trip.collections.idIndex(c.id) > -1)
            .map(c => c.name);
        return new DisplayTrip(
            trip.id,
            dates,
            trip.startDate,
            weatherData ? weatherData.tempToHtmlString() : 'TBC',
            destination.fullName,
            profiles,
            collections,
            trip.dateModified,
            moment(trip.startDate).isBefore(moment(),'day')
        )
    }

    public tripDatesToDateString = (trip: Trip): string => {
        let startDate = moment(trip.startDate)
        let endDate = moment(trip.endDate)
        if (startDate.month != endDate.month) {
            return `${startDate.format('D MMM')} - ${endDate.format('D MMM')}`
        } else {
            return `${startDate.date()} - ${endDate.format('D MMMM')}`
        }
    }

    public validateTrip = (trip: Trip,doDebug:boolean = false): tripProperties[] => {
        let debug:string[] = []
        let validArray: tripProperties[] = []
        let id = trip.destinationId
        let destisValid = !!this.destServices.findDestination(id)
        destisValid ? validArray.push('destinationId') : debug.push('\nDestination not found:',id)
        let now = moment()
        let startDate = moment(trip.startDate)
        let startDateIsFuture = startDate.year() >= now.year() && startDate.dayOfYear() >= now.dayOfYear()
        startDateIsFuture ? validArray.push('startDate') : debug.push('\nStart date not in the future');
        let endDateIsAfterStart = moment(trip.endDate).isAfter(startDate)
        endDateIsAfterStart ? validArray.push('endDate') : debug.push('\nEnd date not after start date');
        trip.profiles.length > 0 ? validArray.push('profiles') :  debug.push('\nThere are no profiles set');
        if (trip.collections.length > 0 && trip.profiles.every(pid => trip.collections.some(c => c.profiles.includes(pid)))) {
            validArray.push('collections')
        } else {
            if(trip.collections.length === 0){
                debug.push('\nCollection.length === 0')
            } 
            if(!trip.profiles.every(pid => trip.collections.some(c => c.profiles.includes(pid)))){
                debug.push('\nnot all profiles are in a collection:\n')
                trip.profiles.forEach((pid,i) => {
                    let found = trip.collections.some(c => c.profiles.includes(pid))
                    debug.push(` ${i+1}. `,pid,' is ',found ? '':'NOT',' in a collection\n')
                })
            }
        }
        debug.push('\n\nTrip Object:\n',JSON.stringify(trip))
        // console.log('TRIP VALIDATION:', validArray.join(' ,'),doDebug?'\n'+debug.join(''):'')
        return validArray
    }
    public validateTripProperties = (trip: Trip, required: tripProperties[]): boolean => {
        const tripValidArray = this.validateTrip(trip)
        return required.every(v => tripValidArray.includes(v))
    }

    public createDisplayPackingList = (
        packingListPackables: PackingListPackable[],
        displayList: DisplayPackingList[] = []
    ): DisplayPackingList[] => {
        console.log('👕 updating display list unsing new packing list:\n',packingListPackables)

        const firstTime = displayList.length === 0
        packingListPackables.forEach(item => {
            let listIndex = displayList.findIndex(p => p.id === (item.type === SHARED ? SHARED : item.profileID)) 
            if (listIndex == -1) {
                const profile = this.storeSelector.getProfileById(item.profileID)
                if (item.type==='PRIVATE') {
                    displayList.push(
                        new DisplayPackingList({
                            header: profile.name,
                            id: profile.id,
                            avatar: profile.avatar,
                            collections: []
                        })
                    )
                } else {
                    displayList.push(
                        new DisplayPackingList({
                            header: 'Shared',
                            id: SHARED,
                            avatar: new Avatar('together', ['#F27121', '#E94057', '#8A2387']),
                            collections: []
                        })
                    )
                }
                listIndex = displayList.findIndex(p => p.id === (item.type === SHARED ? SHARED : item.profileID))
            }
            let collectionIndex = displayList[listIndex].collections.findIndex(c => c.id == item.collectionID)
            if (collectionIndex == -1) {
                const collection = this.storeSelector.getCollectionById(item.collectionID)
                displayList[listIndex].collections.push(
                    new listCollection({
                        header: collection.name,
                        id: item.collectionID,
                        packables: []
                    })
                )
                collectionIndex = displayList[listIndex].collections.findIndex(p => p.id == item.collectionID)
            }
            let packableIndex = displayList[listIndex].collections[collectionIndex].packables.findIndex(p => p.id == item.id)
            if (packableIndex === -1) {
                console.log(`👕 Added ${item.name} to ${displayList[listIndex].header}/${displayList[listIndex].collections[collectionIndex].header}`)
                item.recentlyAdded = firstTime ? item.recentlyAdded : true;
                displayList[listIndex].collections[collectionIndex].packables.push(item)
            } else {
                let p = displayList[listIndex].collections[collectionIndex].packables[packableIndex]
                if (p.dateModified < item.dateModified) {
                    //console.log(`👕 Updated ${displayList[profileIndex].header}/${displayList[profileIndex].collections[collectionIndex].header}/${item.name} new:`, item, 'old:', p);
                    if ((!pass(p) && pass(item))) {
                        item.recentlyAdded = true;
                    }
                    Object.assign(p, item)
                }
            }
        })
        let SharedListIndex = displayList.findIndex(p => p.id === SHARED);
        // push Shared list to the end
        if (SharedListIndex != -1) {
            displayList.push(...displayList.splice(SharedListIndex, 1))
        }
        // const foundList: string[] = []
        // const removeList: PackingListPackable[] = []
        displayList.forEach(profileList => {
            profileList.collections.forEach(colList => {
                colList.packables.compare(packingListPackables.filter(p=>{
                    return profileList.id === SHARED ? ( p.type === SHARED && p.collectionID === colList.id) : ( p.profileID === profileList.id && p.collectionID === colList.id && p.type === 'PRIVATE')
                }))
                // colList.packables.forEach(p => {
                //     // FIND MISSING PACKABLES
                //     const i = packingListPackables.findIndexBy(p, ['id', 'profileID', 'collectionID'])
                //     if (i === -1) {
                //         console.log(`👕 Couldnt find ${p.name}`, p)
                //         removeList.push(p)
                //     } else {
                //         foundList.push(`\nfound ${p.name} in ${profileList.header}/${colList.header}`)
                //     }
                // })
                firstTime && colList.packables.sort((a, b) => {
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();
                    return nameA > nameB ? 1 : -1;
                })
                    .sort((a, b) => {
                        return pass(a) ? (pass(b) ? 0 : -1) : (pass(b) ? 1 : 0)
                    })
            })
        })
        //console.log('👕 FOUND LIST:',foundList)
        //removeList.forEach(p => this.removePackableFromSortedList(p, displayList))
        return displayList;
    }
    removePackableFromSortedList(_p: PackingListPackable, list: DisplayPackingList[]) {
        let packables = list
            .findId(_p.profileID).collections
            .findId(_p.collectionID).packables
        const sortedListIndex = packables.findIndex(p => p.id === _p.id)
        console.log(`
        👕 removing ${_p.name} 
        from ${list.findId(_p.profileID).header}
        /${list.findId(_p.profileID).collections.findId(_p.collectionID).header}`, 
        packables.slice())
        packables.splice(sortedListIndex, 1)
    }
}
