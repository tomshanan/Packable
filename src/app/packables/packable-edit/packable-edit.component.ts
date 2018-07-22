import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { PackableOriginal, PackableBlueprint, PackableFactory } from '../../shared/models/packable.model';
import * as packableActions from '../store/packables.actions';
import * as collectionActions from '../../collections/store/collections.actions'
import * as profileActions from '../../profiles/store/profile.actions'
import * as fromApp from '../../shared/app.reducers';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { ProfileComplete } from '../../shared/models/profile.model';
import { CollectionComplete } from '../../shared/models/collection.model';
import { MemoryService } from '../../shared/memory.service';
import { ListEditorService } from '../../shared/list-editor/list-editor.service';
import { StoreSelectorService } from '../../shared/store-selector.service';
import { navParams } from '../../mobile-nav/mobile-nav.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent, modalConfig } from '../../modal/modal.component';

@Component({
  selector: 'app-packable-edit',
  templateUrl: './packable-edit.component.html',
  styleUrls: ['../../shared/css/full-flex.css', './packable-edit.component.css']
})
export class PackableEditComponent implements OnInit, OnDestroy {
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  params: Params;
  navParams: navParams;
  packableForm: FormGroup;
  editingId: string;
  editingPackable: PackableBlueprint;
  editMode = false;
  advancedForm = false;
  usedNames = [];
  profile: ProfileComplete;
  collection: CollectionComplete;

  packablesState_obs: Observable<{ packables: PackableOriginal[] }>;

  RoutesAndPackablesSub: Subscription;

