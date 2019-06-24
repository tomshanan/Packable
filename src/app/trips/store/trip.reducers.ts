import * as TripActions from './trip.actions';
import { Trip } from '../../shared/models/trip.model';
import { PackingList } from '../../shared/models/packing-list.model';

export interface State {
    trips: Trip[];
    incomplete: Trip[];
    packingLists: PackingList[];
}

const initialState: State = {
    trips: [],
    incomplete: [],
    packingLists: []
}
export function tripReducers(state = initialState, action: TripActions.tripActions) {
    let tripState = state.trips.slice()
    let incompleteState = state.incomplete.slice()
    let packingListState = state.packingLists.slice()
    let editId: string;
    let editIndex: number;
    let editTrip: Trip;
    switch (action.type) {
        case TripActions.SET_TRIP_STATE:
            return {
                ...state,
                ...action.payload
            }
        case TripActions.UPDATE_TRIP:
            action.payload.forEach(trip => {
                editId = trip.id;
                editIndex = tripState.idIndex(editId);
                if (editIndex !== -1) {
                    tripState[editIndex] = trip
                } else {
                    tripState.unshift(trip)
                }
            })
            return {
                ...state,
                trips: [...tripState]
            }

        case TripActions.UPDATE_INCOMPLETE:
            action.payload.forEach(trip => {
                editId = trip.id;
                editIndex = incompleteState.idIndex(editId);
                if (editIndex !== -1) {
                    incompleteState[editIndex] = trip
                } else {
                    incompleteState.unshift(trip)
                }
            })
            return {
                ...state,
                incomplete: [...incompleteState]
            }
        case TripActions.REMOVE_INCOMPLETE:
            action.payload.forEach(id => {
                let removeId = id;
                let removeIndex = incompleteState.idIndex(removeId)
                if (removeIndex !== -1) {
                    incompleteState.splice(removeIndex, 1);
                }
            })
            return {
                ...state,
                incomplete: [...incompleteState]
            }
        case TripActions.REMOVE_TRIPS:
            action.payload.forEach(id => {
                let removeId = id;
                let tripIndex = tripState.idIndex(removeId)
                if (tripIndex !== -1) {
                    tripState.splice(tripIndex, 1);
                }
                let packinglistIndex = packingListState.idIndex(removeId)
                if (packinglistIndex !== -1) {
                    packingListState.splice(packinglistIndex, 1);
                }
            })
            return {
                ...state,
                trips: [...tripState],
                packingLists: [...packingListState]
            }
        case TripActions.UPDATE_PACKING_LIST:
            action.payload.forEach(packinglist => {
                editId = packinglist.id;
                editIndex = packingListState.idIndex(editId);
                if (editIndex !== -1) {
                    packingListState[editIndex] = packinglist
                } else {
                    packingListState.unshift(packinglist)
                }
            })
            return {
                ...state,
                packingLists: [...packingListState]
            }
        case TripActions.UPDATE_PACKING_LIST_PACKABLES:
            let list = action.payload.packingList
            let id = action.payload.packingList.id
            editIndex = packingListState.idIndex(id)
            packingListState[editIndex] = list
            return {
                ...state,
                packingLists: [...packingListState]
            }
        default:
            return state;
    }
}