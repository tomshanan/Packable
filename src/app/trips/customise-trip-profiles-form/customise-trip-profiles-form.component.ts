import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { tripCollectionGroup, Trip } from '../../shared/models/trip.model';
import { isDefined } from '../../shared/global-functions';
import { Profile } from '../../shared/models/profile.model';
import { CollectionComplete } from '../../shared/models/collection.model';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { ContextService } from '../../shared/services/context.service';
import { Subscription } from 'rxjs';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { TripMemoryService } from '../../shared/services/trip-memory.service';

@Component({
  selector: 'customise-trip-profiles-form',
  templateUrl: './customise-trip-profiles-form.component.html',
  styleUrls: ['./customise-trip-profiles-form.component.css']
})
export class CustomiseTripProfilesFormComponent implements OnInit,OnDestroy {
  @Input('trip') trip: Trip;
  profileGroup:Profile[] = []
  cGroups: tripCollectionGroup[] = []
  selectedProfileId:string;
  profileCollections: CollectionComplete[];
  subs: Subscription;
  
  constructor(
    private colFac: CollectionFactory,
    private context: ContextService,
    private storeSelector: StoreSelectorService,
    private tripService: TripMemoryService,
  ) { }

  ngOnInit() {
    this.profileGroup = this.storeSelector.getProfilesById(this.trip.profiles)
    this.cGroups = this.trip.collections.slice()

    if(isDefined(this.profileGroup)){
      this.onSelectedProfiles([this.trip.profiles[0]])
    }
    this.subs = this.storeSelector.profiles$.subscribe(state => {
      console.log('profile state emitted', state);
      this.profileGroup = state.profiles.filter(p=>this.profileGroup.hasId(p.id))
      this.setCollections(this.selectedProfileId)
    })
  }
  ngOnDestroy(){
    this.subs.unsubscribe()
  }
  onSelectedProfiles(selected:string[]){
    let id = selected[0]
    this.context.setProfile(id)
    this.selectedProfileId = id
    this.setCollections(id)
  }
  setCollections(id:string){
    let filteredCollections = this.profileGroup.findId(id).collections.filter(c=>{
      const CG = this.cGroups.findId(c.id)
      return CG && CG.profiles.includes(id)
    })
    this.profileCollections = this.colFac.makeCompleteArray(filteredCollections) 
  }

}
