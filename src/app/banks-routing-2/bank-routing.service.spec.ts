import { TestBed } from "@angular/core/testing";

import { BankRoutingService } from "./bank-routing.service";

describe("BankRoutingService", () => {
  let service: BankRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankRoutingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
