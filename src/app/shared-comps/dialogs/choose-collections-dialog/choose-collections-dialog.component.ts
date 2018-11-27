import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionComplete } from '@models/collection.model';
import { MatCheckboxChange } from '@angular/material';
import { Profile, Avatar } from '@app/shared/models/profile.model';
import { ProfileComplete } from '@shared/models/profile.model';
import { ProfileFactory } from '@factories/profile.factory';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { CollectionFactory } from '../../../shared/factories/collection.factory';

export interface CollectionProfile {
  pId:string,
  cId:string
}
interface ProfileBranch {
  name: string,
  id: string,
  avatar: Avatar,
  collections: CollectionBranch[]
}
interface CollectionBranch {
  name: string,
  id: string
}

@Component({
  selector: 'app-choose-collections-dialog',
  templateUrl: './choose-collections-dialog.component.html',
  styleUrls: ['./choose-collections-dialog.component.css']
})
export class ChooseCollectionsDialogComponent implements OnInit, OnChanges {

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectedIds']){
      
    }
  }

  @Input() CollectionProfileGroup: CollectionProfile[] = [];
  @Input() selectedIds: CollectionProfile[] = [];
  @Output() selectedIdsChange = new EventEmitter<CollectionProfile[]>();
  @Output() confirm = new EventEmitter<CollectionProfile[]>();
  
  completeProfiles: ProfileComplete[] = [];
  completeCollections: CollectionComplete[] = [];
  ProfileCollectionTree:ProfileBranch[];

  constructor(
    private pFac: ProfileFactory,
    private cFac: CollectionFactory,
    private sSelectore: StoreSelectorService
  ) { 
  }
  
  ngOnInit() {
    this.completeProfiles = this.pFac.getCompleteProfiles(this.sSelectore.profiles)
    this.completeCollections = this.cFac.makeCompleteArray(this.sSelectore.originalCollections)
    this.ProfileCollectionTree = this.buildTree();
  }

  buildTree():ProfileBranch[]{
    let tree: ProfileBranch[] = [];
    this.CollectionProfileGroup.forEach(col=>{
      let index = tree.findIndex(p=>p.id == col.pId)
      let newCol = {
        name: this.sSelectore.getCollectionById(col.cId).name,
        id: col.cId
      }
      if(index>-1){
        tree[index].collections.push(newCol)
      } else {
        let profile = this.sSelectore.getProfileById(col.pId)
        tree.push(
          {
            name: profile.name,
            id: profile.id,
            avatar: profile.avatar,
            collections: [newCol]
          }
        )
      }
    })
    return tree
  }


  remove(obj:CollectionProfile){
    if(this.isSelected(obj)){
      this.selectedIds.splice(this.indexOfObj(obj), 1)
    }
  }
  add(obj:CollectionProfile){
    if(!this.isSelected(obj)){
      this.selectedIds.push(obj)
    }
  }
  indexOfObj(obj:CollectionProfile) {
    return this.selectedIds.findIndex(selected=>{
      return selected.cId == obj.cId && selected.pId == obj.pId
    })
  }
  isSelected(obj:CollectionProfile){
    return this.indexOfObj(obj) > -1
  }
  isSelectedView(cid,pid){
    return this.isSelected({cId:cid,pId:pid})
  }
  toggleSelection(cId:string, pId:string, e:MatCheckboxChange){
    let obj:CollectionProfile = {cId: cId, pId:pId};
    if(!this.isSelected(obj) || e.checked == true){
      this.add(obj)
    } else {
      this.remove(obj)
    }
    this.emitSelection()
  }
  
  addAll(){
    this.CollectionProfileGroup.forEach(cp=>{this.add(cp)})
    this.selectedIds = this.selectedIds.slice();
    console.log(this.selectedIds);
     
  }
  removeAll(){
    this.CollectionProfileGroup.forEach(cp=>this.remove(cp))
  }

  emitSelection(){
    this.selectedIdsChange.emit(this.selectedIds)
    console.log(this.selectedIds);
    
  }

  onConfirm(){
    this.selectedIdsChange.emit(this.selectedIds)
    this.confirm.emit(this.selectedIds)
  }
}
