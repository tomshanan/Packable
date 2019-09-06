import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { UserSettings } from '../store/userState.model';
import { first, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  userSettings:UserSettings;
  loading:boolean = true;
  constructor(
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userService.userState$.pipe(filter(state=>!state.loading)).subscribe(userState=>{
      this.loading = false;
      this.userSettings = userState.settings
    })
  }

  editPassword(edit:boolean){
    if(edit){
      this.router.navigate(['user','actions'],{queryParams:{mode:'resetPassword'}})
    }
  }
}
