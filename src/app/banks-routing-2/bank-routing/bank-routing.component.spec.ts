import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BankRoutingComponent2 } from "./bank-routing.component";

describe("BankRoutingComponent", () => {
  let component: BankRoutingComponent2;
  let fixture: ComponentFixture<BankRoutingComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankRoutingComponent2],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankRoutingComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
