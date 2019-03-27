import { Component, OnInit, TemplateRef, OnDestroy  } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';

import { MatDialog } from '@angular/material';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { PackableFactory } from '../shared/factories/packable.factory';
import { PackableComplete } from '../shared/models/packable.model';
import { ContextService } from '../shared/services/context.service';
import { blockInitialAnimations } from '../shared/animations';
import { Subscription } from 'rxjs';
import { StorageService } from '../shared/storage/storage.service';

@Component({
  selector: 'app-packables',
  templateUrl: './packables.component.html',
  styleUrls: [
    './packables.component.css'
  ],
})
export class PackablesComponent implements OnInit, OnDestroy {
sub: Subscription;
  constructor(
    public dialog: MatDialog,
    private storeSelector: StoreSelectorService,
    private storage: StorageService,
    private pacFac: PackableFactory,
    private modalService: NgbModal,
    private context: ContextService,
   ) { }

  packables: PackableComplete[];
  deletedPackables: PackableComplete[];
  ngOnInit() {
    this.context.reset();
    this.sub = this.storeSelector.packables_obs.subscribe(state=>{
      console.log('packables recieved new state:',state.packables);
      this.packables = this.pacFac.makeCompleteFromArray(state.packables)
      this.deletedPackables = this.packables.filter(p=>p.deleted)
    })
  }
  ngOnDestroy(){
    this.sub.unsubscribe()
  }
  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }


}
