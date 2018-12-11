import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


export interface ConfirmDialogData {
  header: string,
  content:string
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm.dialog.html',
  styleUrls: ['./confirm.dialog.css']
})
export class ConfirmDialog implements OnInit {
header: string;
content:string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialogRef: MatDialogRef<ConfirmDialog>,
  ) { 
    this.header = data.header || 'Are you sure?'
    this.content = data.content || '';
  }

  ngOnInit() {
  }

  onClose(confirm: boolean = false) {
    this.dialogRef.close(confirm);
  }
  onConfirm(){
    this.onClose(true)
  }
}
