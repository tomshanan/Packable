import { Component, OnInit, Input } from '@angular/core';
import { PackingListService } from '../packing-list.service';
import { hasNameAndId, sortByName, allowedNameRegEx, anySpaces, comparableName, isDefined, Guid, titleCase, timeStamp } from '../../../shared/global-functions';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { startWith, map, debounceTime, tap, filter, first } from 'rxjs/operators';
import { PackableOriginalWithMetaData, QuantityRule, PackableOriginal } from '../../../shared/models/packable.model';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';
import { Store } from '@ngrx/store';
import * as packableActions from '@app/packables/store/packables.actions';
import * as fromApp from '@shared/app.reducers';
import { WeatherRule } from '@app/shared/models/weather.model';

@Component({
  selector: 'quick-add-packable',
  templateUrl: './quick-add-packable.component.html',
  styleUrls: ['./quick-add-packable.component.css']
})
export class QuickAddPackableComponent implements OnInit {
  @Input() collectionId: string;
  @Input() profileId: string;
  @Input() packablesUsed: string[] = []

  importList: PackableOriginalWithMetaData[];
  usedNames:string[];
  filteredList: Observable<PackableOriginalWithMetaData[]>;

  newPackableName: FormControl;
  firstResult:PackableOriginalWithMetaData;

  constructor(
    private packingListService: PackingListService,
    private fb: FormBuilder,
    private bulkActions: BulkActionsService,
    private pacFac: PackableFactory,
    private store: Store<fromApp.appState>,

  ) {

  }

  ngOnInit() {
    this.importList = []
    this.usedNames = []
    this.packingListService.importPackableList.pipe(first(list=>list!==null)).subscribe(list=>{
      this.importList = list.filter(p => !this.packablesUsed.includes(p.id)).sort(sortByName)
      this.usedNames = list.map(p=>comparableName(p.name))
    })
    this.newPackableName = this.fb.control('', [Validators.pattern(allowedNameRegEx), Validators.required, this.validate_usedName.bind(this)])
    this.filteredList = this.newPackableName.valueChanges.pipe(
      debounceTime(150),
      startWith(''),
      filter(val=>val!==null),
      map(value => typeof value === 'string' ? value : value.name),
      map(value => value!='' ? this._filter(value) : []),
      tap(list=>{
        if (list.length>0){
          this.firstResult = list[0]
        } else if(list.length === 0){
          this.firstResult = null;
        }
      })
    );  
  }


  displayFn(p?: PackableOriginalWithMetaData): string | undefined {
    return p ? p.name : undefined;
  }

  private _filter(value: string): PackableOriginalWithMetaData[] {
    const filterValue = comparableName(value);
    return this.importList.filter(packable => {
      return comparableName(packable.name).includes(filterValue) 
      || packable.metaData.altNames.some(name=>
        comparableName(name).includes(filterValue)
        )
    })
  }


  createNewPackableFromName(name:string){
    if(this.usedNames.includes(comparableName(name))){
      let p = this.importList.find(p=>comparableName(p.name) === comparableName(name))
      this.importPackable(p)
    } else {
      let p = new PackableOriginal(Guid.newGuid(),titleCase(name),[new QuantityRule(1,'profile',1)],new WeatherRule(),true,timeStamp(),false)
      this.store.dispatch(new packableActions.updateOriginalPackables([p]))
      this.addPackableToProfileAndList(p)
    }
  }
  onSelectOption(e:MatAutocompleteSelectedEvent){
    this.importPackable(e.option.value)
  }

  importPackable(p:PackableOriginalWithMetaData){
    console.log('import '+p.name)
    let imported = this.pacFac.clonePackableOriginal(p)
    this.bulkActions.addMissingPackableIdsFromRemote([imported.id])
    this.addPackableToProfileAndList(imported)
  }
  addPackableToProfileAndList(newP:PackableOriginal){
    this.newPackableName.setValue('')
    this.firstResult = null;
    if(isDefined(this.profileId)){
      this.bulkActions.pushOriginalPackablesByCP([newP], [{ pId: this.profileId, cId: this.collectionId }])
      this.packingListService.addNewPackableToList(newP,[this.profileId],this.collectionId,
        {forcePass:true,forceRemove:false,profileID:this.profileId})
    } else {
      // ADDING TO SHARED LIST
      let CP = this.packingListService.trip.profiles.map(pId=>{
        return { pId: pId, cId: this.collectionId }
      })
      newP.quantityRules = [new QuantityRule(1,'trip',1)]
      this.bulkActions.pushOriginalPackablesByCP([newP], CP)
      this.packingListService.addNewPackableToList(newP,this.packingListService.trip.profiles,this.collectionId,
        {forcePass:true,forceRemove:false,profileID:'shared'})
    }
  }
  validate_usedName(control: FormControl): { [s: string]: boolean } {
    if(typeof control.value === 'string' ){
      let input = comparableName(control.value)
      if (this.usedNames.includes(input)) {
        return { 'usedName': true };
      }
    } else {
      return { 'usedName': true }
    }
    return null;
  }
}