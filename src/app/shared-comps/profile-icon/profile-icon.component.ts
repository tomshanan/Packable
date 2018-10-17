import { Component, OnInit, Input, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { IconService } from '@app/core';

@Component({
  selector: 'profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.css']
})
export class ProfileIconComponent implements OnInit {

  @Input() icon: string = '001-man';
  @Input('name') inputName: string = 'Traveler'
  @Input() showName: boolean = false;
  @Input() isInteractive: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() isButton: boolean = false;
  @Input() dim: boolean = false;
  @Input() inputWidth: string = "50px";
  @Input('color') inputColor: string = 'white';

  @ViewChild('profile') profile: ElementRef;


  constructor(
    private iconService:IconService, //for template
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.renderer.setStyle(this.profile.nativeElement, 'width', this.inputWidth)
  }

}
