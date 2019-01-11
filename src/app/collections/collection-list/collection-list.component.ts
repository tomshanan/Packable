import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { CollectionPanelView } from './collection-panel/collection-panel.component';
import { indexOfId } from '@app/shared/global-functions';
import { transitionTrigger, evaporateTransitionTrigger } from '../../shared/animations';
import { ContextService } from '../../shared/services/context.service';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '@app/core';
import { WindowService } from '../../shared/services/window.service';
import { isDefined } from '../../shared/global-functions';
import { MatExpansionPanel, MatCheckboxChange, MatAccordion } from '@angular/material';
import { SelectedList } from '@app/shared/services/selected-list';

interface CollectionViewObject {
  id: string,
  name: string,
  essential: boolean,
  expanded: boolean,
  panel: CollectionPanelView,
  profileSelector: boolean,
  selectedProfile: string,
  profileGroup: Profile[],
  complete: CollectionComplete
}
@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css'],
  animations: [transitionTrigger, evaporateTransitionTrigger]
})
export class CollectionListComponent implements OnInit, OnChanges {


  @Input() profileId: string;
  @Input() collections: CollectionComplete[];
  currentlyOpenPanel: MatExpansionPanel;
  contextProvided: boolean;
  collectionList: CollectionViewObject[];
  selectedPanel: CollectionPanelView;
  listEditing:boolean = true;
  selected = new SelectedList();

  constructor(
    private context: ContextService,
    private storeSelector: StoreSelectorService,
    private windowService: WindowService
  ) { }

  ngOnInit() {
    this.contextProvided = !!this.profileId
    if (!this.profileId && this.context.profileId) {
      this.profileId = this.context.profileId;
    }
    this.collectionList = this.buildCollectionList(this.collections)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.collectionList && changes['collections']) {
      this.updateCollectionList(this.collections)
    }
  }

  checkboxChange(e:MatCheckboxChange, id:string){
    if(e.checked){
      this.selected.add(id)
    } else {
      this.selected.remove(id)
    }
  }
  masterCheckboxChange(e:MatCheckboxChange){
    if(e.checked){
      this.selectAll()
    } else {
      this.selected.clear()
    }
  }
  isSelected(id:string){
    return this.selected.isSelected(id)
  }
  selectAll(){
    this.selected.add(...this.collectionList.map(c=>c.id))
  }
  toggleListEditing(state?:boolean){
    if(isDefined(state)){
      this.listEditing= state;
    } else{
      this.listEditing = !this.listEditing
    }
    if(this.listEditing && this.currentlyOpenPanel){
      this.collapseCollection(this.context.collectionId)
    }
  }


  updateCollectionList(collections: CollectionComplete[]) {
    if (this.collectionList) {
      collections.forEach(c => {
        if (this.collectionList.idIndex(c.id) === -1) {
          this.collectionList.unshift(this.buildViewObject(c))
        }
      })
    }
    this.collectionList.slice().forEach(c => {
      if (collections.idIndex(c.id) === -1) {
        let i = this.collectionList.idIndex(c.id)
        this.collectionList.splice(i, 1)
      }
    })
  }

  buildCollectionList(collections: CollectionComplete[], withProfiles:boolean=true): CollectionViewObject[] {
    let colList = collections.map(c => this.buildViewObject(c))
    return  withProfiles ? colList.filter(x=>x.profileGroup.length>0) : colList;
  }
  buildViewObject(c: CollectionComplete): CollectionViewObject {
    return {
      id: c.id,
      name: c.name,
      essential: c.essential,
      expanded: false,
      panel: 'list',
      profileSelector: !this.profileId,
      selectedProfile: this.profileId,
      profileGroup: this.storeSelector.getProfilesWithCollectionId(c.id),
      complete: c
    }
  }
  togglePanel(id: string, panel: CollectionPanelView, matPanel: MatExpansionPanel) {
    let col = this.collectionList.findId(id)
    if (col.expanded && col.panel === panel) {
      this.collapseCollection(id)
    } else {
      this.expandCollection(id, matPanel, panel)
    }
  }
  expandCollection(id: string, matPanel: MatExpansionPanel, panel?: CollectionPanelView) {
    let col = this.collectionList.findId(id)
    col.expanded = true;
    console.log(col.selectedProfile);
    if (isDefined(col.selectedProfile)) {
      console.log(`updating context for ${col.name}`);
      this.context.setBoth(col.id,col.selectedProfile)
    }
    if (panel) {
      col.panel = panel
    }
    this.currentlyOpenPanel = matPanel;
    this.currentlyOpenPanel.open()
  }
  collapseCollection(id: string) {
    let col = this.collectionList.findId(id)
    col.expanded = false;
    this.currentlyOpenPanel.close();
    this.currentlyOpenPanel = null;
    this.context.setCollection(null)
  }

  isPanelOpen(id: string, panel: CollectionPanelView) {
    let col = this.collectionList[indexOfId(this.collectionList, id)]
    return col.expanded && col.panel == panel
  }
  getSelectedProfile(id: string): string {
    return this.collectionList.findId(id).selectedProfile
  }
  toggleProfileSelector(id: string) {
    if (!this.profileId) {
      let col = this.collectionList.findId(id)
      col.profileSelector = !col.profileSelector;
    }
  }
  profileSelectorOpen(id: string): boolean {
    let col = this.collectionList.findId(id)
    if (!this.profileId) {
      if (col.profileSelector || !col.selectedProfile) {
        return true
      }
    }
    return false
  }

  changeProfileId(colId: string, selection: string[]) {
    this.setCollectionForPanel(colId, selection[0])
    setTimeout(() => {
      this.toggleProfileSelector(colId)
    }, 0)
  }
  setCollectionForPanel(colId: string, profileId: string) {
    let col = this.collectionList.findId(colId)
    this.context.setBoth(colId,profileId)
    col.selectedProfile = profileId
    col.complete = this.context.getCollection()
  }

  removeCollection(id: string) {
    let profileGroup = this.storeSelector.getProfilesWithCollectionId(id);
    console.log(`REMOVING COLLECTIONs`)
    if (profileGroup.length === 0 || this.contextProvided) {
      let index = this.collections.idIndex(id)
      this.collections.splice(index, 1)
      this.updateCollectionList(this.collections)
    } else {
      let col = this.collectionList.findId(id)
      col.profileSelector = true;
      col.selectedProfile = !!profileGroup.findId(col.selectedProfile)  ? col.selectedProfile : null;
      col.expanded = true;
      setTimeout(()=>{
        col.profileGroup = profileGroup;
        this.context.reset();
      }, 500)
    }
  }
  updateViewObject(colId:string){
    let c = this.collectionList.findId(colId)
    console.log(`UPDATING COLLECTIONs`)
    let profileGroup = this.storeSelector.getProfilesWithCollectionId(c.id);
    if(profileGroup.length !== c.profileGroup.length){
      c.profileSelector = true
    }
    c.complete = this.context.getCollection()
    c.essential = c.complete.essential
    c.name = c.complete.name
    c.selectedProfile = isDefined(profileGroup.findId(c.selectedProfile)) ? c.selectedProfile : null;
    setTimeout(()=>{
      c.profileGroup = this.storeSelector.getProfilesWithCollectionId(c.id)
    }, 500)
  }
}
