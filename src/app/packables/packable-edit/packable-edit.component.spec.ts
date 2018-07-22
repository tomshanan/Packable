import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackableEditComponent } from './packable-edit.component';

describe('PackableEditComponent', () => {
  let component: PackableEditComponent;
  let fixture: ComponentFixture<PackableEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackableEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackableEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
