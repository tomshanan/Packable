import { Component, OnInit, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { StoreSelectorService } from '../../shared/services/store-selector.service';
import { Profile } from '../../shared/models/profile.model';
import { MatDialog } from '@angular/material';
import { NewProfileDialogComponent } from '../../profiles/new-profile-dialog/new-profile-dialog.component';
import { take } from 'rxjs/operators';
import { isDefined } from '../../shared/global-functions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'profile-selection-form',
  templateUrl: './profile-selection-form.component.html',
  styleUrls: ['./profile-selection-form.component.css']
})
export class ProfileSelectionFormComponent implements OnInit,OnDestroy {
  profileGroup:Profile[];
  @Input('selected') selected: string[] = []
  @Output('selectedChange') selectedChange = new EventEmitter<string[]>()
  subs: Subscription;
  
  constructor(
    private dialog: MatDialog,
    public storeSelector:StoreSelectorService,    
  ) { }

  ngOnInit() {
    this.subs = this.storeSelector.profiles$.subscribe(()=>{
      this.profileGroup = this.storeSelector.profiles
    })
  }
  ngOnDestroy(){
    this.subs.unsubscribe()
  }

  newProfile(){
    let newProfileDialog = this.dialog.open(NewProfileDialogComponent, {
      width:'99vw',
      maxWidth: '500px',
      maxHeight: '99vh',
      autoFocus: false,
      disableClose: true,
    })
    newProfileDialog.afterClosed().pipe(take(1)).subscribe((profile?:Profile)=>{
      if(isDefined(profile)){
        this.onSelectedChange([...this.selected, profile.id])
      }
    })
  }
  onSelectedChange(ids:string[]){
    this.selected = ids
    this.selectedChange.emit(this.selected)
  }
}
