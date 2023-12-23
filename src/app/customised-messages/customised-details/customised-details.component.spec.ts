import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomisedDetailsComponent } from './customised-details.component';

describe('CustomisedDetailsComponent', () => {
  let component: CustomisedDetailsComponent;
  let fixture: ComponentFixture<CustomisedDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomisedDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomisedDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
