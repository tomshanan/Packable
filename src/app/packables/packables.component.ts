import { Component, OnInit, TemplateRef  } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';

import { MatDialog } from '@angular/material';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { PackableFactory } from '../shared/factories/packable.factory';
import { PackableComplete } from '../shared/models/packable.model';
import { ContextService } from '../shared/services/context.service';

@Component({
  selector: 'app-packables',
  templateUrl: './packables.component.html',
  styleUrls: [
    './packables.component.css'
  ]
})
export class PackablesComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private storeSelector: StoreSelectorService,
    private pacFac: PackableFactory,
    private modalService: NgbModal,
    private context: ContextService,
   ) { }

  packables: PackableComplete[];
  ngOnInit() {
    this.context.reset();
    let originals = this.storeSelector.originalPackables
    this.packables = this.pacFac.makeCompleteFromArray(originals)
  }

  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }


}
