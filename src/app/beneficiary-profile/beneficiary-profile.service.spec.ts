import { TestBed } from '@angular/core/testing';

import { BeneficiaryProfileService } from './beneficiary-profile.service';

describe('BeneficiaryProfileService', () => {
  let service: BeneficiaryProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeneficiaryProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
