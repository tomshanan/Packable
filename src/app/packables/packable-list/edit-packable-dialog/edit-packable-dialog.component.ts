import { Component, OnInit, Inject, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { PackableComplete, PackableOriginal } from '@shared/models/packable.model';
import { Profile } from '@app/shared/models/profile.model';
import { StoreSelectorService } from '../../../shared/services/store-selector.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { CollectionProfile } from './choose-collections-form/choose-collections-form.component';
import { weatherFactory } from '@factories/weather.factory';
import { Store } from '@ngrx/store';
import * as packableActions from '@app/packables/store/packables.actions';
import * as fromApp from '@shared/app.reducers';
import { WindowService } from '../../../shared/services/window.service';
import { transitionTrigger } from '../../../shared/animations';
import { timeStamp, isDefined } from '../../../shared/global-functions';
import { ContextService } from '../../../shared/services/context.service';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';
import { editPackableForm_update, PackableEditFormComponent } from './packable-edit-form/packable-edit-form.component';
import { ImportPackablesDialogComponent, importPackables_data, importPackables_result } from '../import-packables-dialog/import-packables-dialog.component';
import { take } from 'rxjs/operators';

export interface EditPackableDialog_data {
  pakable?: PackableComplete,
  limitProfileGroup?: Array<string>,
  limitCollectionGroup?: Array<string>,
  selected?: string[],
  isNew?: boolean,
  usedPackables?: PackableComplete[];
}
export interface EditPackableDialog_result { 
  resultPackable: PackableComplete, 
  newDialogRef: MatDialogRef<any> 
}


@Component({
  selector: 'app-edit-packable-dialog',
  templateUrl: './edit-packable-dialog.component.html',
  styleUrls: ['./edit-packable-dialog.component.css'],
  animations: [transitionTrigger]
})
export class EditPackableDialogComponent implements OnInit, AfterViewInit {
  /*
   RECEIVE PACKABLE-COMPLETE
   SEND BACK UPDATED PACKABLE COMPLETE

  */


  packable: PackableComplete;
  newPackable: PackableOriginal;
  profileGroup: Profile[];
  selectedProfiles: string[] = []
  selectedCollectionProfiles: CollectionProfile[] = []
  collectionId: string;
  collectionName: string;
  isNew: boolean;
  editName: boolean;
  step: number = 1;
  msg: string;
  formValid: boolean = false;
  @ViewChild('packableForm') packableForm: PackableEditFormComponent;

  constructor(
    private storeSelector: StoreSelectorService,
    @Inject(MAT_DIALOG_DATA) public data: EditPackableDialog_data,
    public dialogRef: MatDialogRef<EditPackableDialogComponent>,
    public dialog: MatDialog,
    private wFactory: weatherFactory,
    private store: Store<fromApp.appState>,
    public windowService: WindowService,
    private context: ContextService,
    private bulkActions: BulkActionsService,
    private cd: ChangeDetectorRef,
  ) {
    this.packable = Object.assign(new PackableComplete(), data.pakable)
    this.isNew = data.isNew || false;
    this.editName = this.isNew || (!this.context.collectionId && this.packable.userCreated) || false;
  }


  ngOnInit() {

    this.collectionId = this.context.collectionId || null;
    if (this.collectionId) {
      if (this.isNew) {
        this.profileGroup = this.storeSelector.getProfilesWithCollectionId(this.collectionId)
      } else {
        this.profileGroup = this.storeSelector.getProfilesWithCollectionAndPackable(this.collectionId, this.packable.id)
      }
    } else {
      this.profileGroup = this.storeSelector.getProfilesWithPackableId(this.packable.id)
    }
    if (isDefined(this.data.limitProfileGroup)) {
      this.profileGroup = this.profileGroup.filter(p => this.data.limitProfileGroup.includes(p.id))
    }
    this.selectedProfiles =
      isDefined(this.data.selected) ? this.data.selected
        : (isDefined(this.context.profileId) ? [this.context.profileId]
          : (isDefined(this.context.collectionId) ? this.profileGroup.ids()
            : []));

    this.collectionName = this.collectionId ? this.storeSelector.getCollectionById(this.collectionId).name : null;
  }
  ngAfterViewInit() {
    this.formValid = this.packableForm.valid()
    this.cd.detectChanges()
  }

  onUpdateForm(data: editPackableForm_update) {
    this.formValid = data.valid
    this.packable = data.packable
    this.selectedProfiles = data.selectedProfiles
    console.log(`packable updated`, this.packable)
  }
  onUpdateCollections(CP: CollectionProfile[]) {
    this.selectedCollectionProfiles = CP;
  }

  valid(): boolean {
    let step = this.step
    if (step === 1) {
      return this.formValid
    } else {
      return true
    }
  }
  onConfirm() {
    switch (this.step) {
      case 1:
        this.onConfirmPackable()
        break;
      case 2:
        this.onConfirmCollections()
        break;
    }
  }
  importRequest(id: string) {
    if(this.isNew){
      if(this.collectionId){
        this.context.setCollection(this.collectionId)
        let data: importPackables_data = {
          header: 'Packables',
          usedPackables: this.data.usedPackables,
          selected:[id],
          profileGroup: this.profileGroup,
          selectedProfiles: this.selectedProfiles
        }
        let importDialog = this.dialog.open(ImportPackablesDialogComponent, {
          data: data
        });
        this.onClose(null,importDialog)
      } else {
        this.bulkActions.addMissingPackableIdsFromRemote([id])
        this.onClose(null)
      }
      
    }
  }
  onConfirmPackable() {
    this.packable.dateModified = timeStamp()
    // save original packable
    this.newPackable = new PackableOriginal(
      this.packable.id,
      this.packable.name,
      this.packable.quantityRules.slice(),
      this.wFactory.deepCopy(this.packable.weatherRules),
      this.isNew || this.packable.userCreated,
      this.packable.dateModified,
      this.packable.deleted
    )
    if (this.isNew || !this.collectionId) {
      // update original packable if no collection id is set
      this.msg = "The default Packable settings have been changed succesfully."
      this.store.dispatch(new packableActions.updateOriginalPackables([this.newPackable]))
    }
    if (this.collectionId && !this.context.profileId) {
      // update original collection if no profile id is set
      this.bulkActions.pushOriginalPackablesByCP([this.newPackable], [{ pId: null, cId: this.collectionId }])
    }
    if (this.collectionId && this.selectedProfiles.length > 0) {
      // UPDATE SELECTED PROFILES WITH NEW PRIVATE PACKABLE
      let CPs: CollectionProfile[] = []
      this.selectedProfiles.forEach((pId) => {
        CPs.push({ pId: pId, cId: this.collectionId })
      })
      this.bulkActions.pushOriginalPackablesByCP([this.newPackable], CPs)
      this.onClose(this.packable);
    } else if (!this.collectionId && !this.context.profileId && this.storeSelector.profiles.some(p => p.collections.length > 0)) {
      this.step = 2;
    } else {
      this.onClose(this.newPackable)
    }
  }

  onConfirmCollections() {
    if (this.selectedCollectionProfiles.length > 0) {
      this.bulkActions.pushOriginalPackablesByCP([this.newPackable], this.selectedCollectionProfiles)
    }
    this.onClose(this.packable);
  }
  onClose(newPackable: PackableComplete,newDialogRef:MatDialogRef<any>=null) {
    console.log('EditPackableDialog closing dialog with vars:',newPackable,newDialogRef)
    this.dialogRef.close({resultPackable:newPackable,newDialogRef:newDialogRef});
  }
}
