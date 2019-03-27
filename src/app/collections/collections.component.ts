import { Component, OnInit, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import * as fromApp from '../shared/app.reducers';
import { Store } from '@ngrx/store';
import { Observable ,  Subscription, combineLatest } from 'rxjs';
import { CollectionPrivate, CollectionOriginal, CollectionComplete } from '../shared/models/collection.model';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/services/memory.service';
import { StoreSelectorService } from '../shared/services/store-selector.service';
import { ModalComponent } from '../shared-comps/modal/modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { slugName } from '../shared/global-functions';
import { CollectionFactory } from '../shared/factories/collection.factory';
import { take } from 'rxjs/operators';
import { ContextService } from '../shared/services/context.service';
import { blockInitialAnimations } from '../shared/animations';
import { StorageService } from '../shared/storage/storage.service';
import { CollectionListComponent } from './collection-list/collection-list.component';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['../shared/css/mat-card-list.css',
  './collections.component.css'],
  animations: [blockInitialAnimations]
  
})
export class CollectionsComponent implements OnInit,OnDestroy {
  @Output('test') test:string = 'test worked';
  @ViewChild('usedCollectionsComponent') usedCollectionsComponent: CollectionListComponent;
  collectionState_obs: Observable<{collections: CollectionOriginal[]}>
  subs: Subscription;
  collections: CollectionComplete[];
  unusedCollections: CollectionComplete[];

  constructor(
    private store:Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private memoryService: MemoryService,
    private collectionFactory: CollectionFactory,
    private storeSelector: StoreSelectorService,
    private storage:StorageService,
    private modalService: NgbModal,
    private context: ContextService,

  ) { }

  ngOnInit() {
    this.context.reset();

    this.subs = this.storeSelector.store_obs.subscribe(([pacState,colState,proState,tripState]) =>{
      console.log('collections - received new state');
      let profiles = proState.profiles
      // collections = select only collections which are being used by a profile
      this.collections = this.collectionFactory.makeCompleteArray(colState.collections).filter(col=>{
        return profiles.some(p=>p.collections.idIndex(col.id)!=-1)
      })
      // unused collections = select only collections which are NOT being used by a profile
      this.unusedCollections = this.collectionFactory.makeCompleteArray(colState.collections).filter(col=>{
        return profiles.every(p=>p.collections.idIndex(col.id)==-1)
      })
    })
  }

  ngOnDestroy(){
    this.subs.unsubscribe();
  }

  openModal(tempRef:TemplateRef<any>) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
}
