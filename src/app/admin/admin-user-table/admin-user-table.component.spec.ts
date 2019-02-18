import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';

import { AdminUserTableComponent } from './admin-user-table.component';

describe('AdminUserTableComponent', () => {
  let component: AdminUserTableComponent;
  let fixture: ComponentFixture<AdminUserTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminUserTableComponent ],
      imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
