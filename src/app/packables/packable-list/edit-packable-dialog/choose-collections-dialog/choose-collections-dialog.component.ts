import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionComplete } from '@models/collection.model';
import { MatCheckboxChange } from '@angular/material';
import { Profile, Avatar } from '@app/shared/models/profile.model';
import { ProfileComplete } from '@shared/models/profile.model';
import { ProfileFactory } from '@factories/profile.factory';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { CollectionFactory } from '@shared/factories/collection.factory';
import { dropInTrigger, expandAndFadeTrigger, quickTransitionTrigger } from '@shared/animations';
import { isDefined } from '../../../../shared/global-functions';

export interface CollectionProfile {
  pId: string,
  cId: string
}
interface CollectionBranch {
  name: string,
  id: string
  profiles: Profile[],
  selected: string[],
  branchOpen:boolean
}
export interface CollectionSelectorConfirmEvent {
  selectedIds: CollectionProfile[],
  action: 'add' | 'update'

}

@Component({
  selector: 'app-choose-collections-dialog',
  templateUrl: './choose-collections-dialog.component.html',
  styleUrls: ['../../../../shared/css/mat-card-list.css', './choose-collections-dialog.component.css'],
  animations: [expandAndFadeTrigger, quickTransitionTrigger]
})
export class ChooseCollectionsDialogComponent implements OnInit, OnChanges {

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIds']) {

    }
  }

  CollectionProfileGroup: CollectionProfile[] = [];

  @Input() PackableId: string = null;
  @Input() selectedIds: CollectionProfile[] = [];
  @Input() limitProfiles: string[] = [];
  @Input() limitCollections: string[] = [];

  @Output() selectedIdsChange = new EventEmitter<CollectionProfile[]>();
  @Output() confirm = new EventEmitter<CollectionSelectorConfirmEvent>();

  collectionsOpen: string[] = []

  action: 'add' | 'update' = 'add';
  ColProTree: CollectionBranch[];

  constructor(
    private pFac: ProfileFactory,
    private cFac: CollectionFactory,
    private storeSelector: StoreSelectorService
  ) {
  }

  ngOnInit() {
    let profilesWithPackableId = this.PackableId != null ? this.storeSelector.getProfilesWithPackableId(this.PackableId) : [];
    console.log('CHOOSE COLLECTION DIALOG: filteredProfileGroup',profilesWithPackableId)

    if (profilesWithPackableId.length > 0) {
      this.CollectionProfileGroup = this.createCollectionProfileGroupByPackable(profilesWithPackableId, this.PackableId)
      this.action = 'update'
    } else {
      this.CollectionProfileGroup = this.createCollectionProfileGroupByPackable(this.storeSelector.profiles)
      this.action = 'add'
    }
    this.ColProTree = this.buildTree();
    if(isDefined(this.limitCollections) &&isDefined(this.limitProfiles)){
      this.addAll()
    }
  }

  createCollectionProfileGroupByPackable(profiles: Profile[], packableId: string = null): CollectionProfile[] {
    let collectionProfileGroup: CollectionProfile[] = []
    console.log('CHOOSE COLLECTION DIALOG: createCollectionProfileGroupByPackable received Profiles:',profiles)
    profiles.forEach(p => {
      if(!isDefined(this.limitProfiles) || this.limitProfiles.includes(p.id)){
          p.collections.forEach(c => {
          if(!isDefined(this.limitCollections) || this.limitCollections.includes(c.id)){
            if (packableId == null || c.packables.some(Packable => Packable.id == packableId)) {
              collectionProfileGroup.push({ cId: c.id, pId: p.id })
            }
          }
        })
      }
    })
    return collectionProfileGroup
  }

  buildTree(): CollectionBranch[] {
    let tree: CollectionBranch[] = [];
    console.log('CHOOSE COLLECTION DIALOG: Building tree from CollectionProfileGroup',this.CollectionProfileGroup)
    this.CollectionProfileGroup.forEach(colPro => {
      let profile = this.storeSelector.getProfileById(colPro.pId)
      let indexOfCollection = tree.findIndex(colBranch => colBranch.id == colPro.cId)
      if (indexOfCollection > -1) {
        tree[indexOfCollection].profiles.push(profile)
      } else {
        let collection = this.storeSelector.getCollectionById(colPro.cId)
        let newCollectionBranch: CollectionBranch = {
          id: collection.id,
          name: collection.name,
          profiles: [profile],
          selected: [],
          branchOpen: false
        }
        tree.push(newCollectionBranch)
      }
    })
    return tree
  }


  updateSelectedProfiles(profileIds: string[], cIndex: string): void {
    this.ColProTree[cIndex].selected = profileIds
    this.emitSelection()
  }

  isCollectionChecked(collection: CollectionBranch): boolean {
    return collection.selected.length != 0
  }
  isCollectionIntermediate(collection: CollectionBranch) {
    return collection.selected.length > 0 && collection.selected.length < collection.profiles.length
  }
  toggleBranch(colIndex, state?:boolean){
    let col = this.ColProTree[colIndex]
    if(!this.isCollectionChecked(col) || state!=null){
      col.branchOpen = state || !col.branchOpen;
    }
    
  }
  toggleCollection(colIndex: number, state: boolean = null) {   
    let col = this.ColProTree[colIndex]
    if (state !== false && !col.branchOpen) {
      this.toggleBranch(colIndex,true)
      col.selected = col.profiles.slice().map(p => p.id)
      
    } else if(state !== true && col.branchOpen){
      this.toggleBranch(colIndex,false)
      if(state === false){
        col.selected = []
      }
    }
    this.emitSelection()
  }


  indexOfObj(obj: CollectionProfile) {
    return this.selectedIds.findIndex(selected => {
      return selected.cId == obj.cId && selected.pId == obj.pId
    })
  }
  isObjSelected(obj: CollectionProfile) {
    return this.indexOfObj(obj) > -1
  }

  addAll() {
    this.ColProTree.forEach(collection => {
      collection.selected = collection.profiles.map(p => p.id)
      collection.branchOpen = true
      collection.profiles.forEach(profile => {
        let obj = { cId: collection.id, pId: profile.id }
        if (!this.isObjSelected(obj)) {
          this.selectedIds.push(obj)
        }
      })
    })
    this.emitSelection()
  }
  removeAll() {
    this.ColProTree.forEach(collection => {
      collection.selected = []
      collection.profiles.forEach(p => {
        let obj = { cId: collection.id, pId: p.id }
        if (this.isObjSelected(obj)) {
          this.selectedIds.splice(this.indexOfObj(obj), 1)
        }
      })
    })
    this.emitSelection()
  }

  emitSelection() {
    let selectedColPros: CollectionProfile[] = []
    this.ColProTree.forEach(col => {
      col.selected.forEach(PID => {
        selectedColPros.push({ cId: col.id, pId: PID })
      })
    })
    this.selectedIds = selectedColPros;
    this.selectedIdsChange.emit(this.selectedIds)
  }

  onConfirm() {
    this.emitSelection();
    this.confirm.emit({ 'selectedIds': this.selectedIds, 'action': this.action })
  }


  
}
