import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetDocSettingsComponent } from './get-doc-settings.component';

describe('GetDocSettingsComponent', () => {
  let component: GetDocSettingsComponent;
  let fixture: ComponentFixture<GetDocSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetDocSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetDocSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
