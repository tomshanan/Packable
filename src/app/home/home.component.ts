import { Component, OnInit, Renderer2, TemplateRef } from '@angular/core';
import { IconService } from '@app/core';
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { Profile } from '@shared/models/profile.model';
import { StorageService } from '../shared/storage/storage.service';
import { quickTransitionTrigger } from '../shared/animations';
import { WindowService } from '../shared/services/window.service';
import { CollectionComplete } from '../shared/models/collection.model';
import { CollectionFactory } from '../shared/factories/collection.factory';
import { randomBetween } from '@app/shared/global-functions';
import { ProfileFactory } from '../shared/factories/profile.factory';
import { TripWeatherData } from '../shared/services/weather.service';
import { Trip } from '../shared/models/trip.model';
import { Router, ActivatedRoute } from '@angular/router';
import { TripMemoryService } from '../shared/services/trip-memory.service';
import { AuthService } from '../user/auth.service';
import { Observable } from 'rxjs';
import { Icon } from '../shared-comps/stepper/stepper.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../shared-comps/modal/modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../shared/css/mat-card-list.css','./home.component.css'],
  animations: [quickTransitionTrigger]
})
export class HomeComponent implements OnInit {
  authenticated$: Observable<boolean>;
  helpIcon: Icon = {icon:{type:'mat',name:'help_outline'},text:'Help'}
  loginIcon: Icon = {icon:null,text:'Login'}
  constructor(
    public windowService: WindowService,
    public auth: AuthService,
    private modalService:NgbModal, 
  ) { 
  }

  ngOnInit() {
    this.authenticated$ = this.auth.isAuthenticated$.pipe()
  }

  openModal(tempRef: TemplateRef<any> ) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
}
