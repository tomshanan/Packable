import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Profile } from '@app/shared/models/profile.model';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'icon-selector',
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.css']
})
export class IconSelectorComponent implements OnInit {
  @Input() icons: string[] = []
  @Input() iconWidth: string = '50px';
  @Input() multiselect: boolean = false;
  @Input() selected: string[] = [];
  @Output() selectedChange = new EventEmitter<string[]>();
  
  constructor() { }

  ngOnInit() {
    if(this.selected.length>0){
      this.selected.forEach(icon=>{
        if(icon){
          let i = this.icons.indexOf(icon)
          this.icons.splice(i,1)
          this.icons = [icon, ...this.icons]
        }
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
