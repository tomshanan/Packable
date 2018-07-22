import { Component, OnInit, Type } from '@angular/core';

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent implements OnInit {
  mainNav = [
    {
      text:'Trips',
      type:'main',
      link:'/trips'
    },
    {
      text:'Profiles',
      type:'main',
      link:'/profiles'
    },
    {
      text:'Collections',
      type:'main',
      link:'/collections'
    },
    {
      text:'Packables',
      type:'main',
      link:'/packables'
    },
    {
      type:'gap'
    },
    {
      text:'User Settings',
      type:'sub',
      link:'/user'
    },
    {
      text:'Logout',
      type:'sub',
      link:'/logout'
    }
  ]
  constructor() { }

  ngOnInit() {
  }

}
