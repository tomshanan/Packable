import { Component, OnInit, Renderer2 } from '@angular/core';
import { IconService } from '@app/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { Profile } from '@shared/models/profile.model';
import { StorageService } from '../shared/storage/storage.service';
import { quickTransitionTrigger } from '../shared/animations';
import { WindowService } from '../shared/services/window.service';
import { CollectionComplete } from '../shared/models/collection.model';
import { CollectionFactory } from '../shared/factories/collection.factory';
import { randomBetween } from '@app/shared/global-functions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../shared/css/mat-card-list.css','./home.component.css'],
  animations: [quickTransitionTrigger]
})
export class HomeComponent implements OnInit {
  collections: CollectionComplete[];
  selectedCollections = [];
  selectedIcons:string[] = ['010-boy'];

  testSelected = true;
  
  constructor(
    private store:StoreSelectorService,
    private colFac:CollectionFactory,
    private iconService:IconService,
    private storage: StorageService,
    private windowService: WindowService,
    private rendere: Renderer2,
  ) { 
    // this.icons = iconService.profileIcons.icons.slice()
  }
  log(e){
    console.log(e);
  }
  ngOnInit() {
    let collections = this.store.originalCollections;
    this.collections = this.colFac.makeCompleteArray(collections)
    let randomSelection = randomBetween(0, this.collections.length-1)
    this.selectedCollections.push(this.collections[randomSelection].id)
  }
  
  generateData(){
    if(confirm("This Will override your user data, and save it! Are you sure?")){
      this.storage.generateDummyData();
    }
  }

}
