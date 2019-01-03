import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';
import { slideInTrigger } from '../../shared/animations';
import { isDefined } from '../../shared/global-functions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.css'],
  animations: [slideInTrigger]
})
export class ProfileSelectorComponent implements OnInit, OnChanges {
  
  @Input() profiles: Profile[] = []
  @Input() selected: string[] = [];
  @Input() iconWidth: string = '50px';
  @Input() multiselect: boolean = false;
  @Input() showNames:boolean = true;
  @Output() selectedChange = new EventEmitter<string[]>();
  
  selectedView: string[] = []
  profilesView: Profile[]=[]
  ready: boolean;
  readySubject = new Subject<boolean>()

  /*
  <profile-selector 
    iconWidth="50px" 
    [profiles]="profileGroup" 
    [(selected)]="selectedProfiles" 
    [multiselect]="true"
    [showNames]="true">
  </profile-selector>
  */
  constructor() {
    
   }

  ngOnInit() {
    this.ready = false;
    this.readySubject.next(this.ready)
    this.selectedView = this.selected.slice().clearUndefined();
    if(this.selectedView.length>0){
      let tempProfileView: Profile[] = []
      this.selectedView.forEach(id=>{
        let i = this.profiles.idIndex(id)
        let removed = this.profiles.slice().splice(i,1)
        tempProfileView = [...removed, ...tempProfileView]
      })
      this.profilesView = tempProfileView;
    } else {
      this.profilesView = this.profiles.slice();
    }
    this.ready = true;
    this.readySubject.next(this.ready)
    this.readySubject.complete()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedView && changes['selected']) {
      this.selectedView = this.selected.slice();
    }
    if (this.profilesView.length>0 && changes['profiles']) {
      if(this.ready){
        this.compare();
      } else {
        this.readySubject.subscribe(ready=>{
          if(ready){
            this.compare()
          }
        })
      }
      
    }
  }
  compare(){
    if(this.profilesView.length>0 && this.profiles.length>0){
      this.profiles.forEach(item => {
        if(this.profilesView.idIndex(item.id)<0){
          this.profilesView.unshift(item)
        }
      })
      this.profilesView.slice().forEach((item) =>{
        if(this.profiles.idIndex(item.id)<0){
          const i = this.profilesView.idIndex(item.id)
          this.profilesView.splice(i,1)
        } 
      })
    }
  }
  
  initSelected(){}
  isSelected(id:string):boolean{
    return this.selectedView.indexOf(id) > -1
  }
  toggle(id:string):void{
    if(this.multiselect){
      let i = this.selectedView.indexOf(id)
      i == -1 ? this.selectedView.push(id) : this.selectedView.splice(i,1)
    } else {
      this.selectedView = [id];
    }
    this.selectedChange.emit(this.selectedView)
  }
}
