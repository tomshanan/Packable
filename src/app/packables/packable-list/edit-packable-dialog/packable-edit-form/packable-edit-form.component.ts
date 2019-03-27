import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output, ViewChild, OnChanges, SimpleChange, SimpleChanges, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { PackableOriginal, QuantityRule } from '@shared/models/packable.model';
import { WeatherRule } from '@models/weather.model';
import { PackableComplete } from '@shared/models/packable.model';
import { ProfileComplete } from '@shared/models/profile.model';
import { isDefined, titleCase } from '@shared/global-functions';
import { Profile } from '@shared/models/profile.model';
import { ProfileFactory } from '@shared/factories/profile.factory';
import { CollectionComplete } from '@shared/models/collection.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { QuantityRuleListComponent } from './quantity-rule-list/quantity-rule-list.component';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ContextService } from '@app/shared/services/context.service';
import { NameInputChangeEvent } from '@app/shared-comps/name-input/name-input.component';

@Component({
  selector: 'app-packable-edit-form',
  templateUrl: './packable-edit-form.component.html',
  styleUrls: ['./packable-edit-form.component.css'],
  encapsulation: ViewEncapsulation.None,
  
})
export class PackableEditFormComponent implements OnInit, OnChanges {
  constructor(
    private storeSelector: StoreSelectorService,
    private context: ContextService,
  ) {
  }

  @Input() packable: PackableComplete = new PackableComplete()
  @Input() profileGroup: Profile[] = [];
  @Input() selectedProfiles: string[] = [];
  @Input('collection') collectionId: string;
  @Input() isNew: boolean = false;
  @Input() editName: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{
    packable: PackableComplete,
    selectedProfiles: string[]
  }>()

  @ViewChild('editNameInput') editNameInput:ElementRef;
  @ViewChild(QuantityRuleListComponent) QuantityRuleList:QuantityRuleListComponent;
  
  showProfileSelector: boolean = false;
  isDefined = isDefined;
  usedPackableNames: string[] =[];
  packableName: string = ''
  nameValid: boolean = true;


  ngOnInit() {
      this.resetForm()
  }

  resetForm() {
    if (this.isNew) {
      this.packable = new PackableComplete();
      this.packableName = ''
    } else {
      this.packableName = this.packable.name
    }
    this.showProfileSelector = (this.collectionId && this.profileGroup && this.profileGroup.length > 0) ? true : false
    if (this.editName){
      this.usedPackableNames = this.storeSelector.getUsedPackableNames()
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
    if(changes['editName']){
      if (this.editName == true && this.editNameInput){
        this.editNameInput.nativeElement.focus();
      }
    }
  }

  onClose() {
    this.close.emit();
  }
  onConfirm() {
    if (this.editName) {
      this.packable.name = this.packableName
    }
    if(this.valid()){
      this.confirm.emit({
        packable: this.packable,
        selectedProfiles: this.selectedProfiles
      })
    }
  }

  onEditName(e:NameInputChangeEvent) {
    this.nameValid = e.valid;
    if(e.valid){
      this.packableName = titleCase(e.value.trim())
    }
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
    } else if( this.packable.quantityRules.length == 0 || !this.QuantityRuleList.valid){
      valid = false;
    }
    return valid
  }

}
