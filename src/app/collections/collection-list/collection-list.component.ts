import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { indexOfId, timeStamp } from '@app/shared/global-functions';
import { transitionTrigger, evaporateTransitionTrigger, horizontalShringAndFade } from '../../shared/animations';
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
import { Store, select } from '@ngrx/store';
import { ProfileFactory } from '../../shared/factories/profile.factory';
import { CollectionFactory } from '../../shared/factories/collection.factory';
import { ConfirmDialog, ConfirmDialogData } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { NewCollectionDialogComponent } from './new-collection-dialog/new-collection-dialog.component';
import { Subscription } from 'rxjs';
import { PackableFactory } from '../../shared/factories/packable.factory';
import { ImportCollectionDialogComponent } from './import-collection-dialog/import-collection-dialog.component';
import { EditCollectionDialogComponent, editCollectionDialog_data } from './edit-collection-dialog/edit-collection-dialog.component';
import { appColors } from '@app/shared/app-colors';

interface CollectionViewObject {
  id: string,
  name: string,
  essential: boolean,
  expanded: boolean,
  selectedProfile: string,
  profileGroup: Profile[],
  complete: CollectionComplete,
  dateModified: number
}
@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.css'],
  animations: [transitionTrigger, evaporateTransitionTrigger,horizontalShringAndFade]
})
export class CollectionListComponent implements OnInit, OnChanges, OnDestroy {


