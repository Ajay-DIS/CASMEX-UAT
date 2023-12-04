import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeListingComponent } from './charge-listing.component';

describe('ChargeListingComponent', () => {
  let component: ChargeListingComponent;
  let fixture: ComponentFixture<ChargeListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargeListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
