import { Component, OnInit, ElementRef, TemplateRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '@shared/app.reducers';
import { PackableOriginal, PackableComplete, QuantityRule } from '@shared/models/packable.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@shared-comps/modal/modal.component';
import { PackableFactory } from '@shared/factories/packable.factory';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { MatDialog, MatCheckboxChange } from '@angular/material';
import { EditPackableDialogComponent } from './edit-packable-dialog/edit-packable-dialog.component';
import { DialogData_EditPackable } from './edit-packable-dialog/edit-packable-dialog.component';
import { WindowService } from '@shared/services/window.service';
import { weatherFactory } from '@app/shared/factories/weather.factory';
import { CollectionComplete } from '@shared/models/collection.model';
import { ProfileComplete } from '@shared/models/profile.model';
import { CollectionFactory } from '@shared/factories/collection.factory';
import { ProfileFactory } from '@shared/factories/profile.factory';
import { PackableEditFormComponent } from './edit-packable-dialog/packable-edit-form/packable-edit-form.component';
import { indexOfId } from '@app/shared/global-functions';
import { expandAndFadeTrigger, addRemoveElementTrigger } from '../../shared/animations';
import { Profile } from '../../shared/models/profile.model';
import { PackablePrivate } from '../../shared/models/packable.model';
import { take } from 'rxjs/operators';
import { isDefined } from '../../shared/global-functions';
import * as packableActions from '@app/packables/store/packables.actions';
import { ConfirmDialog } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';

interface ruleIcon {
  icon: string,
  description: string,
}

interface packableDetails {
  id: string,
  name: string,
  rules: string[],
  icons: ruleIcon[],
  selected: boolean,
  recentlyChanged: boolean
}

type updateViewAction = 'update' | 'add' | 'delete';

@Component({
  selector: 'app-packable-list',
  templateUrl: './packable-list.component.html',
  styleUrls: [
    '../../shared/css/mat-card-list.css',
    './packable-list.component.css'
  ],
  animations: [expandAndFadeTrigger, addRemoveElementTrigger]
})
export class PackableListComponent implements OnInit {


  @Input('collectionId') editingCollectionId: string;
  @Input('profileId') editingProfileId: string;
  @Input() useCard: boolean = false;
  @ViewChild('packableForm') packableForm: PackableEditFormComponent;

  stateSubscription: Subscription;
  completePackables: PackableComplete[];
  packableDetailsArray: packableDetails[];
  createNew: boolean;
  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  dialogData: DialogData_EditPackable = {};
  editList: boolean = false;

  constructor(
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private pacFactory: PackableFactory,
    private proFactory: ProfileFactory,
    private colFactory: CollectionFactory,
    private wcFactory: weatherFactory,
    private windowService: WindowService // for template
  ) { }

  ngOnInit() {
    this.initView()
  }

  initView() {
    this.stateSubscription = combineLatest([
      this.storeSelector.packables_obs,
      this.storeSelector.collections_obs,
      this.storeSelector.profiles_obs
    ]).pipe(take(1)).subscribe(([
      packableState,
      CollectionState,
      profileState]) => {
      console.log('packable state updated:', packableState)

      if (this.editingCollectionId) {
        this.dialogData.collectionId = this.editingCollectionId
        if (this.editingProfileId) {
          this.dialogData.selectedProfiles = [this.editingProfileId]
        }
        this.completePackables = this.pacFactory.makeCompleteFromArray(
          this.storeSelector.getAllPrivatePackables(
            this.editingCollectionId,
            this.editingProfileId //can be null
          )
        )
      } else {
        // no collection is set
        this.completePackables = this.pacFactory.makeCompleteFromArray(packableState.packables); // get packables from store
      }
      this.packableDetailsArray = this.buildViewObjectArray(this.completePackables)

    })
  }
  updateViewObject(ids: string[], action: updateViewAction) {
    this.completePackables = this.pacFactory.makeCompleteFromArray(this.storeSelector.originalPackables);
    if (!this.packableDetailsArray) {
      this.packableDetailsArray = this.buildViewObjectArray(this.completePackables)
    } else if (ids) {
      this.clearRecentlyChanged()
      ids.forEach(id => {
        let index = indexOfId(this.packableDetailsArray, id)
        if (action == 'delete') {
          this.packableDetailsArray.splice(index, 1)
        } else {
          let newObject = this.buildViewObject(this.completePackables.find(p => p.id == id), { recentlyChanged: true })
          if (action == 'update' && index > -1) {
            this.packableDetailsArray.splice(index, 1)
            this.packableDetailsArray.splice(index, 0, newObject)
          } else if (action == 'add') {
            this.packableDetailsArray.splice(0, 0, newObject)
          } else {
            console.warn(`Could not update View for packable id:\n${id}`)
          }
        }
      });
    }
  }
  clearRecentlyChanged() {
    this.packableDetailsArray.forEach(p => {
      p.recentlyChanged = false;
    })
  }
  buildViewObjectArray(packables: PackableComplete[]): packableDetails[] {
    return packables.map(p => {
      return this.buildViewObject(p)
    })
  }
  buildViewObject(p: PackableComplete, options?: { [P in keyof packableDetails]?: any }): packableDetails {
    return {
      id: p.id,
      name: p.name,
      rules: this.pacFactory.getQuantityStrings(p.quantityRules),
      icons: this.wcFactory.getWeatherIcons(p.weatherRules),
      selected: false,
      recentlyChanged: false,
      ...options
    }
  }

  // LIST MANAGEMENT

  toggleEditList(state?: boolean) {
    this.editList = state != null ? state : !this.editList;
    if (!this.editList) {
      this.masterCheckboxToggle(false)
    }
  }
  toggleSelection(id: string, state?: boolean) {
    let p = this.packableDetailsArray.find(p => p.id == id)
    if (!p.selected || state === true) {
      p.selected = true
    } else {
      p.selected = false
    }
  }
  getSelected(): string[] {
    return this.packableDetailsArray.filter(p => p.selected).map(p => p.id);
  }
  checkboxChange(e: MatCheckboxChange, id: string) {
    this.toggleSelection(id, e.checked)
  }

  masterCheckboxIsChecked(): boolean {
    return this.getSelected().length > 0;
  }
  masterCheckboxIsIntermediate(): boolean {
    return this.masterCheckboxIsChecked() && this.getSelected().length < this.packableDetailsArray.length;
  }
  masterCheckboxToggle(state?: boolean) {
    let newState = state != null ? state : !this.masterCheckboxIsChecked();
    this.packableDetailsArray.forEach(p => p.selected = newState)
  }


  // PACKABLE ACTIONS

  clickPackable(id: string) {
    if (this.editList) {
      this.toggleSelection(id)
    } else {
      this.editPackable(id)
    }
  }
  editPackable(packableId: string) {
    let editingPackable: PackableComplete,
      profileGroup: Profile[],
      data: DialogData_EditPackable

    if (this.editingCollectionId) {
      const privatePackable = this.storeSelector.findPrivatePackable(packableId, this.editingCollectionId, this.editingProfileId)
      editingPackable = this.pacFactory.makeComplete(privatePackable)
      profileGroup = this.storeSelector.getProfilesWithCollectionAndPackable(this.editingCollectionId, editingPackable.id)

    } else {
      editingPackable = this.pacFactory.makeCompleteFromIds([packableId])[0];
      profileGroup = this.storeSelector.getProfilesWithPackableId(editingPackable.id)
    }
    data = {
      ...this.dialogData,
      profileGroup: profileGroup,
      pakable: editingPackable,
      isNew: false
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      ...this.dialogSettings,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(ids => {
      this.updateViewObject(ids, 'update')
    })
  }

  newPackable() {
    let editingPackable = new PackableComplete()
    editingPackable.userCreated = true;

    let data: DialogData_EditPackable = {
      ...this.dialogData,
      pakable: editingPackable,
      isNew: true,
    }
    if (this.editingCollectionId) {
      data.profileGroup = this.storeSelector.getProfilesWithCollectionId(this.editingCollectionId)
      console.log(`set profile group:`, data.profileGroup)
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      ...this.dialogSettings,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(ids => {
      this.updateViewObject(ids, 'add')
    })
  }

  deleteSelectedPackables() {
    let ids = this.getSelected()
    this.deletePackables(ids)
  }
  deletePackables(ids: string[]) {
    if (this.editingCollectionId) {
      if (this.editingProfileId) {

      }
    } else {
      // if (confirm(`Are you sure you want to delete these ${ids.length} packables?`)) {
      //   this.store.dispatch(new packableActions.removeOriginalPackables(ids))
      //   this.storeSelector.packables_obs.pipe(take(1)).subscribe(state => {
      //     this.completePackables = this.pacFactory.makeCompleteFromArray(state.packables)
      //     this.updateViewObject(ids, 'delete')
      //   })
      // }
      let names = this.storeSelector.getPackablesByIds(ids).map(p=>p.name);
      let multiple = names.length > 1;
      let header = multiple ? `Delete ${names.length} Packables?` : `Delete ${names[0]}?`
      let content = `If you remove ${multiple ? 'these Packable they' : 'this Packable it'} will also be removed from all Collections and Profiles.<br> Delete anyway?`
      let dialogRef = this.dialog.open(ConfirmDialog, {
        ...this.dialogSettings,
        disableClose: true,
        data: {
          header: header,
          content: content
        },
      });
      dialogRef.afterClosed().pipe(take(1)).subscribe(confirm => {
        if(confirm == true){
          this.store.dispatch(new packableActions.removeOriginalPackables(ids))
          this.storeSelector.packables_obs.pipe(take(1)).subscribe(state => {
            this.completePackables = this.pacFactory.makeCompleteFromArray(state.packables)
            this.updateViewObject(ids, 'delete')
          })  
        }
      })
    }
  }
  openModal(tempRef: TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

  // TEMPLATE HELPERS

  croppedRulesString(rules: string[]): string {
    return rules.length > 1 ? `${rules[0]}...(+${rules.length - 1})` : rules[0]
  }


}
