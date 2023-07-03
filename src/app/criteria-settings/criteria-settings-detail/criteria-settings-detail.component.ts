import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { CriteriaSettingsService } from "../criteria-settings.service";

@Component({
  selector: "app-criteria-settings-detail",
  templateUrl: "./criteria-settings-detail.component.html",
  styleUrls: ["./criteria-settings-detail.component.scss"],
  providers: [ConfirmationService],
})
export class CriteriaSettingsDetailComponent implements OnInit {
  primaryColor = "var(--primary-color)";

  selectAppForm: any;
  selectFields: any[] = [];
  duplicateCriteria = false;
  restoreSelectFields: any[] = [];

  selectedFields: any[] = [];

  criteriaApplicationOptions: any[] = [];
  criteriaFormsOptions: any[] = [];

  isFieldsQueriesData: boolean = false;
  fieldsQueriesData: any = [];

  invalidForSave = false;

  userData: any;

  // Suresh start
  criteriaId = "";
  criteriaSettingtable = [];
  criteriaSettingDetails: any = {};
  orderIDArray: any = [];
  criteriaSettingtableopt: [];
  // Suresh end

  params: any;
  isCloneMode = false;
  criteriaDependancyOptions = [];
  mode = "add";
  criteriaTypeOp: any;

  constructor(
    private confirmationService: ConfirmationService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private criteriaSettingsService: CriteriaSettingsService,
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.params = this.activatedRoute.snapshot.params;
    this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
      this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
    );
    this.coreService.displayLoadingScreen();
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.setSelectAppForm();
    this.mode == "edit" && this.appCtrl.disable() && this.formCtrl.disable();
    this.mode == "clone" && this.formCtrl.enable();
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
            const params = this.activatedRoute.snapshot.params;
            if (params && params.id) {
              this.isCloneMode = true;
              this.setCloneCriteriaData(params.id);
              this.criteriaId = params.id;
              //this.formCtrl.enable();
            }
          } else if (res["msg"]) {
            this.coreService.showWarningToast(res["msg"]);
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
        if (!(this.params && this.params.id)) {
          this.coreService.removeLoadingScreen();
        }
      });
  }

  setSelectAppForm() {
    this.selectAppForm = this.fb.group({
      applications: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      forms: new UntypedFormControl({ value: "", disabled: true }, [
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
    if (!this.isCloneMode) {
      this.criteriaSettingtable = [];
      this.selectedFields = [];
      this.formCtrl.reset();
      this.selectFields = [];
    }
    this.formCtrl.enable();
  }

  onFormChange(e: any) {
    this.executeQueries();
  }

  executeQueries() {
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
              this.restoreSelectFields = [...this.fieldsQueriesData];
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
                item["dependencyOptions"] = item.dependency
                  ?.split(",")
                  .map((x) => {
                    return { label: x, code: x };
                  });
                item["dependency"] = "";
              });
              console.log("fields Data", this.fieldsQueriesData);
            } else if (res["msg"]) {
              this.isFieldsQueriesData = false;
              this.coreService.showWarningToast(res["msg"]);
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
      if (!this.isCloneMode) {
        this.selectFields = [...this.fieldsQueriesData];
        this.selectedFields = [];
        this.criteriaSettingtable = [];
      }
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 500);
    }
  }

  executeBtnClick() {
    this.selectedFields.forEach((item) => {
      console.log(item);
      // this.criteriaTypeOp = item["criteriaType"];
      // item["orderID"] =  this.criteriaSettingtable[index]["operations"];
      if (!item["operationOption"]) {
        item["operationOption"] = item["operations"].split(",").map((opt) => {
          return { label: opt, value: opt };
        });
        let index = this.criteriaSettingtable.findIndex(
          (x) => x.fieldName == item.fieldName
        );
        if (index == -1) {
          item["operations"] = "";
        } else {
          item["operations"] = this.criteriaSettingtable[index]["operations"];
        }
      }
      if (!item["dependencyOptions"]) {
        if (item.dependency) {
          item["dependencyOptions"] = item["dependency"]
            ? item["dependency"].split(",").map((opt) => {
                return { label: opt, value: opt };
              })
            : [];
        } else {
          item["dependency"] = "";
          item["dependencyOptions"] = [];
        }

        let index = this.criteriaSettingtable.findIndex(
          (x) => x.fieldName == item.fieldName
        );
        if (index == -1) {
          item["dependency"] = "";
        } else {
          item["dependency"] = this.criteriaSettingtable[index]["dependency"];
        }
      }
      let index = this.criteriaSettingtable.findIndex(
        (x) => x.fieldName == item.fieldName
      );
      if (index == -1) {
        item["iSMandatory"] = item["iSMandatory"] == "yes" ? true : false;
      } else {
        item["iSMandatory"] = this.criteriaSettingtable[index]["iSMandatory"];
      }
      if (index == -1) {
        item["orderID"] = "";
      } else {
        item["orderID"] = this.criteriaSettingtable[index]["orderID"];
      }
      // item["iSMandatory"] = this.criteriaSettingtable[index]["iSMandatory"];
      // item["iSMandatory"] = item["iSMandatory"] == "yes" ? true : false;
      // item["orderID"] =  this.criteriaSettingtable[index]["orderID"];
    });
    this.criteriaSettingtable = [...this.selectedFields];
    this.orderIDArray = [];
  }

  checkCriteriaDuplication(action) {
    this.coreService.displayLoadingScreen();
    this.criteriaSettingsService
      .getCriteriaSettingListing()
      .pipe(take(1))
      .subscribe(
        (res) => {
          if (res["appForm"] && res["appForm"].length) {
            this.duplicateCriteria = false;
            res["appForm"].forEach((appForm) => {
              let app = appForm.split(":")[0];
              let form = appForm.split(":")[1];
              if (
                this.appCtrl.value.name == app &&
                this.formCtrl.value.name == form &&
                !this.duplicateCriteria
              ) {
                console.log("confirm dialog");
                this.duplicateCriteria = true;
                this.confirmationService.confirm({
                  message: `Criteria for this Application <b>(${this.appCtrl.value.name})</b> & Form <b>(${this.formCtrl.value.name})</b> already exists, Do you want to update it?`,
                  accept: () => {
                    this.saveCriteriaFields(action);
                    console.log("Update it -- call save method API");
                  },
                  reject: () => {
                    this.coreService.showWarningToast(
                      "Criteria saving revoked"
                    );
                    console.log("Dont update it -- reject");
                  },
                });
              }
            });
            if (!this.duplicateCriteria) {
              this.saveCriteriaFields(action);
            }
          } else {
            console.log(res["msg"]);
            this.saveCriteriaFields(action);
          }
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

  saveCriteriaFields(action: any) {
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
      let dependency = [];
      criteria["operations"].forEach((op) => {
        operations.push(op["label"]);
      });
      if (criteria.dependency && criteria.dependency.length) {
        criteria["dependency"].forEach((op) => {
          dependency.push(op["label"]);
        });
      }

      console.log("data", criteria);
      let criteriaDetails = {
        criteriaType: criteria["criteriaType"],
        fieldName: criteria["fieldName"],
        displayName: criteria["displayName"],
        fieldType: criteria["fieldType"],
        operations: operations.join(","),
        iSMandatory: criteria["iSMandatory"] ? "yes" : "no",
        orderID: criteria["orderID"],
        dependency: dependency.length ? dependency.join(",") : null,
      };
      data["cmCriteriaDataDetails"].push(criteriaDetails);
    });

    this.criteriaSettingsService.postCriteriaFieldsToSave(data).subscribe(
      (res) => {
        if (res["msg"]) {
          if (this.mode == "clone") {
            if (this.duplicateCriteria) {
              this.coreService.showSuccessToast(
                "Criteria Details updated Sucessfully."
              );
            } else {
              this.coreService.showSuccessToast(
                "Criteria Clone created Sucessfully."
              );
            }
          }
          if (this.mode == "add") {
            if (this.duplicateCriteria) {
              this.coreService.showSuccessToast(
                "Criteria Details updated Sucessfully."
              );
            } else {
              this.coreService.showSuccessToast(
                "New criteria added Sucessfully."
              );
            }
          }

          if (this.mode == "edit") {
            this.coreService.showSuccessToast(
              "Criteria Details updated Sucessfully."
            );
          }
          if (action == "save") {
            this.router.navigate([`navbar/criteria-settings`]);
          } else if (action == "saveAddNew") {
            // this.reset();
            this.router.navigate([
              `navbar/criteria-settings/add-criteria-settings/add`,
            ]);
            // this.coreService.removeLoadingScreen();
          }
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
      this.coreService.showWarningToast(msg);
      this.invalidForSave = true;
    } else {
      let index = this.orderIDArray.indexOf(orderID);
      console.log(index, this.criteriaSettingtable.indexOf(field), orderID);
      if (orderID <= 0) {
        this.coreService.showWarningToast(
          "Priority is required and should be atleast 1"
        );
        this.orderIDArray[this.criteriaSettingtable.indexOf(field)] = orderID;
        this.invalidForSave = true;
      } else {
        if (index == -1 || this.criteriaSettingtable.indexOf(field) == index) {
          orderID > 0 &&
            (this.orderIDArray[this.criteriaSettingtable.indexOf(field)] =
              orderID);
          this.invalidForSave = false;
        } else {
          this.coreService.showWarningToast(
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
  }

  saveCriteriaSettings(action) {
    let emptyOperation = false;
    let emptyPriority = false;
    let emptydependency = false;
    let validGreaterthanPriority = false;
    this.criteriaSettingtable.forEach((element) => {
      console.log("element", element);
      if (element.operations == "") {
        emptyOperation = true;
      }
      if (element.orderID > this.criteriaSettingtable.length) {
        validGreaterthanPriority = true;
      }
      if (element.orderID == 0 || element.orderID < 0) {
        emptyPriority = true;
      }
      if (element.dependencyOptions.length && element.dependency.length == 0) {
        emptydependency = true;
      }
    });
    if (emptyOperation) {
      this.coreService.showWarningToast("Please select operation.");
    } else if (emptyPriority) {
      this.coreService.showWarningToast("Priority is required.");
    } else if (validGreaterthanPriority) {
      let msg =
        "Please enter priority " +
        (this.criteriaSettingtable.length == 1
          ? "as 1 only"
          : "between 1 to " + this.criteriaSettingtable.length);
      this.coreService.showWarningToast(msg);
    } else if (emptydependency) {
      this.coreService.showWarningToast("Dependency is required.");
    } else {
      console.log("passed validation", this.mode);

      if (this.mode == "edit") {
        this.saveCriteriaFields(action);
      } else {
        this.checkCriteriaDuplication(action);
      }
    }
  }

  setCloneCriteriaData(criteriaId: any) {
    forkJoin({
      cloneCriteriaData:
        this.criteriaSettingsService.getCriteriaCloneData(criteriaId),
      criteriaFieldsData:
        this.criteriaSettingsService.getCriteriaFieldsExecuteQueries(),
    })
      .pipe(
        take(1),
        map((response) => {
          const cloneCriteriaData =
            response.cloneCriteriaData["data"]["cloneCriteria"];
          const criteriaFieldsData =
            response.criteriaFieldsData["data"]["cmCriteriaOperationsMasters"];
          cloneCriteriaData["cmCriteriaDataDetails"].forEach((cloneD: any) => {
            this.orderIDArray.push(cloneD.orderID);
            cloneD["operationOption"] = criteriaFieldsData
              .find((fieldD) => fieldD["fieldName"] == cloneD["fieldName"])
              ["operations"].split(",")
              .map((x) => {
                return { label: x, value: x };
              });
            let selectedOpt = cloneD["operations"].split(",");
            cloneD["operations"] = selectedOpt.map((opt) => {
              return { label: opt, value: opt };
            });
            cloneD["iSMandatory"] =
              cloneD["iSMandatory"] == "yes" ? true : false;
            cloneD["dependencyOptions"] = [];
            let data = criteriaFieldsData.find(
              (fieldD) => fieldD["fieldName"] == cloneD["fieldName"]
            );
            console.log("data   vvvv", data);
            // this.criteriaTypeOp = data["criteriaType"];
            if (data && data["dependency"]) {
              cloneD["dependencyOptions"] = /[,]/.test(data["dependency"])
                ? data["dependency"].split(",").map((x) => {
                    return { label: x, value: x };
                  })
                : [{ label: data["dependency"], value: data["dependency"] }];
            }

            if (cloneD.dependency) {
              let selectedDep = /[,]/.test(data["dependency"])
                ? cloneD["dependency"].split(",")
                : [cloneD["dependency"]];
              cloneD["dependency"] = selectedDep.map((opt) => {
                return { label: opt, value: opt };
              });
            }
          });
          this.isFieldsQueriesData = true;
          this.fieldsQueriesData = [...criteriaFieldsData];

          this.selectedFields = criteriaFieldsData.filter((crit) => {
            return cloneCriteriaData["cmCriteriaDataDetails"].find(
              (cloneCrit) => {
                return cloneCrit["fieldName"] == crit["fieldName"];
              }
            );
          });
          this.selectFields = criteriaFieldsData.filter(
            (el) => !this.selectedFields.includes(el)
          );
          return cloneCriteriaData;
        })
      )
      .subscribe((data) => {
        this.criteriaSettingtable = data["cmCriteriaDataDetails"];
        console.log(this.criteriaSettingtable);
        this.criteriaSettingtable.forEach((item, i) => {
          item["operations"] = this.criteriaSettingtable[i]["operations"];
          item["dependency"] = this.criteriaSettingtable[i]["dependency"];
          item["iSMandatory"] = this.criteriaSettingtable[i]["iSMandatory"];
          console.log(item["iSMandatory"]);
        });
        //this.criteriaSettingtable.forEach((item, i) => {
        // item["dependency"] = this.criteriaSettingtable[i]["dependency"];
        //});

        const appValue = this.criteriaApplicationOptions.find(
          (value) => value.code === data["applications"]
        );
        this.appCtrl.setValue(appValue);
        const formValue = this.criteriaFormsOptions.find(
          (value) => value.code === data["form"]
        );
        this.formCtrl.setValue(formValue);
      })
      .add(() => {
        if (this.params && this.params.id) {
          this.coreService.removeLoadingScreen();
        }
      });
  }

  reset() {
    if (this.mode == "edit") {
      this.mode == "edit" && this.appCtrl.enable() && this.formCtrl.enable();
    }

    this.isFieldsQueriesData = false;
    this.criteriaSettingtable = [];
    this.selectFields = [];
    this.selectedFields = [];
    this.appCtrl.reset();
    this.formCtrl.reset();
    this.formCtrl.disable();
  }
  // Suresh end
}
