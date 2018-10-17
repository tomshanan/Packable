import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherConditionsFormComponent } from './weather-conditions-form.component';

describe('WeatherConditionsFormComponent', () => {
  let component: WeatherConditionsFormComponent;
  let fixture: ComponentFixture<WeatherConditionsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherConditionsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherConditionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
