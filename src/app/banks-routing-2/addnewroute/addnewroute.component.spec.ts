import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AddnewrouteComponent2 } from "./addnewroute.component";

describe("AddnewrouteComponent", () => {
  let component: AddnewrouteComponent2;
  let fixture: ComponentFixture<AddnewrouteComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddnewrouteComponent2],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddnewrouteComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
