import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPaymentModeComponent } from './view-payment-mode.component';

describe('ViewPaymentModeComponent', () => {
  let component: ViewPaymentModeComponent;
  let fixture: ComponentFixture<ViewPaymentModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPaymentModeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPaymentModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
