import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.css']
})
export class DialogHeaderComponent implements OnInit {
@Input() header: string = ''
@Input() super: string = null;
@Output() close = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }
  onClose(){
    this.close.emit();
  }
}
