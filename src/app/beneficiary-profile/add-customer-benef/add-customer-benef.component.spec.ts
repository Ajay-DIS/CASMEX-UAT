import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomerBenefComponent } from './add-customer-benef.component';

describe('AddCustomerBenefComponent', () => {
  let component: AddCustomerBenefComponent;
  let fixture: ComponentFixture<AddCustomerBenefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomerBenefComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCustomerBenefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
