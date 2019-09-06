import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CollectionComplete, CollectionWithMetadata as RemoteCollection } from '../../../shared/models/collection.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { Store } from '@ngrx/store';
import * as libraryActions from '@shared/library/library.actions';
import { State as LibraryState } from '@shared/library/library.model';
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
import { PackableComplete, PackableOriginalWithMetaData } from '../../../shared/models/packable.model';
import { PackableFactory } from '../../../shared/factories/packable.factory';
import * as packableActions from '@app/packables/store/packables.actions';
import { takeUntil, single, take, first } from 'rxjs/operators';
import { WindowService } from '../../../shared/services/window.service';
import { isDefined } from '../../../shared/global-functions';
import { tripCollectionGroup } from '../../../shared/models/trip.model';

export interface importCollections_data {
  profileName?: string,
  profileGroup?: Profile[],
  usedCollections?: string[],
  selectedProfiles?: string[],
  selectedCollections?:string[],
}
export interface importCollections_result {
  collections: CollectionComplete[],
  profiles: string[],
}
@Component({
  selector: 'app-import-collection-dialog',
  templateUrl: './import-collection-dialog.component.html',
  styleUrls: ['../../../shared/css/dialog.css', './import-collection-dialog.component.css'],
  animations: [transitionTrigger]
})
export class ImportCollectionDialogComponent implements OnInit, OnDestroy {
  profileName: string = '';
  searchString: string = '';
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
  allRemotePackables: PackableOriginalWithMetaData[];

  constructor(
    private storeSelector: StoreSelectorService,
    private store: Store<LibraryState>,
    private colFac: CollectionFactory,
    private context: ContextService,
    private bulkActions: BulkActionsService,
    @Inject(MAT_DIALOG_DATA) public data: importCollections_data,
    public dialogRef: MatDialogRef<ImportCollectionDialogComponent>,
    private windowService: WindowService,

  ) {
    this.profileName = data.profileName || ''
    this.profileGroup = data.profileGroup || this.storeSelector.profiles
    this.selectedProfiles = data.selectedProfiles || (this.context.profileId ? [this.context.profileId] : [])
  }

  ngOnInit() {
    this.loading = true
    this.store.dispatch(new libraryActions.loadLibrary())
    this.subs = this.storeSelector.libraryState$.pipe(first(state=>!state.loading)).subscribe((state) => {
        this.initSelector()
        this.loading = false
    })
  }

  ngOnDestroy() {
    this.subs && this.subs.unsubscribe()
  }
  initSelector() {
    this.localCollections = this.colFac.getAllComplete()
    this.allRemoteCollections = this.storeSelector.getRemoteCollectionsWithMetadata()
    this.allRemotePackables = this.storeSelector.getRemotePackablesWithMetaData()
    this.collections = this.colFac.getImportCollectionList()

    if (this.context.profileId) {
      this.usedCollections = this.colFac.getAllCompleteFromProfile(this.context.profileId)
    } else {
      this.usedCollections = this.localCollections
    }
    if (isDefined(this.data.usedCollections)) {
      this.usedCollections.filter(c => this.data.usedCollections.includes(c.id))
    }
    if(isDefined(this.data.selectedCollections)){
      this.selectedCollections = this.data.selectedCollections
      this.onConfirm()
    } else {
      this.dialogRef.addPanelClass('dialog-tall')
    }
  }
  back() {
    this.step--
    this.dialogRef.addPanelClass('dialog-tall')
  }

  valid(): boolean {
    switch (this.step) {
      case 1:
        return this.selectedCollections.length > 0
      case 2:
        return this.selectedProfiles.length > 0 && !this.context.profileId
    }

  }
  onConfirm() {
    switch (this.step) {
      case 1:
        this.onSelectCollections()
        break;
      case 2:
        this.onSelectProfiles()
        break;
    }
  }
  onSelectCollections() {
    this.dialogRef.removePanelClass('dialog-tall')
    if (this.context.profileId) {
      this.onSelectProfiles()
    } else {
      this.step++
    }
  }

  onSelectProfiles() {
    this.selectedCollections
    let colGorups:tripCollectionGroup[] = this.selectedCollections.map(c=>{
      return {id: c, profiles:this.selectedProfiles}
    })
    this.bulkActions.pushMissingCollectionsToProfiles(colGorups)
    let allComplete = this.collections.filter(c => this.selectedCollections.includes(c.id))
    this.onClose(allComplete, this.selectedProfiles)
  }
  onClose(collections: CollectionComplete[] = [], profiles: string[] = []) {
    this.dialogRef.close(<importCollections_result>{ collections: collections, profiles: profiles })
  }
}