  @Input() profileId: string;
  @Input('collections') inputCollections: CollectionComplete[];
  currentlyOpenPanel: MatExpansionPanel;
  contextProvided: boolean;
  collectionList: CollectionViewObject[];
  listEditing: boolean = false;
  selected = new SelectedList();
  contextSubscription: Subscription;
  totalProfiles: number = 0;
  subs: Subscription;
  usedByAmount:number = 5;
  constructor(
    private context: ContextService,
    private storeSelector: StoreSelectorService,
    public windowService: WindowService,
    public dialog: MatDialog,
    private store: Store<fromApp.appState>,
    private proFac: ProfileFactory,
    private pacFac: PackableFactory,
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
    } else {
      this.collectionList = this.buildCollectionList(this.getProfileCompleteCollections())
    }
    this.collectionList.sort((a,b)=>{
      return a.profileGroup.length > b.profileGroup.length ? -1 : 1;
    })
    this.subs = this.storeSelector.profiles_obs.subscribe((profileState)=>{
      this.totalProfiles = profileState.profiles.length
    })
    this.subs.add(this.windowService.change.subscribe(()=>{
      if(this.windowService.max('xs')){
        this.usedByAmount = 3
      } else if (this.windowService.max('sm')){
        this.usedByAmount = 4
      } else if (this.windowService.max('md')){
        this.usedByAmount = 5
      } else if (this.windowService.min('md')){
        this.usedByAmount = 6
      }
    }))
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.collectionList && changes['inputCollections']) {
      console.log(`received changes and updated collection list`);
      this.updateCollectionList(this.inputCollections)
    }
    if (this.collectionList && changes['profileId']) {
      console.log(`profile id updated: ${changes['profileId'].previousValue} => ${changes['profileId'].currentValue}`)
      this.collectionList = this.buildCollectionList(this.getProfileCompleteCollections())
    }
  }
  ngOnDestroy(){
    this.subs.unsubscribe();
  }
  getProfileCompleteCollections(): CollectionComplete[]{
    return this.proFac.getCompleteProfilesByIds([this.profileId])[0].collections
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
    console.log('toggleListEditing is state defined:', state != null);
    
    if (state != null) {
      console.log('toggleListEditing state received:',state);
      this.listEditing = state;
    } else {
      console.log('toggleListEditing not received:',state);
      this.listEditing = !this.listEditing
    }
    if (this.listEditing && this.currentlyOpenPanel) {
      this.collapseCollection(this.context.collectionId, true)
    }
    console.log('toggleListEditing:',this.listEditing);
  }

  updateCollectionList(updatedCollections: CollectionComplete[]) {
    let updatedViewObject = this.buildCollectionList(updatedCollections)
    console.log(`updatedViewObject:`, updatedViewObject)
    this.collectionList.compare(updatedViewObject,(newItem,action)=>{
      console.log('UpdateCollectionList: handeling action: ',action,newItem)
      if(action=="remove"){
        this.collectionList.removeIds([newItem])
      } else if (action == 'add'){
        this.collectionList.unshift(newItem)
      } else if (action == 'update'){
        console.log('updateCollectionList: Updating item');
        this.updateViewObject(newItem)
      }
    })
  }

  buildCollectionList(collections: CollectionComplete[]): CollectionViewObject[] {
    let colList = collections.map(c => this.buildViewObject(c))
    return colList;
  }

  buildViewObject(c: CollectionComplete): CollectionViewObject {
    return {
      id: c.id,
      name: c.name,
      essential: c.essential,
      complete: c,
      expanded: false,
      selectedProfile: this.profileId,
      profileGroup: this.storeSelector.getProfilesWithCollectionId(c.id),
      dateModified: c.dateModified
    }
  }

  expandCollection(id: string, matPanel: MatExpansionPanel, forceOpen: boolean = false) {
    let col = this.collectionList.findId(id)
    col.expanded = true;
    console.log('collectionList.expandCollection: expanded',col.complete);
    this.context.setBoth(col.id, col.selectedProfile)    
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

  getSelectedProfile(id: string): string {
    return this.collectionList.findId(id).selectedProfile
  }


  setCollectionForPanel(colId: string, profileId: string) {
    let col = this.collectionList.findId(colId)
    this.context.setBoth(colId, profileId)
    col.selectedProfile = profileId
    col.complete = this.context.getCollection()
  }

  onChangeProfileGroup(id: string) {
    let profileGroup = this.storeSelector.getProfilesWithCollectionId(id);
    let c = this.collectionList.findId(id)
    c.profileGroup.compare(profileGroup);

    // console.log(`REMOVING COLLECTIONs`)
    // if (profileGroup.length === 0 || this.contextProvided) {
    //   this.updateCollectionList(this.inputCollections)
    // } else {
    //   let c = this.collectionList.findId(id)
    //   c.selectedProfile = !!profileGroup.findId(c.selectedProfile) ? c.selectedProfile : null;
    //   c.expanded = true;
    //   c.profileGroup = profileGroup;
    // }
  }
  updateViewObject(newC:CollectionViewObject) {
    console.log(`COLLECTION UPDATING:`, newC)
    delete newC.expanded
    let cIndex = this.collectionList.idIndex(newC.id)
    Object.assign(this.collectionList[cIndex],newC)
    
    console.log('updated item is now:',this.collectionList.findId(newC.id));
  }

  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }

  // BULK ACTIONS

  bulkActionRemoveSelectedCollections() {
    let selectedIds = this.selected.array
    let profiles = this.storeSelector.profiles
    let profile = this.context.getProfile()
    let content = 
      `This will remove the selected Collections from <b>
      ${ profile ? profile.name : 'all Travelers'}</b>, 
      and any custom settings will be gone.<br>
      <span class="text-danger"><b>Are you sure you wish to continue?</b></span>`
    let data: ConfirmDialogData = {
      header: 'Removing Collections',
      content: content
    }
    let confirmDialogRef = this.dialog.open(ConfirmDialog, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    })
    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirm) => {
      if (confirm) {
        if(profile){
          this.bulkActions.removeCollectionsFromProfiles(selectedIds, [profile.id])
        } else{
          this.bulkActions.removeCollectionsFromProfiles(selectedIds, profiles.map(x => x.id))
        }
        this.toggleListEditing(false)
        selectedIds.forEach(id=>{
          this.onChangeProfileGroup(id)
        })
      }
    })
  }

  bulkActionPushCollection(collection: CollectionComplete) {
    console.log('Push Collection Called')
    let revivedPackables = collection.packables.filter(p=>p.deleted).map(p=>this.pacFac.completeToOriginal(p))
    let profiles = this.storeSelector.profiles
    let data: DialogData_ChooseProfiles = {
      collection: collection,
      profileGroup: profiles,
      selectedProfiles: [],
      header: 'Choose Profiles',
      super: 'Adding Collection',
      content: `${revivedPackables.length>0 ? '<p class="my-1">This action will also import the following Packables:<br>'+revivedPackables.map(p=>p.name).join(', ')+"</p>" : ''}Please select the Travelers you would like to add this Collection to:`
    }
    let chooseProfileDialog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDialog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds && profileIds.length > 0) {
        let profilesFiltered = profiles.filter(p=>profileIds.includes(p.id))
        let privateCol = this.colFac.completeToPrivate(collection);
        profileIds.forEach(pId => {
          let profile = profilesFiltered.findId(pId)
          profile = this.proFac.addEditCollection(profile, privateCol)
        });
        revivedPackables.forEach(p=>p.deleted=false)
        this.store.dispatch(new packableActions.updateOriginalPackables(revivedPackables))
        this.store.dispatch(new profileActions.editProfiles(profilesFiltered))
        this.updateCollectionList(this.inputCollections)
        this.toggleListEditing(false)
        this.onChangeProfileGroup(collection.id)
      }
    })
  }

  bulkActionImportCollections(){
    let importCollectionDialog = this.dialog.open(ImportCollectionDialogComponent, {
      ...this.dialogSettings,
      disableClose: true,
      data: {
        profileName:this.context.profileId ? this.context.getProfile().name : ''
      }
    });
    importCollectionDialog.afterClosed().pipe(take(1)).subscribe((collections:CollectionComplete[])=>{
      if(isDefined(collections)){
        this.storeSelector.profiles_obs.pipe(take(1)).subscribe(() => {
          this.updateCollectionList(this.inputCollections)
        })
        this.toggleListEditing(false)
        collections.forEach(col=>{
          this.onChangeProfileGroup(col.id)
        })
      }
    })
  }

  // SINGLE COLLECTION ACTIONS
  actionEditSettings(collection:CollectionViewObject){
    let data: editCollectionDialog_data = {collection:collection.complete,profileGroup:collection.profileGroup}
    this.context.setProfile(this.profileId)
    let editSettingsDialog = this.dialog.open(EditCollectionDialogComponent, {
      ...this.dialogSettings,
      disableClose: true,
      data: data
    })

  }

  actionNewCollection() {
    let newCollection = this.dialog.open(NewCollectionDialogComponent, {
      ...this.dialogSettings,
      disableClose: true,
    });
    newCollection.afterClosed().pipe(take(1)).subscribe((collection: CollectionComplete) => {
      if (collection) {
        console.log(`Created collection:\n`,collection);
        this.storeSelector.profiles_obs.pipe(take(1)).subscribe(() => {
          this.updateCollectionList(this.inputCollections)
        })
        this.toggleListEditing(false)
      }
    })
  }

  actionApplyCollection(collection:CollectionViewObject){
    let usedProfiles = this.storeSelector.getProfilesWithCollectionId(collection.id)
    let data:DialogData_ChooseProfiles = {
      collection: collection.complete,
      profileGroup: usedProfiles,
      selectedProfiles: usedProfiles.map(p=>p.id),
      header: `Select Profiles`,
      content: `<small>This will override existing Collections (including all Packables and settings)</small>`,
      super: `Apply Changes To Travelers`,
    }
    let chooseProfileDialog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDialog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        this.bulkActions.pushCollectionsToProfiles([collection.complete],profileIds)
      }
    })
  }
  actionAddCollection(collection:CollectionViewObject){
    let usedProfiles = this.storeSelector.getProfilesWithCollectionId(collection.id)
    let unusedProfiles = this.storeSelector.profiles.removeIds(usedProfiles)
    console.log(
      'profiles using this collection:',usedProfiles,
    '\nprofiles not using this collection:',unusedProfiles)
    let data:DialogData_ChooseProfiles = {
      collection: collection.complete,
      // profileGroup - get only the profiles that do not use this collection
      profileGroup: unusedProfiles,
      selectedProfiles: unusedProfiles.map(p=>p.id),
      header: `Select Profiles`,
      content: `<small>Select the profiles you would like to add this Collection to.</small>`,
      super: `Applying Collection To Travelers`,

    }
    let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        this.bulkActions.pushCollectionsToProfiles([collection.complete],profileIds)
      }
      this.onChangeProfileGroup(collection.id)
    
    })
  }
  actionRemoveCollection(collection:CollectionViewObject){
    let usedProfiles = this.storeSelector.getProfilesWithCollectionId(collection.id)

    let data:DialogData_ChooseProfiles = {
      collection: collection.complete,
      profileGroup: collection.profileGroup,
      selectedProfiles: this.contextProvided ? [this.profileId] : usedProfiles.map(p=>p.id),
      super: `Deleting ${collection.name}`,
      header: `Select Profiles`,
      content: `Please select the profiles you would like to remove this Collection from`,
    }
    let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
      if (profileIds.length > 0) {
        this.bulkActions.removeCollectionsFromProfiles([collection.id],profileIds)
        this.onChangeProfileGroup(collection.id)
      }
    })
  }
  bulkActionDeleteSelectedCollections(id?:string){
    if(!this.context.profileId){ 
      let selectedIds = id ? [id] : this.selected.array
      let multi = selectedIds.length > 1;
      let content = 
        `This will delete the ${multi ? 'selected collections' : 'collection'} from all Travelers and from this library.<br>
        <span class="text-danger"><b>Are you sure you wish to continue?</b></span>`
      let data: ConfirmDialogData = {
        header: 'Removing Collections',
        content: content
      }
      let confirmDialogRef = this.dialog.open(ConfirmDialog, {
        ...this.dialogSettings,
        disableClose: false,
        data: data
      })
      confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirm) => {
        if (confirm) {
          let profiles = this.storeSelector.profiles
          this.bulkActions.removeCollectionsFromProfiles(selectedIds,profiles.map(p=>p.id))
          this.store.dispatch(new collectionActions.removeOriginalCollections(selectedIds))
          this.toggleListEditing(false)
          
        }
      })  
    }
  }
}
