import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewSearchComponent } from './add-new-search.component';

describe('AddNewSearchComponent', () => {
  let component: AddNewSearchComponent;
  let fixture: ComponentFixture<AddNewSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
