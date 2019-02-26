import { Component, OnInit, ViewChild, OnDestroy, AfterContentInit, DoCheck, AfterContentChecked, AfterViewInit, AfterViewChecked } from '@angular/core';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { AdminUserTableDataSource } from './admin-user-table-datasource';
import { StorageService } from '../../shared/storage/storage.service';
import { UserService } from '../../shared/services/user.service';
import { userPermissions } from '../../user/store/userState.model';
import { SetPermissionsDialogComponent } from '../set-permissions-dialog/set-permissions-dialog.component';
import { take } from 'rxjs/operators';
import { isDefined } from '@app/shared/global-functions';
import { Store } from '@ngrx/store';
import * as fromStore from '@shared/app.reducers'
import * as fromApp from '@shared/app.reducers';
import { reducers } from '../../shared/app.reducers';
import { User } from '../store/adminState.model';
import * as adminActions from '../store/admin.actions';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { ConfirmDialog, ConfirmDialogData } from '../../shared-comps/dialogs/confirm-dialog/confirm.dialog';

@Component({
  selector: 'admin-user-table',
  templateUrl: './admin-user-table.component.html',
  styleUrls: ['./admin-user-table.component.css']
})
export class AdminUserTableComponent implements OnInit,OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource: AdminUserTableDataSource;
  constructor(
    private storageService:StorageService,
    private dialog: MatDialog,
    private user: UserService,
    private store: Store<fromApp.appState>,
    private storeSelector: StoreSelectorService,
    ){}
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'alias', 'permissions', 'actions'];
  // ngOnChanges(){
  //   console.log('ngOnChanges');
    
  // }
  ngOnInit() {
    let data = this.storeSelector.adminState.users
    this.storageService.adminListenToUserConfig(true)
    this.dataSource = new AdminUserTableDataSource(this.paginator, this.sort, this.store, data);
  }

 
  ngOnDestroy(){
    
    this.storageService.adminListenToUserConfig(false)
  }

  joinPermissions(permissions:userPermissions):string{
    let strings = [];
    for(let p in permissions){
      if (permissions[p]){
        strings.push(p)
      }
    }
    return strings.join(', ')
  }
s
  actionPermissions(row:User){
    if(this.user.id !== row.id && this.user.permissions.setPermissions){
      let permissionsDialog = this.dialog.open(SetPermissionsDialogComponent, {
        data:{alias:row.alias, permissions:row.permissions},
      })
      permissionsDialog.afterClosed().pipe(take(1)).subscribe((p:userPermissions)=>{
        if(isDefined(p)){
          console.log(p);
          this.store.dispatch(new adminActions.adminSetPermissions([{id:row.id,permissions:p}]))
        }
      })
    }
  }
  actionDelete(rows:User[]){
    let multi = rows.length > 1
    let data:ConfirmDialogData= {
      header: `Delete ${multi? rows.length+' Users' : rows[0].alias}`,
      content: `Are you sure you wish to delete ${ multi ? 'these users:<br>'+rows.map(r=>r.alias).join(', ') : 'this user'}?`
    }
    if( rows.every(row=>{
      return this.user.id !== row.id && !row.permissions.userManagement && this.user.permissions.userManagement
    })){
      let confirmDeleteDialog = this.dialog.open(ConfirmDialog, {
        data: data,
        width: '99vw',
        maxWidth: '500px'
      })
      confirmDeleteDialog.afterClosed().pipe(take(1)).subscribe((confirm:boolean)=>{
        if(confirm){
          this.storageService.adminDeleteUsers(rows.map(r=>r.id))
        }
      })
    }
  }
}
