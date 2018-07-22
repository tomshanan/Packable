import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackablesComponent } from './packables.component';

describe('PackablesComponent', () => {
  let component: PackablesComponent;
  let fixture: ComponentFixture<PackablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
