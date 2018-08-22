import { Component, OnInit, OnDestroy, Pipe } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../shared/app.reducers'
import * as tripActions from '../store/trip.actions';
import { Observable } from 'rxjs/Observable';
import { PackingList, PackingListPackable, Reason, packingListData } from '../../shared/models/packing-list.model';
import { Subscription } from 'rxjs';
import { State as tripState} from '../store/trip.reducers';
import { MemoryService } from '../../shared/memory.service';
import { Trip } from '../../shared/models/trip.model';
import * as moment from 'moment';
import { CollectionFactory } from '../../shared/models/collection.model';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreSelectorService } from '../../shared/store-selector.service';
import { DestinationDataService } from '../../shared/location-data.service';
import { PackableBlueprint, ActivityRule } from '../../shared/models/packable.model';
import { WindowService } from '../../shared/window.service';
import { Profile } from '../../shared/models/profile.model';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { WeatherService } from '../../shared/weather.service';
import { WeatherRule } from '../../shared/models/weather.model';


interface collectionList{
  header:string,
  collectionID:string,
  packables: PackingListPackable[]
}
interface profileList {
  header: string,
  profileID: string,
  collections: collectionList[]
}

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['../../shared/css/full-flex.css','./packing-list.component.css']
})
export class PackingListComponent implements OnInit, OnDestroy {
  trip_obs: Observable<tripState>
  state_subscription: Subscription;
  packingList: PackingList;
  sortedList: profileList[];
  saveTimeout;
  lastSave:string;
  trip: Trip;
  navParams:navParams;

  constructor(
    private store: Store<fromApp.appState>,
    private memoryService: MemoryService,
    private router: Router,
    private activatedRoute:ActivatedRoute,
    private selectorService: StoreSelectorService,
    private destService: DestinationDataService,
    private windowService: WindowService,
    private weatherService: WeatherService
  ) { }

  ngOnInit() {
    // get packinglist for trip
    let memoryTrip = this.memoryService.getTrip()
    if(!!memoryTrip){
      this.trip_obs = this.store.select('trips')
      
      this.state_subscription = this.trip_obs.subscribe(tripState =>{
        this.packingList = tripState.packingLists.find(pl=> pl.tripId == memoryTrip.id);
        this.trip = tripState.trips.find(trip => trip.id == memoryTrip.id);
        
        if(!this.packingList){
          this.generateList(this.trip);
        } else {
          if(!this.sortedList){
            this.sortedList = this.sortPackingList(this.packingList)
          }
          this.lastSave = moment().format('MMM Do YYYY, H:mm:ss')
        }
      })
      this.navSetup();
    } else {
      this.return();
    }
  }
  navSetup() {
    this.navParams = {
      header:  this.packingList.data.destination.fullName,
      left: {
        enabled: true,
        text: 'Trips',
        iconClass: 'fas fa-chevron-left'
      },
      right: {
        enabled: true,
        text: '',
        iconClass: 'fas fa-ellipsis-h'
      },
      options: []
    }
  }
  toggleCheck(packabale:PackingListPackable){
    let index = this.packingList.packables.findIndex(p=>{
      return p.packableID == packabale.packableID && p.profileID == packabale.profileID
    })
    this.packingList.packables[index].checked = !this.packingList.packables[index].checked;
    this.delayedSave();
  }
  
  delayedSave(){
    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(()=>{
      this.store.dispatch(new tripActions.updatePackingList(this.packingList))
    },2000)
  }

