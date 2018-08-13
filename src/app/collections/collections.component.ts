import { Component, OnInit, OnDestroy, Output, TemplateRef } from '@angular/core';
import * as fromApp from '../shared/app.reducers';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { CollectionPrivate, CollectionOriginal, CollectionComplete, CollectionFactory } from '../shared/models/collection.model';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/memory.service';
import { StoreSelectorService } from '../shared/store-selector.service';
import { ModalComponent } from '../modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit,OnDestroy {
  @Output('test') test:string = 'test worked';
  collectionState_obs: Observable<{collections: CollectionOriginal[]}>
  collectionState_sub: Subscription;
  collections: CollectionComplete[];
  constructor(
    private store:Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService: MemoryService,
    private collectionFactory: CollectionFactory,
    private selectorService: StoreSelectorService,
    private modalService: NgbModal

  ) { }

  ngOnInit() {
    this.collectionState_obs = this.store.select('collections');
    this.collectionState_sub = this.collectionState_obs.subscribe(state =>{
      this.collections = [...state.collections];
      this.collections = this.selectorService.getCompleteCollections(this.collections);
    })
  }

  ngOnDestroy(){
    this.collectionState_sub.unsubscribe();
  }
  editCollection(id:number, collection:CollectionPrivate){
    this.memoryService.resetAll();
    let completeCollection = this.collectionFactory.makeComplete(collection);
    this.memoryService.setCollection(completeCollection);
    this.router.navigate([id], {relativeTo: this.activatedRoute})
  }
  newCollection(){
    this.memoryService.resetAll();
    this.router.navigate(["new"], {relativeTo: this.activatedRoute})
  }
  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
}
