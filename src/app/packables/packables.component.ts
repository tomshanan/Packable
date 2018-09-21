import { Component, OnInit, ElementRef, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromApp from '../shared/app.reducers';
import { PackableOriginal } from '../shared/models/packable.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/memory.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { slugName } from '../shared/global-functions';

@Component({
  selector: 'app-packables',
  templateUrl: './packables.component.html',
  styleUrls: ['./packables.component.css']
})
export class PackablesComponent implements OnInit {
obs_originalPackables: Observable<{packables:PackableOriginal[]}>;
originalPackables: PackableOriginal[] = [];

  constructor(
    private store: Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService:MemoryService,
    private modalService: NgbModal
   ) { }

  ngOnInit() {
    this.obs_originalPackables =  this.store.select('packables');
    this.obs_originalPackables.subscribe(state =>{
      this.originalPackables = state.packables;
    })
  }

  editPackable(packable:PackableOriginal){
    this.memoryService.resetAll();
    this.memoryService.set('ORIGINAL_PACKABLE',packable)
    this.router.navigate([slugName(packable.name)], {relativeTo:this.activatedRoute});
  }

  newPackable(){
    this.memoryService.resetAll();
    this.router.navigate(['new'], {relativeTo:this.activatedRoute});

  }

  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }

}
