import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryProfileComponent } from './beneficiary-profile.component';

describe('BeneficiaryProfileComponent', () => {
  let component: BeneficiaryProfileComponent;
  let fixture: ComponentFixture<BeneficiaryProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeneficiaryProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiaryProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
