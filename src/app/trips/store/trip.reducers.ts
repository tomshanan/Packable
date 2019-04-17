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
    let editId: string;
    let editIndex: number;
    let editTrip: Trip;
    console.log('TripReducers received action',action)
    switch (action.type) {
        case TripActions.SET_TRIP_STATE:
            return {
                ...state,
                ...action.payload
            }
        case TripActions.UPDATE_TRIP:
            action.payload.forEach(trip=>{
                editId = trip.id;
                editIndex = tripState.idIndex(editId);
                if(editIndex !== -1){
                    tripState[editIndex] = trip
                } else {
                    tripState.unshift(trip)
                }
            })
            return {
                ...state,
                trips: [...tripState]
            }
        case TripActions.REMOVE_TRIP:
        action.payload.forEach(id=>{
            let removeId = id;
            let removeIndex = tripState.idIndex(removeId)
            if(removeIndex !== -1){
                tripState.splice(removeIndex,1);
            }
        })
            return {
                ...state,
                trips: [...tripState]
            }
            case TripActions.UPDATE_INCOMPLETE:
            action.payload.forEach(trip=>{
                editId = trip.id;
                editIndex = incompleteState.idIndex(editId);
                if(editIndex !== -1){
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
        action.payload.forEach(id=>{
            let removeId = id;
            let removeIndex = incompleteState.idIndex(removeId)
            if(removeIndex !== -1){
                incompleteState.splice(removeIndex,1);
            }
        })
            return {
                ...state,
                incomplete: [...incompleteState]
            }
        case TripActions.UPDATE_PACKING_LIST:
            const newList = action.payload;
            const updateListIndex = state.packingLists.findIndex(p=>p.id === newList.id);
            if(updateListIndex > -1){
                let newListState = state.packingLists.slice();
                newListState[updateListIndex] = newList;
                return{
                    ...state,
                    packingLists: newListState
                }
            } else {
                return {
                    ...state,
                    packingLists: [...state.packingLists, newList]
                }
            }
        default:
            return state;
        }
}