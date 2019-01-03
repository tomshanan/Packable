import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { CollectionPanelView } from './collection-panel/collection-panel.component';
import { indexOfId } from '@app/shared/global-functions';
import { transitionTrigger, evaporateTransitionTrigger } from '../../shared/animations';
import { ContextService } from '../../shared/services/context.service';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '@app/core';
import { WindowService } from '../../shared/services/window.service';
import { isDefined } from '../../shared/global-functions';
import { MatExpansionPanel } from '@angular/material';

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

  contextProvided: boolean;
  collectionList: CollectionViewObject[];
  selectedPanel: CollectionPanelView;

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

  updateCollectionList(collections: CollectionComplete[]) {
    if (this.collectionList) {
      collections.forEach(c => {
        if (this.collectionList.idIndex(c.id) === -1) {
          this.collectionList.splice(0, 0, this.buildViewObject(c))
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

  buildCollectionList(collections: CollectionComplete[]): CollectionViewObject[] {
    return collections.map(c => this.buildViewObject(c))
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
      matPanel.close();
    } else {
      this.expandCollection(id, panel)
      matPanel.open()
    }
  }
  expandCollection(id: string, panel?: CollectionPanelView) {
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
  }
  collapseCollection(id: string) {
    let col = this.collectionList.findId(id)
    col.expanded = false;
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
