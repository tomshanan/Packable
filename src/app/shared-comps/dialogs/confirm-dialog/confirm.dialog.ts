import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AppColors } from '../../../shared/app-colors';


export interface ConfirmDialogData {
  header: string,
  content:string,
  activeColor?: keyof AppColors,
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm.dialog.html',
  styleUrls: ['./confirm.dialog.css']
})
export class ConfirmDialog implements OnInit {
header: string;
content:string;
activeColor: keyof AppColors;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    public dialogRef: MatDialogRef<ConfirmDialog>,
  ) { 
    this.header = data.header || 'Are you sure?'
    this.content = data.content || '';
    this.activeColor = data.activeColor || 'action';
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
