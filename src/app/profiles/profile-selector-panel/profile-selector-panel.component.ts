import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Profile } from '../../shared/models/profile.model';
import { WindowService } from '../../shared/services/window.service';
import { ContextService } from '../../shared/services/context.service';
import { Subscription } from 'rxjs';
import { HorizontalIconSelectorComponent } from '../../shared-comps/horizontal-icon-selector/horizontal-icon-selector.component';
import { takeUntil, filter, take } from 'rxjs/operators';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { MatDialog } from '@angular/material';
import { NewProfileDialogComponent } from '../new-profile-dialog/new-profile-dialog.component';
import { isDefined, sortByMostRecent } from '../../shared/global-functions';
import { StoreSelectorService } from '@app/core';
import { ConfirmDialog, ConfirmDialogData } from '@app/shared-comps/dialogs/confirm-dialog/confirm.dialog';
import { horizontalShringAndFade } from '../../shared/animations';

@Component({
  selector: 'profile-selector-panel',
  templateUrl: './profile-selector-panel.component.html',
  styleUrls: ['./profile-selector-panel.component.css'],
  animations: [
    trigger('showTrigger',[
      transition(':enter',[
        animate('500ms ease-out',keyframes([
          style({opacity:0, transform:'translateX(-40px)', zIndex:-1}),
          style({opacity:1, transform:'translateX(0px)', zIndex:-1})
        ]))
      ])
    ]),
    horizontalShringAndFade
  ]
})
export class ProfileSelectorPanelComponent implements OnInit,OnChanges {
  @Input('profiles') profiles: Profile[] = []
  @Input('selected') selected: string = ''
  @Output('selectedChange') selectedChange = new EventEmitter<string>()
  @Output('clickSettings') clickSettings = new EventEmitter<void>()
  @Output('deleteProfile') deleteProfile = new EventEmitter<string>()
  @ViewChild('iconSelector') iconSelector: HorizontalIconSelectorComponent;
  selectorOpen: boolean = true

  constructor(
    public windowService: WindowService,
    private dialog: MatDialog,
    public storeSelector:StoreSelectorService,
  ) { }

  toggleProfileSelector(){
    this.selectorOpen =! this.selectorOpen

  }
  getSelectedProfileName():string{
    return this.profiles.findId(this.selected).name
  }
  ngOnInit() {
    this.profiles.sort(sortByMostRecent)
  }
  ngOnChanges(changes:SimpleChanges){
    if(changes['profiles'] || changes['selected']){
      console.log('Profile Selector received profiles: ', this.profiles)
      if(isDefined(this.selected) && this.profiles.idIndex(this.selected) == -1){
        this.onSelectedProfiles([null])
      } else if(!isDefined(this.selected)){
        this.selectorOpen = true;
        if(this.selectorOpen){
          setTimeout(() => {
            this.iconSelector.scrollEvent()
          }, 200);
        }
      }
    }
  }
  onSelectedProfiles(ids: string[]){
    this.selectedChange.emit(ids[0])
    // if(isDefined(ids.clearUndefined())){
      this.iconSelector.scrolling.pipe(filter(x=>x===0), take(1)).subscribe(scroll => {
        if(scroll === 0){
          setTimeout(()=>{
            this.toggleProfileSelector()
          },100)
        }
      })
      this.iconSelector.scrollToTop();
    // }
  }
  onClickSettings(){
    this.clickSettings.emit()
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
        this.selected = profile.id
        this.onSelectedProfiles([profile.id])
      }
    })
  }
  onDeleteProfile(id:string){
    this.deleteProfile.emit(id)
  }
}
