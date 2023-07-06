import { TestBed } from '@angular/core/testing';

import { CustomfieldServiceService } from './customfield-service.service';

describe('CustomfieldServiceService', () => {
  let service: CustomfieldServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomfieldServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
