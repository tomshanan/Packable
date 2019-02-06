import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.css']
})
export class SearchFieldComponent implements OnInit {
  @Input() value: string;
  @Input() placeholder: string;
  @Output() valueChange = new EventEmitter<string>()
/**
<search-field
[(value)]="searchString"
placeholder="Search Collections">
</search-field> 
 */
  constructor() { }

  ngOnInit() {
  }
  inputChange() {
    this.valueChange.emit(this.value)
  }
  clearInput(){
    this.value = '';
    this.inputChange()
  }

}
