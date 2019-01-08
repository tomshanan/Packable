import { Component, OnInit, TemplateRef, ViewChild, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, enableProdMode } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import { PackableComplete } from '@shared/models/packable.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '@shared-comps/modal/modal.component';
import { PackableFactory } from '@shared/factories/packable.factory';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { EditPackableDialogComponent } from './edit-packable-dialog/edit-packable-dialog.component';
import { DialogData_EditPackable } from './edit-packable-dialog/edit-packable-dialog.component';
import { WindowService } from '@shared/services/window.service';
import { weatherFactory } from '@app/shared/factories/weather.factory';
import { CollectionFactory } from '@shared/factories/collection.factory';
import { ProfileFactory } from '@shared/factories/profile.factory';
import { expandAndFadeTrigger, addRemoveElementTrigger } from '../../shared/animations';
import { take } from 'rxjs/operators';
import * as packableActions from '@app/packables/store/packables.actions';
import { ConfirmDialog } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { ChooseProfileDialogComponent, DialogData_ChooseProfiles } from '../../collections/collection-list/collection-panel/choose-profile-dialog/choose-profile-dialog.component';
import { PushPackables_DialogData, PushPackablesDialogComponent } from './push-packables-dialog/push-packables-dialog.component';
import * as profileActions from '@app/profiles/store/profile.actions';
import * as collectionActions from '@app/collections/store/collections.actions';
import { ContextService } from '../../shared/services/context.service';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { ImportPackablesDialogComponent, importPackables_result } from './import-packables-dialog/import-packables-dialog.component';


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
export class PackableListComponent implements OnInit, OnDestroy, OnChanges {


  editingCollectionId: string; 
  editingProfileId: string; 

  @Input('packables') completePackables: PackableComplete[];
  @Output() packablesChange = new EventEmitter<PackableComplete[]>()
  @Input() useCard: boolean = false;

  subscription: Subscription;
  packableList: PackableComplete[] = [];
  dialogSettings = {
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  editList: boolean;
  selected: string[];
  recentlyChanged: string[];

  constructor(
    private bulkActions:BulkActionsService,
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    private pacFactory: PackableFactory,
    private proFactory: ProfileFactory,
    private colFactory: CollectionFactory,
    private context: ContextService,
    private wcFactory: weatherFactory,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private windowService: WindowService // for template
  ) { }

  ngOnInit() {
    this.initView()
    this.subscription = this.context.changes.subscribe(()=>{
      //this.initView()
    })
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['completePackables']){
      this.initView()
    }
  }
  ngOnDestroy(){
   this.subscription.unsubscribe()
  }
  
  initView() {
    this.editingProfileId = this.context.profileId
    this.editingCollectionId = this.context.collectionId
    this.packableList = this.completePackables.slice();
    this.recentlyChanged = [];
    this.selected = [];
    this.editList = false;
  }

  updateViewObject(packables: PackableComplete[], action: updateViewAction) {
    if (!this.packableList) {
      // this.completePackables = this.getCompletePackables()
      this.packableList = this.completePackables.slice()
    } else if (packables) {
      this.clearRecentlyChanged()
      packables.forEach(p => {
        let index = this.packableList.idIndex(p.id)
        if (action == 'delete' && index != -1) {
          this.packableList.splice(index, 1)
        } else {
          if (action == 'update' && index > -1) {
            let newPackable = this.pacFactory.makeComplete(p)
            this.packableList.splice(index, 1, newPackable)
            this.addRecentlyChanged(p.id)
          } else if (action == 'add' && index == -1) {
            this.packableList.unshift(p)
          } else {
            console.warn(`Could not update View for packable "${p.name}" id:\n${p.id}`)
          }
        }
      });
      this.packablesChange.emit(this.packableList)
    }
  }
  
  
  // LIST MANAGEMENT

  isRecentlyChanged(id): boolean{
    return this.recentlyChanged.includes(id)
  }
  addRecentlyChanged(id){
    if(!this.isRecentlyChanged(id)){
      this.recentlyChanged.push(id)
    }
  }
  removeRecentelyChanged(id){
    if(this.isRecentlyChanged(id)){
      let i = this.recentlyChanged.findIndex(x=>x===id)
      this.recentlyChanged.splice(i,1)
    }
  }
  toggleRecentlyChanged(id){
    if(this.isRecentlyChanged(id)){
      this.removeRecentelyChanged(id)
    } else {
      this.addRecentlyChanged(id)
    }
  }
  clearRecentlyChanged() {
    this.recentlyChanged = []
  }

  
  isSelected(id){
    return this.selected.includes(id)
  }

  toggleEditList(state?: boolean) {
    this.editList = state != null ? state : !this.editList;
    if (!this.editList) {
      this.masterCheckboxToggle(false)
    }
  }
  toggleSelection(id: string, state?: boolean) {
    if(state===true || (state === null && !this.isSelected(id))){
      this.addToSelection(id)
    } else {
      this.removeFromSelection(id)
    }
  }
  addToSelection(id){
    if(!this.isSelected(id)){
      this.selected.push(id)
    }
  }
  removeFromSelection(id){
    if(this.isSelected(id)){
      let i = this.selected.findIndex(x => x==id)
      this.selected.splice(i,1)
    }
  }

  masterCheckboxIsChecked(): boolean {
    return this.selected.length > 0;
  }
  masterCheckboxIsIntermediate(): boolean {
    return this.masterCheckboxIsChecked() && this.selected.length < this.packableList.length;
  }
  masterCheckboxToggle(state?: boolean) {
    let newState = state != null ? state : !this.masterCheckboxIsChecked();
    if(newState){
      this.selected = this.packableList.map(p=>p.id)
    } else {
      this.selected = [];
    }
  }


