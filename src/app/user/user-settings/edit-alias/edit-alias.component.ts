import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { StorageService } from '../../../shared/storage/storage.service';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { isDefined } from '../../../shared/global-functions';
import { from } from 'rxjs';
import { actionState } from '../setting-toggle/setting-toggle.component';

@Component({
  selector: 'edit-alias-form',
  templateUrl: './edit-alias.component.html',
  styleUrls: ['./edit-alias.component.css']
})
export class EditAliasComponent implements OnInit, OnChanges {
  @Input() alias: string;
  aliasInput: FormControl;
  editMode: boolean = false;
  actionState: actionState = 'edit';
  usedName: string;
  constructor(
    private storageService: StorageService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.setForm()
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['alias'] && isDefined(this.alias) && isDefined(this.aliasInput)) {
      this.setForm()
    }
  }
  setForm() {
    if (isDefined(this.alias)) {
      this.aliasInput = new FormControl(this.alias,
        [Validators.required,
        Validators.pattern(/^[A-Za-z0-9\_\s]+$/),
        Validators.minLength(4),
        this.usedNameValidator.bind(this)
        ]
      )
    }
  }
  usedNameValidator(control: AbstractControl): { [s: string]: boolean } | null {
    const val = this.normaliseValue(control.value)
    if (this.usedName && val === this.normaliseValue(this.usedName)) {
      return { nameUsed: true }
    }
    return null
  }
  normaliseValue(value: string): string {
    return value.trim().replace(' ', '_').toLowerCase()
  }
  normaliseInput() {
    let value: string = this.aliasInput.value
    if (/([^a-z0-9\_])+/.test(value)) {
      value = this.normaliseValue(value)
      this.aliasInput.setValue(value)
    }
  }


  editAlias(editting: boolean) {
    console.log(`toggle emitted editting:`,editting)
    if (editting) {
      this.editMode = true
      this.checkChange()
    } else {
      this.normaliseInput()
      if (this.hasChanged()) {
        this.editMode = true
        this.aliasInput.disable()
        this.actionState = 'loading';
        const alias = this.aliasInput.value;
        this.storageService.checkAliasAvailable(alias).then((isAvailable) => {
          if (isAvailable) {
            this.userService.changeAlias(alias)
            console.log('ALIAS ACCEPTED:',alias)
            this.editMode = false;
            this.actionState = 'edit'
            this.usedName = null
            this.alias = alias
            this.setForm()
          } else {
            this.actionState = 'cancel'
            this.aliasInput.enable()
            this.usedName = this.aliasInput.value
            this.aliasInput.updateValueAndValidity()
            this.editMode = true;
          }
        }).catch(e=>{
          this.editMode = true;
          this.usedName = null;
          this.aliasInput.enable()
          this.usedName = this.aliasInput.value
          this.aliasInput.updateValueAndValidity()
          this.actionState = 'cancel'
        })
      } else {
        this.actionState = 'edit';
        this.editMode = false;
        this.setForm()
      }
    }
  }
  hasChanged() {
    return this.aliasInput.dirty && this.normaliseValue(this.aliasInput.value) !== this.normaliseValue(this.alias)
  }
  checkChange() {
    console.log(`checking this.editMode`,this.editMode)
    if(this.editMode){
      if (this.hasChanged() && this.aliasInput.valid) {
        this.actionState = 'confirm'
      } else {
        this.actionState = 'cancel'
      }
    } else {
      this.actionState = 'edit'
    }
  }
}
