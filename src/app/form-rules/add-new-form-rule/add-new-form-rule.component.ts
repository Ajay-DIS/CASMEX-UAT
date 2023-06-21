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

@Component({
  selector: "app-add-new-form-rule",
  templateUrl: "./add-new-form-rule.component.html",
  styleUrls: ["./add-new-form-rule.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddNewFormRuleComponent implements OnInit {
  primaryColor = "var(--primary-color)";
  @ViewChild("treeTable") treeTable: TreeTable;

  userId = "";
  ruleID = "";
  mode = "add";
  formName = "Form Rules";
  applicationName = "Web Application";

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

  applyCriteriaFormattedData: TreeNode[] = [];

  applyCriteriaDataTableColumns: any[] = [];

  cols: any[] = [
    { field: "fieldName", header: "Field Name", type: "string" },
    { field: "isMandatory", header: "Is Mandatory", type: "checkbox" },
    // { field: "isEnabled", header: "Is Enabled", type: 'checkbox' },
    { field: "isVisibile", header: "Is Visible", type: "checkbox" },
    { field: "validLength", header: "Min/Max Length", type: "input" },
    { field: "defaultValue", header: "Default Values", type: "input" },
    { field: "regex", header: "Regex", type: "input" },
  ];

  applyCriteriaResponse: any = {};

  selectedNodes: TreeNode;
  maxlengthDefaultValue = 0;

  appliedCriteriaDataCols = [];
  appliedCriteriaData: any = [];

  appliedCriteriaDatajson: any = {};

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
    private criteriaDataService: CriteriaDataService
  ) {}

  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;

  ngOnInit(): void {
    this.mode = "add";
    this.getCriteriaMasterData();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.getAllTemplates();
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      // this.mode = "edit";
      this.ruleID = params.id;
    }
    console.log(this.mode);
  }

  getFormRulesForEditApi(formRuleCode: any, operation: any) {
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.formRuleService
      .getFormRuleForEdit(formRuleCode, operation)
      .subscribe(
        (res) => {
          if (!res["msg"]) {
            this.editFromRulesApiData = res;
            console.log("edit data", res);

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
              this.editFromRulesApiData
            );

            this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
              this.criteriaCodeText,
              this.criteriaMasterData,
              this.cmCriteriaSlabType
            );

            this.formRuleCode = res["data"][0]["formRuleCode"];
            if (res["data"][0]["ruleCodeDesc"]) {
              this.ruleDescription = res["data"][0]["ruleCodeDesc"];
            }
            this.isFromRulesLinked = !res["criteriaUpdate"];

            this.appliedCriteriaDataOrg = [...res["data"]];
            this.appliedCriteriaData = [...res["data"]];
            // this.setSelectedOptions();
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaDataCols = [...this.getColumns(res["column"])];
          } else {
            this.coreService.showWarningToast(res["msg"]);
            if (res["msg"].includes("No active")) {
              this.inactiveData = true;
              this.setCriteriaSharedComponent.criteriaCtrl.disable();
            }
            this.appliedCriteriaData = [];
            this.appliedCriteriaDataCols = [];
          }
        },
        (err) => {
          console.log("Error in getTaxSettingForEditApi", err);
        }
      )
      .add(() => {
        setTimeout(() => {
          this.coreService.removeLoadingScreen();
        }, 250);
      });
  }

  getCriteriaMasterData() {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.formRuleService.getCriteriaMasterData(
        this.userId
      ),
      addFormRuleCriteriaData: this.formRuleService.getAddFormRuleCriteriaData(
        this.userId
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
              this.criteriaDataDetailsJson.data.ruleCodeDesc;
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
            this.getFormRulesForEditApi(this.ruleID, "edit");
          } else if (this.mode == "clone") {
            this.getFormRulesForEditApi(this.ruleID, "clone");
          } else {
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
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
        this.applicationName,
        criteriaMapValue,
        fieldName,
        displayName
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
              // this.appliedCriteriaDataOrg = [...res["data"]];
              // this.appliedCriteriaData = [...res["data"]];
              // // this.setSelectedOptions();

              // this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              // this.appliedCriteriaIsDuplicate = res["duplicate"];

              // for apply START

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
                    this.applyCriteriaDataTableColumns.unshift({
                      field: formatCrt.split("  ")[0],
                      header: formatCrt.split("  ")[0],
                      value: formatCrt.split("  ")[1],
                      type: "string",
                    });
                  }
                });

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

              // this.treeTable.writeValue(this.applyCriteriaFormattedData);
              // // Refresh the TreeTable component to reflect the changes
              // this.treeTable.value = [...this.nodes];
              // this.treeTable.updateDataToRender(
              //   this.treeTable.filteredValue || this.treeTable.value
              // );

              console.log(this.applyCriteriaFormattedData);

              // for apply END

              this.coreService.showSuccessToast(
                `Criteria Applied Successfully`
              );
            } else {
              this.appliedCriteriaData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.appliedCriteriaDataCols = [];
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
    let padLeft = i == 0 ? "0px !important" : "";
    let width = col.type == "lcyOpr" ? "120px !important" : "";

    return `padding-left : ${padLeft};`;
  }

  saveCriteriaAsTemplate(templateFormData: any) {
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
      .getAllCriteriaTemplates(this.userId)
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
    console.log(this.applyCriteriaFormattedData);

    console.log(this.applyCriteriaResponse);
    let copyApplyCriteriaFormattedData = [...this.applyCriteriaFormattedData];

    let fruitColors = {};

    for (let fruit of copyApplyCriteriaFormattedData) {
      if (fruitColors[fruit.data.key]) {
        fruitColors[fruit.data.key].push(fruit);
      } else {
        fruitColors[fruit.data.key] = [fruit];
      }
    }

    console.log(fruitColors);
    console.log(Object.values(fruitColors));

    let groupsArray: any[] = [];
    Object.values(fruitColors).forEach((col: any) => {
      let groupObj: any = {};
      col.forEach((c: any) => {
        c["children"].forEach((childData: any) => {
          if (childData["partialSelected"] == false) {
            childData["data"]["ruleSelected"] = true;
          } else {
            childData["data"]["ruleSelected"] = false;
          }
          // delete childData["partialSelected"];
          delete childData["parent"];
        });
        groupObj[c["data"]["fieldName"]] = c["children"];
      });
      groupsArray.push(groupObj);
    });

    console.log(groupsArray);

    this.applyCriteriaResponse.data = {};

    this.applyCriteriaResponse["data"]["dataOperation"] = groupsArray;
    this.applyCriteriaResponse["formRuleCode"] = this.formRuleCode;
    this.applyCriteriaResponse["formRuleDesc"] = this.ruleDescription
      ? this.ruleDescription
      : "";
    this.applyCriteriaResponse["userId"] = this.userId;
    let str = this.stringify(this.applyCriteriaResponse);
    str = str.replace(/true/g, '"Y"');
    str = str.replace(/false/g, '"N"');
    console.log(JSON.parse(str));
    this.applyCriteriaResponse = JSON.parse(str);
    let copyPayload = JSON.parse(this.stringify(this.applyCriteriaResponse));
    if (copyPayload["duplicate"] == "N") {
      this.applyCriteriaResponse["duplicate"] = false;
    } else {
      this.applyCriteriaResponse["duplicate"] = true;
    }
    console.log(this.applyCriteriaResponse);

    if (
      this.mode != "clone" ||
      (this.mode == "clone" && this.isApplyCriteriaClicked)
    ) {
      // this.coreService.displayLoadingScreen();
      // let isRequiredFields = false;
      // let invalidTaxAmount = false;
      // this.appliedCriteriaData.forEach((element) => {
      //   if (element["invalidTaxAmount"]) {
      //     invalidTaxAmount = true;
      //   }
      //   element["taxCodeDesc"] = this.taxDescription
      //     ? this.taxDescription
      //     : null;
      //   function isNullValue(arr) {
      //     return arr.some((el) => el == null);
      //   }
      //   console.log("::::", element);
      //   if (isNullValue(Object.values(element))) {
      //     isRequiredFields = true;
      //   }
      // });
      // if (isRequiredFields) {
      //   this.coreService.removeLoadingScreen();
      //   this.coreService.showWarningToast("Please Fill required fields.");
      // } else if (invalidTaxAmount) {
      //   this.coreService.removeLoadingScreen();
      //   this.coreService.showWarningToast("Please Enter Valid Tax Amount.");
      // } else {
      let service;
      // this.decodeSelectedOptions();
      if (this.mode == "edit") {
        let data;
        // service = this.formRuleService.updateFormRule(this.userId, data);
        console.log("EDIT MODE - UPDATE form SERVICE");
      } else {
        console.log("ADD MODE - ADD NEW form SERVICE");
        service = this.formRuleService.addNewFormRule(
          this.applyCriteriaResponse
        );
      }

      if (service) {
        service.subscribe(
          (res) => {
            if (res["msg"]) {
              this.coreService.showSuccessToast(res.msg);
              if (action == "save") {
                this.router.navigate([`navbar/form-rules`]);
              } else if (action == "saveAndAddNew") {
                this.reset();
                this.coreService.removeLoadingScreen();
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
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    this.confirmationService.confirm({
      message: "Are you sure, you want to clear all the fields ?",
      key: "resetTaxDataConfirmation",
      accept: () => {
        this.appliedCriteriaData = [];
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
