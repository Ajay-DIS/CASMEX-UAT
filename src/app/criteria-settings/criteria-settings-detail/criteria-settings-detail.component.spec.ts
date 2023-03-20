import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaSettingsDetailComponent } from './criteria-settings-detail.component';

describe('CriteriaSettingsDetailComponent', () => {
  let component: CriteriaSettingsDetailComponent;
  let fixture: ComponentFixture<CriteriaSettingsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CriteriaSettingsDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteriaSettingsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
