import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLoyaltyComponent } from './add-loyalty.component';

describe('AddLoyaltyComponent', () => {
  let component: AddLoyaltyComponent;
  let fixture: ComponentFixture<AddLoyaltyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLoyaltyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLoyaltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
