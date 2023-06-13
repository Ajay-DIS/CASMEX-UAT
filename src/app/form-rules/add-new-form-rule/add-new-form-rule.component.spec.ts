import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewFormRuleComponent } from './add-new-form-rule.component';

describe('AddNewFormRuleComponent', () => {
  let component: AddNewFormRuleComponent;
  let fixture: ComponentFixture<AddNewFormRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewFormRuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewFormRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
