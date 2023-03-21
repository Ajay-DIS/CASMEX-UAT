import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { CriteriaSettingsService } from "../criteria-settings.service";

@Component({
  selector: "app-criteria-settings-detail",
  templateUrl: "./criteria-settings-detail.component.html",
  styleUrls: ["./criteria-settings-detail.component.css"],
})
export class CriteriaSettingsDetailComponent implements OnInit {
  selectAppForm: any;
  selectFields: any[] = [
    // { name: "Arizona", code: "Arizona" },
    // { name: "California", value: "California" },
    // { name: "Florida", code: "Florida" },
    // { name: "Ohio", code: "Ohio" },
    // { name: "Washington", code: "Washington" },
  ];

  selectedFields: any[] = [];

  criteriaApplicationOptions: any[] = [];
  criteriaFormsOptions: any[] = [];

  isFieldsQueriesData: boolean = false;
  fieldsQueriesData: any = [];

  // Suresh start
  criteriaSettingtable = [];
  criteriaSettingDetails: any = {
    data: {
      cmCriteriaOperationsMasters: [
        {
          id: 1,
          fieldName: "Correspondent",
          displayName: "Correspondent",
          fieldType: "Dropdown",
          operations: "Is Equal To,Is Not Equal To",
          orderID: 1,
          sqlQueries: "select Correspondent from CorrespondentMaster",
          iSMandatory: "no",
          dependency: "Country",
        },
        {
          id: 2,
          fieldName: "Currency",
          displayName: "Currency",
          fieldType: "Dropdown",
          operations:
            "Is Equal To,Is Not Equal To,Is Greater Than,Is Not Greater Than",
          orderID: 2,
          sqlQueries: "select Branch from BranchMaster",
          iSMandatory: "no",
          dependency: "Country",
        },
        {
          id: 3,
          fieldName: "Country",
          displayName: "Country",
          fieldType: "Dropdown",
          operations: "Is Equal To,Is Not Equal To",
          orderID: 3,
          sqlQueries: "select Country from CountryMaster",
          iSMandatory: "no",
          dependency: null,
        },
        {
          id: 4,
          fieldName: "Service Type",
          displayName: "Service Type",
          fieldType: "Dropdown",
          operations: "Is Equal To,Is Not Equal To",
          orderID: 4,
          sqlQueries: "select Currency from CurrencyMaster",
          iSMandatory: "no",
          dependency: "Service Category",
        },
        {
          id: 5,
          fieldName: "Service Category",
          displayName: "Service Category",
          fieldType: "Dropdown",
          operations: "Is Equal To,Is Not Equal To",
          orderID: 5,
          sqlQueries: "select Module from ModuleMaster",
          iSMandatory: "no",
          dependency: null,
        },
        {
          id: 6,
          fieldName: "LCY Slab",
          displayName: "LCY Slab",
          fieldType: "Dropdown",
          operations: "Slab",
          orderID: 6,
          sqlQueries: "select slab from slab",
          iSMandatory: "no",
          dependency: null,
        },
      ],
    },
    status: "200",
  };

  // Suresh end

  constructor(
    private criteriaSettingsService: CriteriaSettingsService,
    private ngxToaster: ToastrService,
    private fb: FormBuilder,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.setSelectAppForm();
    this.criteriaSettingsService
      .getCriteriaAppFormsList()
      .pipe(take(1))
      .subscribe(
        (res) => {
          if (res["data"]) {
            this.criteriaApplicationOptions = res["data"][
              "cmApplicationMaster"
            ].map((app) => {
              return { name: app.name, code: app.name };
            });
            this.criteriaFormsOptions = res["data"][
              "cmCriteriaFormsMaster"
            ].map((app) => {
              return { name: app.criteriaForms, code: app.criteriaForms };
            });
          } else if (res["msg"]) {
            this.ngxToaster.warning(res["msg"]);
            this.appCtrl.disable();
            this.formCtrl.disable();
          }
        },
        (err) => {
          this.appCtrl.disable();
          this.formCtrl.disable();
          console.log("Error in Criteria App Form List", err);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  setSelectAppForm() {
    this.selectAppForm = this.fb.group({
      applications: new FormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      forms: new FormControl({ value: "", disabled: true }, [
        Validators.required,
      ]),
    });
  }

  get appCtrl() {
    return this.selectAppForm.get("applications");
  }
  get formCtrl() {
    return this.selectAppForm.get("forms");
  }

  onAppChange(e: any) {
    this.formCtrl.enable();
  }

  executeQueries() {
    this.coreService.displayLoadingScreen();
    if (!this.isFieldsQueriesData) {
      this.criteriaSettingsService
        .getCriteriaFieldsExecuteQueries()
        .pipe(take(1))
        .subscribe(
          (res) => {
            if (res["data"]) {
              this.isFieldsQueriesData = true;
              this.fieldsQueriesData =
                res["data"]["cmCriteriaOperationsMasters"];
              this.selectFields = this.fieldsQueriesData;
              this.selectFields.forEach(item=> {
                item['operationOption']= item.operations.split(',');
              })
              console.log("fields Data", this.fieldsQueriesData);
            } else if (res["msg"]) {
              this.isFieldsQueriesData = false;
              this.ngxToaster.warning(res["msg"]);
            }
          },
          (err) => {
            console.log("error in getting fields queries", err);
          }
        )
        .add(() => {
          this.coreService.removeLoadingScreen();
        });
    } else {
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 500);
    }
  }

  // Suresh start

  // Suresh end
}
