import { Component, OnInit, TemplateRef, ViewChild, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, enableProdMode } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '@shared/app.reducers';
import * as packableActions from '@app/packables/store/packables.actions';
import * as profileActions from '@app/profiles/store/profile.actions';
import * as collectionActions from '@app/collections/store/collections.actions';
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
import { expandAndFadeTrigger, addRemoveElementTrigger, blockInitialAnimations } from '../../shared/animations';
import { take } from 'rxjs/operators';
import { ConfirmDialog } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { ChooseProfileDialogComponent, DialogData_ChooseProfiles } from '../../collections/collection-list/collection-panel/choose-profile-dialog/choose-profile-dialog.component';
import { PushPackables_DialogData, PushPackablesDialogComponent } from './push-packables-dialog/push-packables-dialog.component';
import { ContextService } from '../../shared/services/context.service';
import { BulkActionsService } from '../../shared/services/bulk-actions.service';
import { ImportPackablesDialogComponent, importPackables_result } from './import-packables-dialog/import-packables-dialog.component';
import { isDefined, timeStamp } from '../../shared/global-functions';


type updateViewAction = 'update' | 'add' | 'remove';

@Component({
  selector: 'app-packable-list',
  templateUrl: './packable-list.component.html',
  styleUrls: [
    '../../shared/css/mat-card-list.css',
    './packable-list.component.css'
  ],
  animations: [expandAndFadeTrigger, addRemoveElementTrigger, blockInitialAnimations]
})
export class PackableListComponent implements OnInit, OnDestroy, OnChanges {

  @Input('collectionId') inputCollectionId: string; 
  @Input('profileId') inputProfileId: string; 

  editingCollectionId: string; 
  editingProfileId: string; 

  @Input('packables') inputPackables: PackableComplete[];
  @Output() packablesChange = new EventEmitter<PackableComplete[]>()
  @Input() useCard: boolean = false;

