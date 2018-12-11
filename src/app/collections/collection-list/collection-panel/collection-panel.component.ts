import { Component, OnInit, Input } from '@angular/core';
import { CollectionComplete } from '../../../shared/models/collection.model';
import { transitionTrigger } from '../../../shared/animations';

export type CollectionPanelView = 'list' | 'settings';

@Component({
  selector: 'app-collection-panel',
  templateUrl: './collection-panel.component.html',
  styleUrls: ['./collection-panel.component.css'],
  animations: [transitionTrigger]
})
export class CollectionPanelComponent implements OnInit {
  @Input() selectedView: CollectionPanelView = 'list';
  @Input() collection: CollectionComplete;

  constructor() { }

  ngOnInit() {
  }

}
