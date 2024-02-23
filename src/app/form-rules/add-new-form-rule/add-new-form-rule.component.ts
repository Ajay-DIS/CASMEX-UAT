import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService, TreeNode } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { FormRuleService } from "../form-rule.service";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { TreeTable } from "primeng/treetable";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-add-new-form-rule",
  templateUrl: "./add-new-form-rule.component.html",
  styleUrls: ["./add-new-form-rule.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddNewFormRuleComponent implements OnInit {
  primaryColor = "var(--primary-color)";
  @ViewChild("treeTable") treeTable: TreeTable;

  validLengthRegex: RegExp = /^[^<>*!]+$/;

  userId = "";
  ruleID = "";
  mode = "add";
  // formName = "Form Rules";

  formRuleCode = "No Data";
  ruleDescription = "";

  statusData: any = [];
  deactivated: boolean = false;

  isFromRulesLinked: boolean = false;

  appliedCriteriaDataOrg: any = [];
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;

  editFromRulesApiData: any = [];

  criteriaMasterData: any = {};
  criteriaDataDetailsJson: any = {};
  cmCriteriaMandatory = [];
  cmCriteriaDependency: any = {};
  cmCriteriaDataDetails: any = [];
  independantCriteriaArr: any = [];
  cmCriteriaSlabType: any = { Slab: "LCY Amount", date: "Transaction Date" };
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [];
  criteriaEqualsDdlOptions = [];
  correspondentDdlOptions = [];

  criteriaText: any[] = [];
  criteriaCodeText: any[] = [];

  savingCriteriaTemplateError = null;

  inactiveData: boolean = false;
  isApplyCriteriaClicked: boolean = false;
  4;

  isLcyAmount: boolean = false;
  isLcySlab: boolean = false;

  formRulesData: any = [];

  applyCriteriaFormattedData: any[] = [];

  applyCriteriaDataTableColumns: any[] = [];

  ttLoading = false;

  cols: any[] = [
    {
      field: "fieldId",
      header: "Field Name",
      type: "string",
      width: "225px",
      info: null,
    },
    {
      field: "fieldDisplayName",
      header: "Field Label",
      type: "input",
      width: "150px",
      info: null,
    },
    {
      field: "isMandatory",
      header: "Is Mandatory",
      type: "checkbox",
      width: "80px",
      info: null,
    },
    {
      field: "isEnable",
      header: "Is Enable",
      type: "checkbox",
      width: "80px",
      info: null,
    },
    {
      field: "isVisible",
      header: "Is Visible",
      type: "checkbox",
      width: "80px",
      info: null,
    },
    {
      field: "checkDuplicate",
      header: "Check Duplicate",
      type: "checkbox",
      width: "80px",
      info: null,
    },
    {
      field: "displayInNewLine",
      header: "Show in newline",
      type: "checkbox",
      width: "80px",
      info: null,
    },
    {
      field: "regex",
      header: "Regex",
      type: "input",
      width: "120px",
      info: null,
    },

    {
      field: "regexMessage",
      header: "Regex Message",
      type: "input",
      width: "120px",
      info: null,
    },
    {
      field: "prefix",
      header: "Prefix",
      type: "input",
      width: "80px",
      info: null,
    },
    {
      field: "suffix",
      header: "Suffix",
      type: "input",
      width: "80px",
      info: null,
    },
    // {
    //   field: "validLength",
    //   header: "Min/Max Length",
    //   type: "input",
    //   width: "80px",
    //   info: null
    // },
    {
      field: "minLength",
      header: "Min Length",
      type: "input",
      width: "60px",
      info: null,
    },
    {
      field: "maxLength",
      header: "Max Length",
      type: "input",
      width: "60px",
      info: null,
    },
    {
      field: "defaultValue",
      header: "Default Value",
      type: "input",
      width: "210px",
      info: null,
    },
    {
      field: "setOptions",
      header: "Set Options",
      type: "dropdownMulti",
      width: "210px",
      info: null,
    },
    {
      field: "validValues",
      header: "Valid Values",
      type: "chips",
      width: "200px",
      info: "Multiple values are allowed, seprate them using , comma.",
    },
    {
      field: "displayValidValuesOnHover",
      header: "Show Valid Values",
      type: "checkbox",
      width: "100px",
      info: "Tick this, if user is allowed to see valid values on hover.",
    },
    {
      field: "warning",
      header: "Warning",
      type: "checkbox",
      width: "100px",
      info: null,
    },
    {
      field: "warningMessageCode",
      header: "Warning Code",
      type: "dropdownSingle",
      width: "210px",
      info: null,
    },
    {
      field: "block",
      header: "Block",
      type: "checkbox",
      width: "100px",
      info: null,
    },
    {
      field: "blockMessageCode",
      header: "Block Code",
      type: "dropdownSingle",
      width: "210px",
      info: null,
    },
    {
      field: "masking",
      header: "Masking",
      type: "input",
      width: "100px",
      info: null,
    },
  ];

  defCols = this.cols.map((col) => col.field);

  defValueInpTooltip = "";
  minMaxInpTooltip = "";

  applyCriteriaResponse: any = {};

  selectedNodes: TreeNode[] = [];
  maxlengthDefaultValue = 0;

  appliedCriteriaDataCols = [];
  appliedCriteriaData: any = [];

  appliedCriteriaDatajson: any = {};

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];
  searchFormOptions: any[] = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  customMsgMaster = {
    block: [
      {
        code: "ERR-001",
        codeName: "ERR-001",
      },
      {
        code: "ERR-002",
        codeName: "ERR-002",
      },
    ],
    warning: [
      {
        code: "WARN-001",
        codeName: "WARN-001",
      },
      {
        code: "WARN-002",
        codeName: "WARN-002",
      },
    ],
  };

  formFieldsMaster = {};

  fieldDisplayData = {};

  setCriteriaName = "forms";

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private setCriteriaService: SetCriteriaService,
    private formRuleService: FormRuleService,
    private criteriaDataService: CriteriaDataService,
    private fb: UntypedFormBuilder
  ) {}

  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.mode = "add";
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.setSelectAppModule();
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      this.ruleID = params.id;
    }

    // !

    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));

    let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
    let currAppMod = JSON.parse(sessionStorage.getItem("form"));

    let defApp = null;
    let defMod = null;

    if (currAppMod) {
      console.log(currAppMod);
      defApp = this.searchApplicationOptions.filter(
        (opt) => opt.code == currAppMod.applicationName.code
      )[0];
      defMod = this.searchModuleOptions.filter(
        (opt) => opt.code == currAppMod.moduleName.code
      )[0];
    } else {
      if (defAppMod) {
        defApp = JSON.parse(localStorage.getItem("applicationName"));
        defMod = JSON.parse(localStorage.getItem("moduleName"));
      }
    }

    if (defApp) {
      this.appCtrl.patchValue(defApp);
    }
    if (defMod) {
      this.moduleCtrl.patchValue(defMod);
    }

    this.formRuleService.getFormRulesAppModuleList().subscribe(
      (res) => {
        if (
          res["status"] &&
          typeof res["status"] == "string" &&
          (res["status"] == "400" || res["status"] == "500")
        ) {
          this.coreService.removeLoadingScreen();
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
          } else {
            this.coreService.showWarningToast("Some error in fetching data");
          }
        } else {
          if (!res["msg"]) {
            this.searchFormOptions = res["data"]["cmCriteriaFormsMaster"]
              .filter((form) => {
                return form.criteriaForms.includes("_Form Rules");
              })
              .map((form) => {
                return { name: form.criteriaForms, code: form.criteriaForms };
              });

            let defForm = null;

            if (currAppMod) {
              defForm = this.searchFormOptions.filter(
                (opt) => opt.code == currAppMod.formName.code
              )[0];
            }

            if (defForm) {
              this.formCtrl.patchValue(defForm);
            }

            if (this.mode != "add") {
              if (
                this.appCtrl.value &&
                this.moduleCtrl.value &&
                this.formCtrl.value
              ) {
                this.appCtrl.disable();
                this.moduleCtrl.disable();
                this.formCtrl.disable();
                this.searchAppModule();
                this.appModuleDataPresent = true;
              } else {
                this.router.navigate([`navbar/form-rules`]);
              }
            } else {
              this.moduleCtrl.enable();
              this.formCtrl.enable();
              if (
                this.appCtrl.value &&
                this.moduleCtrl.value &&
                this.formCtrl.value
              ) {
                this.searchAppModule();
              } else {
                this.coreService.removeLoadingScreen();
              }
            }
          } else {
            this.coreService.removeLoadingScreen();
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
    this.statusData = this.formRuleService.getData();
    console.log("status", this.statusData);
    if (this.statusData && this.statusData["status"] == "Inactive") {
      this.deactivated = true;
    }
  }

  check(key: any) {
    console.log(key);
    console.log(this.applyCriteriaFormattedData);
  }

  setSelectAppModule() {
    this.selectAppModule = this.fb.group({
      applications: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      modules: new UntypedFormControl({ value: "", disabled: true }, [
        Validators.required,
      ]),
      forms: new UntypedFormControl({ value: "", disabled: true }, [
        Validators.required,
      ]),
    });
  }

  get appCtrl() {
    return this.selectAppModule.get("applications");
  }
  get moduleCtrl() {
    return this.selectAppModule.get("modules");
  }
  get formCtrl() {
    return this.selectAppModule.get("forms");
  }

  onAppValueChange() {
    this.showContent = false;
    this.appModuleDataPresent = false;
    this.moduleCtrl.reset();
    this.formCtrl.reset();
    this.moduleCtrl.enable();
  }
  onModValueChange() {
    this.showContent = false;
    this.appModuleDataPresent = false;
    this.formCtrl.reset();
    this.formCtrl.enable();
  }

  searchAppModule() {
    this.applyCriteriaFormattedData = [];
    this.criteriaText = [];
    this.criteriaCodeText = [];
    this.appModuleDataPresent = true;
    this.showContent = false;
    this.getCriteriaMasterData();
    // this.getFormFieldsMasterData();
    this.getCustomerMasterDataFromAppControlAndRemittance();
    this.getAllTemplates();
  }

  getVirtualOptions(apiKey: any) {
    return [{ code: "1", name: "One" }];
  }

  getFieldTypeName(fieldType: any) {
    if (fieldType == "dropdownSingle" || fieldType == "dropdownMulti") {
      return "Dropdown";
    } else {
      return fieldType;
    }
  }

  getFormRulesForEditApi(formRuleCode: any, operation: any) {
    let simpleData = false;
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.formRuleService
      .getFormRuleForEdit(
        formRuleCode,
        operation,
        this.formRuleService.applicationName,
        this.formRuleService.moduleName,
        this.formRuleService.formName
      )
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.coreService.removeLoadingScreen();
            this.showContent = false;
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (!res["msg"]) {
              this.coreService.removeLoadingScreen();
              this.appModuleDataPresent = true;
              this.editFromRulesApiData = JSON.parse(this.stringify(res));

              this.appliedCriteriaCriteriaMap = res["criteriaMap"];

              this.formRuleCode = this.editFromRulesApiData["formRuleCode"];
              if (this.editFromRulesApiData["formRuleDesc"]) {
                this.ruleDescription =
                  this.editFromRulesApiData["formRuleDesc"];
              }
              this.isFromRulesLinked =
                !this.editFromRulesApiData["criteriaUpdate"];

              let reqData =
                this.criteriaDataService.decodeCriteriaMapIntoTableFields(
                  this.editFromRulesApiData
                );

              this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
                this.editFromRulesApiData
              );

              this.criteriaText =
                this.setCriteriaService.decodeFormattedCriteria(
                  reqData.critMap,
                  this.criteriaMasterData,
                  this.fieldDisplayData
                );
              console.log("criteriaText", this.criteriaText);
              this.applyCriteriaDataTableColumns = [];
              this.applyCriteriaFormattedData = [];

              let lcyOprFields = [];
              let isLcyOprFieldPresent = false;
              let lcyOprFieldInserted = false;
              let lcySlabFieldInserted = false;

              this.applyCriteriaDataTableColumns = [...this.cols];

              console.log(this.applyCriteriaDataTableColumns);

              let completeData = [];
              let amtSlabPresent = false;
              let dateSlabPresent = false;

              if (res["criteriaMap"].indexOf("from:") >= 0) {
                amtSlabPresent = true;
              }

              if (res["criteriaMap"].indexOf("trnStartDate=") >= 0) {
                dateSlabPresent = true;
              }

              if (amtSlabPresent && dateSlabPresent) {
                res["data"]["dataOperation"].forEach((data) => {
                  Object.values(data).forEach((subData) => {
                    (subData as any[]).forEach((d) => {
                      d["data"]["key"] = d["data"]["criteriaMapSplit"]
                        .split("&&&&")
                        .slice(1)
                        .join("&&&&");
                    });
                  });
                });
                this.applyCriteriaDataTableColumns.splice(-8, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  type: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-8, 0, {
                  field: "dateTo",
                  header: "Date To",
                  type: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-8, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  type: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-8, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  type: "text",
                });
              } else {
                if (amtSlabPresent) {
                  res["data"]["dataOperation"].forEach((data) => {
                    Object.values(data).forEach((subData) => {
                      (subData as any[]).forEach((d) => {
                        d["data"]["key"] =
                          d["data"]["criteriaMapSplit"].split("&&&&")[1];
                      });
                    });
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    type: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    type: "text",
                  });
                } else if (dateSlabPresent) {
                  res["data"]["dataOperation"].forEach((data) => {
                    Object.values(data).forEach((subData) => {
                      (subData as any[]).forEach((d) => {
                        d["data"]["key"] =
                          d["data"]["criteriaMapSplit"].split("&&&&")[1];
                      });
                    });
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "dateFrom",
                    header: "Date From",
                    type: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "dateTo",
                    header: "Date To",
                    type: "text",
                  });
                } else if (!amtSlabPresent && !dateSlabPresent) {
                  Object.keys(res["labelData"]["label"]).forEach((k, i) => {
                    let formattedRowData = {
                      data: {
                        fieldId: res["labelData"]["label"][k],
                        key: i,
                      },
                      expanded: true,
                      leaf: false,
                      children: [],
                    };

                    let formattedChilds =
                      res["data"]["dataOperation"][0][
                        res["labelData"]["label"][k]
                      ];

                    formattedChilds.forEach((child) => {
                      child["leaf"] = true;
                      if (child["data"]["ruleSelected"] == "Yes") {
                        child["partialSelected"] = false;
                        this.selectedNodes.push(child);
                      }
                    });

                    formattedRowData["children"] = formattedChilds;
                    completeData.push(formattedRowData);
                  });
                }
              }

              this.applyCriteriaDataTableColumns.forEach((col) => {
                res["data"]["dataOperation"].forEach((data) => {
                  Object.values(data).forEach((subData) => {
                    (subData as any[]).forEach((d) => {
                      if (
                        col["field"] == "setOptions" ||
                        col["field"] == "defaultValue" ||
                        col["field"] == "validValues" ||
                        col["field"] == "blockMessageCode" ||
                        col["field"] == "warningMessageCode"
                      ) {
                        if (d["data"][col["field"]]) {
                          d["data"][col["field"]] = JSON.parse(
                            d["data"][col["field"]]
                          );
                        }
                      }
                      if (
                        d["data"][col["field"]] == "Yes" ||
                        d["data"][col["field"]] == "True"
                      ) {
                        d["data"][col["field"]] = true;
                      }
                      if (
                        d["data"][col["field"]] == "No" ||
                        d["data"][col["field"]] == "False"
                      ) {
                        d["data"][col["field"]] = false;
                      }
                      if (d["data"][col["field"]] == "null") {
                        d["data"][col["field"]] = "";
                      }
                      if (col["value"]) {
                        d["data"][col["field"]] = col["value"];
                      }
                    });
                  });
                });
              });

              if (amtSlabPresent || dateSlabPresent) {
                if (amtSlabPresent && dateSlabPresent) {
                  reqData.dateSlabArr.forEach((slabD, di) => {
                    reqData.lcySlabArr.forEach((slabA, ai) => {
                      Object.keys(res["labelData"]["label"]).forEach((k) => {
                        let formattedRowData = {
                          data: {
                            fieldId: res["labelData"]["label"][k],
                            key: ai,
                          },
                          expanded: true,
                          leaf: false,
                          children: [],
                        };
                        let formattedChilds = res["data"]["dataOperation"][0][
                          res["labelData"]["label"][k]
                        ].filter((child) => {
                          return (
                            child["data"]["key"] ==
                            `from:${slabA["from"]}::to:${slabA["to"]}&&&&trnStartDate=${slabD["trnStartDate"]}::trnEndDate=${slabD["trnEndDate"]}`
                          );
                        });
                        formattedChilds.forEach((child) => {
                          child["data"]["dateFrom"] = slabD["trnStartDate"];
                          child["data"]["dateTo"] = slabD["trnEndDate"];
                          child["data"]["lcyAmountFrom"] = slabA["from"];
                          child["data"]["lcyAmountTo"] = slabA["to"];
                          child["leaf"] = true;
                          if (child["data"]["ruleSelected"] == "Yes") {
                            child["partialSelected"] = false;
                            this.selectedNodes.push(child);
                          }
                        });

                        console.log(formattedChilds);
                        formattedRowData["children"] = formattedChilds;
                        completeData.push(formattedRowData);
                      });
                    });
                  });
                } else {
                  if (amtSlabPresent) {
                    reqData.lcySlabArr.forEach((slab, i) => {
                      Object.keys(res["labelData"]["label"]).forEach((k) => {
                        let formattedRowData = {
                          data: {
                            fieldId: res["labelData"]["label"][k],
                            key: i,
                          },
                          expanded: true,
                          leaf: false,
                          children: [],
                        };
                        let formattedChilds = res["data"]["dataOperation"][0][
                          res["labelData"]["label"][k]
                        ].filter(
                          (child) =>
                            child["data"]["key"] ==
                            `from:${slab["from"]}::to:${slab["to"]}`
                        );
                        formattedChilds.forEach((child) => {
                          child["data"]["lcyAmountFrom"] = slab["from"];
                          child["data"]["lcyAmountTo"] = slab["to"];
                          child["leaf"] = true;
                          if (child["data"]["ruleSelected"] == "Yes") {
                            child["partialSelected"] = false;
                            this.selectedNodes.push(child);
                          }
                        });

                        formattedRowData["children"] = formattedChilds;
                        completeData.push(formattedRowData);
                      });
                    });
                  } else if (dateSlabPresent) {
                    reqData.dateSlabArr.forEach((slab, i) => {
                      Object.keys(res["labelData"]["label"]).forEach((k) => {
                        let formattedRowData = {
                          data: {
                            fieldId: res["labelData"]["label"][k],
                            key: i,
                          },
                          expanded: true,
                          leaf: false,
                          children: [],
                        };
                        let formattedChilds = res["data"]["dataOperation"][0][
                          res["labelData"]["label"][k]
                        ].filter(
                          (child) =>
                            child["data"]["key"] ==
                            `trnStartDate=${slab["trnStartDate"]}::trnEndDate=${slab["trnEndDate"]}`
                        );
                        formattedChilds.forEach((child) => {
                          child["data"]["dateFrom"] = slab["trnStartDate"];
                          child["data"]["dateTo"] = slab["trnEndDate"];
                          child["leaf"] = true;
                          if (child["data"]["ruleSelected"] == "Yes") {
                            child["partialSelected"] = false;
                            this.selectedNodes.push(child);
                          }
                        });

                        formattedRowData["children"] = formattedChilds;
                        completeData.push(formattedRowData);
                      });
                    });
                  }
                }
              } else {
              }

              console.log("::", completeData);
              console.log("::", this.applyCriteriaDataTableColumns);

              this.applyCriteriaFormattedData = [...completeData];
              this.showContent = true;
            } else {
              this.coreService.showWarningToast(res["msg"]);
              this.showContent = false;
              if (res["msg"].includes("No active")) {
                this.inactiveData = true;
                this.setCriteriaSharedComponent.criteriaCtrl.disable();
              }
              this.appliedCriteriaData = [];
              this.appliedCriteriaDataCols = [];
            }
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getTaxSettingForEditApi", err);
        }
      );
  }

  onActive(data: any) {
    this.confirmFormEditStatus();
  }
  confirmFormEditStatus() {
    let type = "";
    let reqStatus = "";
    if (this.deactivated == true) {
      reqStatus = "Active";
      type = "activate";
    } else {
      reqStatus = "Inactive";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the Form Rule Record: ${this.formRuleCode}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatusForm",
      accept: () => {
        this.updateStatus(reqStatus);
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }
  updateStatus(reqStatus: any) {
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("formRuleCode", this.formRuleCode);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.code);
    formData.append("moduleName", this.moduleCtrl.value.code);
    formData.append("form", this.formCtrl.value.code);
    this.updateFormStatus(formData);
  }

  updateFormStatus(formData: any) {
    this.formRuleService.updateFormRuleStatus(formData).subscribe(
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
          let message = "";
          if (res["error"] == "true") {
            this.coreService.removeLoadingScreen();
            this.coreService.showWarningToast(message);
          } else {
            if (res["msg"]) {
              message = res["msg"];
              this.deactivated = !this.deactivated;
              this.coreService.showSuccessToast(message);
            } else {
              this.coreService.removeLoadingScreen();
              message = "Error in fetching data, Please try again later";
              this.coreService.showWarningToast(message);
            }
          }
        }
      },
      (err) => {
        console.log("Error in updateFormRuleStatus", err);
        this.coreService.removeLoadingScreen();
      }
    );
  }

  onNodeSelect(event) {
    if (event.node) {
      event["node"]["partialSelected"] = false;
    }
  }
  onNodeUnSelect(event) {
    delete event["node"]["partialSelected"];
    if (event["node"]["children"] && event["node"]["children"].length > 0) {
      event["node"]["children"].forEach((child) => {
        if (child.hasOwnProperty("partialSelected")) {
          delete child["partialSelected"];
        }
      });
    }
  }

  getCustomerMasterDataFromAppControlAndRemittance() {
    this.formFieldsMaster = {};
    this.formRuleService
      .getCustomerMasterDataFromAppControlAndRemittance()
      .subscribe(
        (responses: any[]) => {
          // Handle successful responses
          console.log("Response from API 1:", responses[0]);
          console.log("Response from API 2:", responses[1]);
          this.formFieldsMaster = {
            ...responses[0]["data"],
            ...responses[1]["data"],
          };
          // salaryDateMaster
          for (let i = 1; i <= 30; i++) {
            this.formFieldsMaster["salaryDateEmpDetails"].push({
              code: `${i}`,
              codeName: `${i}`,
            });
          }
          console.log(this.formFieldsMaster);
        },
        (error) => {
          console.error("Error:", error);
        }
      );
  }

  // getFormFieldsMasterData() {
  //   this.formRuleService
  //     .formFieldsMasterData(this.formCtrl.value.code)
  //     .subscribe(
  //       (res) => {
  //         if (
  //           res["status"] &&
  //           typeof res["status"] == "string" &&
  //           (res["status"] == "400" || res["status"] == "500")
  //         ) {
  //           if (res["error"]) {
  //             this.coreService.showWarningToast(res["error"]);
  //           } else {
  //             this.coreService.showWarningToast("Some error in fetching Data");
  //           }
  //           this.formFieldsMaster = [];
  //         } else {
  //           console.log(":::mastee", res);
  //           this.formFieldsMaster = res["data"];
  //         }
  //       },
  //       (err) => {
  //         console.log("Error in getFormFieldsMasterData", err);
  //         this.formFieldsMaster = [];
  //       }
  //     );
  // }

  getCriteriaMasterData() {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.formRuleService.getCriteriaMasterData(
        this.userId,
        this.formCtrl.value.code,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addFormRuleCriteriaData: this.formRuleService.getAddFormRuleCriteriaData(
        this.userId,
        this.formCtrl.value.code,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
    })
      .pipe(
        take(1),
        map((response) => {
          if (
            response.addFormRuleCriteriaData["data"] &&
            Object.keys(response.addFormRuleCriteriaData["data"]).length == 0
          ) {
            return {
              msg: "No Criteria Found for Selected Application & Module.",
            };
          } else if (
            !response.addFormRuleCriteriaData["data"] &&
            response.addFormRuleCriteriaData["msg"]
          ) {
            return {
              msg: response.addFormRuleCriteriaData["msg"],
            };
          } else {
            let criteriaMasterJson = _lodashClone(response.criteriaMasterData);
            delete criteriaMasterJson["fieldDisplay"];
            this.fieldDisplayData = response.criteriaMasterData["fieldDisplay"];
            const criteriaMasterData = criteriaMasterJson;
            this.criteriaDataDetailsJson = response.addFormRuleCriteriaData;
            this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
              (data) => {
                if (data["criteriaType"] == "Slab") {
                  this.cmCriteriaSlabType["Slab"] = data["fieldId"];
                }
                if (data["criteriaType"] == "date") {
                  this.cmCriteriaSlabType["date"] = data["fieldId"];
                }
              }
            );

            if (this.mode == "add") {
              this.formRuleCode =
                this.criteriaDataDetailsJson.data.formRuleCode;
              this.ruleID = this.formRuleCode;
              this.ruleDescription =
                this.criteriaDataDetailsJson.data.formRuleDesc;
            }

            this.cmCriteriaDataDetails = [
              ...this.criteriaDataDetailsJson.data.listCriteria
                .cmCriteriaDataDetails,
            ];

            this.cmCriteriaMandatory =
              this.criteriaDataDetailsJson.data.mandatory
                .replace(/["|\[|\]]/g, "")
                .split(", ");

            this.cmCriteriaDependency =
              this.criteriaDataDetailsJson.data.dependance;

            let criteriaDependencyTreeData =
              this.criteriaDataService.setDependencyTree(
                this.criteriaDataDetailsJson,
                this.cmCriteriaDataDetails,
                criteriaMasterData,
                this.cmCriteriaMandatory,
                this.cmCriteriaDependency,
                this.cmCriteriaSlabType
              );

            this.criteriaMapDdlOptions =
              criteriaDependencyTreeData["criteriaMapDdlOptions"];
            this.independantCriteriaArr =
              criteriaDependencyTreeData["independantCriteriaArr"];
            return criteriaMasterData;
          }
        })
      )
      .subscribe(
        (res) => {
          if (!res["msg"]) {
            if (
              res["status"] &&
              typeof res["status"] == "string" &&
              (res["status"] == "400" || res["status"] == "500")
            ) {
              this.coreService.removeLoadingScreen();
              this.showContent = false;
              if (res["error"]) {
                this.coreService.showWarningToast(res["error"]);
              } else {
                this.coreService.showWarningToast(
                  "Some error in fetching data"
                );
              }
            } else {
              this.criteriaMasterData = res;
              if (this.mode == "edit") {
                if (
                  !(
                    this.formRuleService.applicationName ||
                    this.formRuleService.moduleName ||
                    this.formRuleService.formName
                  )
                ) {
                  this.appModuleDataPresent = false;
                  this.showContent = false;
                  this.router.navigate([`navbar/form-rules`]);
                } else {
                  this.getFormRulesForEditApi(this.ruleID, "edit");
                }
              } else if (this.mode == "clone") {
                if (
                  !(
                    this.formRuleService.applicationName ||
                    this.formRuleService.moduleName ||
                    this.formRuleService.formName
                  )
                ) {
                  this.appModuleDataPresent = false;
                  this.showContent = false;
                  this.router.navigate([`navbar/form-rules`]);
                } else {
                  this.getFormRulesForEditApi(this.ruleID, "clone");
                }
              } else {
                this.showContent = true;
                this.coreService.removeLoadingScreen();
              }
            }
          } else if (res["msg"]) {
            this.coreService.showWarningToast(res["msg"]);
            this.coreService.removeLoadingScreen();
            return;
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in Initiating dropdown values", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  getCorrespondentValues(
    fieldId: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.formRuleService
      .getCorrespondentValuesData(
        this.formCtrl.value.code,
        this.appCtrl.value.code,
        criteriaMapValue,
        fieldId,
        displayName,
        this.moduleCtrl.value.code
      )
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.coreService.removeLoadingScreen();
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            this.coreService.removeLoadingScreen();
            if (res[fieldId]) {
              this.setCriteriaSharedComponent.valueCtrl.enable();
              this.setCriteriaSharedComponent.hideValuesDropdown = false;
              this.setCriteriaSharedComponent.showValueInput = false;

              this.correspondentDdlOptions = res[fieldId].map((val) => {
                return { name: val["codeName"], code: val["code"] };
              });
            } else {
              if (res["message"]) {
                this.coreService.showWarningToast(res["message"]);
                this.resetCriteriaDropdowns();
              } else {
                this.coreService.showWarningToast("Criteria Map is not proper");
                this.resetCriteriaDropdowns();
              }
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.resetCriteriaDropdowns();
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  resetCriteriaDropdowns() {
    this.setCriteriaSharedComponent.resetCriteriaDropdowns();
  }

  applyCriteria(postDataCriteria: FormData) {
    postDataCriteria.append("formRuleCode", this.ruleID);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.appCtrl.value.code);
    postDataCriteria.append("form", this.formCtrl.value.code);
    postDataCriteria.append("moduleName", this.moduleCtrl.value.code);
    this.isApplyCriteriaClicked = true;
    if (this.isFromRulesLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "formRulesLinkedWarning",
        accept: () => {
          this.coreService.displayLoadingScreen();
          setTimeout(() => {
            this.coreService.setHeaderStickyStyle(true);
            this.coreService.setSidebarBtnFixedStyle(true);
          }, 500);
          setTimeout(() => {
            this.coreService.removeLoadingScreen();
          }, 1000);
        },
      });
    } else {
      this.formRuleCriteriaSearchApi(postDataCriteria);
    }
  }

  formRuleCriteriaSearchApi(formData: any) {
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.coreService.displayLoadingScreen();
    this.formRuleService
      .postFormRuleSearch(formData)
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
            this.applyCriteriaResponse = JSON.parse(JSON.stringify(res));
            if (!res["msg"]) {
              if (!res["duplicate"]) {
                this.appliedCriteriaCriteriaMap = res["criteriaMap"];
                let reqData =
                  this.criteriaDataService.decodeCriteriaMapIntoTableFields(
                    res
                  );

                let crtfields = this.setCriteriaService.decodeFormattedCriteria(
                  reqData.critMap,
                  this.criteriaMasterData,
                  this.fieldDisplayData
                );

                this.applyCriteriaDataTableColumns = [];

                let lcyOprFields = [];
                let isLcyOprFieldPresent = false;
                let lcyOprFieldInserted = false;
                let lcySlabFieldInserted = false;

                this.applyCriteriaDataTableColumns = [...this.cols];
                this.appliedCriteriaIsDuplicate = res["duplicate"];

                let completeData = [];
                Object.keys(res["labelData"]["label"]).forEach((k) => {
                  let formattedRowData = {
                    data: {
                      fieldId: res["labelData"]["label"][k],
                    },
                    expanded: true,
                    leaf: false,
                    children: [],
                  };

                  res["data"][k].forEach((detail) => {
                    let childRow = { data: {} };
                    this.applyCriteriaDataTableColumns.forEach((col) => {
                      if (
                        detail[col["field"]] == "True" ||
                        detail[col["field"]] == "Yes"
                      ) {
                        detail[col["field"]] = true;
                      }
                      if (
                        detail[col["field"]] == "False" ||
                        detail[col["field"]] == "No"
                      ) {
                        detail[col["field"]] = false;
                      }
                      childRow["data"][col["field"]] = detail[col["field"]];
                    });
                    Object.keys(childRow.data).forEach((field) => {
                      if (childRow.data[field] === undefined) {
                        this.applyCriteriaDataTableColumns.forEach((col) => {
                          if (field == col["field"]) {
                            childRow.data[field] = col["value"];
                          }
                        });
                      }
                    });
                    childRow["data"]["fieldDisplayOrder"] =
                      detail["fieldDisplayOrder"];
                    childRow["data"]["displaySection"] =
                      detail["displaySection"];
                    childRow["data"]["displaySectionOrder"] =
                      detail["displaySectionOrder"];
                    childRow["data"]["fieldType"] = detail["fieldType"];
                    childRow["data"]["fieldDisplayName"] =
                      detail["fieldDisplayName"];
                    childRow["data"]["apiKey"] = detail["apiKey"];
                    childRow["data"]["obscure"] = detail["obscure"];
                    childRow["data"]["multiSelect"] = detail["multiSelect"];
                    childRow["data"]["minDate"] = detail["minDate"];
                    childRow["data"]["maxDate"] = detail["maxDate"];
                    childRow["data"]["initialDate"] = detail["initialDate"];

                    childRow["leaf"] = true;

                    formattedRowData["children"].push(childRow);
                  });
                  completeData.push(formattedRowData);
                });

                let amtSlabPresent = false;
                let dateSlabPresent = false;

                let baseCriteriaMap = res["criteriaMap"].split("&&&&")[0];

                if (res["criteriaMap"].indexOf("from:") >= 0) {
                  amtSlabPresent = true;
                }

                if (res["criteriaMap"].indexOf("trnStartDate=") >= 0) {
                  dateSlabPresent = true;
                }

                if (amtSlabPresent && dateSlabPresent) {
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "dateFrom",
                    header: "Date From",
                    type: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "dateTo",
                    header: "Date To",
                    type: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    type: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-8, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    type: "text",
                  });

                  this.applyCriteriaFormattedData = [];

                  let dateSlabFields = reqData.dateSlabArr;
                  let lcySlabFields = reqData.lcySlabArr;

                  dateSlabFields.forEach((fieldDate) => {
                    lcySlabFields.forEach((fieldAmt, i) => {
                      let copy = JSON.parse(JSON.stringify(completeData));
                      copy.forEach((row) => {
                        row["data"]["key"] = i;
                        row["children"].forEach((child) => {
                          child["data"]["lcyAmountFrom"] = fieldAmt.from;
                          child["data"]["lcyAmountTo"] = fieldAmt.to;
                          child["data"]["dateFrom"] = fieldDate.trnStartDate;
                          child["data"]["dateTo"] = fieldDate.trnEndDate;
                          child["data"][
                            "criteriaMapSplit"
                          ] = `${baseCriteriaMap}&&&&from:${fieldAmt["from"]}::to:${fieldAmt["to"]}&&&&trnStartDate=${fieldDate["trnStartDate"]}::trnEndDate=${fieldDate["trnEndDate"]}`;
                        });
                      });
                      this.applyCriteriaFormattedData.push(...copy);
                    });
                  });
                } else {
                  if (amtSlabPresent) {
                    let lcySlabFields = reqData.lcySlabArr;
                    this.applyCriteriaDataTableColumns.splice(-8, 0, {
                      field: "lcyAmountFrom",
                      header: "Amount From",
                      type: "text",
                    });
                    this.applyCriteriaDataTableColumns.splice(-8, 0, {
                      field: "lcyAmountTo",
                      header: "Amount To",
                      type: "text",
                    });
                    this.applyCriteriaFormattedData = [];
                    lcySlabFields.forEach((slab, i) => {
                      let copy = JSON.parse(JSON.stringify(completeData));
                      copy.forEach((row) => {
                        row["data"]["key"] = i;
                        row["children"].forEach((child) => {
                          child["data"]["lcyAmountFrom"] = slab["from"];
                          child["data"]["lcyAmountTo"] = slab["to"];
                          child["data"][
                            "criteriaMapSplit"
                          ] = `${baseCriteriaMap}&&&&from:${slab["from"]}::to:${slab["to"]}`;
                        });
                      });

                      this.applyCriteriaFormattedData.push(...copy);
                    });
                  } else if (dateSlabPresent) {
                    let dateSlabFields = reqData.dateSlabArr;
                    this.applyCriteriaDataTableColumns.splice(-8, 0, {
                      field: "dateFrom",
                      header: "Date From",
                      type: "text",
                    });
                    this.applyCriteriaDataTableColumns.splice(-8, 0, {
                      field: "dateTo",
                      header: "Date To",
                      type: "text",
                    });
                    this.applyCriteriaFormattedData = [];
                    dateSlabFields.forEach((slab, i) => {
                      let copy = JSON.parse(JSON.stringify(completeData));
                      copy.forEach((row) => {
                        row["data"]["key"] = i;
                        row["children"].forEach((child) => {
                          child["data"]["dateFrom"] = slab["trnStartDate"];
                          child["data"]["dateTo"] = slab["trnEndDate"];
                          child["data"][
                            "criteriaMapSplit"
                          ] = `${baseCriteriaMap}&&&&trnStartDate=${slab["trnStartDate"]}::trnEndDate=${slab["trnEndDate"]}`;
                        });
                      });

                      this.applyCriteriaFormattedData.push(...copy);
                    });
                  } else if (!amtSlabPresent && !dateSlabPresent) {
                    this.applyCriteriaFormattedData = [...completeData];
                    this.applyCriteriaFormattedData.forEach((row, i) => {
                      row["data"]["key"] = i;
                      row["children"].forEach((child) => {
                        child["data"]["criteriaMapSplit"] = baseCriteriaMap;
                      });
                    });
                  }
                }

                console.log("::", this.applyCriteriaFormattedData);
                console.log("::", this.applyCriteriaDataTableColumns);

                this.coreService.showSuccessToast(
                  `Criteria Applied Successfully`
                );
              } else {
                this.applyCriteriaFormattedData = [];
                this.appliedCriteriaCriteriaMap = null;
                this.appliedCriteriaIsDuplicate = null;
                this.applyCriteriaDataTableColumns = [];
                this.coreService.showWarningToast(
                  "Applied criteria already exists."
                );
              }
            } else {
              if (res["msg"] && res["msg"] == "No search criteria available.") {
                this.applyCriteriaFormattedData = [];
                this.appliedCriteriaCriteriaMap = null;
                this.appliedCriteriaIsDuplicate = null;
                this.applyCriteriaDataTableColumns = [];
                this.coreService.showWarningToast(res["msg"]);
                return;
              }
            }
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error in fetching applied criteria data, please try again"
          );
          console.log("error in FormRuleCriteriaSearchApi", err);
        }
      )
      .add(() => {
        setTimeout(() => {
          this.coreService.removeLoadingScreen();
        }, 250);
      });
  }

  setStyle(col: any, i: any) {
    let padLeft = i == 0 ? "8px !important" : "";
    let width = col.type == "lcyOpr" ? "120px !important" : "";

    return `padding-left : ${padLeft};`;
  }

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formCtrl.value.code);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.formRuleService
      .currentCriteriaSaveAsTemplate(templateFormData)
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.coreService.removeLoadingScreen();
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(
                "Some error in saving template"
              );
            }
          } else {
            this.coreService.removeLoadingScreen();
            if (res.msg == "Criteria Template already exists.") {
              // this.savingCriteriaTemplateError =
              //   "Criteria Template already exists.";
              this.savingCriteriaTemplateError = true;
              console.log(this.savingCriteriaTemplateError);
            } else {
              this.savingCriteriaTemplateError = false;
              this.setCriteriaSharedComponent.selectedTemplate =
                this.setCriteriaSharedComponent.criteriaName;
              this.coreService.showSuccessToast(res.msg);
              this.setCriteriaSharedComponent.saveTemplateDialogOpen = false;
              this.setCriteriaSharedComponent.criteriaName = "";
              this.getAllTemplates();
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log(":: Error in saving criteria template", err);
          this.coreService.showWarningToast("Some error in saving template");
        }
      );
  }

  getAllTemplates() {
    this.criteriaTemplatesDdlOptions = [];
    this.formRuleService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
        this.formCtrl.value.code
      )
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
                "Some error in saving template"
              );
            }
          } else {
            if (res.data && res.data.length) {
              this.criteriaTemplatesDdlOptions = res.data;
              this.criteriaTemplatesDdlOptions.forEach((val) => {
                val["name"] = val["criteriaName"];
                val["code"] = val["criteriaName"];
              });
            } else {
              console.log(res.msg);
            }
          }
        },
        (err) => {
          console.log(":: Error in getting template list", err);
          this.coreService.showWarningToast(
            "Some error in getting template list"
          );
        }
      );
  }

  saveAddNewRule(action) {
    if (
      this.setCriteriaSharedComponent.getCurrentCriteriaMap() !=
      this.appliedCriteriaCriteriaMap
    ) {
      this.coreService.showWarningToast(
        "Recent changes in Criteria map has not been applied, Saving last applied data"
      );
    }

    let isRequiredFields = false;
    let invalidDefValue = false;
    let invalidMaxLengthValue = false;

    let payloadData;

    if (this.applyCriteriaResponse["data"]) {
      payloadData = JSON.parse(this.stringify(this.applyCriteriaResponse));
    } else if (this.editFromRulesApiData["data"]) {
      payloadData = JSON.parse(this.stringify(this.editFromRulesApiData));
      payloadData["duplicate"] = this.appliedCriteriaIsDuplicate;
    }

    console.log(":::", this.applyCriteriaFormattedData);
    let copyApplyCriteriaFormattedData = _lodashClone(
      this.applyCriteriaFormattedData
    );

    let finalObj = {};
    Object.keys(payloadData["labelData"]["label"]).forEach((k) => {
      let fieldArr = [];
      let fieldObjArr = copyApplyCriteriaFormattedData.filter((tableData) => {
        return tableData["data"]["fieldId"] == k;
      });
      fieldObjArr.forEach((data) => {
        fieldArr.push(...data["children"]);
      });

      fieldArr.forEach((child) => {
        delete child["parent"];
        // console.log(child, child["partialSelected"]);
        if (
          child["partialSelected"] == false ||
          child["partialSelected"] == "N"
        ) {
          child["data"]["ruleSelected"] = "Yes";
        } else {
          child["data"]["ruleSelected"] = "No";
        }
        if (child["data"]["isValidMaxLength"] == false) {
          invalidMaxLengthValue = true;
        }
        if (child["data"]["isValidDefValue"] == false) {
          invalidDefValue = true;
        }

        //setting True Yes

        Object.keys(child["data"]).forEach((fieldParam) => {
          if (child["data"][fieldParam] == undefined) {
            child["data"][fieldParam] = null;
          }
          switch (fieldParam) {
            case "isMandatory":
            case "isEnable":
            case "isVisible":
            case "displayInNewLine":
              if (
                child["data"][fieldParam] == true ||
                child["data"][fieldParam] == "True"
              ) {
                child["data"][fieldParam] = "True";
              } else {
                child["data"][fieldParam] = "False";
              }
              break;
            case "block":
            case "warning":
            case "checkDuplicate":
            case "displayValidValuesOnHover":
              if (
                child["data"][fieldParam] == true ||
                child["data"][fieldParam] == "Yes"
              ) {
                child["data"][fieldParam] = "Yes";
              } else {
                child["data"][fieldParam] = "No";
              }
              break;
          }
        });
      });

      finalObj[k] = fieldArr;
    });

    if (
      !this.ruleDescription ||
      this.ruleDescription.replace(/\s+/g, "").length == 0
    ) {
      isRequiredFields = true;
    }

    if (isRequiredFields) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Please Fill required fields.");
    } else if (invalidMaxLengthValue) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Max Length fields are invalid.");
    } else if (invalidDefValue) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast("Default values fields are invalid.");
    } else {
      payloadData.data = {};

      payloadData["data"]["dataOperation"] = [finalObj];
      payloadData["formRuleCode"] = this.formRuleCode;
      payloadData["formRuleDesc"] = this.ruleDescription
        ? this.ruleDescription
        : "";
      payloadData["userId"] = this.userId;
      // let str = this.stringify(payloadData);
      // str = str.replace(/true/g, '"Y"');
      // str = str.replace(/false/g, '"N"');
      // payloadData = JSON.parse(str);
      // let copyPayload = JSON.parse(this.stringify(payloadData));
      // if (copyPayload["duplicate"] == "N") {
      //   payloadData["duplicate"] = false;
      // } else if (copyPayload["duplicate"] == "Y") {
      //   payloadData["duplicate"] = true;
      // }

      console.log(payloadData);
      if (
        this.mode != "clone" ||
        (this.mode == "clone" && this.isApplyCriteriaClicked)
      ) {
        this.coreService.displayLoadingScreen();
        let service;
        if (this.mode == "edit") {
          service = this.formRuleService.updateFormRule(
            this.userId,
            payloadData,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formCtrl.value.code
          );
        } else {
          service = this.formRuleService.addNewFormRule(
            payloadData,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formCtrl.value.code
          );
        }
        // Object.keys(payloadData["labelData"]["label"]).forEach((k) => {
        //   payloadData["data"]["dataOperation"][0][
        //     payloadData["labelData"]["label"][k]
        //   ].forEach((fieldRow) => {
        //     for (const key in fieldRow.data) {
        //       if (fieldRow.data.hasOwnProperty(key)) {
        //         const value = fieldRow.data[key];

        //         if (
        //           value !== null &&
        //           value !== undefined &&
        //           typeof value !== "boolean"
        //         ) {
        //           fieldRow.data[key] =
        //             typeof value === "object" ? JSON.stringify(value) : value;
        //         } else {
        //           fieldRow.data[key] = value;
        //         }
        //       }
        //     }
        //   });

        //   console.log(
        //     ":::",
        //     payloadData["data"]["dataOperation"][0][
        //       payloadData["labelData"]["label"][k]
        //     ]
        //   );
        // });
        console.log(":::PAYLOAD", JSON.stringify(payloadData, null, 2));
        if (service) {
          service.subscribe(
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
                  this.coreService.showSuccessToast(res.msg);
                  if (action == "save") {
                    this.router.navigate([`navbar/form-rules`]);
                  } else if (action == "saveAndAddNew") {
                    this.formRuleService.applicationName = null;
                    this.formRuleService.moduleName = null;
                    this.formRuleService.formName = null;
                    this.router.navigate([`navbar/form-rules/addnewformrule`]);
                  }
                }
              }
            },
            (err) => {
              this.coreService.removeLoadingScreen();
              console.log("error in saveAddNewFormRule", err);
            }
          );
        }
      } else {
        this.coreService.showWarningToast("Applied criteria already exists.");
      }
    }
  }

  stringify(obj) {
    let cache = [];
    let str = JSON.stringify(obj, function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          return;
        }
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
  }

  reset() {
    if (this.mode == "edit") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetFormDataConfirmation",
        accept: () => {
          this.coreService.displayLoadingScreen();
          // this.getCriteriaMasterData();
          // this.getAllTemplates();
          // this.coreService.setHeaderStickyStyle(true);
          // this.coreService.setSidebarBtnFixedStyle(true);
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.ruleDescription = "";

          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn();
        },
      });
    } else if (this.mode == "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetFormDataConfirmation",
        accept: () => {
          this.coreService.displayLoadingScreen();
          this.getCriteriaMasterData();
          this.getAllTemplates();
          this.coreService.setHeaderStickyStyle(true);
          this.coreService.setSidebarBtnFixedStyle(true);
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn();
        },
      });
    } else {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear all the fields ?",
        key: "resetFormDataConfirmation",
        accept: () => {
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.ruleDescription = "";

          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
          // this.appCtrl.reset();
          // this.moduleCtrl.reset();
          // this.moduleCtrl.disable();
          // this.formCtrl.reset();
          // this.formCtrl.disable();
          // this.showContent = false;
          // this.appModuleDataPresent = false;
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn();
        },
      });
    }
  }

  setHeaderSidebarBtn() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }

  setSelectedOptions() {
    this.appliedCriteriaData.forEach((data) => {
      if (data["taxType"]) {
        data["taxType"] = data["taxTypeOption"].filter(
          (option) => option["code"] == data["taxType"]
        )[0]["codeName"];
      }

      if (data["setAs"]) {
        data["setAs"] = data["setAsOption"].filter(
          (option) => option["code"] == data["setAs"]
        )[0]["codeName"];
      }
    });
  }
  decodeSelectedOptions() {
    this.appliedCriteriaData.forEach((data) => {
      data["taxType"] = data["taxTypeOption"].filter(
        (option) => option["codeName"] == data["taxType"]
      )[0]["code"];
      data["setAs"] = data["setAsOption"].filter(
        (option) => option["codeName"] == data["setAs"]
      )[0]["code"];
    });
  }

  minValidation(e: any, rowData: any, minInp: any, maxInpVal: any) {
    rowData["maxLength"] = null;
    rowData["defaultValue"] = null;
    rowData["isValidDefValue"] = true;
    // rowData["minLength"] = e;
  }
  maxValidation(e: any, rowData: any, maxInp: any, minInpVal: any) {
    rowData["isValidMaxLength"] = null;
    rowData["defaultValue"] = null;
    rowData["isValidDefValue"] = true;
    if (minInpVal && e) {
      if (minInpVal > e) {
        maxInp.classList.add("inputError");
        rowData["isValidMaxLength"] = false;
        this.minMaxInpTooltip = "Max length should be greater than Min length";
      } else {
        maxInp.classList.remove("inputError");
        rowData["isValidMaxLength"] = true;
      }
    }
  }

  // minMaxValidation(
  //   e: any,
  //   rowData: any,
  //   validLengthInp: any,
  //   defaultValueCol: any
  // ) {
  //   const pattern = /^(\d+)-(\d+)$/;
  //   rowData["isValidLength"] = null;

  //   rowData[defaultValueCol] = "";
  //   const defValueInp = validLengthInp
  //     .closest("td")
  //     .nextSibling.nextSibling.querySelector("input");
  //   defValueInp.classList.remove("inputError");

  //   if (e.length == 0) {
  //     this.minMaxInpTooltip = "";
  //     validLengthInp.classList.remove("inputError");
  //     rowData["isValidLength"] = null;
  //     return;
  //   }

  //   const match = e.match(pattern);
  //   if (match) {
  //     const lesserNumber = parseInt(match[1]);
  //     const bigNumber = parseInt(match[2]);

  //     if (bigNumber > lesserNumber) {
  //       this.minMaxInpTooltip = "";
  //       validLengthInp.classList.remove("inputError");
  //       rowData["isValidLength"] = true;
  //     } else {
  //       this.minMaxInpTooltip = "{min-length} should be less than {max-length}";
  //       rowData["isValidLength"] = false;
  //       validLengthInp.classList.add("inputError");
  //     }
  //   } else {
  //     this.minMaxInpTooltip =
  //       "Please enter only number in this format: {min-length}-{max-length}";

  //     validLengthInp.classList.add("inputError");
  //     rowData["isValidLength"] = false;
  //   }

  //   if (rowData["isValidLength"] == false) {
  //     this.defValueInpTooltip = "Please set min max length correctly";
  //   } else {
  //     this.defValueInpTooltip = "";
  //   }
  // }

  toggleCheckbox(e: any, rowData: any, field: any) {
    if (field == "isMandatory") {
      if (e.returnValue) {
        rowData["isVisible"] = true;
        rowData["isEnable"] = true;
      } else {
        rowData["isVisible"] = false;
        rowData["isEnable"] = false;
      }
    }
  }

  defValueValidation(
    e: any,
    rowData: any,
    defValueInp: any,
    minInpVal: any,
    maxInpVal: any
  ) {
    rowData["isValidDefValue"] = true;
    if (e) {
      if (minInpVal && !(e.length >= minInpVal)) {
        rowData["isValidDefValue"] = false;
        this.defValueInpTooltip =
          "Default value length is less than specified Min length";
      } else if (maxInpVal && !(e.length <= maxInpVal)) {
        rowData["isValidDefValue"] = false;
        this.defValueInpTooltip =
          "Default value length is greater than specified Max length";
      } else {
        rowData["isValidDefValue"] = true;
        this.defValueInpTooltip = "";
      }
    }
  }

  resetDefValueInp(defValueInp: any) {
    console.log("reset", defValueInp);
  }

  // defaultValueValidation(
  //   e: any,
  //   rowData: any,
  //   defValueInp: any,
  //   minMaxCol: any
  // ) {
  //   rowData["isValidDefValue"] = null;
  //   if (e.length == 0) {
  //     rowData["isValidDefValue"] = null;
  //     defValueInp.classList.remove("inputError");
  //     return;
  //   } else {
  //     if (rowData[minMaxCol]) {
  //       const min = rowData[minMaxCol].split("-")[0];
  //       const max = rowData[minMaxCol].split("-")[1];
  //       if (e.length > max || e.length < min) {
  //         rowData["isValidDefValue"] = false;
  //         defValueInp.classList.add("inputError");
  //       } else {
  //         rowData["isValidDefValue"] = true;
  //         defValueInp.classList.remove("inputError");
  //       }
  //     } else {
  //       rowData["isValidDefValue"] = true;
  //       defValueInp.classList.remove("inputError");
  //     }

  //     if (rowData["isValidDefValue"] == false) {
  //       this.defValueInpTooltip = "Default value is not in specified range";
  //     } else {
  //       this.defValueInpTooltip = "";
  //     }
  //   }
  // }

  onChange(controlId, rule) {
    let minmax = rule.minFieldLengthMaxLength.split("-");
    let min = minmax[0];
    let max = minmax[1];
    let index = this.formRulesData.findIndex((x) => x.fieldId == rule.fieldId);
    if (controlId == "defaultValues") {
      this.formRulesData[index].maxlengthDefaultValue = Number(max);
    }
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }
  selectedColumn(selectCol: any, value: any, index: any) {
    if (selectCol == "setAsOption") {
      if (selectCol == "setAsOption" && value["code"] == "Percentage") {
        this.appliedCriteriaData[index]["tax"] = 0;
      } else {
        if (Number(this.appliedCriteriaData[index].lcyAmountFrom)) {
          this.appliedCriteriaData[index]["tax"] = Number(
            this.appliedCriteriaData[index].lcyAmountFrom
          );
        } else {
          if (this.appliedCriteriaData[index].lcyAmount) {
            let lcyAmountNum =
              this.appliedCriteriaData[index].lcyAmount.split(" ")[3];
            let lcyAmountOpr =
              this.appliedCriteriaData[index].lcyAmount.split(" ")[2];
            if (lcyAmountOpr == ">=") {
              this.appliedCriteriaData[index]["tax"] = Number(lcyAmountNum);
            } else if (lcyAmountOpr == ">") {
              this.appliedCriteriaData[index]["tax"] = Number(lcyAmountNum) + 1;
            } else if (lcyAmountOpr == "=") {
              this.appliedCriteriaData[index]["tax"] = Number(lcyAmountNum);
            } else {
              this.appliedCriteriaData[index]["tax"] = 0;
            }
          } else {
            this.appliedCriteriaData[index]["tax"] = 0;
          }
        }
      }
    }
    this.appliedCriteriaData[index][selectCol.split("Option")[0]] =
      value.codeName;
  }

  changeValueInput(
    selectCol: any,
    inputCol: any,
    event: any,
    index: any,
    valueInputElm: any
  ) {
    this.appliedCriteriaData[index]["invalidTaxAmount"] = false;
    let max = 0;
    let min = 0;
    let lcyAmountEqualTo =
      this.appliedCriteriaData[index].lcyAmount &&
      this.appliedCriteriaData[index].lcyAmount.substring(
        this.appliedCriteriaData[index].lcyAmount.indexOf("=") + 1
      );
    let lcyAmountGreaterThan =
      this.appliedCriteriaData[index].lcyAmount &&
      this.appliedCriteriaData[index].lcyAmount.substring(
        this.appliedCriteriaData[index].lcyAmount.indexOf(">") + 1
      );
    if (
      this.appliedCriteriaData[index][selectCol.split("Option")[0]] ==
      "Percentage"
    ) {
      max = 100;
    } else if (
      this.appliedCriteriaData[index][selectCol.split("Option")[0]] == "Amount"
    ) {
      if (
        Number(this.appliedCriteriaData[index].lcyAmountFrom) > 0 &&
        Number(this.appliedCriteriaData[index].lcyAmountTo) > 0
      ) {
        min = Number(this.appliedCriteriaData[index].lcyAmountFrom);
        max = Number(this.appliedCriteriaData[index].lcyAmountTo);
      } else if (Number(lcyAmountEqualTo) > 0) {
        min = Number(lcyAmountEqualTo);
        max = Number(lcyAmountEqualTo);
      } else if (Number(lcyAmountGreaterThan) > 0) {
        min = Number(lcyAmountGreaterThan);
        max = 1000000;
      } else {
        max = 1000000;
      }
    }

    if (event.value <= max) {
      this.appliedCriteriaData[index][inputCol] = event.value;
    } else {
      let lastValueEntered = valueInputElm.lastValue;
      valueInputElm.input.nativeElement.value = lastValueEntered;
    }
    let isDisplayError = false;
    if (event.value < min || event.value > max) {
      isDisplayError = true;
      this.appliedCriteriaData[index]["invalidTaxAmount"] = true;
      this.coreService.showWarningToast(
        "Please enter tax between " + min + " to " + max
      );
      return false;
    }
  }

  TaxValidation() {}

  checkOperation(operation: any, index: any, selectRow: any, fieldId: any) {
    if (operation == "delete") {
      this.delete(index);
    } else if (operation == "clone") {
      this.clone(index, selectRow, fieldId);
    }
  }

  clone(index: any, selectRow: any, fieldId: any) {
    let clonedRow = {
      ...selectRow,
    };
    clonedRow[fieldId] = "clone,delete";
    this.appliedCriteriaData.splice(index + 1, 0, clonedRow);
  }
  delete(index: any) {
    this.appliedCriteriaData.splice(index, 1);
  }
}