  subscription: Subscription;
  packableList: PackableComplete[] = [];
  dialogSettings = {
    width:'auto',
    maxWidth: "99vw",
    maxHeight: "99vh",
    disableClose: true,
    autoFocus: false
  }
  editList: boolean = false;
  selected: string[] = []

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
    public windowService: WindowService // for template
  ) { }

  ngOnInit() {
    this.selected = [];
    this.editList = false;
    this.initView()
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['inputPackables']){
      console.log(`packableList recieved new packables`, this.inputPackables);
      this.initView()
    }
    if(changes['inputCollectionId']){
      console.log(`packableList recieved new collection Id`, this.inputCollectionId);
      this.initView()
    }
    if(changes['inputProfileId']){
      console.log(`packableList recieved new profile id`, this.inputProfileId);
      this.initView()
    }
  }
  ngOnDestroy(){
  }
  
  initView() {
    let newPackables = this.inputPackables ? this.inputPackables.filter(p=>!p.deleted) : []
    if(this.editingProfileId == this.inputProfileId && this.editingCollectionId == this.inputCollectionId){
      // if context stays the same, update the list using compare function
      console.log('PACKABLE LIST:','updating packableList with compare()',this.packableList.slice(),newPackables.slice());
      this.packableList.compare(newPackables,(changeItem,action)=>{
        this.updateViewObject([changeItem],action)
      });
    } else {
      // if the cotnext changed, reset the list completely
      this.selected = [];
      this.editList = false;
      this.packableList = newPackables
    }
    this.editingProfileId = this.inputProfileId
    this.editingCollectionId = this.inputCollectionId
  }

  updateViewObject(newPackables: PackableComplete[], action: updateViewAction) {
    if (!this.packableList) {
      // this.completePackables = this.getCompletePackables()
      this.packableList = this.inputPackables.slice()
    } else if (newPackables) {
      newPackables.forEach(newPackable => {
        let index = this.packableList.idIndex(newPackable.id)
        switch(action){
          case 'add':
            if(index===-1){
              this.packableList.unshift(newPackable)
            }
            break;
          case 'remove':
            if(index!=-1){
              this.packableList.splice(index, 1)
            }
            break;
          case 'update':
            if(index>-1){
              console.log('PACKABLE LIST, updateViewObject replaced packable:',newPackable)
              this.packableList.splice(index,1,newPackable)
            }
            break;
          default:
            console.log('Could not update PackableList view for '+newPackable.name)
        }
      })
      this.packablesChange.emit(this.packableList)
    }
  }
  
  
  // LIST MANAGEMENT
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
    this.context.setBoth(this.editingCollectionId, this.editingProfileId)
    
    editingPackable = this.inputPackables.findId(packableId)
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
      //this.updateViewObject(packables, 'update')
    })
  }

  newPackable() { // EDIT PACKABLE DIALOG CREATES AND STORES THE NEW PACKABLE
    let editingPackable = new PackableComplete()
    editingPackable.userCreated = true;
    this.context.setBoth(this.editingCollectionId, this.editingProfileId)
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
      //this.updateViewObject(packables, 'add')
      this.toggleEditList(false)
      this.selected = []
    })
  }

  pushSelectedPackables(header?:string){
    let ids = this.selected
    let names = this.storeSelector.getPackablesByIds(ids).map(p => p.name);
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
      this.toggleEditList(false)
      this.selected = []
    })
  }
  deleteSelectedPackables() {
    let ids = this.selected.slice()
    let deletePackables = this.packableList.filter(p=>ids.includes(p.id))
    let multiple = ids.length > 1;

    this.context.setBoth(this.editingCollectionId, this.editingProfileId)

    if (this.editingCollectionId) {
      let collectionComplete = this.colFactory.getCompleteById(this.editingCollectionId);
      let data: DialogData_ChooseProfiles = {
        collection: collectionComplete,
        profileGroup: this.storeSelector.getProfilesWithCollectionId(this.editingCollectionId),
        selectedProfiles: this.editingProfileId ? [this.editingProfileId] : [],
        header: 'Choose Profiles',
        content:
          `You are removing <i>${multiple ? deletePackables.length + ' Packables' : deletePackables[0].name}</i> from <i>${collectionComplete.name}</i>.
        <br>Select the Profiles you would like to update:`
      }
      let chooseProfileDIalog = this.dialog.open(ChooseProfileDialogComponent, {
        ...this.dialogSettings,
        disableClose: false,
        data: data
      });
      chooseProfileDIalog.afterClosed().pipe(take(1)).subscribe((profileIds: string[]) => {
        if (isDefined(profileIds)) {
          let CPs = profileIds.map((pid)=>{
            return {pId:pid,cId:this.editingCollectionId}
          })
          this.bulkActions.removePackablesByCP(ids,CPs)
          this.storeSelector.profiles_obs.pipe(take(1)).subscribe(()=>{
            //this.updateViewObject(deletePackables, 'remove') 
            this.toggleEditList(false)
            this.selected = []
          })
        }
        // If editing an original collections, update original collection in store
        if (!this.editingProfileId && this.editingCollectionId){
          let collection = this.storeSelector.getCollectionById(this.editingCollectionId)
          let colPackables = collection.packables.filter(p=>!ids.includes(p.id))
          collection.packables = colPackables
          collection.dateModified = timeStamp()
          this.store.dispatch(new collectionActions.updateOriginalCollections([collection]))
        }
      })

    } else {
      let header = multiple ? `Delete ${deletePackables.length} Packables?` : `Delete ${deletePackables[0].name}?`
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
        console.log('confirmDeleteDialog: returned',confirm,ids);
        if (confirm == true) {
          this.store.dispatch(new packableActions.removeOriginalPackables(ids))
          this.storeSelector.packables_obs.pipe(take(1)).subscribe(() => {
            //this.updateViewObject(deletePackables, 'remove')
            this.toggleEditList(false)
            this.selected = []
          })
        }
      })
    }
  }
  importPackables(){
    this.context.setBoth(this.editingCollectionId, this.editingProfileId)
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
      if(isDefined(result) && isDefined(result.packables) && (!this.editingProfileId || result.selectedProfiles.includes(this.editingProfileId))){
        //this.updateViewObject(result.packables, 'add')
        this.toggleEditList(false)
        this.selected = []
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
