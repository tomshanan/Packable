import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MemoryService } from '../shared/memory.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css']
})
export class TripsComponent implements OnInit {

  iterator = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  constructor(
    private modalService:NgbModal, 
    private router:Router, 
    private activeRoute:ActivatedRoute,
    private memoryService: MemoryService) { }

  ngOnInit() {

  }
  openModal(tempRef: TemplateRef<any> ) {
    const modal = this.modalService.open(ModalComponent);
    modal.componentInstance.inputTemplate = tempRef;
  }
  newTrip(){
    this.memoryService.resetAll();
    this.router.navigate(['new'], {relativeTo: this.activeRoute})
  }
}
