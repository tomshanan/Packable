import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';
import { slideInTrigger, blockInitialAnimations } from '../../shared/animations';
import { isDefined } from '../../shared/global-functions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.css'],
  animations: [slideInTrigger,blockInitialAnimations]
})
export class ProfileSelectorComponent implements OnInit, OnChanges {

  @Input() profiles: Profile[] = []
  @Input() selected: string[] = [];
  @Input() iconWidth: string = '50px';
  @Input() multiselect: boolean = false;
  @Input() showNames: boolean = true;
  @Input() selectedFirst: boolean = false;
  @Output() selectedChange = new EventEmitter<string[]>();
  @HostBinding('@blockInitialAnimations') blockInitialAnimations = blockInitialAnimations;
  selectedView: string[] = []
  profilesView: Profile[] = []
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
    console.log(this.selected);
    
    this.ready = false;
    this.readySubject.next(this.ready)
    this.selectedView = this.selected.slice().clearUndefined();
    this.profilesView = this.profiles.slice().clearUndefined();
    if (this.selectedView.length > 0) {
      this.profilesView = this.bringSelectedToTop();
      console.log('initial sort:\n', this.profilesView);
    } else {
      this.profilesView = this.profiles.slice();
      console.log('no initial sort:\n', this.profilesView);

    }
    this.ready = true;
    this.readySubject.next(this.ready)
    this.readySubject.complete()
  }

  bringSelectedToTop(): Profile[] {
    let tempProfileView: Profile[] = this.profilesView.slice()
    if(this.selectedView && this.selectedView.length > 0){
      this.selectedView.forEach(id => {
        let i = tempProfileView.idIndex(id)
        let removed = tempProfileView.splice(i, 1)
        tempProfileView.unshift(removed[0])
      })
    }
    return tempProfileView
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (isDefined(this.selectedView) && changes['selected']) {
      this.selectedView = this.selected.slice();
    }
    if (isDefined(this.selectedView) && this.selectedFirst) {
      this.profilesView = this.bringSelectedToTop();
      console.log('updated sort:\n', this.profilesView);
    }
    if (this.profilesView.length > 0 && changes['profiles']) {
      if (this.ready) {
        this.compare();
      } else {
        this.readySubject.subscribe(ready => {
          if (ready) {
            this.compare()
          }
        })
      }

    }
  }
  compare() {
    if (this.profilesView.length > 0 && this.profiles.length > 0) {
      this.profiles.forEach(item => {
        if (this.profilesView.idIndex(item.id) < 0) {
          this.profilesView.unshift(item)
        }
      })
      this.profilesView.slice().forEach((item) => {
        if (this.profiles.idIndex(item.id) < 0) {
          const i = this.profilesView.idIndex(item.id)
          this.profilesView.splice(i, 1)
        }
      })
      console.log('--comparing profiles complete--')
    }
  }

  initSelected() { }
  isSelected(id: string): boolean {
    return this.selectedView.indexOf(id) > -1
  }
  toggle(id: string): void {
    if (this.multiselect) {
      let i = this.selectedView.indexOf(id)
      i == -1 ? this.selectedView.push(id) : this.selectedView.splice(i, 1)
    } else {
      this.selectedView = [id];
    }
    this.selectedChange.emit(this.selectedView)
  }
}
