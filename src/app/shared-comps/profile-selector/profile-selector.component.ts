import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';

@Component({
  selector: 'profile-selector',
  templateUrl: './profile-selector.component.html',
  styleUrls: ['./profile-selector.component.css']
})
export class ProfileSelectorComponent implements OnInit {
  @Input() profiles: Profile[] = []
  @Input() selected: string[] = [];
  @Input() iconWidth: string = '50px';
  @Input() multiselect: boolean = false;
  @Input() showNames:boolean = true;
  @Output() selectedChange = new EventEmitter<string[]>();
  
  constructor() { }

  ngOnInit() {
    if(this.selected.length>0){
      this.selected.forEach(id=>{
        let i = this.profiles.findIndex(p=>p.id == id)
        let removed = this.profiles.splice(i,1)
        this.profiles = [removed[0], ...this.profiles]
      })
    }
  }

  isSelected(id:string):boolean{
    return this.selected.indexOf(id) > -1
  }
  toggle(id:string):void{
    if(this.multiselect){
      let i = this.selected.indexOf(id)
      i == -1 ? this.selected.push(id) : this.selected.splice(i,1)
    } else {
      this.selected = [id];
    }
    this.selectedChange.emit(this.selected)
  }
}
