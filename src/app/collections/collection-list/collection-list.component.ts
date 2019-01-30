import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { CollectionPanelView } from './collection-panel/collection-panel.component';
import { indexOfId } from '@app/shared/global-functions';
import { transitionTrigger, evaporateTransitionTrigger } from '../../shared/animations';
import { ContextService } from '../../shared/services/context.service';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '@app/core';
import { WindowService } from '../../shared/services/window.service';
import { isDefined } from '../../shared/global-functions';
import { MatExpansionPanel, MatCheckboxChange, MatAccordion, MatDialog } from '@angular/material';
import { SelectedList } from '@app/shared/services/selected-list';
import { DialogData_ChooseProfiles, ChooseProfileDialogComponent } from './collection-panel/choose-profile-dialog/choose-profile-dialog.component';
import { take } from 'rxjs/operators';
import * as fromApp from '@shared/app.reducers';
import * as packableActions from '@app/packables/store/packables.actions';
import * as profileActions from '@app/profiles/store/profile.actions';
import * as collectionActions from '@app/collections/store/collections.actions';
import { Store } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { ConfirmDialog, ConfirmDialogData } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { NewCollectionDialogComponent } from './new-collection-dialog/new-collection-dialog.component';
import { Subscription } from 'rxjs';

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
export class CollectionListComponent implements OnInit, OnChanges, OnDestroy {


  @Input() profileId: string;
  @Input('collections') inputCollections: CollectionComplete[];
  currentlyOpenPanel: MatExpansionPanel;
  contextProvided: boolean;
  collectionList: CollectionViewObject[];
  unusedCollectionList: CollectionComplete[];
  selectedPanel: CollectionPanelView;
  listEditing: boolean = false;
  selected = new SelectedList();
  contextSubscription: Subscription;

  constructor(
    private context: ContextService,
    private storeSelector: StoreSelectorService,
    public windowService: WindowService,
    public dialog: MatDialog,
    private store: Store<fromApp.appState>,
    private proFac: ProfileFactory,
    private colFac: CollectionFactory,
    private bulkActions: BulkActionsService,
  ) { }

