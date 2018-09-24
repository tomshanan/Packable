import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent implements OnInit {
  mainNav = [
    {
      text:'Trips',
      type:'text',
      size: 'main',
      link:'/trips',
      active: true
    },
    {
      text:'Profiles',
      type:'text',
      size: 'main',
      link:'/profiles',
      active: true
    },
    {
      text:'Collections',
      type:'text',
      size: 'main',
      link:'/collections',
      active: true
    },
    {
      text:'Packables',
      type:'text',
      size: 'main',
      link:'/packables',
      active: true
    },
    {
      type:'gap',
      active: false
    },
  ]
  userNav = [
    {
      text:'User Settings',
      type:'text',
      size: 'sub',
      fragment:'settings',
      active: true
    },
    {
      text:'Login',
      type:'text',
      size: 'sub',
      fragment:'login',
      active: true
    },
    {
      text:'Register',
      type:'text',
      size: 'sub',
      fragment:'register',
      active: true
    },
    {
      text:'Logout',
      type:'text',
      size: 'sub',
      fragment:'logout',
      active: true
    }
  ]
  constructor() { }

  ngOnInit() {
  }

}
