import { Component, OnInit, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../shared/app.reducers';
import { PackableOriginal, PackableComplete, QuantityRule } from '../shared/models/packable.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';
import { PackableFactory } from '../shared/factories/packable.factory';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { Profile } from '../shared/models/profile.model';
import { PackableEditFormComponent } from './packable-edit-form/packable-edit-form.component';
import { MatDialog } from '@angular/material';
import { EditPackableDialogComponent } from '@app/shared-comps/dialogs/edit-packable-dialog/edit-packable-dialog.component';
import { DialogData_EditPackable } from '../shared-comps/dialogs/edit-packable-dialog/edit-packable-dialog.component';
import { WindowService } from '../shared/services/window.service';
import { weatherFactory } from '@app/shared/factories/weather.factory';
import { decodeHtml } from '@app/shared/global-functions';

interface ruleIcon {
  icon: string,
  description: string,
}

interface packableDetails {
  id: string,
  name: string,
  rules: string[],
  icons: ruleIcon[]
}
@Component({
  selector: 'app-packables',
  templateUrl: './packables.component.html',
  styleUrls: ['./packables.component.css']
})
export class PackablesComponent implements OnInit {
obs_originalPackables: Observable<{packables:PackableOriginal[]}>;
originalPackables: PackableOriginal[] = [];
packableDetailsArray: packableDetails[];
editingPackableProfileGorup:Profile[];
createNew: boolean;
dialogSettings = {
  maxWidth: "99vw",
  maxHeight: "99vh",
  disableClose: true,
  autoFocus: false
}

@ViewChild('packableForm') packableForm: PackableEditFormComponent;

  constructor(
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    public dialog: MatDialog,
    private modalService: NgbModal,
    private pacFactory: PackableFactory,
    private wcFactory: weatherFactory,
   ) { }

  ngOnInit() {
    this.obs_originalPackables =  this.store.select('packables');
    this.obs_originalPackables.subscribe(state =>{
      console.log('packable state updated:',state)
      this.originalPackables = state.packables;
      this.packableDetailsArray = this.buildViewObject(this.originalPackables)
      console.log(this.packableDetailsArray);
          })
    
  }

  buildViewObject(packables:PackableOriginal[]):packableDetails[]{
    return packables.map(p => {
      return {
        id: p.id,
        name: p.name,
        rules: this.pacFactory.getQuantityStrings(p.quantityRules),
        icons: this.wcFactory.getWeatherIcons(p.weatherRules) // compiles list of icons for weather rules <===================
      }
    })
  }

  editPackable(packableId:string){
    let editingPackable =this.pacFactory.makeCompeleteFromIds([packableId])[0];
    let dialogData:DialogData_EditPackable = {
      pakable: editingPackable,
      profileGroup: this.storeSelector.getProfilesWithPackableId(editingPackable.id),
      selectedProfiles: [],
      collection: null,
      isNew: false
    }
    this.dialog.open(EditPackableDialogComponent, {
      ...this.dialogSettings,   
      data: dialogData,
    });
  }

  newPackable(){
    let editingPackable =  new PackableComplete()
    editingPackable.userCreated = true;

    let dialogData:DialogData_EditPackable = {
      pakable: editingPackable,
      profileGroup: this.storeSelector.getProfilesWithPackableId(editingPackable.id),
      selectedProfiles: [],
      collection: null,
      isNew: true,
    }
    this.dialog.open(EditPackableDialogComponent, {
      ...this.dialogSettings,   
      data: dialogData,
    });
  }

  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }


}
