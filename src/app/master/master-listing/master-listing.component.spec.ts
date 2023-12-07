import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterListingComponent } from './master-listing.component';

describe('MasterListingComponent', () => {
  let component: MasterListingComponent;
  let fixture: ComponentFixture<MasterListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
