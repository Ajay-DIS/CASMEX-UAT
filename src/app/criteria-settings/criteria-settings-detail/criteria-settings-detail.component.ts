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

  // Suresh start 
  criteriaSettingtable = [];
  criteriaSettingDetails : any={
    "data": {
        "cmCriteriaOperationsMasters": [
            {
                "id": 1,
                "fieldName": "Correspondent",
                "displayName": "Correspondent",
                "fieldType": "Dropdown",
                "operations": "Is Equal To,Is Not Equal To",
                "orderID": 1,
                "sqlQueries": "select Correspondent from CorrespondentMaster",
                "iSMandatory": "no",
                "dependency": "Country"
            },
            {
                "id": 2,
                "fieldName": "Currency",
                "displayName": "Currency",
                "fieldType": "Dropdown",
                "operations": "Is Equal To,Is Not Equal To,Is Greater Than,Is Not Greater Than",
                "orderID": 2,
                "sqlQueries": "select Branch from BranchMaster",
                "iSMandatory": "no",
                "dependency": "Country"
            },
            {
                "id": 3,
                "fieldName": "Country",
                "displayName": "Country",
                "fieldType": "Dropdown",
                "operations": "Is Equal To,Is Not Equal To",
                "orderID": 3,
                "sqlQueries": "select Country from CountryMaster",
                "iSMandatory": "no",
                "dependency": null
            },
            {
                "id": 4,
                "fieldName": "Service Type",
                "displayName": "Service Type",
                "fieldType": "Dropdown",
                "operations": "Is Equal To,Is Not Equal To",
                "orderID": 4,
                "sqlQueries": "select Currency from CurrencyMaster",
                "iSMandatory": "no",
                "dependency": "Service Category"
            },
            {
                "id": 5,
                "fieldName": "Service Category",
                "displayName": "Service Category",
                "fieldType": "Dropdown",
                "operations": "Is Equal To,Is Not Equal To",
                "orderID": 5,
                "sqlQueries": "select Module from ModuleMaster",
                "iSMandatory": "no",
                "dependency": null
            },
            {
                "id": 6,
                "fieldName": "LCY Slab",
                "displayName": "LCY Slab",
                "fieldType": "Dropdown",
                "operations": "Slab",
                "orderID": 6,
                "sqlQueries": "select slab from slab",
                "iSMandatory": "no",
                "dependency": null
            }
        ]
    },
    "status": "200"
};

  // Suresh end

  constructor() {
    this.criteriaSettingtable = this.criteriaSettingDetails.data.cmCriteriaOperationsMasters;
  }

  ngOnInit(): void {}

  // Suresh start

  // Suresh end
}
