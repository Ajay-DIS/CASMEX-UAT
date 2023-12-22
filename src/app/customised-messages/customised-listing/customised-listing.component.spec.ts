import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomisedListingComponent } from './customised-listing.component';

describe('CustomisedListingComponent', () => {
  let component: CustomisedListingComponent;
  let fixture: ComponentFixture<CustomisedListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomisedListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomisedListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
