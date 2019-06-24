import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../user/auth.service';
import { Observable } from 'rxjs';
import * as fromAuth from '../../user/store/auth.reducers'
import * as fromUser from '../../user/store/userState.model'
import * as fromApp from '../../shared/app.reducers';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { userPermissions, permissionTypes, State } from '../../user/store/userState.model';
import { combineLatest } from 'rxjs';

interface listItem {
  text:string,
  size: 'main' | 'sub',
  link:string,
  showAuth: boolean,
  showPublic: boolean,
}
interface userListItem {
  text:string,
  size: 'main' | 'sub',
  showAuth: boolean,
  showPublic: boolean,
  fragment: string,
}
interface adminListItem {
  text:string,
  size: 'main' | 'sub',
  link:string,
  adminPermissions: permissionTypes[],
}

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent implements OnInit {
  @Output() navigate= new EventEmitter<void>()
  authState: Observable<fromAuth.State>
  userState: Observable<fromUser.State>
  isAuthenticated: boolean;
  username: string;
  
  constructor(
    private authService: AuthService,
    public user: UserService,
    private store: Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { 
    this.authState = this.store.select('auth');
    this.userState = this.store.select('user');
    let stateObs = combineLatest(this.authState,this.userState).subscribe(
      ([auth,user])=>{
        this.isAuthenticated = auth.authenticated;
        this.username = user.settings.alias
      }
    )
  }
  
  mainNav:listItem[] = [
    {
      text:'Home',
      size: 'main',
      link:'/home',
      showAuth: true,
      showPublic: true,
    },
    {
      text:'Trips',
      size: 'main',
      link:'/trips',
      showAuth: true,
      showPublic: false,
    },
    {
      text:'Travelers',
      size: 'main',
      link:'/travelers',
      showAuth: true,
      showPublic: false
    },
    {
      text:'Collections',
      size: 'main',
      link:'/collections',
      showAuth: true,
      showPublic: false
    },
    {
      text:'Packables',
      size: 'main',
      link:'/packables',
      showAuth: true,
      showPublic: false
    },
    
  ]
  adminNav: adminListItem[] = [
    {
      text:'Admin Settings',
      size: 'main',
      link:'/admin/settings',
      adminPermissions:['creator','userManagement']
    },
    {
      text:'Users',
      size: 'main',
      link:'/admin/users',
      adminPermissions:['userManagement']
    },
  ]

  
  canView(listItem:{showAuth: boolean, showPublic:boolean}):boolean{
    //return true // FOR DEVELOPMENT
    if(this.isAuthenticated){
      return listItem.showAuth
    } else {
      return listItem.showPublic
    }
  }
  adminViewReducer():boolean{
    return this.adminNav.some(v=>this.adminCanView(v))
  }
  adminCanView(listItem:{adminPermissions:permissionTypes[]}){
    if(this.isAuthenticated && listItem.adminPermissions.some(p=>{
      return !!this.user.permissions[p]
    })){
      return true
    } else {
      return false
    }
  }
  routeTo(link:string, fragment:string=""){
    let settings = fragment!="" ? {fragment:fragment} : {};
    this.router.navigate([link], settings)
    this.navigate.emit()
  }
  ngOnInit() {
  }

}