  // PACKABLE ACTIONS
  
  packableChange(packable:PackableComplete){
    this.updateViewObject([packable], 'update')
  }
  editPackable(packableId: string) { // EDIT PACKABLE DIALOG CREATES AND STORES THE EDITTED PACKABLE
    let editingPackable: PackableComplete,
      data: DialogData_EditPackable

    editingPackable = this.completePackables.findId(packableId)
    data = {
      pakable: editingPackable,
      isNew: false
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      ...this.dialogSettings,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((packables:PackableComplete[]) => {
      console.log(`Received from modal:`, packables);
      this.updateViewObject(packables, 'update')
    })
  }

  newPackable() { // EDIT PACKABLE DIALOG CREATES AND STORES THE NEW PACKABLE
    let editingPackable = new PackableComplete()
    editingPackable.userCreated = true;

    let data: DialogData_EditPackable = {
      pakable: editingPackable,
      isNew: true,
    }
    let dialogRef = this.dialog.open(EditPackableDialogComponent, {
      ...this.dialogSettings,
      data: data,
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe((packables:PackableComplete[]) => {
      console.log(`Received from modal:`, packables);
      this.updateViewObject(packables, 'add')
    })
  }

  pushSelectedPackables(header?:string){
    let ids = this.selected
    console.log(ids)
    let names = this.storeSelector.getPackablesByIds(ids).map(p => p.name);
    console.log(names)
    let multiple = names.length > 1;
    let data: PushPackables_DialogData = {
      content: `Select the Collections and Profiles on which to apply ${multiple ? 'these Packables and their' : 'this Packables and its'} settings.
      <br><small>This will override existing Packables, and add them if missing from collection</small>`,
      header:header|| 'Copy Packables',
      ids: ids,
      collectionName: this.editingCollectionId ? this.storeSelector.getCollectionById(this.editingCollectionId).name : null
    }
    let pushPackablesDialod = this.dialog.open(PushPackablesDialogComponent, {
      ...this.dialogSettings,
      disableClose: false,
      data: data
    });
    pushPackablesDialod.afterClosed().pipe(take(1)).subscribe(()=>{
      this.selected = []
    })
  }
  deleteSelectedPackables() {
    let ids = this.selected.slice()
    let packables = this.packableList.filter(p=>ids.includes(p.id))
    let multiple = ids.length > 1;

    if (this.editingCollectionId) {
      // TO BE CHANGED AS A SINGLE ACTION TO REMOVE FROM LOCAL LIST 
      // THEN PASS ON UPDATED LIST TO LIST CONTAINER
      let collectionComplete = this.colFactory.getCompleteById(this.editingCollectionId);
      let data: DialogData_ChooseProfiles = {
        collection: collectionComplete,
        profileGroup: this.storeSelector.getProfilesWithCollectionId(this.editingCollectionId),
        selectedProfiles: [],
        header: 'Choose Profiles',
        content:
          `You are removing <i>${multiple ? packables.length + ' Packables' : packables[0].name}</i> from <i>${collectionComplete.name}</i>.
        <br>Select the Profiles you would like to update:`
      }
      if (this.editingProfileId) {
        data.selectedProfiles = [this.editingProfileId]
      }
      let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
        ...this.dialogSettings,
        disableClose: false,
        data: data
      });
      chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
        if (profileIds.length > 0) {
          let deletePackables = this.packableList.filter(p=>ids.includes(p.id))
          let CPs = profileIds.map((pid)=>{
            return {pId:pid,cId:this.editingCollectionId}
          })
          this.bulkActions.removePackablesByCP(ids,CPs)
          this.storeSelector.profiles_obs.pipe(take(1)).subscribe(()=>{
            this.updateViewObject(deletePackables, 'delete') 
            this.selected = []
          })
        }
      })

    } else {
      let header = multiple ? `Delete ${packables.length} Packables?` : `Delete ${packables[0].name}?`
      let content = `If you remove ${multiple ? 'these Packables they' : 'this Packable it'} will also be removed from all Collections and Profiles.<br> Delete anyway?`
      let confirmDeleteDialog = this.dialog.open(ConfirmDialog, {
        ...this.dialogSettings,
        disableClose: false,
        data: {
          header: header,
          content: content
        },
      });
      confirmDeleteDialog.afterClosed().pipe(take(1)).subscribe(confirm => {
        if (confirm == true) {
          this.store.dispatch(new packableActions.removeOriginalPackables(ids))
          this.storeSelector.packables_obs.pipe(take(1)).subscribe(() => {
            this.updateViewObject(packables, 'delete')
          })
        }
      })
    }
  }
  importPackables(){
    // get used packables (complete)
    // set header
    let data = {
      header: 'Packables',
      usedPackables: this.packableList
    }
    let importPackablesDialog = this.dialog.open(ImportPackablesDialogComponent, {
      ...this.dialogSettings,
      minWidth: "300px",
      maxWidth: "99vw",
      minHeight: "none",
      maxHeight: "99vh",
      disableClose: false,
      data: data
    });
    importPackablesDialog.afterClosed().pipe(take(1)).subscribe((result:importPackables_result)=>{
      if(!this.context.profileId || result.CPs.some(cp=>cp.pId == this.context.profileId)){
        this.updateViewObject(result.packables, 'add')
      }
    })
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
