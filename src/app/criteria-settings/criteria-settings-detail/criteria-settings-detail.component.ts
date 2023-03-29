import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ConfirmationService } from "primeng/api";
import { take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { CriteriaSettingsService } from "../criteria-settings.service";

@Component({
  selector: "app-criteria-settings-detail",
  templateUrl: "./criteria-settings-detail.component.html",
  styleUrls: ["./criteria-settings-detail.component.css"],
  providers: [ConfirmationService],
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

  invalidForSave = false;

  userData: any;

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
  orderIDArray: any = [];
  // Suresh end

  constructor(
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ngxToaster: ToastrService,
    private criteriaSettingsService: CriteriaSettingsService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
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

  onFormChange(e: any) {
    this.executeQueries();
  }

  executeQueries() {
    this.selectedFields = [];
    this.criteriaSettingtable = [];
    this.coreService.displayLoadingScreen();
    console.log("changed form");
    if (!this.isFieldsQueriesData) {
      console.log("changed form if");
      this.criteriaSettingsService
        .getCriteriaFieldsExecuteQueries()
        .pipe(take(1))
        .subscribe(
          (res) => {
            if (res["data"]) {
              this.isFieldsQueriesData = true;
              this.fieldsQueriesData =
                res["data"]["cmCriteriaOperationsMasters"];
              this.selectFields = [...this.fieldsQueriesData];
              this.selectFields.forEach((item) => {
                item["operationOption"] = item.operations
                  .split(",")
                  .map((x) => {
                    return { label: x, code: x };
                  });
                item["orderID"] = "";
                item["operations"] = "";
                item["iSMandatory"] =
                  item["iSMandatory"] == "yes" ? true : false;
              });
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
      console.log("changed form else");
      console.log(this.fieldsQueriesData);
      this.selectFields = [...this.fieldsQueriesData];
      this.selectedFields = [];
      this.criteriaSettingtable = [];
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 500);
    }
  }

  executeBtnClick() {
    this.criteriaSettingtable = [...this.selectedFields];
    this.criteriaSettingtable.forEach((item) => {
      item["orderID"] = "";
      item["operations"] = "";
    });
    let s = [];
    Object.assign(s, this.criteriaSettingtable);
    this.criteriaSettingtable = [];
    this.criteriaSettingtable = s;
  }

  checkCriteriaDuplication() {
    this.coreService.displayLoadingScreen();
    this.criteriaSettingsService
      .getCriteriaSettingListing()
      .pipe(take(1))
      .subscribe(
        (res) => {
          if (res["appForm"].length) {
            let duplicateCriteria = false;
            res["appForm"].forEach((appForm) => {
              let app = appForm.split(":")[0];
              let form = appForm.split(":")[1];
              if (
                this.appCtrl.value.name == app &&
                this.formCtrl.value.name == form &&
                !duplicateCriteria
              ) {
                console.log("confirm dialog");
                duplicateCriteria = true;
                this.confirmationService.confirm({
                  message: `Criteria for this Application <b>(${this.appCtrl.value.name})</b> & Form <b>(${this.formCtrl.value.name})</b> already exists, Do you want to update it?`,
                  accept: () => {
                    this.saveCriteriaFields();
                    console.log("Update it -- call save method API");
                  },
                  reject: () => {
                    this.ngxToaster.warning("Criteria saving revoked");
                    console.log("Dont update it -- reject");
                  },
                });
              }
            });
            if (!duplicateCriteria) {
              this.saveCriteriaFields();
            }
          }
          console.log(res["appForm"]);
        },
        (err) => {
          console.log(
            "error in getting criteria list for checking duplication",
            err
          );
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  saveCriteriaFields() {
    this.coreService.displayLoadingScreen();
    let data = {
      form: this.formCtrl.value.name,
      applications: this.appCtrl.value.name,
      createdBy: null,
      createdByID: this.userData.userId,
      status: "A",
      cmCriteriaDataDetails: [],
    };
    console.log("on save", this.criteriaSettingtable);
    this.criteriaSettingtable.forEach((criteria) => {
      let operations = [];
      criteria["operations"].forEach((op) => {
        operations.push(op["label"]);
      });
      let criteriaDetails = {
        fieldName: criteria["fieldName"],
        displayName: criteria["displayName"],
        fieldType: criteria["fieldType"],
        operations: operations.join(","),
        iSMandatory: criteria["iSMandatory"] ? "yes" : "no",
        orderID: criteria["orderID"],
        dependency: criteria["dependency"],
      };
      data["cmCriteriaDataDetails"].push(criteriaDetails);
    });

    this.criteriaSettingsService.postCriteriaFieldsToSave(data).subscribe(
      (res) => {
        if (res["msg"]) {
          this.ngxToaster.success(res["msg"]);
          this.router.navigate(["navbar", "criteria-settings"]);
        }
      },
      (err) => {
        console.log("Error in saving criteria", err);
      }
    );
    console.log(data);
  }

  toggleIsMandatory(e: any) {
    console.log(e, this.criteriaSettingtable);
  }

  // Suresh start
  criteriaPriorityValidation(event, field) {
    let orderID = Number(event.target.value);
    if (orderID > this.criteriaSettingtable.length) {
      let msg =
        "Please enter priority " +
        (this.criteriaSettingtable.length == 1
          ? "as 1 only"
          : "between 1 to " + this.criteriaSettingtable.length);
      this.ngxToaster.warning(msg);
      this.invalidForSave = true;
    } else {
      let index = this.orderIDArray.indexOf(orderID);
      console.log(index, this.criteriaSettingtable.indexOf(field), orderID);
      if (orderID <= 0) {
        this.ngxToaster.warning("Priority is required and should be atleast 1");
        this.orderIDArray[this.criteriaSettingtable.indexOf(field)] = orderID;
        this.invalidForSave = true;
      } else {
        if (index == -1 || this.criteriaSettingtable.indexOf(field) == index) {
          orderID > 0 &&
            (this.orderIDArray[this.criteriaSettingtable.indexOf(field)] =
              orderID);
          this.invalidForSave = false;
        } else {
          this.ngxToaster.warning(
            "Entered priority is already exist please try with different."
          );
          this.invalidForSave = true;
        }
      }
    }
  }

  bindSelectedOperations(values, rowIndex) {
    let selectedOp: any = [];
    selectedOp = [...values.map((x) => x.code)].join(",");
    console.log(
      "selected",
      selectedOp,
      "this.criteriaSettingtable[rowIndex].operations",
      this.criteriaSettingtable[rowIndex].operations
    );
    // this.criteriaSettingtable[rowIndex].operations = "";
    // this.criteriaSettingtable[rowIndex].operations = selectedOp
  }

  saveCriteriaSettings() {
    let emptyOperation = false;
    let emptyPriority = false;
    this.criteriaSettingtable.forEach((element) => {
      if (element.operations == "") {
        emptyOperation = true;
      }
      if (element.orderID == 0 || element.orderID < 0) {
        emptyPriority = true;
      }
      // (element.operations == "") && (this.ngxToaster.warning("Please select operation."));
      // element.orderID == 0 && this.ngxToaster.warning("Please Enter Priority.");
    });
    if (emptyOperation) {
      this.ngxToaster.warning("Please select operation.");
    } else if (emptyPriority) {
      this.ngxToaster.warning("Priority is required.");
    } else {
      console.log("passed validation");
      this.checkCriteriaDuplication();
    }
  }
  // Suresh end
}
