import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankRoutingComponent } from './bank-routing.component';

describe('BankRoutingComponent', () => {
  let component: BankRoutingComponent;
  let fixture: ComponentFixture<BankRoutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankRoutingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankRoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
