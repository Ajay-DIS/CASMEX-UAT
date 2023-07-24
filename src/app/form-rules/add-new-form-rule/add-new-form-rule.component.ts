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
  formName = "Form Rules";
  // applicationName = "Web Application";

  formRuleCode = "No Data";
  ruleDescription = "";

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
  cmCriteriaSlabType: any = [];
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

  formRulesData: any = [
    {
      id: 1,
      fieldName: "First Name",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "4-8",
      defaultValues: "",
      regex: "",
      groupBy: "Personal Details",
    },
    {
      id: 2,
      fieldName: "Middle Name",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "4-12",
      defaultValues: "",
      regex: "",
      groupBy: "Personal Details",
    },
    {
      id: 3,
      fieldName: "Last Name",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "4-9",
      defaultValues: "",
      regex: "",
      groupBy: "Personal Details",
    },
    {
      id: 4,
      fieldName: "Country",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "6-8",
      defaultValues: "India",
      regex: "",
      groupBy: "Personal Details",
    },
    {
      id: 5,
      fieldName: "Currency",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "2-8",
      defaultValues: "Rupee",
      regex: "",
      groupBy: "Personal Details",
    },
    {
      id: 6,
      fieldName: "Remarks",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "2-8",
      defaultValues: "Rupee",
      regex: "",
      groupBy: "Payment Details",
    },
    {
      id: 7,
      fieldName: "Comments",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "2-8",
      defaultValues: "Rupee",
      regex: "",
      groupBy: "Payment Details",
    },
    {
      id: 8,
      fieldName: "Description",
      isMandatory: true,
      isEnabled: false,
      isVisible: true,
      minFieldLengthMaxLength: "2-8",
      defaultValues: "Rupee",
      regex: "",
      groupBy: "Payment Details",
    },
  ];

  applyCriteriaFormattedData: any[] = [];

  applyCriteriaDataTableColumns: any[] = [];

  cols: any[] = [
    { field: "fieldName", header: "Field Name", type: "string" },
    { field: "fieldLabel", header: "Field Label", type: "input" },
    { field: "isMandatory", header: "Is Mandatory", type: "checkbox" },
    { field: "isEnable", header: "Is Enable", type: "checkbox" },
    { field: "isVisibile", header: "Is Visible", type: "checkbox" },
    { field: "validLength", header: "Min/Max Length", type: "input" },
    { field: "defaultValue", header: "Default Values", type: "input" },
    { field: "regex", header: "Regex", type: "input" },
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

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

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
      // this.mode = "edit";
      this.ruleID = params.id;
    }
    this.formRuleService.getFormRulesAppModuleList().subscribe((res) => {
      console.log("appModuleList", res);
      if (!res["msg"]) {
        this.searchApplicationOptions = res["data"]["cmApplicationMaster"].map(
          (app) => {
            return { name: app.name, code: app.name };
          }
        );
        this.searchModuleOptions = res["data"][
          "cmPrimaryModuleMasterDetails"
        ].map((app) => {
          return { name: app.codeName, code: app.codeName };
        });
        if (
          !(
            this.formRuleService.applicationName ||
            this.formRuleService.moduleName
          )
        ) {
          if (this.mode != "add") {
            this.router.navigate([`navbar/form-rules`]);
          } else {
            this.coreService.removeLoadingScreen();
          }
        } else {
          if (this.mode != "add") {
            this.appCtrl.setValue({
              name: this.formRuleService.applicationName,
              code: this.formRuleService.applicationName,
            });
            this.moduleCtrl.setValue({
              name: this.formRuleService.moduleName,
              code: this.formRuleService.moduleName,
            });
            this.appModuleDataPresent = true;
            this.appCtrl.disable();
            this.moduleCtrl.disable();
            this.searchAppModule();
          }
        }
      } else {
        this.coreService.removeLoadingScreen();
      }
    });
  }

  setSelectAppModule() {
    this.selectAppModule = this.fb.group({
      applications: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      modules: new UntypedFormControl({ value: "", disabled: true }, [
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

  onAppValueChange() {
    this.showContent = false;
    this.appModuleDataPresent = false;
    this.moduleCtrl.reset();
    this.moduleCtrl.enable();
  }

  searchAppModule() {
    this.appModuleDataPresent = true;
    this.showContent = false;
    this.getCriteriaMasterData();
    this.getAllTemplates();
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
        this.formName
      )
      .subscribe(
        (res) => {
          if (!res["msg"]) {
            this.coreService.removeLoadingScreen();
            this.appModuleDataPresent = true;
            this.editFromRulesApiData = JSON.parse(this.stringify(res));
            console.log("edit data", res);

            this.appliedCriteriaCriteriaMap = res["criteriaMap"];

            if (
              !(res["criteriaMap"].indexOf("&&&&") >= 0) &&
              !(res["criteriaMap"].indexOf("LCY Amount") >= 0)
            ) {
              simpleData = true;
            } else {
              simpleData = false;
              res["data"]["dataOperation"].forEach((data) => {
                Object.values(data).forEach((subData) => {
                  (subData as any[]).forEach((d) => {
                    d["data"]["key"] =
                      d["data"]["criteriaMapSplit"].split("&&&&")[1];
                  });
                });
              });
            }

            console.log(res);

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
              this.editFromRulesApiData
            );

            this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
              this.criteriaCodeText,
              this.criteriaMasterData,
              this.cmCriteriaSlabType
            );

            this.formRuleCode = this.editFromRulesApiData["formRuleCode"];
            if (this.editFromRulesApiData["formRuleDesc"]) {
              this.ruleDescription = this.editFromRulesApiData["formRuleDesc"];
            }
            this.isFromRulesLinked =
              !this.editFromRulesApiData["criteriaUpdate"];

            // Table formation STARt

            let reqData =
              this.criteriaDataService.decodeCriteriaMapIntoTableFields(
                this.editFromRulesApiData
              );

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
              this.editFromRulesApiData
            );
            console.log(":::::", this.criteriaCodeText);

            console.log("decoded ARRRR", reqData);
            let crtfields = this.setCriteriaService.decodeFormattedCriteria(
              reqData.critMap,
              this.criteriaMasterData,
              // reqData.lcySlabArr.length ? ["LCY Amount"] : []
              ["LCY Amount"]
            );
            console.log("this.criteriaText", crtfields);

            this.applyCriteriaDataTableColumns = [];

            let lcyOprFields = [];
            let isLcyOprFieldPresent = false;
            let lcyOprFieldInserted = false;
            let lcySlabFieldInserted = false;

            let countryCol = {};

            this.applyCriteriaDataTableColumns = [...this.cols];
            crtfields
              .slice()
              .reverse()
              .forEach((crt) => {
                let formatCrt;
                let opr;
                if (crt.includes("!=")) {
                  formatCrt = crt.replace(/[!=]/g, "");
                  opr = "!=";
                } else if (crt.includes(">=")) {
                  formatCrt = crt.replace(/[>=]/g, "");
                  opr = ">=";
                } else if (crt.includes("<=")) {
                  formatCrt = crt.replace(/[<=]/g, "");
                  opr = "<=";
                } else if (crt.includes("<")) {
                  formatCrt = crt.replace(/[<]/g, "");
                  opr = "<";
                } else if (crt.includes(">")) {
                  formatCrt = crt.replace(/[>]/g, "");
                  opr = ">";
                } else {
                  formatCrt = crt.replace(/[=]/g, "");
                  opr = "=";
                }

                console.log(crt, formatCrt.split("  ")[0]);

                if (formatCrt.split("  ")[0] == "LCY Amount") {
                  isLcyOprFieldPresent = true;
                  lcyOprFields.push(
                    formatCrt.split("  ")[0] +
                      " " +
                      opr +
                      " " +
                      formatCrt.split("  ")[1]
                  );
                  //   if (!lcyOprFieldInserted) {
                  //     this.applyCriteriaDataTableColumns.unshift({
                  //       field: "lcyAmount",
                  //       header: formatCrt.split("  ")[0],
                  //       value: formatCrt.split("  ")[1],
                  //       type: "lcyOpr",
                  //     });
                  //     lcyOprFieldInserted = true;
                  //   }
                }
                if (
                  this.criteriaCodeText.includes("LCY Amount = Slab") &&
                  !lcySlabFieldInserted
                ) {
                  this.applyCriteriaDataTableColumns.splice(-6, 0, {
                    field: "amountFrom",
                    header: "Amount From",
                    type: "lcySlabFrom",
                  });
                  this.applyCriteriaDataTableColumns.splice(-6, 0, {
                    field: "amountTo",
                    header: "Amount To",
                    type: "lcySlabTo",
                  });
                  lcySlabFieldInserted = true;
                }

                if (formatCrt.split("  ")[0] == "LCY Amount") {
                  if (!lcyOprFieldInserted) {
                    this.applyCriteriaDataTableColumns.unshift({
                      field: "lcyAmount",
                      header: formatCrt.split("  ")[0],
                      value: formatCrt.split("  ")[1],
                      type: "lcyOpr",
                    });
                    lcyOprFieldInserted = true;
                  } else {
                    return;
                  }
                } else {
                  if (formatCrt.split("  ")[0] == "Country") {
                    countryCol = {
                      field: formatCrt.split("  ")[0],
                      header: formatCrt.split("  ")[0],
                      value: formatCrt.split("  ")[1],
                      type: "string",
                    };
                  } else {
                    this.applyCriteriaDataTableColumns.unshift({
                      field: formatCrt.split("  ")[0],
                      header: formatCrt.split("  ")[0],
                      value: formatCrt.split("  ")[1],
                      type: "string",
                    });
                  }
                }
              });

            console.log(countryCol);
            if (Object.keys(countryCol).length) {
              this.applyCriteriaDataTableColumns.unshift(countryCol);
            }

            this.applyCriteriaDataTableColumns.forEach((col) => {
              res["data"]["dataOperation"].forEach((data) => {
                Object.values(data).forEach((subData) => {
                  (subData as any[]).forEach((d) => {
                    if (d["data"][col["field"]] == "Y") {
                      d["data"][col["field"]] = true;
                    }
                    if (d["data"][col["field"]] == "N") {
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

            console.log(this.applyCriteriaDataTableColumns);

            let completeData = [];
            if (simpleData) {
              Object.keys(res["labelData"]["label"]).forEach((k, i) => {
                let formattedRowData = {
                  data: {
                    fieldName: res["labelData"]["label"][k],
                    key: i,
                  },
                  expanded: true,
                  children: [],
                };
                console.log(
                  res["data"]["dataOperation"][0][res["labelData"]["label"][k]]
                );

                let formattedChilds =
                  res["data"]["dataOperation"][0][res["labelData"]["label"][k]];

                formattedChilds.forEach((child) => {
                  if (child["data"]["ruleSelected"] == "Y") {
                    child["partialSelected"] = false;
                    this.selectedNodes.push(child);
                  }
                });

                formattedRowData["children"] = formattedChilds;
                completeData.push(formattedRowData);
              });
            } else {
              console.log(reqData);
              console.log(lcyOprFields);
              if (reqData.lcySlabArr.length > 0) {
                reqData.lcySlabArr.forEach((slab, i) => {
                  Object.keys(res["labelData"]["label"]).forEach((k) => {
                    let formattedRowData = {
                      data: {
                        fieldName: res["labelData"]["label"][k],
                        key: i,
                      },
                      expanded: true,
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
                      child["data"]["amountFrom"] = slab["from"];
                      child["data"]["amountTo"] = slab["to"];
                      if (child["data"]["ruleSelected"] == "Y") {
                        child["partialSelected"] = false;
                        this.selectedNodes.push(child);
                      }
                    });

                    formattedRowData["children"] = formattedChilds;
                    completeData.push(formattedRowData);
                  });
                });
              } else if (lcyOprFields.length > 0) {
                lcyOprFields.forEach((oprField, i) => {
                  Object.keys(res["labelData"]["label"]).forEach((k) => {
                    let formattedRowData = {
                      data: {
                        fieldName: res["labelData"]["label"][k],
                        key: i,
                      },
                      expanded: true,
                      children: [],
                    };
                    console.log(
                      res["data"]["dataOperation"][0][
                        res["labelData"]["label"][k]
                      ]
                    );
                    let formattedChilds = res["data"]["dataOperation"][0][
                      res["labelData"]["label"][k]
                    ].filter((child) => child["data"]["key"] == oprField);
                    formattedChilds.forEach((child) => {
                      child["data"]["lcyAmount"] = oprField;
                      if (child["data"]["ruleSelected"] == "Y") {
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

            console.log(completeData);
            console.log(this.selectedNodes);
            this.applyCriteriaFormattedData = [...completeData];

            console.log(this.editFromRulesApiData["data"]["dataOperation"]);
            console.log(this.applyCriteriaFormattedData);
            this.showContent = true;
            // Table formation END
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

          console.log(res);
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getTaxSettingForEditApi", err);
        }
      );
  }

  onNodeSelect(event) {
    console.log(event);
    event["node"]["partialSelected"] = false;
  }
  onNodeUnSelect(event) {
    console.log(event);
    delete event["node"]["partialSelected"];
  }

  getCriteriaMasterData() {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.formRuleService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addFormRuleCriteriaData: this.formRuleService.getAddFormRuleCriteriaData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          this.criteriaDataDetailsJson = response.addFormRuleCriteriaData;
          this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
            (data) => {
              if (data["criteriaType"] == "Slab") {
                this.cmCriteriaSlabType.push(data["fieldName"]);
              }
            }
          );
          console.log(" Slabs fields", this.cmCriteriaSlabType);
          console.log(this.criteriaDataDetailsJson);

          if (this.mode == "add") {
            this.formRuleCode = this.criteriaDataDetailsJson.data.formRuleCode;
            this.ruleID = this.formRuleCode;
            this.ruleDescription =
              this.criteriaDataDetailsJson.data.formRuleDesc;
          }

          this.cmCriteriaDataDetails = [
            ...this.criteriaDataDetailsJson.data.listCriteria
              .cmCriteriaDataDetails,
          ];
          console.log("this.cmCriteriaDataDetails", this.cmCriteriaDataDetails);

          this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
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
          console.log(this.criteriaMapDdlOptions);
          return criteriaMasterData;
        })
      )
      .subscribe(
        (res) => {
          console.log(res);
          this.criteriaMasterData = res;
          if (this.mode == "edit") {
            if (
              !(
                this.formRuleService.applicationName ||
                this.formRuleService.moduleName
              )
            ) {
              this.appModuleDataPresent = false;
              this.showContent = false;
              this.router.navigate([`navbar/bank-routing`]);
            } else {
              this.getFormRulesForEditApi(this.ruleID, "edit");
            }
          } else if (this.mode == "clone") {
            if (
              !(
                this.formRuleService.applicationName ||
                this.formRuleService.moduleName
              )
            ) {
              this.appModuleDataPresent = false;
              this.showContent = false;
              this.router.navigate([`navbar/bank-routing`]);
            } else {
              this.getFormRulesForEditApi(this.ruleID, "clone");
            }
          } else {
            this.showContent = true;
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in Initiating dropdown values", err);
        }
      );
  }

  getCorrespondentValues(
    fieldName: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.formRuleService
      .getCorrespondentValuesData(
        this.formName,
        this.appCtrl.value.code,
        criteriaMapValue,
        fieldName,
        displayName,
        this.moduleCtrl.value.code
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          console.log(res);
          if (res[fieldName]) {
            this.setCriteriaSharedComponent.valueCtrl.enable();
            this.setCriteriaSharedComponent.hideValuesDropdown = false;
            this.setCriteriaSharedComponent.showValueInput = false;

            console.log(res[fieldName]);
            this.correspondentDdlOptions = res[fieldName].map((val) => {
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
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.resetCriteriaDropdowns();
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
    postDataCriteria.append("form", this.formName);
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
      console.log("CANNNNOT UPDATE ITTT");
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
          console.log("criteriasearch DATA", res);
          this.applyCriteriaResponse = JSON.parse(JSON.stringify(res));
          if (!res["msg"]) {
            if (!res["duplicate"]) {
              // for apply START
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              let reqData =
                this.criteriaDataService.decodeCriteriaMapIntoTableFields(res);

              console.log("decoded ARRRR", reqData);
              let crtfields = this.setCriteriaService.decodeFormattedCriteria(
                reqData.critMap,
                this.criteriaMasterData,
                // reqData.lcySlabArr.length ? ["LCY Amount"] : []
                ["LCY Amount"]
              );
              console.log("this.criteriaText", crtfields);

              this.applyCriteriaDataTableColumns = [];

              let lcyOprFields = [];
              let isLcyOprFieldPresent = false;
              let lcyOprFieldInserted = false;
              let lcySlabFieldInserted = false;

              let countryCol = {};

              this.applyCriteriaDataTableColumns = [...this.cols];
              this.appliedCriteriaIsDuplicate = res["duplicate"];
              crtfields
                .slice()
                .reverse()
                .forEach((crt) => {
                  let formatCrt;
                  let opr;
                  if (crt.includes("!=")) {
                    formatCrt = crt.replace(/[!=]/g, "");
                    opr = "!=";
                  } else if (crt.includes(">=")) {
                    formatCrt = crt.replace(/[>=]/g, "");
                    opr = ">=";
                  } else if (crt.includes("<=")) {
                    formatCrt = crt.replace(/[<=]/g, "");
                    opr = "<=";
                  } else if (crt.includes("<")) {
                    formatCrt = crt.replace(/[<]/g, "");
                    opr = "<";
                  } else if (crt.includes(">")) {
                    formatCrt = crt.replace(/[>]/g, "");
                    opr = ">";
                  } else {
                    formatCrt = crt.replace(/[=]/g, "");
                    opr = "=";
                  }

                  if (formatCrt.split("  ")[0] == "LCY Amount") {
                    isLcyOprFieldPresent = true;
                    lcyOprFields.push(
                      formatCrt.split("  ")[0] +
                        " " +
                        opr +
                        " " +
                        formatCrt.split("  ")[1]
                    );
                    if (!lcyOprFieldInserted) {
                      this.applyCriteriaDataTableColumns.unshift({
                        field: "lcyAmount",
                        header: formatCrt.split("  ")[0],
                        value: formatCrt.split("  ")[1],
                        type: "lcyOpr",
                      });
                      lcyOprFieldInserted = true;
                    }
                  } else {
                    if (formatCrt.split("  ")[0] == "Country") {
                      countryCol = {
                        field: formatCrt.split("  ")[0],
                        header: formatCrt.split("  ")[0],
                        value: formatCrt.split("  ")[1],
                        type: "string",
                      };
                    } else {
                      this.applyCriteriaDataTableColumns.unshift({
                        field: formatCrt.split("  ")[0],
                        header: formatCrt.split("  ")[0],
                        value: formatCrt.split("  ")[1],
                        type: "string",
                      });
                    }
                  }
                });

              if (Object.keys(countryCol).length) {
                this.applyCriteriaDataTableColumns.unshift(countryCol);
              }
              let completeData = [];
              console.log(res);
              Object.keys(res["labelData"]["label"]).forEach((k) => {
                let formattedRowData = {
                  data: {
                    fieldName: res["labelData"]["label"][k],
                  },
                  expanded: true,
                  children: [],
                };

                res["data"][k].forEach((detail) => {
                  let childRow = { data: {} };
                  this.applyCriteriaDataTableColumns.forEach((col) => {
                    if (detail[col["field"]] == "Y") {
                      detail[col["field"]] = true;
                    }
                    if (detail[col["field"]] == "N") {
                      detail[col["field"]] = false;
                    }
                    console.log(detail[col["field"]]);
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
                  console.log(detail);
                  childRow["data"]["formLableFieldSequence"] =
                    detail["formLableFieldSequence"];
                  childRow["data"]["formSection"] = detail["formSection"];
                  childRow["data"]["fieldType"] = detail["fieldType"];
                  childRow["data"]["fieldLabel"] = detail["fieldLabel"];
                  formattedRowData["children"].push(childRow);
                });
                completeData.push(formattedRowData);
              });

              if (
                !reqData.lcySlabArr.length &&
                reqData.critMap.findIndex((element) =>
                  element.includes("LCY Amount")
                ) < 0
              ) {
                this.isLcySlab = false;
                this.isLcyAmount = false;
                this.applyCriteriaFormattedData = [...completeData];
                this.applyCriteriaFormattedData.forEach((row, i) => {
                  row["data"]["key"] = i;
                  row["children"].forEach((child) => {
                    child["data"]["criteriaMapSplit"] = null;
                  });
                });
              } else {
                if (
                  reqData.lcySlabArr.length &&
                  reqData.critMap.findIndex((element) =>
                    element.includes("LCY Amount")
                  ) < 0
                ) {
                  this.isLcySlab = true;
                  this.isLcyAmount = false;
                  this.applyCriteriaDataTableColumns.splice(-6, 0, {
                    field: "amountFrom",
                    header: "Amount From",
                    type: "lcySlabFrom",
                  });
                  this.applyCriteriaDataTableColumns.splice(-6, 0, {
                    field: "amountTo",
                    header: "Amount To",
                    type: "lcySlabTo",
                  });

                  this.applyCriteriaFormattedData = [];

                  reqData.lcySlabArr.forEach((slab, i) => {
                    console.log(completeData);
                    let copy = JSON.parse(JSON.stringify(completeData));
                    copy.forEach((row) => {
                      row["data"]["key"] = i;
                      row["children"].forEach((child) => {
                        child["data"]["amountFrom"] = slab["from"];
                        child["data"]["amountTo"] = slab["to"];
                        child["data"][
                          "criteriaMapSplit"
                        ] = `from:${slab["from"]}::to:${slab["to"]}`;
                      });
                    });

                    this.applyCriteriaFormattedData.push(...copy);
                  });
                } else if (
                  !reqData.lcySlabArr.length &&
                  reqData.critMap.findIndex((element) =>
                    element.includes("LCY Amount")
                  ) >= 0
                ) {
                  this.applyCriteriaFormattedData = [];
                  this.isLcySlab = false;
                  this.isLcyAmount = true;

                  lcyOprFields.forEach((opr, i) => {
                    console.log(completeData);
                    let copy = JSON.parse(JSON.stringify(completeData));
                    copy.forEach((row) => {
                      row["data"]["key"] = i;
                      row["children"].forEach((child) => {
                        child["data"]["lcyAmount"] = opr;
                        child["data"]["criteriaMapSplit"] = opr;
                      });
                    });

                    this.applyCriteriaFormattedData.push(...copy);
                  });
                }
              }

              console.log(this.applyCriteriaFormattedData);

              // for apply END

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
            this.coreService.showWarningToast(res["msg"]);

            this.appliedCriteriaData = [];
          }
        },
        (err) => {
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
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.formRuleService
      .currentCriteriaSaveAsTemplate(templateFormData)
      .subscribe(
        (response) => {
          this.coreService.removeLoadingScreen();
          if (response.msg == "Criteria Template already exists.") {
            this.savingCriteriaTemplateError =
              "Criteria Template already exists.";
          } else {
            this.savingCriteriaTemplateError = null;
            this.setCriteriaSharedComponent.selectedTemplate =
              this.setCriteriaSharedComponent.criteriaName;
            this.coreService.showSuccessToast(response.msg);
            this.setCriteriaSharedComponent.saveTemplateDialogOpen = false;
            this.setCriteriaSharedComponent.criteriaName = "";
            this.getAllTemplates();
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log(":: Error in saving criteria template", err);
        }
      );
  }

  getAllTemplates() {
    this.formRuleService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
        this.formName
      )
      .subscribe((response) => {
        if (response.data && response.data.length) {
          console.log("::templates", response);
          this.criteriaTemplatesDdlOptions = response.data;
          this.criteriaTemplatesDdlOptions.forEach((val) => {
            val["name"] = val["criteriaName"];
            val["code"] = val["criteriaName"];
          });
        } else {
          console.log(response.msg);
        }
      });
  }

  saveAddNewRule(action) {
    console.log(this.setCriteriaSharedComponent.getCurrentCriteriaMap());
    console.log(this.appliedCriteriaCriteriaMap);

    if (
      this.setCriteriaSharedComponent.getCurrentCriteriaMap() !=
      this.appliedCriteriaCriteriaMap
    ) {
      this.coreService.showWarningToast(
        "Recent changes in Criteria map has not been applied, Saving last applied data"
      );
    }

    console.log(this.applyCriteriaFormattedData);
    console.log(this.applyCriteriaResponse);
    console.log(this.editFromRulesApiData);

    let isRequiredFields = false;
    let invalidDefValue = false;
    let invalidLengthValue = false;

    let payloadData;

    if (this.applyCriteriaResponse["data"]) {
      console.log("apply");
      payloadData = JSON.parse(this.stringify(this.applyCriteriaResponse));
    } else if (this.editFromRulesApiData["data"]) {
      console.log("edit");
      payloadData = JSON.parse(this.stringify(this.editFromRulesApiData));
      payloadData["duplicate"] = this.appliedCriteriaIsDuplicate;
    }

    let copyApplyCriteriaFormattedData = [...this.applyCriteriaFormattedData];

    let finalObj = {};
    Object.keys(payloadData["labelData"]["label"]).forEach((k) => {
      let fieldArr = [];
      let fieldObjArr = copyApplyCriteriaFormattedData.filter((tableData) => {
        return tableData["data"]["fieldName"] == k;
      });

      fieldObjArr.forEach((data) => {
        fieldArr.push(...data["children"]);
      });

      fieldArr.forEach((child) => {
        delete child["parent"];

        if (child["partialSelected"] == false) {
          child["data"]["ruleSelected"] = true;
        } else {
          child["data"]["ruleSelected"] = false;
        }
        if (child["data"]["isValidLength"] == false) {
          invalidLengthValue = true;
        }

        if (child["data"]["isValidDefValue"] == false) {
          invalidDefValue = true;
        }
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
    } else if (invalidLengthValue) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast(
        "Some Min/Max Length fields are invalid."
      );
    } else if (invalidDefValue) {
      this.coreService.removeLoadingScreen();
      this.coreService.showWarningToast(
        "Some Default values fields are invalid."
      );
    } else {
      payloadData.data = {};

      payloadData["data"]["dataOperation"] = [finalObj];
      payloadData["formRuleCode"] = this.formRuleCode;
      payloadData["formRuleDesc"] = this.ruleDescription
        ? this.ruleDescription
        : "";
      payloadData["userId"] = this.userId;
      let str = this.stringify(payloadData);
      str = str.replace(/true/g, '"Y"');
      str = str.replace(/false/g, '"N"');
      console.log(JSON.parse(str));
      payloadData = JSON.parse(str);
      let copyPayload = JSON.parse(this.stringify(payloadData));
      if (copyPayload["duplicate"] == "N") {
        payloadData["duplicate"] = false;
      } else if (copyPayload["duplicate"] == "Y") {
        payloadData["duplicate"] = true;
      }
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
            this.formName
          );
          console.log("EDIT MODE - UPDATE form SERVICE");
        } else {
          console.log("ADD MODE - ADD NEW form SERVICE");
          service = this.formRuleService.addNewFormRule(
            payloadData,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formName
          );
        }

        if (service) {
          service.subscribe(
            (res) => {
              console.log(res);
              if (res["msg"]) {
                this.coreService.showSuccessToast(res.msg);
                if (action == "save") {
                  this.router.navigate([`navbar/form-rules`]);
                } else if (action == "saveAndAddNew") {
                  this.formRuleService.applicationName = null;
                  this.formRuleService.moduleName = null;
                  this.router.navigate([`navbar/form-rules/addnewformrule`]);
                  // this.coreService.removeLoadingScreen();
                }
              }
            },
            (err) => {
              this.coreService.removeLoadingScreen();
              console.log("error in saveAddNewFormRule", err);
            }
          );
          // }
        }
      } else {
        this.coreService.showWarningToast("Applied criteria already exists.");
      }
    }

    console.log([finalObj]);
  }

  stringify(obj) {
    let cache = [];
    let str = JSON.stringify(obj, function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
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
          this.appCtrl.reset();
          this.moduleCtrl.reset();
          this.moduleCtrl.disable();
          this.showContent = false;
          this.appModuleDataPresent = false;
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

  minMaxValidation(
    e: any,
    rowData: any,
    validLengthInp: any,
    defaultValueCol: any
  ) {
    console.log(rowData, e, validLengthInp);
    const pattern = /^(\d+)-(\d+)$/;
    rowData["isValidLength"] = null;

    rowData[defaultValueCol] = "";
    const defValueInp = validLengthInp
      .closest("td")
      .nextSibling.nextSibling.querySelector("input");
    defValueInp.classList.remove("inputError");

    if (e.length == 0) {
      this.minMaxInpTooltip = "";
      validLengthInp.classList.remove("inputError");
      rowData["isValidLength"] = null;
      return;
    }

    const match = e.match(pattern);
    console.log(validLengthInp.classList);
    if (match) {
      const lesserNumber = parseInt(match[1]);
      const bigNumber = parseInt(match[2]);

      if (bigNumber > lesserNumber) {
        console.log("Valid match!");
        this.minMaxInpTooltip = "";
        validLengthInp.classList.remove("inputError");
        rowData["isValidLength"] = true;
      } else {
        this.minMaxInpTooltip = "{min-length} should be less than {max-length}";
        rowData["isValidLength"] = false;
        validLengthInp.classList.add("inputError");
        console.log(
          "Invalid match: big number is not greater than lesser number."
        );
      }
    } else {
      this.minMaxInpTooltip =
        "Please enter only number in this format: {min-length}-{max-length}";

      validLengthInp.classList.add("inputError");
      rowData["isValidLength"] = false;
      console.log("No match found.");
    }

    if (rowData["isValidLength"] == false) {
      this.defValueInpTooltip = "Please set min max length correctly";
    } else {
      this.defValueInpTooltip = "";
    }
  }

  defaultValueValidation(
    e: any,
    rowData: any,
    defValueInp: any,
    minMaxCol: any
  ) {
    console.log(e);
    console.log(rowData);
    rowData["isValidDefValue"] = null;

    console.log(rowData[minMaxCol]);
    console.log(e.length);

    if (e.length == 0) {
      rowData["isValidDefValue"] = null;
      defValueInp.classList.remove("inputError");
      return;
    } else {
      if (rowData[minMaxCol]) {
        const min = rowData[minMaxCol].split("-")[0];
        const max = rowData[minMaxCol].split("-")[1];
        if (e.length > max || e.length < min) {
          rowData["isValidDefValue"] = false;
          defValueInp.classList.add("inputError");
        } else {
          rowData["isValidDefValue"] = true;
          defValueInp.classList.remove("inputError");
        }
      } else {
        rowData["isValidDefValue"] = true;
        defValueInp.classList.remove("inputError");
      }

      if (rowData["isValidDefValue"] == false) {
        this.defValueInpTooltip = "Default value is not in specified range";
      } else {
        this.defValueInpTooltip = "";
      }
    }
  }

  // suresh Work start -->

  onChange(controlId, rule) {
    let minmax = rule.minFieldLengthMaxLength.split("-");
    let min = minmax[0];
    let max = minmax[1];
    let index = this.formRulesData.findIndex(
      (x) => x.fieldName == rule.fieldName
    );
    console.log("minmax", minmax, max, index);
    if (controlId == "defaultValues") {
      // if(rule.defaultValues.length < min || rule.defaultValues.length > max) {
      // rule.maxlengthDefaultValue = Number(max);
      this.formRulesData[index].maxlengthDefaultValue = Number(max);
      // }
    }
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }
  selectedColumn(selectCol: any, value: any, index: any) {
    console.log(selectCol, value, index);
    if (selectCol == "setAsOption") {
      if (selectCol == "setAsOption" && value["code"] == "Percentage") {
        this.appliedCriteriaData[index]["tax"] = 0;
      } else {
        if (Number(this.appliedCriteriaData[index].lcyAmountFrom)) {
          console.log("SLAB");
          this.appliedCriteriaData[index]["tax"] = Number(
            this.appliedCriteriaData[index].lcyAmountFrom
          );
        } else {
          console.log("NOT SLAB");
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
    console.log("this.appliedCriteriaData", this.appliedCriteriaData[index]);
  }

  changeValueInput(
    selectCol: any,
    inputCol: any,
    event: any,
    index: any,
    valueInputElm: any
  ) {
    this.appliedCriteriaData[index]["invalidTaxAmount"] = false;
    console.log(
      "selectCol",
      event,
      "valueInputElm",
      valueInputElm,
      this.appliedCriteriaData[index][selectCol.split("Option")[0]],
      this.appliedCriteriaData[index].lcyAmountFrom
    );
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
    // console.log("lcyAmount",lcyAmount);
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

  checkOperation(operation: any, index: any, selectRow: any, fieldName: any) {
    if (operation == "delete") {
      this.delete(index);
    } else if (operation == "clone") {
      this.clone(index, selectRow, fieldName);
    } else {
      console.log("Nor Clone neither Delete");
    }
  }

  clone(index: any, selectRow: any, fieldName: any) {
    console.log("clone", index, selectRow);
    let clonedRow = {
      ...selectRow,
    };
    clonedRow[fieldName] = "clone,delete";
    console.log(clonedRow);
    this.appliedCriteriaData.splice(index + 1, 0, clonedRow);
    setTimeout(() => {
      console.log(this.appliedCriteriaData[index]);
      console.log(this.appliedCriteriaData[index + 1]);
    }, 100);
  }
  delete(index: any) {
    this.appliedCriteriaData.splice(index, 1);
    console.log("delete", index);
  }
  // suresh Work end -->
}
