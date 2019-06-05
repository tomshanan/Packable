import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTab, MatTabGroup, MatTabChangeEvent } from '@angular/material';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  selectedIndex:number;
  section:string;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  route_sub: Subscription;
  sharedEmail: string = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public authService:AuthService
  ) { 
  }
  changeFragment(change:MatTabChangeEvent){
    let index = change.index
    switch (index) {
      case 0 :
        this.router.navigate([],{fragment:'login'})
        break;
      case 1 :
        this.router.navigate([],{fragment:'register'})
      default:
        break;
    }
  }
  ngOnInit() {
    this.route_sub = this.activatedRoute.fragment.subscribe(fragment =>{
      this.section = fragment
      if (!this.authService.isAuthenticated){
        if (fragment == 'register'){
          this.selectedIndex = 1
        } else if (fragment == 'login'){
          this.selectedIndex = 0 
        } else {
          this.router.navigate([],{fragment:'login'})
        }
      } else {
        if (fragment == 'logout'){
          setTimeout(()=>{
            this.authService.logout()
            this.router.navigate([],{fragment:'login'})
          },1000)
        } else if (fragment == 'settings') {
          
        } else {
          this.router.navigate([],{fragment:'settings'})
        }
      }
    })
    
  }

  onRegister(){
    this.router.navigate([''])
  }
  onLogin(){
    this.router.navigate([''])
  }
}
