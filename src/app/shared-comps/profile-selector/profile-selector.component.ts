import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';
import {  blockInitialAnimations, listItemTrigger, horizontalShringAndFade } from '../../shared/animations';
import { isDefined } from '../../shared/global-functions';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { StoreSelectorService } from '../../shared/services/store-selector.service';

@Component({
  selector: 'profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.css'],
  animations: [horizontalShringAndFade,blockInitialAnimations]
})
export class ProfileSelectorComponent implements OnInit, OnChanges {

  @Input('profiles') inputProfiles: Profile[] = [] // input profile list
  @Input('selected') inputSelected: string[] = []; // input initial selected ID
  @Input() iconWidth: string = '50px'; // set the width of all icons (including padding and margin)
  @Input() multiselect: boolean = false; // allow selecting multiple profiles
  @Input() showNames: boolean = true; // show the name below icon
  @Input() showQuickButtons:boolean = true;
  @Input() selectedFirst: boolean = false; // move the selected profiles to top of list
  @Input() fullFrame: boolean = false; // fit icon inside circle
  @Input() color: string; // override background color for all icons
  @Output() selectedChange = new EventEmitter<string[]>(); // emits selected ids

  @HostBinding('@blockInitialAnimations') blockInitialAnimations = blockInitialAnimations;
  selected: string[] = []
  profiles: Profile[] = []
  ready: boolean;
  readySubject = new Subject<boolean>()

  /*
  <profile-selector 
    iconWidth="50px" 
    [profiles]="profileGroup" 
    [(selected)]="selectedProfiles" 
    [multiselect]="true"
    [fullFrame]="false"
    [showNames]="true">
  </profile-selector>
  */
  constructor(
    private storeSelector: StoreSelectorService,
  ) {

  }

  ngOnInit() {
    this.ready = false;
    this.readySubject.next(this.ready)
    this.selected = this.inputSelected.slice().clearUndefined();
    this.profiles = this.inputProfiles.slice().clearUndefined();
    if (this.selected.length > 0) {
      this.profiles = this.bringSelectedToTop();
    } else {
      this.profiles = this.inputProfiles.slice();
    }
    this.ready = true;
    this.readySubject.next(this.ready)
    this.readySubject.complete()
  }

  bringSelectedToTop(): Profile[] {
    let tempProfileView: Profile[] = this.profiles.slice()
    if(this.selected && this.selected.length > 0){
      this.selected.forEach(id => {
        let i = tempProfileView.idIndex(id)
        let removed = tempProfileView.splice(i, 1)
        tempProfileView.unshift(removed[0])
      })
    }
    return tempProfileView
  }
  ngOnChanges(changes: SimpleChanges): void {
   
    if (isDefined(this.selected) && changes['inputSelected']) {
      this.selected = this.inputSelected.slice();
    }
    if (isDefined(this.selected) && this.selectedFirst) {
      this.profiles = this.bringSelectedToTop();
    }
    if(this.profiles && changes['inputProfiles']){
      this.profiles.compare(this.inputProfiles)
    }
  }

  // }

  initSelected() { }
  isSelected(id: string): boolean {
    return this.selected.indexOf(id) > -1
  }
  toggle(id: string): void {
    if (this.multiselect) {
      let i = this.selected.indexOf(id)
      i == -1 ? this.selected.push(id) : this.selected.splice(i, 1)
    } else {
      this.selected = [id];
    }
    this.selectedChange.emit(this.selected)
  }

  profileSelect(select:'all'|'none'){
    if(this.multiselect){
      if(select == 'all'){
        this.selected = this.profiles.map(p=>p.id)
        this.selectedChange.emit(this.selected)
      } else if (select == 'none'){
        this.selected = []
        this.selectedChange.emit(this.selected)
      }
    }
  }
}
