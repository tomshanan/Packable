import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { Store } from '@ngrx/store';
import * as libraryActions from '@shared/library/library.actions';
import { State as LibraryState, remoteCollection as RemoteCollection } from '@shared/library/library.model';
import { ProfileFactory } from '../../../shared/factories/profile.factory';
import { ContextService } from '../../../shared/services/context.service';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionFactory } from '@app/shared/factories/collection.factory';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../shared/storage/storage.service';
import * as collectionActions from '@app/collections/store/collections.actions';
import { Profile } from '../../../shared/models/profile.model';
import { transitionTrigger } from '../../../shared/animations';
import { PackableComplete,remotePackable} from '../../../shared/models/packable.model';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import * as packableActions from '@app/packables/store/packables.actions';

export interface importCollections_data {
  profileName:string
}

@Component({
  selector: 'app-import-collection-dialog',
  templateUrl: './import-collection-dialog.component.html',
  styleUrls: ['../../../shared/css/dialog.css', './import-collection-dialog.component.css'],
  animations: [transitionTrigger]
})
export class ImportCollectionDialogComponent implements OnInit, OnDestroy {
  profileName: string = '';
  searchString:string = '';
  collections: CollectionComplete[];
  selectedCollections: string[] = [];
  usedCollections: CollectionComplete[];
  loading: boolean = true
  subs: Subscription;
  allRemoteCollections: RemoteCollection[] = []
  step = 1;
  profileGroup: Profile[];
  selectedProfiles: string[];
  localCollections: CollectionComplete[];
  allRemotePackables: remotePackable[];

  constructor(
    private storeSelector:StoreSelectorService,
    private storage: StorageService,
    private store: Store<LibraryState>,
    private proFac:ProfileFactory,
    private pacFac: PackableFactory,
    private colFac: CollectionFactory,
    private context:ContextService,
    private bulkActions: BulkActionsService,
    @Inject(MAT_DIALOG_DATA) public data:importCollections_data,
    public dialogRef: MatDialogRef<ImportCollectionDialogComponent>,

  ) { 
    this.profileName = data.profileName || ''
    this.profileGroup = this.storeSelector.profiles
    this.selectedProfiles = this.context.profileId ? [this.context.profileId] : []
    this.dialogRef.addPanelClass('dialog-full-height')
  }

  ngOnInit() {
    this.subs = this.storeSelector.libraryState_obs.subscribe((state)=>{
      if(state.loading){
        this.loading = true
      } else {
        this.initSelector()
        this.loading = false
      }
    })
    this.store.dispatch(new libraryActions.loadLibrary())
  }
  ngOnDestroy(){
    this.subs.unsubscribe()
  }
  initSelector(){
    this.localCollections = this.colFac.getAllComplete()
    this.allRemoteCollections = this.storeSelector.getRemoteCollections()
    this.allRemotePackables = this.storeSelector.getRemotePackables()
    this.collections = this.colFac.getImportCollectionList()

    if(this.context.profileId){
      this.usedCollections = this.colFac.getAllCompleteFromProfile(this.context.profileId)
    } else {
      this.usedCollections = this.localCollections
    }
  }
  onClose(collections:CollectionComplete[] = []){
    this.dialogRef.close(collections)
  }
  onSelectCollections(){
    this.dialogRef.removePanelClass('dialog-full-height')
    this.dialogRef.addPanelClass('dialog-form')
    if(this.context.profileId){
      this.onSelectProfiles()
    } else {
      this.step++
    }
  }
  back(){
    this.step--
    this.dialogRef.addPanelClass('dialog-full-height')
    this.dialogRef.removePanelClass('dialog-form')

  }
  onSelectProfiles(){
  this.bulkActions.processImportCollections(this.selectedCollections,this.selectedProfiles)    
  let allComplete = this.colFac.getImportCollectionList().filter(c=>this.selectedCollections.includes(c.id))
  this.onClose(allComplete)
  }
}
