import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'dialog-confirm-button',
  templateUrl: './dialog-confirm-button.component.html',
  styleUrls: ['./dialog-confirm-button.component.css']
})
export class DialogConfirmButtonComponent implements OnInit {

  @Output() confirm = new EventEmitter<void>();
  @Input() icon: string = "check";
  @Input() valid: boolean = true;

  constructor() { }

  ngOnInit() {
  }
  onConfirm(){
    this.confirm.emit();
  }

}
