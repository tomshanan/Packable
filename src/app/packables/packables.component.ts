import { Component, OnInit, ElementRef, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import * as fromApp from '../shared/app.reducers';
import { PackableOriginal, PackableFactory } from '../shared/models/packable.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/memory.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';

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
    private packableFactory: PackableFactory,
    private modalService: NgbModal
   ) { }

  ngOnInit() {
    this.obs_originalPackables =  this.store.select('packables');
    this.obs_originalPackables.subscribe(state =>{
      this.originalPackables = state.packables;
    })
  }

  editPackable(id:number){
    this.memoryService.resetAll();
    let editingPackable = this.packableFactory.makeComplete(this.originalPackables[id]);
    this.memoryService.setPackable(editingPackable)
    this.router.navigate([id], {relativeTo:this.activatedRoute});
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
