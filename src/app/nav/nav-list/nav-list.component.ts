import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../user/auth.service';

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent implements OnInit {
  constructor(
    private authService: AuthService
  ) { }
  
  mainNav = [
    {
      text:'Trips',
      type:'text',
      size: 'main',
      link:'/trips',
      showAuth: true,
      showPublic: false,
    },
    {
      text:'Profiles',
      type:'text',
      size: 'main',
      link:'/profiles',
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
    if(this.authService.isAuthenticated()){
      return listItem.showAuth
    } else {
      return listItem.showPublic
    }
  }

  ngOnInit() {
  }

}