  constructor(
    private store: Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService: MemoryService,
    private listService: ListEditorService,
    private packableFactory: PackableFactory,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.packableForm = new FormGroup({
      'name': new FormControl({ value: '', disabled: false }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-\_\(\)]+$/), this.validate_usedName.bind(this)]),
      'icon': new FormControl({ value: 'baseball-ball', disabled: false }, [Validators.required]), // has default
      'quantityRules': new FormArray([]),
      'activityRules': new FormArray([]),
      'weatherRules': new FormArray([])
    });
    this.profile = this.memoryService.getProfile();
    this.collection = this.memoryService.getCollection();
    this.packablesState_obs = this.store.select('packables');
    const RouteParams = this.activatedRoute.params;
    const RoutesAndPackables = combineLatest(RouteParams, this.packablesState_obs);

    this.RoutesAndPackablesSub = RoutesAndPackables.subscribe(
      ([params, packablesState]) => {
        this.params = params;
        this.usedNames = [];
        for (let packable of packablesState.packables) {
          this.usedNames.push(packable.name.toLowerCase());
        }
        if (this.profile) {
          this.advancedForm = true;
        }
        let memoryPackable = this.memoryService.getPackable();
        if (params['packable']) {
          if (memoryPackable) {
            this.editMode = true;
            this.editingPackable = memoryPackable;
            this.editingId = this.editingPackable.id;
            this.initForm()
          } else {
            this.router.navigate(['../'], { relativeTo: this.activatedRoute })
          }
        } else {
          this.editMode = false;
          this.initForm();
        }
        this.navSetup();
      }
    )

  }

  navSetup() {
    this.navParams = {
      header: this.editingPackable ? this.editingPackable.name : 'New Packable',
      left: {
        enabled: true,
        text: 'Cancel',
        iconClass: 'fas fa-times'
      },
      right: {
        enabled: false,
        text: this.editMode ? 'Save' : 'Create',
        iconClass: 'fas fa-check'
      },
      options: []
    }
    this.editMode
      && this.navParams.options.push({ 
        name: (this.advancedForm ? 'Remove' : 'Delete') +' Packable', 
        actionName: 'delete' 
      })
      && this.advancedForm
      && this.navParams.options.push({ name: 'Restore Default Settings', actionName: 'restore' });
    this.packableForm.statusChanges.subscribe(status => {
      this.navParams.right.enabled = status == 'VALID' ? true : false;
    })
  }
  onOption(action: string) {
    console.log(action);
    switch (action) {
      case 'delete':
        this.delete();
        break;
      case 'restore':
        //restore;
        console.log('restore');
        break;
      default:
        break;
    }
  }
  initForm() {
    if (this.advancedForm && this.editMode) {
      this.packableForm.get('name').disable();
      this.packableForm.get('icon').disable();
    }
    let name: string = '';
    let icon: string = '';

    if (this.editMode == true) {
      name = this.editingPackable.name;
      icon = this.editingPackable.icon;
      this.packableForm.patchValue({
        name: name,
        icon: icon
      })
    }
    if (this.editMode == true && this.editingPackable.quantityRules.length > 0) {
      for (let rule of this.editingPackable.quantityRules) {
        this.addNewRule(rule.amount, rule.type, rule.repAmount);
      }
    } else {
      this.addNewRule();
    }
  }

  validate_usedName(control: FormControl): { [s: string]: boolean } {
    let input = control.value.toLowerCase();
    if (this.usedNames.indexOf(input) !== -1 && (this.editMode === false || input !== this.editingPackable.name.toLowerCase())) {
      return { 'usedName': true };
    }
    return null;
  }

  validate_quantity_repAmount2(control: FormControl): { [s: string]: boolean } {
    let parent = control.parent;
    if (parent) {
      let controlValue = control.value;
      let type = parent.get('type');
      if (type.value == 'period' && controlValue == null) {
        return { 'repAmountMissing': true };
      }
    }
    return null;
  }


  addNewRule(amount: number = 1, period: string = 'period', repAmount: number = 1) {
    (<FormArray>this.packableForm.get('quantityRules')).push(this.newQRuleFormGroup(amount, period, repAmount));
  }

  newQRuleFormGroup = (amount: number, period: string, repAmount: number = 1) => {
    return new FormGroup({
      'amount': new FormControl(amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
      'type': new FormControl(period, [Validators.required]),
      'repAmount': new FormControl(repAmount, [this.validate_quantity_repAmount2.bind(this), Validators.pattern(/^[1-9]+[0-9]*$/)])
    })
  }
  removeQuantityRule(i: number) {
    (<FormArray>this.packableForm.get('quantityRules')).removeAt(i);
  }

  onSubmit() {
    if (this.advancedForm && this.editMode) {
      this.packableForm.get('name').enable();
      this.packableForm.get('icon').enable();
    }
    let formData = this.packableForm.value;
    let newPackableOriginal = new PackableOriginal(formData.name, formData.icon, formData.quantityRules);
    if (this.editMode) {
      newPackableOriginal.id = this.editingPackable.id;
    }
    if (this.advancedForm) {
      newPackableOriginal.activityRules = formData.activityRules;
      newPackableOriginal.weatherRules = formData.weatherRules;
    }
    let newPackablePrivate = this.packableFactory.newPrivatePackable(newPackableOriginal);
    let newPackableComplete = this.packableFactory.makeComplete(newPackablePrivate)
    let profile = this.profile;
    let collection = this.collection;
    if (this.editMode) {
      if (profile) {
        if (collection) {
          let packableIndex = collection.packables.findIndex(p => p.id == this.editingId);
          collection.packables.splice(packableIndex, 1, newPackableComplete)
          this.memoryService.setCollection(collection);
        } else {
          let packableIndex = profile.packables.findIndex(p => p.id == this.editingId);
          profile.packables.splice(packableIndex, 1, newPackableComplete)
          this.memoryService.setProfile(profile);
        }
      } else {
        this.store.dispatch(new packableActions.editOriginalPackable(newPackableOriginal));
      }
    } else {
      this.store.dispatch(new packableActions.addOriginalPackable(newPackableOriginal));
      if (this.params['profile'] || this.params['collection']) {
        let listParams = this.listService.params;
        listParams.originalList.push(newPackableOriginal)
        this.listService.setParams(listParams);
        this.listService.addNewItems([newPackableOriginal]);
      }
    }
    this.return();
  }
  delete() {
    if (this.advancedForm) {
      let profile = this.profile;
      let collection = this.collection;
      if (profile) {
        if (collection) {
          let config: modalConfig = {
            right: { name: 'Remove', class: 'btn-outline-danger' },
            header: 'Remove ' + this.editingPackable.name + '?',
            content: 'If you remove this Packable you will lose the changes you made to its settings and conditions. You will be able to add it back with its default settings.'
          }
          this.openConfirmModal(null, config, () => {
            let packableIndex = collection.packables.findIndex(p => p.id == this.editingId);
            collection.packables.splice(packableIndex, 1);
            this.memoryService.setCollection(collection);
            this.return();
          });
        } else {
          let config: modalConfig = {
            right: { name: 'Remove', class: 'btn-outline-danger' },
            header: 'Remove ' + this.editingPackable.name + '?',
            content: 'If you remove this Packable you will lose the changes you made to its settings and conditions. You will be able to add it back with its default settings.'
          }
          this.openConfirmModal(null, config, () => {
            let packableIndex = profile.packables.findIndex(p => p.id == this.editingId);
            profile.packables.splice(packableIndex, 1)
            this.memoryService.setProfile(profile);
            this.return();
          });
        }
      }
    } else {
      let config: modalConfig = {
        right: { name: 'Delete', class: 'btn-outline-danger' },
        header: 'Delete ' + this.editingPackable.name + '?'
      }
      this.openConfirmModal(this.deleteModal, config, () => {
        this.store.dispatch(new packableActions.removeOriginalPackable(this.editingPackable.id));
        this.store.dispatch(new collectionActions.deletePackable(this.editingPackable.id));
        this.store.dispatch(new profileActions.deletePackable(this.editingPackable.id));
        this.return();
      })
    }
  }

  return() {
    this.memoryService.resetPackable();
    if (this.profile && this.editMode) {
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }
  }
  openModal(tempRef: TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

  openConfirmModal(tempRef: TemplateRef<any>, config: modalConfig, callback: () => void) {
    config.left = { name: 'Cancel', class: 'btn-outline-secondary' }
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
    modal.componentInstance.config = config;
    modal.componentInstance.leftAction.subscribe((action) => {
      modal.close();
    })
    modal.componentInstance.rightAction.subscribe((action) => {
      callback();
      modal.close();
    })
  }

  ngOnDestroy(): void {
    this.RoutesAndPackablesSub.unsubscribe();
  }
}
