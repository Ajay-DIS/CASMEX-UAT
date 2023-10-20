import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyDetailsListComponent } from './loyalty-details-list.component';

describe('LoyaltyDetailsListComponent', () => {
  let component: LoyaltyDetailsListComponent;
  let fixture: ComponentFixture<LoyaltyDetailsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoyaltyDetailsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoyaltyDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
