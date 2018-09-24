import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTab, MatTabGroup } from '@angular/material';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  section:string;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.fragment.subscribe(fragment =>{
      this.section = fragment
      if (this.section == 'register'){
        this.tabGroup.selectedIndex = 1
      } else if (this.section == 'login'){
        this.tabGroup.selectedIndex = 0
      } 
    })
  }

  onRegister(){
    console.log('Registered!');
  }
}