  ngOnInit() {
    this.contextProvided = !!this.profileId
    if (!this.profileId && this.context.profileId) {
      this.profileId = this.context.profileId;
    }
    if (!this.contextProvided) {
      this.collectionList = this.buildCollectionList(this.inputCollections)
      this.unusedCollectionList =
        this.buildCollectionList(this.inputCollections, true)
          .filter(x => x.profileGroup.length === 0)
          .map(x => x.complete)
    } else {
      this.collectionList = this.buildCollectionList(this.getProfileCompleteCollections())
    }
    // this.contextSubscription = this.context.changes.subscribe(()=>{
    //   this.profileId = this.context.profileId;
    // })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.collectionList && changes['collections']) {
      this.updateCollectionList(this.inputCollections)
      console.log(`received changes and updated collection list`);
      this.updateUnusedCollectionList(this.inputCollections)
    }
    if (this.collectionList && changes['profileId']) {
      this.collectionList = this.buildCollectionList(this.getProfileCompleteCollections())
    }
  }
  ngOnDestroy(){
    // this.contextSubscription.unsubscribe();
  }
  getProfileCompleteCollections(): CollectionComplete[]{
    return this.proFac
    .getCompleteProfiles(this.storeSelector.profiles)
    .findId(this.profileId)
    .collections
  }
  checkboxChange(e: MatCheckboxChange, id: string) {
    if (e.checked) {
      this.selected.add(id)
    } else {
      this.selected.remove(id)
    }
  }
  masterCheckboxChange(e: MatCheckboxChange) {
    if (e.checked) {
      this.selectAll()
    } else {
      this.selected.clear()
    }
  }
  isSelected(id: string) {
    return this.selected.isSelected(id)
  }
  selectAll() {
    this.selected.add(...this.collectionList.map(c => c.id))
  }
  toggleListEditing(state?: boolean) {
    this.selected.clear()
    if (isDefined(state)) {
      this.listEditing = state;
    } else {
      this.listEditing = !this.listEditing
    }
    if (this.listEditing && this.currentlyOpenPanel) {
      this.collapseCollection(this.context.collectionId, true)
    }
  }


  updateCollectionList(collections: CollectionComplete[], includeUnused: boolean = false) {
    if (this.collectionList) {
      collections.forEach(c => {
        if (this.collectionList.idIndex(c.id) === -1) {
          let viewObj = this.buildViewObject(c)
          if (includeUnused || viewObj.profileGroup.length > 0) {
            this.collectionList.unshift(viewObj)
          }
        }
      })
    }
    this.collectionList.slice().forEach(c => {
      let remove = false;
      if (collections.idIndex(c.id) === -1) {
        remove = true;
      } else {
        let viewObj = this.buildViewObject(collections.findId(c.id))
        if (!includeUnused && viewObj.profileGroup.length === 0) {
          remove = true;
        }
      }
      if (remove) {
        let i = this.collectionList.idIndex(c.id)
        this.collectionList.splice(i, 1)
      }
    })
  }
  updateUnusedCollectionList(collections: CollectionComplete[]) {
    if (!this.contextProvided) {
      this.unusedCollectionList =
        this.buildCollectionList(collections, true)
          .filter(x => x.profileGroup.length === 0)
          .map(x => x.complete)
      console.log('unused collection list updated:\n', this.unusedCollectionList)
    }
  }

  buildCollectionList(collections: CollectionComplete[], includeUnused: boolean = false): CollectionViewObject[] {
    let colList = collections.map(c => this.buildViewObject(c))
    return !includeUnused ? colList.filter(x => x.profileGroup.length > 0) : colList;
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
      this.collapseCollection(id, true)
    } else {
      this.expandCollection(id, matPanel, true, panel)
    }
  }
  expandCollection(id: string, matPanel: MatExpansionPanel, forceOpen: boolean = false, panel?: CollectionPanelView) {
    let col = this.collectionList.findId(id)
    col.expanded = true;
    console.log(col.selectedProfile);
    if (isDefined(col.selectedProfile)) {
      console.log(`updating context for ${col.name}`);
      this.context.setBoth(col.id, col.selectedProfile)
    }
    if (panel) {
      col.panel = panel
    }
    this.currentlyOpenPanel = matPanel;
    if (forceOpen) {
      this.currentlyOpenPanel.open()
    }
  }
  collapseCollection(id: string, forceClose: boolean = false) {
    let col = this.collectionList.findId(id)
    col.expanded = false;
    if (forceClose) {
      this.currentlyOpenPanel.close();
    }
    this.currentlyOpenPanel = null;
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
    this.context.setBoth(colId, profileId)
    col.selectedProfile = profileId
    col.complete = this.context.getCollection()
  }

  removeCollection(id: string) {
    let profileGroup = this.storeSelector.getProfilesWithCollectionId(id);
    console.log(`REMOVING COLLECTIONs`)
    if (profileGroup.length === 0 || this.contextProvided) {
      let index = this.inputCollections.idIndex(id)
      //this.inputCollections.splice(index, 1)
      this.updateCollectionList(this.inputCollections)
      this.updateUnusedCollectionList(this.inputCollections)
    } else {
      let col = this.collectionList.findId(id)
      col.profileSelector = true;
      col.selectedProfile = !!profileGroup.findId(col.selectedProfile) ? col.selectedProfile : null;
      col.expanded = true;
      setTimeout(() => {
        col.profileGroup = profileGroup;
        this.context.reset();
      }, 500)
    }
  }
  updateViewObject(colId: string) {
    let c = this.collectionList.findId(colId)
    console.log(`UPDATING COLLECTIONs`)
    let profileGroup = this.storeSelector.getProfilesWithCollectionId(c.id);
    if (profileGroup.length !== c.profileGroup.length) {
      c.profileSelector = true
    }
    c.complete = this.context.getCollection()
    c.essential = c.complete.essential
    c.name = c.complete.name
    c.selectedProfile = isDefined(profileGroup.findId(c.selectedProfile)) ? c.selectedProfile : null;
    setTimeout(() => {
      c.profileGroup = this.storeSelector.getProfilesWithCollectionId(c.id)
    }, 500)
  }

  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }

  removeSelectedCollections() {
    let selectedIds = this.selected.array
    let profiles = this.storeSelector.profiles
    let data: ConfirmDialogData = {
      header: 'Removing Collections',
      content: 'This will remove the selected collections from all Travelers, and any custom settings will be gone.<br><span class="text-danger"><b>Are you sure you wish to continue?</b></span>',
    }
    let confirmDialogRef = this.dialog.open(ConfirmDialog, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    })
    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirm) => {
      if (confirm) {
        this.bulkActions.removeCollectionsFromProfiles(selectedIds, profiles.map(x => x.id))
        this.storeSelector.profiles_obs.pipe(take(1)).subscribe(() => {
          this.updateCollectionList(this.inputCollections)
          this.updateUnusedCollectionList(this.inputCollections)
          this.selected.clear()
        })
      }
    })
  }

  pushCollection(collection: CollectionComplete) {
    console.log('Push Collection Called')
    let profiles = this.storeSelector.profiles
    let data: DialogData_ChooseProfiles = {
      collection: collection,
      profileGroup: profiles,
      selectedProfiles: [],
      header: 'Choose Profiles',
      super: 'Adding Collection',
      content: `Please select the Travelers you would like to add this Collection to:`
    }
    let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        let privateCol = this.colFac.completeToPrivate(collection);
        profileIds.forEach(pId => {
          let profile = profiles.findId(pId)
          profile = this.proFac.addEditCollection(profile, privateCol)
        });
        this.store.dispatch(new profileActions.setProfileState(profiles))
        this.updateCollectionList(this.inputCollections)
        this.updateUnusedCollectionList(this.inputCollections)
        this.selected.clear()
      }
    })
  }
  newCollection() {
    let newCollection = this.dialog.open(NewCollectionDialogComponent, {
      ...this.dialogSettings,
      disableClose: true,
    });
    newCollection.afterClosed().pipe(take(1)).subscribe((collection: CollectionComplete) => {
      if (collection) {
        console.log(`Created collection:\n`,collection);
        this.storeSelector.profiles_obs.pipe(take(1)).subscribe(() => {
          this.updateCollectionList(this.inputCollections)
          this.updateUnusedCollectionList(this.inputCollections)
        })
      }
    })
  }
}
