import { Component, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { Observable, forkJoin } from "rxjs";
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
  criteriaModuleOptions: any[] = [];

  criteriaOperatorsOptions: any[] = [];

  isFieldsQueriesData: boolean = false;
  fieldsQueriesData: any = [];

  invalidForSave = false;

  userData: any;
  appFormModuleDataForEdit: any = {};

  criteriaId = "";
  criteriaSettingtable = [];
  criteriaSettingDetails: any = {};
  orderIDArray: any = [];
  criteriaSettingtableopt: [];

  params: any;
  isCloneMode = false;
  criteriaDependancyOptions = [];
  mode = "add";
  criteriaTypeOp: any;

  cols: any[] = [
    {
      field: "fieldName",
      header: "Field Name",
      width: "20%",
      isMandatory: false,
    },
    {
      field: "displayName",
      header: "Display Name",
      width: "20%",
      isMandatory: false,
    },
    { field: "operator", header: "Operator ", width: "20%", isMandatory: true },
    {
      field: "criteriaPriority",
      header: "Criteria Priority",
      width: "15%",
      isMandatory: true,
    },
    {
      field: "isMandatory",
      header: "Is Mandatory",
      width: "15%",
      isMandatory: false,
    },
    {
      field: "dependency",
      header: "Dependency",
      width: "10%",
      isMandatory: true,
    },
  ];

  state$: Observable<any>;

  constructor(
    private confirmationService: ConfirmationService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private criteriaSettingsService: CriteriaSettingsService,
    private coreService: CoreService,
    private activatedRoute: ActivatedRoute
  ) {
    this.state$ = this.route.paramMap.pipe(map(() => window.history.state));
  }

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
    if (this.mode == "clone") {
      this.formCtrl.enable();
      this.moduleCtrl.enable();
    }
    this.criteriaSettingsService
      .getCriteriaAppFormsList()
      .pipe(take(1))
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(res["msg"]);
            }
          } else {
            if (res["data"]) {
              this.criteriaApplicationOptions = JSON.parse(
                localStorage.getItem("appAccess")
              );
              this.criteriaModuleOptions = JSON.parse(
                localStorage.getItem("modAccess")
              );
              this.criteriaFormsOptions = res["data"][
                "cmCriteriaFormsMaster"
              ].map((app) => {
                return { name: app.criteriaForms, code: app.criteriaForms };
              });
              this.criteriaOperatorsOptions = res["data"][
                "systemOperatorsMaster"
              ].map((app) => {
                return { name: app.codeName, code: app.codeName };
              });
              const params = this.activatedRoute.snapshot.params;
              if (params && params.id) {
                this.isCloneMode = true;
                this.setCloneCriteriaData(params.id);
                this.criteriaId = params.id;
              } else {
                let defAppMod = JSON.parse(
                  localStorage.getItem("defAppModule")
                );
                let defApp = null;
                let defMod = null;
                if (defAppMod) {
                  defApp = this.criteriaApplicationOptions.filter(
                    (opt) => opt.code == defAppMod.applicationName.code
                  )[0];
                  defMod = this.criteriaModuleOptions.filter(
                    (opt) => opt.code == defAppMod.moduleName.code
                  )[0];
                }

                if (defApp) {
                  this.appCtrl.patchValue(defApp);
                }
                if (defMod) {
                  this.moduleCtrl.patchValue(defMod);
                  this.moduleCtrl.enable();
                  this.formCtrl.enable();
                }
              }
            } else if (res["msg"]) {
              this.coreService.showWarningToast(res["msg"]);
              this.appCtrl.disable();
              this.formCtrl.disable();
            }
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
      modules: new UntypedFormControl({ value: "", disabled: true }, [
        Validators.required,
      ]),
    });
  }

  get appCtrl() {
    return this.selectAppForm.get("applications");
  }
  get moduleCtrl() {
    return this.selectAppForm.get("modules");
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
      this.moduleCtrl.reset();
    }
    this.moduleCtrl.enable();
  }

  onModuleChange() {
    if (!this.isCloneMode) {
      this.formCtrl.reset();
      this.criteriaSettingtable = [];
      this.selectedFields = [];
      this.selectFields = [];
    }
    this.formCtrl.enable();
  }

  onFormChange(e: any) {
    this.executeQueries();
  }

  executeQueries() {
    let data = {
      formName: this.formCtrl.value.name,
      moduleName: this.moduleCtrl.value.name,
      applicationName: this.appCtrl.value.name,
    };

    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
      this.selectFields = [];
      this.selectedFields = [];
      this.criteriaSettingtable = [];
      this.criteriaSettingsService
        .getCriteriaFieldsExecuteQueries()
        .pipe(take(1))
        .subscribe(
          (res) => {
            if (
              res["status"] &&
              typeof res["status"] == "string" &&
              (res["status"] == "400" || res["status"] == "500")
            ) {
              if (res["error"]) {
                this.coreService.showWarningToast(res["error"]);
              } else {
                this.coreService.showWarningToast(res["msg"]);
              }
            } else {
              if (res["data"]) {
                this.isFieldsQueriesData = true;
                this.fieldsQueriesData =
                  res["data"]["cmCriteriaOperationsMasters"];
                this.selectFields = [...this.fieldsQueriesData];
                this.restoreSelectFields = [...this.fieldsQueriesData];
                this.selectFields.forEach((item) => {
                  item["operationOption"] = this.criteriaOperatorsOptions.map(
                    (x) => {
                      return { label: x.name, code: x.name };
                    }
                  );
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
              } else if (res["msg"]) {
                this.isFieldsQueriesData = false;
                this.coreService.showWarningToast(res["msg"]);
              }
            }
          },
          (err) => {
            console.log("error in getting fields queries", err);
          }
        )
        .add(() => {
          this.coreService.removeLoadingScreen();
        });
    }
  }

  executeBtnClick() {
    this.selectedFields.forEach((item) => {
      if (!item["operationOption"]) {
        item["operationOption"] = this.criteriaOperatorsOptions.map((x) => {
          return { label: x.name, code: x.name };
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
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(res["msg"]);
            }
          } else {
            if (res["appForm"] && res["appForm"].length) {
              this.duplicateCriteria = false;
              res["appForm"].forEach((appForm) => {
                let app = appForm.split(":")[0];
                let form = appForm.split(":")[1];
                let module = appForm.split(":")[2];
                if (
                  this.appCtrl.value.name == app &&
                  this.formCtrl.value.name == form &&
                  this.moduleCtrl.value.name == module &&
                  !this.duplicateCriteria
                ) {
                  this.duplicateCriteria = true;
                  this.confirmationService.confirm({
                    message: `Criteria for this Application <b>(${this.appCtrl.value.name})</b>, Module <b>(${this.moduleCtrl.value.name})</b> & Form <b>(${this.formCtrl.value.name})</b> already exists, Do you want to update it?`,
                    accept: () => {
                      this.saveCriteriaFields(action);
                    },
                    reject: () => {
                      this.coreService.showWarningToast(
                        "Criteria saving revoked"
                      );
                    },
                  });
                }
              });
              if (!this.duplicateCriteria) {
                this.saveCriteriaFields(action);
              }
            } else {
              this.saveCriteriaFields(action);
            }
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
      moduleName: this.moduleCtrl.value.name,
      createdBy: null,
      createdByID: this.userData.userId,
      status: "A",
      cmCriteriaDataDetails: [],
    };
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
        if (
          res["status"] &&
          typeof res["status"] == "string" &&
          (res["status"] == "400" || res["status"] == "500")
        ) {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
          } else {
            this.coreService.showWarningToast(res["msg"]);
          }
        } else {
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
              this.router.navigate([
                `navbar/criteria-settings/add-criteria-settings/add`,
              ]);
            }
          }
        }
      },
      (err) => {
        console.log("Error in saving criteria", err);
      }
    );
  }

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
  }

  saveCriteriaSettings(action) {
    let emptyOperation = false;
    let emptyPriority = false;
    let emptydependency = false;
    let validGreaterthanPriority = false;
    this.criteriaSettingtable.forEach((element) => {
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
      if (this.mode == "edit") {
        this.saveCriteriaFields(action);
      } else {
        this.checkCriteriaDuplication(action);
      }
    }
  }

  setCloneCriteriaData(criteriaId: any) {
    let data = {
      formName: this.appFormModuleDataForEdit["formName"],
      moduleName: this.appFormModuleDataForEdit["moduleName"],
      applicationName: this.appFormModuleDataForEdit["appName"],
    };
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
            cloneD["operationOption"] = this.criteriaOperatorsOptions.map(
              (x) => {
                return { label: x.name, code: x.name };
              }
            );
            let selectedOpt = cloneD["operations"].split(",");
            cloneD["operations"] = selectedOpt.map((opt) => {
              return { label: opt, code: opt };
            });
            cloneD["iSMandatory"] =
              cloneD["iSMandatory"] == "yes" ? true : false;
            cloneD["dependencyOptions"] = [];
            let data = criteriaFieldsData.find(
              (fieldD) => fieldD["fieldName"] == cloneD["fieldName"]
            );
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
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            console.log("df", res);
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(res["msg"]);
            }
          } else {
            this.criteriaSettingtable = res["cmCriteriaDataDetails"];
            this.criteriaSettingtable.forEach((item, i) => {
              item["operations"] = this.criteriaSettingtable[i]["operations"];
              item["dependency"] = this.criteriaSettingtable[i]["dependency"];
              item["iSMandatory"] = this.criteriaSettingtable[i]["iSMandatory"];
            });

            const appValue = this.criteriaApplicationOptions.find(
              (value) => value.name === res["applications"]
            );
            this.appCtrl.setValue(appValue);
            const formValue = this.criteriaFormsOptions.find(
              (value) => value.name === res["form"]
            );
            this.formCtrl.setValue(formValue);
            const moduleValue = this.criteriaModuleOptions.find(
              (value) => value.name === res["moduleName"]
            );
            this.moduleCtrl.setValue(moduleValue);
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Error in fetching data, Please try again later"
          );
        }
      )
      .add(() => {
        if (this.params && this.params.id) {
          this.coreService.removeLoadingScreen();
        }
      });
  }

  reset() {
    if (this.mode == "edit" || this.mode == "clone") {
      this.appCtrl.enable();
    }
    this.isFieldsQueriesData = false;
    this.criteriaSettingtable = [];
    this.selectFields = [];
    this.selectedFields = [];
    // this.appCtrl.reset();
    // this.formCtrl.reset();
    // this.formCtrl.disable();
    // this.moduleCtrl.reset();
    // this.moduleCtrl.disable();
  }
}
