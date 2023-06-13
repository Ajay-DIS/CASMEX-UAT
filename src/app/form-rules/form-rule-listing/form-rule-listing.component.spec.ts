import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRuleListingComponent } from './form-rule-listing.component';

describe('FormRuleListingComponent', () => {
  let component: FormRuleListingComponent;
  let fixture: ComponentFixture<FormRuleListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormRuleListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRuleListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
