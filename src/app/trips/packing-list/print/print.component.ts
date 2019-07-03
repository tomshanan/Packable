import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PackingListService } from '../packing-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take, takeUntil, takeWhile } from 'rxjs/operators';
import { PackingList, DisplayPackingList, pass } from '../../../shared/models/packing-list.model';
import { Trip, DisplayTrip } from '@app/shared/models/trip.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { isDefined } from '../../../shared/global-functions';
import { TripFactory } from '../../../shared/factories/trip.factory';
import { combineLatest } from 'rxjs';

export class PrintOptions {
  profileId: string;
  pagePerProfile:boolean = false;
  cleanCheckboxes:boolean= false;
  constructor(
    options?:Partial<PrintOptions>
  ){
    if(options){
      Object.assign(this,options)
    }
  }
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
  displayTrip:DisplayTrip;
  packingList: PackingList;
  displayList:DisplayPackingList[];
  profileId: string;
  pagePerProfile:boolean= false;
  cleanCheckboxes:boolean = false;

  constructor(
    private route: ActivatedRoute,
    private storeSelector: StoreSelectorService,
    private tripFac:TripFactory,
    private router:Router,
  ) { 
  }

  ngOnInit() {
    console.log('print component loaded')
    combineLatest([this.route.paramMap,this.storeSelector.trips$])
      .pipe(
        takeWhile(([paramMap,state])=>{
          let id = paramMap.get('id')
          return !isDefined(id) || !this.storeSelector.packingLists.hasId(id)
        },true))
      .subscribe(([paramMap,state])=>{
        let id = paramMap.get('id')
        log('received id',id,(this.storeSelector.packingLists.hasId(id)?'Found':'Not Found'))
        if(isDefined(id) && this.storeSelector.packingLists.hasId(id)){
          this.profileId = this.route.snapshot.queryParamMap.get('profileId') || null
          this.pagePerProfile = this.route.snapshot.queryParamMap.get('pagePerProfile') == 'true' ? true : false
          this.cleanCheckboxes = this.route.snapshot.queryParamMap.get('cleanCheckboxes') == 'true' ? true :  false;
          log(this.route.snapshot.queryParamMap)
          this.packingList = this.storeSelector.getPackinglistById(id)
          log(this.packingList)
          this.displayList = this.tripFac.createDisplayPackingList(this.packingList.packables.filter(p=>pass(p)))
          this.tripFac.getDisplayTrips([id]).then(displayTrips=>{
            this.displayTrip = displayTrips[0]
            setTimeout(() => {
              window.print();
              setTimeout(()=>{
                this.router.navigate([{ outlets: { print: null }}])
              },1000)
            }, 0);
          })
        }
          // log('redirecting print route to null')
          // this.router.navigate([{ outlets: { print: null }}])
        
      })
  }

  calcColumns(profile:DisplayPackingList):number{
    let packables = profile.collections.reduce((total,col,i)=>{
      total += col.packables.length
      return total
    },0)
    return packables > 20 ? (packables>40 ? 3 : 2) : 1;
  }
  checkPageBreak(i:number):boolean{
    if(this.pagePerProfile){
      let profiles =this.displayList.length
      if(profiles > 1 && i>0){
          return true;
      }
    }
    return false
  }
}
