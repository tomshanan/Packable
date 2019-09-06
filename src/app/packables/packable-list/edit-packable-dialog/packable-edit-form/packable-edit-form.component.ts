import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output, ViewChild, OnChanges, SimpleChange, SimpleChanges, ElementRef, ChangeDetectorRef, Inject, AfterViewInit } from '@angular/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { PackableOriginal, QuantityRule } from '@shared/models/packable.model';
import { WeatherRule } from '@models/weather.model';
import { PackableComplete } from '@shared/models/packable.model';
import { ProfileComplete } from '@shared/models/profile.model';
import { isDefined, titleCase, hasNameAndId, hasOrigin } from '@shared/global-functions';
import { Profile } from '@shared/models/profile.model';
import { ProfileFactory } from '@shared/factories/profile.factory';
import { CollectionComplete } from '@shared/models/collection.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { QuantityRuleListComponent } from './quantity-rule-list/quantity-rule-list.component';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ContextService } from '@app/shared/services/context.service';
import { NameInputChangeEvent, NameInputComponent } from '@app/shared-comps/name-input/name-input.component';
import { comparableName } from '../../../../shared/global-functions';


export interface editPackableForm_update{
  packable: PackableComplete,
  valid: boolean,
  selectedProfiles: string[],
}

@Component({
  selector: 'app-packable-edit-form',
  templateUrl: './packable-edit-form.component.html',
  styleUrls: ['./packable-edit-form.component.css'],
  encapsulation: ViewEncapsulation.None,
  
})
export class PackableEditFormComponent implements OnInit, OnChanges,AfterViewInit {
  constructor(
    private storeSelector: StoreSelectorService,
    private context: ContextService,
    private cd: ChangeDetectorRef,
  ) {
  }

  @Input() packable: PackableComplete = new PackableComplete()
  @Input() profileGroup: Profile[] = [];
  @Input() selectedProfiles: string[] = [];
  @Input('collection') collectionId: string;
  @Input() isNew: boolean = false;
  @Input() editName: boolean = false;
  

  @Output() update = new EventEmitter<editPackableForm_update>()
  @Output() importRequest = new EventEmitter<string>()

  @ViewChild('nameInput') nameInput:NameInputComponent;
  @ViewChild(QuantityRuleListComponent) quantityRuleComponent:QuantityRuleListComponent;
  
  showProfileSelector: boolean = false;
  isDefined = isDefined;
  usedPackables: Array<hasNameAndId & hasOrigin> =[];
  usedPackableNames: string[] =[];
  packableName: string = ''
  nameValid: boolean = true;
  allowImport:boolean = false;

  ngOnInit() {
      this.resetForm()
  }
  ngAfterViewInit(){
    if(this.editName){
      this.nameValid = this.nameInput.nameInput.valid
      this.cd.detectChanges()
    }
  }

  resetForm() {
    if (this.isNew) {
      this.packable = new PackableComplete();
      this.packableName = ''
      this.nameValid = false;
    } else {
      this.packableName = this.packable.name
    }
    this.showProfileSelector = (this.collectionId && this.profileGroup && this.profileGroup.length > 0) ? true : false
    if (this.editName){
        this.usedPackables = this.storeSelector.getUsedPackableNames()
        this.usedPackableNames = this.usedPackables.map(p=>p.name)
    }
  }

  profileSelect(select:'all'|'none'){
    if (select == 'all'){
      this.selectedProfiles = this.profileGroup.map(p=>p.id)
    } else {
      this.selectedProfiles = [];
    }
  }

  ngOnChanges(changes:SimpleChanges):void {
    if(changes['isNew']){
      this.resetForm();
    }
  }

  emitChange() {
    if (this.editName) {
      this.packable.name = this.packableName
    }
    this.update.emit({
      packable: this.packable,
      valid:this.valid(),
      selectedProfiles: this.selectedProfiles
    })
  }

  onEditName(e:NameInputChangeEvent) {
    this.nameValid = e.valid;
    this.packableName = titleCase(e.value.trim())
    if(e.valid === false){
      let p = this.usedPackables.find(p=>comparableName(p.name) === comparableName(e.value))
      if(p && this.isNew){
        if(p.origin === 'remote' || this.collectionId){
          this.allowImport = true;
        }
      }
    }
    this.emitChange()
  }
  onEditRules(e:QuantityRule[]){
    this.packable.quantityRules = e
    this.emitChange()
  }

  log(e) {
    console.log(e);
  }


  valid():boolean{
    let valid = true;
    if(this.context.profileId && this.showProfileSelector && this.selectedProfiles.length == 0){
      valid = false;
    } else if( this.editName && !this.nameValid){
      valid = false
    } else if( this.packable.quantityRules.length == 0 || !this.quantityRuleComponent.valid){
      valid = false;
    }
    console.log('form validation:'+(valid?'valid':'invalid'))
    return valid
  }

  onImportRequest(name:string){
    if(this.isNew){
      let item = this.usedPackables.find(n=>comparableName(n.name)===comparableName(name))
      if(item){
        this.importRequest.emit(item.id)
      }
    }
  }

}
