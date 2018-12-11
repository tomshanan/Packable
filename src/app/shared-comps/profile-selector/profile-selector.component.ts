import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';

@Component({
  selector: 'profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.css']
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
  /*
  <profile-selector 
    iconWidth="50px" 
    [profiles]="profileGroup" 
    [(selected)]="selectedProfiles" 
    [multiselect]="true"
    [showNames]="true">
  </profile-selector>
  */
  constructor() { }

  ngOnInit() {
    this.selectedView = this.selected.slice();
    this.profilesView = this.profiles.slice();
    if(this.selectedView.length>0){
      this.selectedView.forEach(id=>{
        let i = this.profilesView.findIndex(p=>p.id == id)
        let removed = this.profilesView.slice().splice(i,1)
        this.profilesView = [removed[0], ...this.profilesView]
      })
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected']) {
      this.selectedView = this.selected.slice();
      this.profilesView = this.profiles.slice();
      console.log('selected',this.selectedView);
      
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
