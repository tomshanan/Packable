import { Component, OnInit } from '@angular/core';
import { PackingListService } from '../packing-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { PackingList } from '../../../shared/models/packing-list.model';
import { Trip } from '@app/shared/models/trip.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { isDefined } from '../../../shared/global-functions';

export interface PrintOptions {
  profileId?: string;
  pagePerProfile?:string;
  cleanCheckboxes?:string;
}
function log(...args){
  console.log("🖨️",...args)
}
@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css'],
})
export class PrintComponent implements OnInit {
  trip:Trip;
  packingList: PackingList;
  profileId: string;
  pagePerProfile:boolean= false;
  cleanCheckboxes:boolean = false;

  constructor(
    private route: ActivatedRoute,
    private storeSelector: StoreSelectorService,
    private router:Router,
  ) { 
  }

  ngOnInit() {
    console.log('print component loaded')
    this.route.paramMap.pipe(take(1)).subscribe(paramMap=>{
      let id = paramMap.get('id')
      log('received id',id)
      log('found?',this.storeSelector.packingLists.hasId(id))
      if(isDefined(id) && this.storeSelector.packingLists.hasId(id)){
        this.packingList = this.storeSelector.packingLists.findId(id)
        this.trip = this.storeSelector.trips.findId(id)
        this.profileId = this.route.snapshot.queryParamMap.get('profileId') || null
        this.pagePerProfile = !!this.route.snapshot.queryParamMap.get('pagePerProfile') || false
        this.cleanCheckboxes = !!this.route.snapshot.queryParamMap.get('cleanCheckboxes') || false
      } else {
        this.router.navigate([{ outlets: { print: null }}])
      }
    })
  }

}
