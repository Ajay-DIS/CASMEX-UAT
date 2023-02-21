import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddnewrouteComponent } from './addnewroute.component';

describe('AddnewrouteComponent', () => {
  let component: AddnewrouteComponent;
  let fixture: ComponentFixture<AddnewrouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddnewrouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddnewrouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
