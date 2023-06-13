import { TestBed } from '@angular/core/testing';

import { FormRuleService } from './form-rule.service';

describe('FormRuleService', () => {
  let service: FormRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
