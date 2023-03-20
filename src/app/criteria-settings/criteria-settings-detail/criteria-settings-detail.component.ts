import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-criteria-settings-detail",
  templateUrl: "./criteria-settings-detail.component.html",
  styleUrls: ["./criteria-settings-detail.component.css"],
})
export class CriteriaSettingsDetailComponent implements OnInit {
  selectedState: any = null;
  list1: any[];

  list2: any[];

  states: any[] = [
    { name: "Arizona", code: "Arizona" },
    { name: "California", value: "California" },
    { name: "Florida", code: "Florida" },
    { name: "Ohio", code: "Ohio" },
    { name: "Washington", code: "Washington" },
  ];

  constructor() {}

  ngOnInit(): void {}
}
