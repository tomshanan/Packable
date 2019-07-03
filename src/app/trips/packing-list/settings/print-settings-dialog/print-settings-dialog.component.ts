import { Component, OnInit, Inject } from '@angular/core';
import { PrintOptions } from '../../print/print.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


export interface printDialog_data{
  destinationName:string,
  printSettings:PrintOptions,
}

@Component({
  selector: 'app-print-settings-dialog',
  templateUrl: './print-settings-dialog.component.html',
  styleUrls: ['./print-settings-dialog.component.css']
})
export class PrintSettingsDialogComponent implements OnInit {
  printSettings: PrintOptions = new PrintOptions()
  destinationName:string = ''
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:printDialog_data,
    private dialogRef:MatDialogRef<PrintSettingsDialogComponent>,
  ) { 
    this.destinationName = data.destinationName
    this.printSettings = data.printSettings
  }

  ngOnInit() {
  }

  onConfirm(){
    this.onClose(this.printSettings)
  }
  onClose(printSettings:PrintOptions = null){
    this.dialogRef.close(printSettings)
  }
}
