import { Component, OnInit, TemplateRef  } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';

import { MatDialog } from '@angular/material';

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
    private modalService: NgbModal,
   ) { }

  ngOnInit() {

  }

  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }


}
