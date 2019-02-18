import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatCheckboxChange } from '@angular/material';
import { userPermissions } from '../../user/store/userState.model';

export interface data{
  permissions: userPermissions,
  alias: string
}

@Component({
  selector: 'app-set-permissions-dialog',
  templateUrl: './set-permissions-dialog.component.html',
  styleUrls: ['./set-permissions-dialog.component.css']
})
export class SetPermissionsDialogComponent implements OnInit {
  permissions: userPermissions;
  alias: string = ''
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:data,
    public dialogRef:MatDialogRef<SetPermissionsDialogComponent>) { 
      this.permissions = {...this.data.permissions}
      this.alias = this.data.alias
    }
  ngOnInit() {
  }
  update(string:keyof userPermissions, e: MatCheckboxChange){
    this.permissions[string] = e.checked
  }
  onClose(p:userPermissions = null){
    this.dialogRef.close(p)
  }

}
