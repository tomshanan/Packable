import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../user/auth.service';
import { Observable } from 'rxjs';
import * as fromAuth from '../../user/store/auth.reducers'
import * as fromApp from '../../shared/app.reducers';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent implements OnInit {
  @Output() navigate= new EventEmitter<void>()
  authState: Observable<fromAuth.State>
  isAuthenticated: boolean;

  constructor(
    private authService: AuthService,
    private store: Store<fromApp.appState>,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { 
    this.authState = this.store.select('auth');
    this.authState.subscribe(state =>{
      this.isAuthenticated = state.authenticated;
    })
  }
  
  mainNav = [
    {
      text:'Home',
      type:'text',
      size: 'main',
      link:'/',
      showAuth: true,
      showPublic: true,
    },
    {
      text:'Trips',
      type:'text',
      size: 'main',
      link:'/trips',
      showAuth: true,
      showPublic: false,
    },
    {
      text:'Travelers',
      type:'text',
      size: 'main',
      link:'/travelers',
      showAuth: true,
      showPublic: false
    },
    {
      text:'Collections',
      type:'text',
      size: 'main',
      link:'/collections',
      showAuth: true,
      showPublic: false
    },
    {
      text:'Packables',
      type:'text',
      size: 'main',
      link:'/packables',
      showAuth: true,
      showPublic: false
    },
    {
      type:'gap',
      showAuth: false,
      showPublic: false
    },
  ]
  userNav = [
    {
      text:'User Settings',
      type:'text',
      size: 'sub',
      fragment:'settings',
      showAuth: true,
      showPublic: false
    },
    {
      text:'Login',
      type:'text',
      size: 'sub',
      fragment:'login',
      showAuth: false,
      showPublic: true
    },
    {
      text:'Register',
      type:'text',
      size: 'sub',
      fragment:'register',
      showAuth: false,
      showPublic: true
    },
    {
      text:'Logout',
      type:'text',
      size: 'sub',
      fragment:'logout',
      showAuth: true,
      showPublic: false
    }
  ]
  
  canView(listItem:{showAuth: boolean, showPublic:boolean}):boolean{
    return true // FOR DEVELOPMENT
    if(this.isAuthenticated){
      return listItem.showAuth
    } else {
      return listItem.showPublic
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
