import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
  emailInput:FormControl;
  constructor(
     @Inject(MAT_DIALOG_DATA) public email:string,
    private dialogref:MatDialogRef<ForgotPasswordDialogComponent>,
  ) { 
  this.emailInput = new FormControl(email,[Validators.required, Validators.email])
  }
  ngOnInit() {
  }
  onClose(){
    this.dialogref.close(null)
  }
  onConfirm(){
    this.dialogref.close(this.emailInput.value)
  }
}
