import { TestBed } from '@angular/core/testing';

import { PaymentModeServiceService } from './payment-mode-service.service';

describe('PaymentModeServiceService', () => {
  let service: PaymentModeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentModeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
