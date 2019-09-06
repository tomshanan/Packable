import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup, MatTabChangeEvent } from '@angular/material';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { isDefined } from '../../shared/global-functions';

@Component({
  selector: 'auth-component',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  selectedIndex: number;
  section: string;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  route_sub: Subscription;
  sharedEmail: string = '';
  returnTo:string[]
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
  ) {
  }

  ngOnInit() {
    if(this.route.snapshot.queryParamMap.has('returnTo')){
      this.returnTo = this.route.snapshot.queryParamMap.get('returnTo').split(',')
      console.log(`returnTo:`,this.returnTo)
    }
    this.route_sub = this.route.fragment.subscribe(fragment => {
      this.section = fragment
      if (fragment == 'register') {
        this.selectedIndex = 1
      } else if (fragment == 'login') {
        this.selectedIndex = 0
      } else {
        this.router.navigate([], { fragment: 'login'})
      }
    })
  }

  changeFragment(change: MatTabChangeEvent) {
    let index = change.index
    switch (index) {
      case 0:
        this.router.navigate([], { fragment: 'login' })
        break;
      case 1:
        this.router.navigate([], { fragment: 'register' })
      default:
        break;
    }
  }
  onRegister(){
    // confirm email?
  }
  onLogin() {
    if(isDefined(this.returnTo)){
      console.log('logged in, return to:',this.returnTo)
      this.router.navigate([...this.returnTo])
    } else {
      this.router.navigate([''])
    }
  }
}