  generateList(trip: Trip):void{
    let newPackingList =  new PackingList(trip.id,moment().format(),null);
    let data = new packingListData()
    let dates = this.getAllDates(trip.startDate,trip.endDate);
    data.totalDays = dates.length;
    data.totalNights = dates.length-1;
    data.destination = this.destService.DestinationById(trip.destinationId);

    // get weather for all dates
    // get maximum and minimum
    
    let activityIds = trip.activities;
    let profiles = this.selectorService.getCompleteProfilesByIds(trip.profiles)

    let processPackable = (packable:PackableBlueprint, collectionId: string, profileId: string):void =>{
      let addTripPackable = (newPackable: PackingListPackable):void=>{
          let packableIndex = newPackingList.packables.findIndex(p => {
            return p.packableID == newPackable.packableID && p.profileID == newPackable.profileID
          })
          if(packableIndex != -1){
            let currentQuantity = newPackingList.packables[packableIndex].quantity;
            if(newPackable.quantity > currentQuantity) {
              newPackingList.packables[packableIndex].quantity = newPackable.quantity;
              newPackingList.packables[packableIndex].quantityReasons.forEach((v,i,a)=>{
                a[i].active = false
              })
            } else {
              newPackable.quantityReasons.forEach((v,i,a)=>{
                a[i].active = false
              })
            }
            newPackingList.packables[packableIndex].quantityReasons.push(...newPackable.quantityReasons)
          } else {
            newPackingList.packables.push(newPackable)
          }
      }
      let collectionName = collectionId ? this.selectorService.getCollectionById(collectionId).name : 'Loose';
      let profileName = this.selectorService.getProfileById(profileId).name;
      if(checkWeatherRules(packable) && checkActivityRules(packable)){
        let accQuantity = 0;
        let reasons: Reason[] = [];
        packable.quantityRules.forEach(rule => {
          let reasonText:string;
          if (rule.type != 'trip'){
            if(rule.type == 'period'){
              let ruleQuantity = rule.amount * Math.floor(data.totalDays/rule.repAmount);
              accQuantity += ruleQuantity;
              reasonText = `${rule.amount} per ${rule.repAmount} days = ${ruleQuantity} (from ${collectionName} Collection)`;
            } else if (rule.type == 'profile') {
              accQuantity += rule.amount;
              reasonText = `${rule.amount} per Profile (from ${collectionName} Collection)`
            }
            reasons.push(new Reason(reasonText))
          } else {
            reasonText = `${rule.amount} per Trip (from ${collectionName} Collection in ${profileName}'s Profile)`
            let newPackable:PackingListPackable = {
              packableID: packable.id,
              profileID: null,
              collectionID: collectionId,
              quantity: rule.amount,
              quantityReasons: [new Reason(reasonText)],
              checked: false,
            }
            addTripPackable(newPackable);
          }
        })
        if(accQuantity>0){
          let newPackable:PackingListPackable = {
            packableID: packable.id,
            profileID: profileId,
            collectionID: collectionId,
            quantity: accQuantity,
            quantityReasons: [...reasons],
            checked: false,
          }
          addTripPackable(newPackable);
        }
      }
    }
    let checkWeatherRules = (object:{weatherRules: WeatherRule}):boolean=>{
      return true
    }
    let checkActivityId = (id:string):boolean=>{
      return activityIds.indexOf(id) != -1
    }
    let checkActivityRules = (object:{activityRules: ActivityRule[]}):boolean=>{
      if (object.activityRules.length > 0){
        return object.activityRules.every(activityRule => {
          return checkActivityId(activityRule.id)
        })
      } else {
        return true;
      }
    }
    // for each profiles:
    profiles.forEach(profile =>{
      console.warn(profile.name);
      profile.packables.forEach(packable =>{
        processPackable(packable,null,profile.id)
      })
      profile.collections.forEach(collection =>{
        if((!collection.activity || checkActivityId(collection.id)) 
        && checkActivityRules(collection) && checkWeatherRules(collection)){
          collection.packables.forEach(packable =>{
            processPackable(packable,collection.id,profile.id)
          })
        }
      })
    })
    newPackingList.data = data;
    this.store.dispatch(new tripActions.updatePackingList(newPackingList))
    this.packingList = newPackingList;
    this.sortedList = this.sortPackingList(this.packingList)
  }

  sortPackingList(packingList:PackingList):profileList[]{
    let sortedList:profileList[] = [];
    packingList.packables.forEach(item=>{
      let profileIndex = sortedList.findIndex(p=>p.profileID == item.profileID)
      if(profileIndex == -1){
        sortedList.push({
          header: this.getProfileName(item),
          profileID: item.profileID,
          collections: []
        })
        profileIndex = sortedList.findIndex(p=>p.profileID == item.profileID)
      }
      let collectionIndex = sortedList[profileIndex].collections.findIndex(p=>p.collectionID == item.collectionID)
      if(collectionIndex == -1){
        sortedList[profileIndex].collections.push({
          header: this.getCollectionName(item),
          collectionID: item.collectionID,
          packables: []
        })
        collectionIndex = sortedList[profileIndex].collections.findIndex(p=>p.collectionID == item.collectionID)
      }
      sortedList[profileIndex].collections[collectionIndex].packables.push(item)
    })
    let SharedListIndex = sortedList.findIndex(p=> p.header=='Shared');
    if(~SharedListIndex){
      let SharedList = sortedList.splice(SharedListIndex,1)
      sortedList.push(...SharedList)
    }
    return sortedList;
  }

  getAllDates(startDate:string, EndDate:string):moment.Moment[] {
    let startMoment = moment(startDate, 'YYYY-MM-DD');
    let endMoment = moment(EndDate, 'YYYY-MM-DD');
    let daysTotal = endMoment.diff(startMoment,'days');
    let allDates: moment.Moment[] = [];
    for (let i = 0; i<=daysTotal; i++){ // INCLUDES FIRST DAY - change i = 1 to exclude first day
      allDates.push(moment(startMoment).add(i,'d'))
    }
    return allDates
  }

  getPackableName(packable:PackingListPackable){
    return this.selectorService.getPackableById(packable.packableID).name;
  }
  getProfileName(packable:PackingListPackable){
    if(packable.profileID){
      return this.selectorService.getProfileById(packable.profileID).name;
    } else {
      return 'Shared'
    }
  }
  getCollectionName(packable:PackingListPackable){
    if(packable.collectionID){
      return this.selectorService.getCollectionById(packable.collectionID).name;
    } else {
      return 'General'
    }
  }

  countCompleted(profile:profileList):number{
    return profile.collections.reduce((total,col,i,arr)=>{
      return total + col.packables.reduce((subtotal,packable)=>{
        return packable.checked ? subtotal + 1 : subtotal;
      }, 0)
    }, 0)
  }
  countPackables(profile:profileList):number{
    return profile.collections.reduce((total,col,i,arr)=>{
      return total + col.packables.length
    },0);
  }
  checkCompleted(profile:profileList):boolean{
    return this.countPackables(profile)===this.countCompleted(profile)
  }

  ngOnDestroy(){
    this.state_subscription && this.state_subscription.unsubscribe();
  }

  return(){
    this.router.navigate(['/trips'])
  }
}
