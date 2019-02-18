import { Component, OnInit, ViewChild, OnDestroy, AfterContentInit } from '@angular/core';
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

@Component({
  selector: 'admin-user-table',
  templateUrl: './admin-user-table.component.html',
  styleUrls: ['./admin-user-table.component.css']
})
export class AdminUserTableComponent implements OnInit,OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: AdminUserTableDataSource;
  constructor(
    private storageService:StorageService,
    private dialog: MatDialog,
    private user: UserService,
    private store: Store<fromApp.appState>
    ){}
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'alias', 'permissions', 'actions'];
  // ngOnChanges(){
  //   console.log('ngOnChanges');
    
  // }
  ngOnInit() {
    // console.log('ngOnInit');
    this.storageService.adminListenToUserData(true)
    this.dataSource = new AdminUserTableDataSource(this.paginator, this.sort, this.store);
    // console.log('set dataSource:', this.dataSource);
    
  }

  
 
  ngOnDestroy(){
    this.storageService.adminListenToUserData(false)
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
  actionDelete(id:string){

  }
}
