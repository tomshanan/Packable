import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CollectionComplete } from '../../shared/models/collection.model';
import { indexOfId, timeStamp } from '@app/shared/global-functions';
import { transitionTrigger, evaporateTransitionTrigger, horizontalShringAndFade } from '../../shared/animations';
import { ContextService } from '../../shared/services/context.service';
import { Profile } from '../../shared/models/profile.model';
import { StoreSelectorService } from '@app/core';
import { WindowService } from '../../shared/services/window.service';
import { isDefined, joinSpecial } from '../../shared/global-functions';
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
import { NewCollectionDialogComponent, newCollectionDialog_result } from './new-collection-dialog/new-collection-dialog.component';
import { Subscription } from 'rxjs';
import { PackableFactory } from '../../shared/factories/packable.factory';
import { ImportCollectionDialogComponent, importCollections_result } from './import-collection-dialog/import-collection-dialog.component';
import { EditCollectionDialogComponent, editCollectionDialog_data } from './edit-collection-dialog/edit-collection-dialog.component';
import { AppColors } from '@app/shared/app-colors';
import { tripCollectionGroup, Trip } from '../../shared/models/trip.model';
import { TripMemoryService } from '../../shared/services/trip-memory.service';

interface CollectionViewObject {
  id: string,
  name: string,
  essential: boolean,
  expanded: boolean,
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


  @Input() optionsEnabled: boolean = true;
  @Input('profileId') inputProfileId: string; 
  profileId: string;  // defaults to context.profileId if inputProfile is null
  @Input('collections') inputCollections: CollectionComplete[];
  currentlyOpenPanel: MatExpansionPanel;
  collectionList: CollectionViewObject[];
  listEditing: boolean = false;
  selected = new SelectedList();
  contextSubscription: Subscription;
  totalProfiles: number = 0; // for template
  subs: Subscription;
  usedByAmount:number = 5;

  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }

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
    private tripMemory: TripMemoryService,
  ) { }

  ngOnInit() {
    if (!this.inputProfileId && this.context.profileId) {
      this.inputProfileId = this.context.profileId;
    }
    this.profileId = this.inputProfileId
    this.collectionList = this.buildCollectionList(this.inputCollections)
    this.initialSort()

    
    this.subs = this.storeSelector.profiles$.subscribe((profileState)=>{
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
    if (this.collectionList && changes['inputCollections'] && this.profileId === this.inputProfileId) {
      console.log('collection list update');
      this.updateCollectionList(this.inputCollections)
    }
    if (this.collectionList && changes['inputProfileId'] && this.profileId !== this.inputProfileId){
      if(this.currentlyOpenPanel){
        this.collapseCollection(this.context.collectionId, true)
      }
      this.profileId = this.inputProfileId
      this.collectionList = this.buildCollectionList(this.inputCollections)
      this.initialSort()
    }
  }
  ngOnDestroy(){
    this.subs.unsubscribe();
  }
  getProfileCompleteCollections(profileId:string): CollectionComplete[]{
    return this.proFac.getCompleteProfilesByIds([profileId])[0].collections
  }
  initialSort(){
    this.collectionList.sort((a,b)=>{
      return a.name > b.name ? -1 : 1;
    })
    if(this.profileId){
      this.collectionList.sort((a,b)=>{
        return a.essential ? (b.essential ? 0 : -1) : (b.essential ? 1 : 0)
      })
    } else {
      this.collectionList.sort((a,b)=>{
        return a.profileGroup.length > b.profileGroup.length ? -1 : 1;
      })
    }
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
        this.collectionList.removeElements([newItem])
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
      profileGroup: this.getProfileGroup(c.id),
      dateModified: c.dateModified
    }
  }
  updateViewObject(newC:CollectionViewObject) {
    delete newC.expanded
    let oldC = this.collectionList.findId(newC.id)
    Object.assign(oldC,newC)
    console.log('updateCollectionList, updated',oldC)
  }
  getProfileGroup(id:string):Profile[]{
    return this.storeSelector.getProfilesWithCollectionId(id)
  }
  updateProfileGroup(id: string) {
    const profileGroup:Profile[] = this.getProfileGroup(id)
    let c = this.collectionList.findId(id)
    c && c.profileGroup.compare(profileGroup);
  }

  expandCollection(id: string, matPanel: MatExpansionPanel, forceOpen: boolean = false) {
    let col = this.collectionList.findId(id)
    col.expanded = true;
    console.log('collectionList.expandCollection: expanded',col.complete);
    this.context.setCollection(col.id)    
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
          this.bulkActions.removeCollectionsFromProfilesAndTrips(selectedIds, [profile.id])
        } else{
          this.bulkActions.removeCollectionsFromProfilesAndTrips(selectedIds, profiles.map(x => x.id))
        }
        this.toggleListEditing(false)
        selectedIds.forEach(id=>{
          this.updateProfileGroup(id)
        })
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
    importCollectionDialog.afterClosed().pipe(take(1)).subscribe((r:importCollections_result)=>{
      if(isDefined(r.collections)){
        this.toggleListEditing(false)
        r.collections.forEach(col=>{
          this.updateProfileGroup(col.id)
        })
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
        header: 'Deleting Collections',
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
          this.bulkActions.removeCollectionsFromProfilesAndTrips(selectedIds,profiles.map(p=>p.id))
          this.store.dispatch(new collectionActions.removeOriginalCollections(selectedIds))
          this.toggleListEditing(false)
        }
      })  
    }
  }
  // SINGLE COLLECTION ACTIONS
  actionEditSettings(collection:CollectionViewObject){
    let data: editCollectionDialog_data = {
      collection:collection.complete,
      profileGroup:collection.profileGroup
    }
    let editSettingsDialog = this.dialog.open(EditCollectionDialogComponent, {
      ...this.dialogSettings,
      disableClose: true,
      data: data
    })

  }
  actionNewCollection() {
    let newCollectionDialog = this.dialog.open(NewCollectionDialogComponent, {
      ...this.dialogSettings,
      disableClose: true,
    });
    newCollectionDialog.afterClosed().pipe(take(1)).subscribe((result: newCollectionDialog_result) => {
      if (result.collection) {
        console.log(`Created collection:\n`,result.collection);
        this.toggleListEditing(false)
      }
    })
  }

  actionApplyCollection(collection:CollectionViewObject){
    let usedProfiles = collection.profileGroup
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
        this.bulkActions.pushCompleteCollectionsToProfiles([collection.complete],profileIds)
      }
    })
  }
  actionAddCollection(collection:CollectionViewObject){
    let usedProfiles = collection.profileGroup
    let unusedProfiles = this.storeSelector.profiles.removeElements(usedProfiles)
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
      if (profileIds && profileIds.length > 0) {
        this.bulkActions.pushCompleteCollectionsToProfiles([collection.complete],profileIds)
      }
      this.updateProfileGroup(collection.id)
      
    })
  }
  actionRemoveCollection(collection:CollectionViewObject){
    let usedProfiles = collection.profileGroup

    let data:DialogData_ChooseProfiles = {
      collection: collection.complete,
      profileGroup: collection.profileGroup,
      selectedProfiles: this.profileId ? [this.profileId] : usedProfiles.map(p=>p.id),
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
        this.bulkActions.removeCollectionsFromProfilesAndTrips([collection.id],profileIds)
        this.updateProfileGroup(collection.id)

      }
    })
  }
}
