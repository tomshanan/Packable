import { Component, OnInit, Inject } from '@angular/core';
import { CollectionProfile } from '../edit-packable-dialog/choose-collections-form/choose-collections-form.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BulkActionsService } from '../../../shared/services/bulk-actions.service';


export interface PushPackables_DialogData{
  ids: string[],
  content: string,
  collectionName: string,
  header: string
}

@Component({
  selector: 'app-push-packables-dialog',
  templateUrl: './push-packables-dialog.component.html',
  styleUrls: ['./push-packables-dialog.component.css']
})
export class PushPackablesDialogComponent implements OnInit {
  selectedCollections: CollectionProfile[] = [];
  content:string;
  collectionName: string;
  header: string;
  ids: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PushPackables_DialogData,
    public dialogRef: MatDialogRef<PushPackablesDialogComponent>,
    private bulkAction:BulkActionsService,
  ) { 
    this.content = data.content || 'Select the Collections and Porfiles on which to apply the Packables and their settings:'
    this.collectionName = data.collectionName || null;
    this.header = data.header || "Push Packables";
    this.ids = data.ids || [];
  }

  ngOnInit() {
  }
  onClose(){
    this.dialogRef.close()
  }
  onConfirmCollections(){
    this.bulkAction.pushPackablesByCP(this.ids, this.selectedCollections)
    this.onClose()
  }

}
