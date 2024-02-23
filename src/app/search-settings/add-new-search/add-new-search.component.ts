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
import { SearchSettingsService } from "../search-settings.service";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-add-new-search",
  templateUrl: "./add-new-search.component.html",
  styleUrls: ["./add-new-search.component.scss"],
})
export class AddNewSearchComponent implements OnInit {
  primaryColor = "var(--primary-color)";

  selectAppForm: any;
  selectFields: any[] = [];
  duplicateCriteria = false;
  restoreSelectFields: any[] = [];

  selectedFields: any[] = [];

  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];
  searchFormsOptions: any[] = [];

  searchOperatorsOptions: any[] = [];

  isFieldsQueriesData: boolean = false;
  fieldsQueriesData: any = [];

  invalidForSave = false;

  userData: any;

  appFormModuleDataForEdit: any = {};

  searchId = "";
  searchSettingtable = [];
  criteriaSettingDetails: any = {};
  orderIDArray: any = [];
  searchSettingtableopt: [];

  params: any;
  isCloneMode = false;
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
      width: "30%",
      isMandatory: false,
    },
    { field: "operator", header: "Operator ", width: "35%", isMandatory: true },
    {
      field: "displayOrder",
      header: "Display Order",
      width: "15%",
      isMandatory: true,
    },
  ];

  state$: Observable<any>;

  constructor(
    private confirmationService: ConfirmationService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private searchSettingsService: SearchSettingsService,
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
    this.mode == "clone" && this.formCtrl.enable();

    // !
    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));
    let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
    let defApp = null;
    let defMod = null;
    if (defAppMod) {
      defApp = JSON.parse(localStorage.getItem("applicationName"));
      defMod = JSON.parse(localStorage.getItem("moduleName"));
    }

    if (defApp) {
      this.appCtrl.patchValue(defApp);
    }
    if (defMod) {
      this.moduleCtrl.patchValue(defMod);
      this.moduleCtrl.enable();
      this.formCtrl.enable();
    }
    // !

    this.searchSettingsService
      .getSearchAppFormsList()
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
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (res["data"]) {
              this.searchFormsOptions = res["data"][
                "cmSearchSettingFormMasters"
              ].map((app) => {
                return { name: app.codeName, code: app.codeName };
              });
              this.searchOperatorsOptions = res["data"][
                "systemOperatorsMaster"
              ].map((app) => {
                return { name: app.codeName, code: app.codeName };
              });
              const params = this.activatedRoute.snapshot.params;
              if (params && params.id) {
                this.isCloneMode = true;
                let data;
                this.searchId = params.id;
                this.state$.subscribe((res) => {
                  if (res["appName"]) {
                    this.appFormModuleDataForEdit = res;
                    this.setCloneCriteriaData(params.id);
                  } else {
                    this.router.navigateByUrl(`navbar/search-settings`);
                  }
                });
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
      this.searchSettingtable = [];
      this.selectedFields = [];
      this.formCtrl.reset();
      this.moduleCtrl.reset();
      this.selectFields = [];
    }
    this.moduleCtrl.enable();
  }

  onModuleChange() {
    if (!this.isCloneMode) {
      this.formCtrl.reset();
      this.searchSettingtable = [];
      this.selectedFields = [];
      this.selectFields = [];
    }
    this.formCtrl.enable();
  }

  onFormChange(e: any) {
    this.executeQueries();
  }

  executeQueries() {
    this.coreService.displayLoadingScreen();
    let data = {
      formName: this.formCtrl.value.code,
      moduleName: this.moduleCtrl.value.code,
      applicationName: this.appCtrl.value.code,
    };

    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
      this.selectFields = [];
      this.selectedFields = [];
      this.searchSettingtable = [];

      this.searchSettingsService
        .getSearchFieldsExecuteQueries(data)
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
                this.coreService.showWarningToast(
                  "Some error in fetching data"
                );
              }
            } else {
              if (res["data"]["cmCriteriaOperationsMasters"].length) {
                this.isFieldsQueriesData = true;
                this.fieldsQueriesData =
                  res["data"]["cmCriteriaOperationsMasters"];
                this.selectFields = [...this.fieldsQueriesData];
                this.restoreSelectFields = [...this.fieldsQueriesData];
                this.selectFields.forEach((item) => {
                  item["operationOption"] = this.searchOperatorsOptions.map(
                    (x) => {
                      return { label: x.name, code: x.name };
                    }
                  );
                  item["orderID"] = "";
                  item["operations"] = "";
                });
              } else if (
                res["data"]["cmCriteriaOperationsMasters"].length == 0
              ) {
                this.isFieldsQueriesData = false;
                this.coreService.showWarningToast(
                  "No data found for selected parameters"
                );
              } else if (res["msg"]) {
                this.isFieldsQueriesData = false;
                this.coreService.showWarningToast(res["msg"]);
                this.selectFields = [];
                this.selectedFields = [];
                this.searchSettingtable = [];
              }
            }
          },
          (err) => {
            console.log("error in getting fields queries", err);
            this.coreService.showWarningToast("Some error in fetching data");
          }
        )
        .add(() => {
          this.coreService.removeLoadingScreen();
        });
    } else {
      if (!this.isCloneMode) {
        this.selectFields = [...this.fieldsQueriesData];
        this.selectedFields = [];
        this.searchSettingtable = [];
      }
    }
  }

  executeBtnClick() {
    this.selectedFields.forEach((item) => {
      if (!item["operationOption"]) {
        item["operationOption"] = this.searchOperatorsOptions.map((x) => {
          return { label: x.name, code: x.name };
        });
        let index = this.searchSettingtable.findIndex(
          (x) => x.fieldName == item.fieldName
        );
        if (index == -1) {
          item["operations"] = "";
        } else {
          item["operations"] = this.searchSettingtable[index]["operators"];
        }
      }
      let index = this.searchSettingtable.findIndex(
        (x) => x.fieldName == item.fieldName
      );
      if (index == -1) {
        item["orderID"] = "";
      } else {
        item["orderID"] = this.searchSettingtable[index]["orderID"];
      }
    });
    this.searchSettingtable = [...this.selectedFields];
    this.orderIDArray = [];
  }

  checkCriteriaDuplication(action) {
    this.coreService.displayLoadingScreen();
    this.searchSettingsService
      .getSearchSettingListing()
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
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (res["appForm"] && res["appForm"].length) {
              this.duplicateCriteria = false;
              res["appForm"].forEach((appForm) => {
                let app = appForm.split(":")[0];
                let form = appForm.split(":")[1];
                let module = appForm.split(":")[2];
                if (
                  this.appCtrl.value.code == app &&
                  this.formCtrl.value.code == form &&
                  this.moduleCtrl.value.code == module &&
                  !this.duplicateCriteria
                ) {
                  this.coreService.setSidebarBtnFixedStyle(false);
                  this.coreService.setHeaderStickyStyle(false);
                  this.duplicateCriteria = true;
                  this.confirmationService.confirm({
                    message: `<img src="../../../assets/warning.svg"><br/><br/> Search setting for this Application <b>(${this.appCtrl.value.name})</b>, Module <b>(${this.moduleCtrl.value.name})</b> & Form <b>(${this.formCtrl.value.name})</b> already exists, Do you want to update it?`,
                    accept: () => {
                      this.saveCriteriaFields(action);
                      this.setHeaderSidebarBtn(true);
                    },
                    reject: () => {
                      this.coreService.showWarningToast(
                        "Search setting saving revoked"
                      );
                      this.setHeaderSidebarBtn(false);
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
            "error in getting search setting list for checking duplication",
            err
          );
          this.coreService.showWarningToast("Some error in fetching data");
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }

  setHeaderSidebarBtn(accept: boolean) {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    if (!accept) {
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 1000);
    }
  }

  saveCriteriaFields(action: any) {
    this.coreService.displayLoadingScreen();
    let data = {
      formName: this.formCtrl.value.code,
      applicationName: this.appCtrl.value.code,
      moduleName: this.moduleCtrl.value.code,
      createdBy: null,
      createdByID: this.userData.userId,
      status: "A",
      settingSearchQueryCriteria: [],
    };
    this.searchSettingtable.forEach((searchSetting) => {
      let operations = [];
      searchSetting["operations"].forEach((op) => {
        operations.push(op["label"]);
      });
      delete searchSetting["id"];
      searchSetting["operators"] = operations.join(",");
      data["settingSearchQueryCriteria"].push(searchSetting);
    });

    let operation = "add";

    if (this.mode == "edit") {
      operation = "update";
    }

    this.searchSettingsService
      .postSearchFieldsToSave(data, operation, this.userData.userId)
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
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (res["msg"]) {
              if (this.mode == "clone") {
                if (this.duplicateCriteria) {
                  this.coreService.showSuccessToast(
                    "Search setting updated Sucessfully."
                  );
                } else {
                  this.coreService.showSuccessToast(
                    "Search setting Clone created Sucessfully."
                  );
                }
              }
              if (this.mode == "add") {
                if (this.duplicateCriteria) {
                  this.coreService.showSuccessToast(
                    "Search setting updated Sucessfully."
                  );
                } else {
                  this.coreService.showSuccessToast(
                    "New Search setting added Sucessfully."
                  );
                }
              }

              if (this.mode == "edit") {
                this.coreService.showSuccessToast(
                  "Search setting updated Sucessfully."
                );
              }
              if (action == "save") {
                this.router.navigate([`navbar/search-settings`]);
              } else if (action == "saveAddNew") {
                this.router.navigate([
                  `navbar/search-settings/add-search-settings/add`,
                ]);
              }
            }
          }
        },
        (err) => {
          console.log("Error in saving Search setting", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  criteriaPriorityValidation(event, field) {
    let orderID = Number(event.target.value);
    if (orderID > this.searchSettingtable.length) {
      let msg =
        "Please enter display order " +
        (this.searchSettingtable.length == 1
          ? "as 1 only"
          : "between 1 to " + this.searchSettingtable.length);
      this.coreService.showWarningToast(msg);
      this.invalidForSave = true;
      field["invalidForSave"] = true;
    } else {
      let index = this.orderIDArray.indexOf(orderID);
      if (orderID <= 0) {
        this.coreService.showWarningToast(
          "Display Order is required and should be atleast 1"
        );
        this.orderIDArray[this.searchSettingtable.indexOf(field)] = orderID;
        this.invalidForSave = true;
        field["invalidForSave"] = true;
      } else {
        if (index == -1 || this.searchSettingtable.indexOf(field) == index) {
          orderID > 0 &&
            (this.orderIDArray[this.searchSettingtable.indexOf(field)] =
              orderID);
          this.invalidForSave = false;
          field["invalidForSave"] = false;
        } else {
          this.coreService.showWarningToast(
            "Entered display order is already exist please try with different."
          );
          this.invalidForSave = true;
          field["invalidForSave"] = true;
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
    let validGreaterthanPriority = false;
    let displayOrderInvalid = false;
    this.searchSettingtable.forEach((element) => {
      if (element.operations == "") {
        emptyOperation = true;
      }
      if (element.orderID > this.searchSettingtable.length) {
        validGreaterthanPriority = true;
      }
      if (element.orderID == 0 || element.orderID < 0) {
        emptyPriority = true;
      }
      if (element["invalidForSave"]) {
        displayOrderInvalid = true;
      }
    });
    if (emptyOperation) {
      this.coreService.showWarningToast("Please select operation.");
    } else if (emptyPriority) {
      this.coreService.showWarningToast("Display Order is required.");
    } else if (validGreaterthanPriority) {
      let msg =
        "Please enter display order " +
        (this.searchSettingtable.length == 1
          ? "as 1 only"
          : "between 1 to " + this.searchSettingtable.length);
      this.coreService.showWarningToast(msg);
    } else if (displayOrderInvalid) {
      let msg = "Some of display order fields are invalid.";
      this.coreService.showWarningToast(msg);
    } else {
      if (this.mode == "edit") {
        this.saveCriteriaFields(action);
      } else {
        this.checkCriteriaDuplication(action);
      }
    }
  }

  setCloneCriteriaData(searchId: any) {
    let data = {
      formName: this.appFormModuleDataForEdit["formName"],
      moduleName: this.appFormModuleDataForEdit["moduleName"],
      applicationName: this.appFormModuleDataForEdit["appName"],
    };

    forkJoin({
      cloneCriteriaData:
        this.searchSettingsService.getSearchCloneData(searchId),
      criteriaFieldsData:
        this.searchSettingsService.getSearchFieldsExecuteQueries(data),
    })
      .pipe(
        take(1),
        map((response) => {
          if (
            response.cloneCriteriaData["data"] &&
            response.cloneCriteriaData["data"]["cloneCriteria"]
          ) {
            const cloneCriteriaData =
              response.cloneCriteriaData["data"]["cloneCriteria"];
            const criteriaFieldsData =
              response.criteriaFieldsData["data"][
                "cmCriteriaOperationsMasters"
              ];
            cloneCriteriaData["settingSearchQueryCriteria"].forEach(
              (cloneD: any) => {
                this.orderIDArray.push(cloneD.orderID);
                cloneD["operationOption"] = this.searchOperatorsOptions.map(
                  (x) => {
                    return { label: x.name, code: x.name };
                  }
                );
                let selectedOpt = cloneD["operators"].split(",");
                cloneD["operators"] = selectedOpt.map((opt) => {
                  return { label: opt, code: opt };
                });
                let data = criteriaFieldsData.find(
                  (fieldD) => fieldD["fieldName"] == cloneD["fieldName"]
                );
              }
            );
            this.isFieldsQueriesData = true;
            this.fieldsQueriesData = [...criteriaFieldsData];

            this.selectedFields = criteriaFieldsData.filter((crit) => {
              return cloneCriteriaData["settingSearchQueryCriteria"].find(
                (cloneCrit) => {
                  return cloneCrit["fieldName"] == crit["fieldName"];
                }
              );
            });
            this.selectFields = criteriaFieldsData.filter(
              (el) => !this.selectedFields.includes(el)
            );
            return cloneCriteriaData;
          } else {
            return response.cloneCriteriaData;
          }
        })
      )
      .subscribe((res) => {
        console.log(":::", res);
        if (res["status"]) {
          if (
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (res) {
              this.searchSettingtable = res["settingSearchQueryCriteria"];
              this.searchSettingtable.forEach((item, i) => {
                item["operations"] = this.searchSettingtable[i]["operators"];
              });

              const appValue = this.searchApplicationOptions.find(
                (value) => value.code === res["applicationName"]
              );
              this.appCtrl.setValue(appValue);
              const formValue = this.searchFormsOptions.find(
                (value) => value.code === res["formName"]
              );
              this.formCtrl.setValue(formValue);
              const moduleValue = this.searchModuleOptions.find(
                (value) => value.code === res["moduleName"]
              );
              this.moduleCtrl.setValue(moduleValue);
            }
          }
        } else if (res["msg"]) {
          this.coreService.showWarningToast(res["msg"]);
          return;
        }
      })
      .add(() => {
        if (this.params && this.params.id) {
          this.coreService.removeLoadingScreen();
        }
      });
  }

  reset() {
    this.isFieldsQueriesData = false;
    this.searchSettingtable = [];
    this.selectFields = [];
    this.selectedFields = [];
    // this.appCtrl.reset();
    // this.formCtrl.reset();
    // this.moduleCtrl.reset();
    // this.formCtrl.disable();
    // this.moduleCtrl.disable();
  }
}
