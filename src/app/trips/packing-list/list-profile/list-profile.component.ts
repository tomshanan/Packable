import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { listCollection } from '@app/shared/models/packing-list.model';
import { PackingListSettings, PackingListPackable, DisplayPackingList } from '../../../shared/models/packing-list.model';
import { Trip } from '../../../shared/models/trip.model';
import { timer } from 'rxjs';

@Component({
  selector: 'list-profile',
  templateUrl: './list-profile.component.html',
  styleUrls: ['./list-profile.component.css']
})
export class ListProfileComponent implements OnInit, OnChanges {
  @Input() columns: number = 1;
  @Input() packingListSettings: PackingListSettings;
  @Input() profile: DisplayPackingList;
  @Input() trip: Trip;
  @Input() editingPackable: PackingListPackable;
  @Output() editingPackableChange = new EventEmitter<PackingListPackable>()

  sortedColumns: listCollection[][] = []
  debouncer = setTimeout(() => { }, 0)
  constructor() { }

  ngOnInit() {
    this.sortToColumns()
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['packingListSettings'] || changes['columns'] || changes['profile']) {
      if (this.sortedColumns.length > 0) {
        clearTimeout(this.debouncer)
        this.debouncer = setTimeout(() => {
          this.sortToColumns()
        }, 50);
      }
    }
  }

  sortToColumns() {
    let showInvalid = this.packingListSettings.showInvalid
    this.sortedColumns = []
    for (let i = 0; this.columns > i; i++) {
      this.sortedColumns.push([])
    }
    if (showInvalid) {
      this.profile.collections.sort((a, b) => {
        return (b.packables.length + 1) - (a.packables.length + 1)
      })
    } else {
      this.profile.collections.sort((a, b) => {
        return (b.validPackables() + 1) - (a.validPackables() + 1)
      })
    }
    this.profile.collections.forEach(collection => {
      let shortest = this.sortedColumns.reduce((a, b) => {
        let aLength = this.countPackables(a, showInvalid)
        let bLength = this.countPackables(b, showInvalid)
        return aLength <= bLength ? a : b;
      });
      shortest.push(collection)
    })
    this.sortedColumns.sort((a, b) => {
      let aLength = this.countPackables(a, showInvalid)
      let bLength = this.countPackables(b, showInvalid)
      return bLength - aLength;
    })
  }

  countPackables(column: listCollection[], countInvalid: boolean = false): number {
    return column.reduce((a, b) => {
      a += countInvalid ? b.packables.length + 1 : b.validPackables() + 1
      return a
    }, 0)
  }
}
