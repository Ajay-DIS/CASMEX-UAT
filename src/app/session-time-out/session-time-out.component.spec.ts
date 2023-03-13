import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionTimeOutComponent } from './session-time-out.component';

describe('SessionTimeOutComponent', () => {
  let component: SessionTimeOutComponent;
  let fixture: ComponentFixture<SessionTimeOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionTimeOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionTimeOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
