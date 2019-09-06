import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTab, MatTabGroup, MatTabChangeEvent } from '@angular/material';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  username:string;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public authService:AuthService,
    private userService:UserService,
  ) { 
  }

  ngOnInit() {
    if(this.authService.isAuthenticated){
      this.username = this.userService.settings.alias
    }
    
  }

}
