import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { TaxSettingsService } from "../tax-settings.service";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import { Table } from "primeng/table";
import { Dropdown } from "primeng/dropdown";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-add-new-tax",
  templateUrl: "./add-new-tax.component.html",
  styleUrls: ["./add-new-tax.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddNewTaxComponent implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;
  primaryColor = "var(--primary-color)";

  userId = "";
  taxID = "";
  mode = "add";
  formName = "Tax Settings";

  taxCode = "No Data";
  taxDescription = "";

  isTaxSettingLinked: boolean = false;

  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  objectKeys = Object.keys;
  isEditMode = false;

  editTaxSettingApiData: any = [];

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

  applyCriteriaResponse: any[] = [];
  isLcyFieldPresent = false;
  applyCriteriaDataTableColumns: any[] = [];
  columnsCopy: any[] = [
    {
      field: "taxType",
      header: "Tax Type",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "setAs",
      header: "Set As",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "tax",
      header: "Tax",
      fieldType: "input",
      frozen: false,
      info: null,
    },
    {
      field: "action",
      header: "Action",

      fieldType: "button",
      frozen: true,
      info: null,
    },
  ];
  applyCriteriaFormattedData: any[] = [];

  taxTypeOption: any[] = [];
  setAsOption: any[] = [];

  taxMin = 0;
  taxPerMax = 100;
  taxAmountMax = 100000;

  appliedCriteriaDatajson: any = {};
  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  formattedMasterData: any = [];

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
    private taxSettingsService: TaxSettingsService,
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
      this.taxID = params.id;
    }
    this.taxSettingsService.getTaxSettingAppModuleList().subscribe(
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
            this.searchApplicationOptions = res["data"][
              "cmApplicationMaster"
            ].map((app) => {
              return { name: app.name, code: app.name };
            });
            this.searchModuleOptions = res["data"][
              "cmPrimaryModuleMasterDetails"
            ].map((app) => {
              return { name: app.codeName, code: app.codeName };
            });
            if (
              !(
                this.taxSettingsService.applicationName ||
                this.taxSettingsService.moduleName
              )
            ) {
              if (this.mode != "add") {
                this.router.navigate([`navbar/tax-settings`]);
              } else {
                this.coreService.removeLoadingScreen();
              }
            } else {
              if (this.mode != "add") {
                this.appCtrl.setValue({
                  name: this.taxSettingsService.applicationName,
                  code: this.taxSettingsService.applicationName,
                });
                this.moduleCtrl.setValue({
                  name: this.taxSettingsService.moduleName,
                  code: this.taxSettingsService.moduleName,
                });
                this.appModuleDataPresent = true;
                this.appCtrl.disable();
                this.moduleCtrl.disable();
                this.searchAppModule();
              }
            }
          } else {
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
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
    this.applyCriteriaFormattedData = [];
    this.criteriaText = [];
    this.criteriaCodeText = [];
    this.appModuleDataPresent = true;
    this.showContent = false;
    this.getCriteriaMasterData();
    this.getAllTemplates();
  }

  getTaxSettingForEditApi(taxCode: any, operation: any) {
    console.log("HERE");
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.taxSettingsService
      .getTaxSettingForEdit(
        taxCode,
        operation,
        this.taxSettingsService.applicationName,
        this.taxSettingsService.moduleName,
        this.formName
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
            if (res["data"]) {
              this.showContent = true;
              this.editTaxSettingApiData = JSON.parse(JSON.stringify(res));

              this.criteriaCodeText =
                this.setCriteriaService.setCriteriaMap(res);

              this.criteriaText =
                this.setCriteriaService.decodeFormattedCriteria(
                  this.criteriaCodeText,
                  this.criteriaMasterData,
                  this.cmCriteriaSlabType
                );

              this.taxCode = res["taxCode"];
              if (res["taxCodeDesc"]) {
                this.taxDescription = res["taxCodeDesc"];
              }
              this.isTaxSettingLinked = !res["criteriaUpdate"];
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];

              this.taxTypeOption = res["taxTypeOption"].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });
              this.setAsOption = res["setAsOption"].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });

              if (res["criteriaMap"].indexOf("&&&&") >= 0) {
                this.isLcyFieldPresent = true;
              }

              if (!this.isLcyFieldPresent) {
                this.applyCriteriaFormattedData = res["data"];
              } else {
                if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
                  this.applyCriteriaDataTableColumns.splice(-4, 0, {
                    field: "lcyAmount",
                    header: "LCY Amount",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = res["data"];

                  this.applyCriteriaFormattedData.forEach((data) => {
                    let split = data["criteriaMapSplit"];
                    if (split) {
                      data["lcyAmount"] = split.includes("&&&&")
                        ? split.split("&&&&").pop()
                        : split;
                      data["criteriaMapSplit"] = split.includes("&&&&")
                        ? split.split("&&&&").pop()
                        : split;
                    }
                  });
                } else if (res["criteriaMap"].indexOf("from") >= 0) {
                  this.applyCriteriaDataTableColumns.splice(-4, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-4, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = res["data"];
                  console.log("::", this.applyCriteriaFormattedData);
                  this.applyCriteriaFormattedData.forEach((data) => {
                    let split = data["criteriaMapSplit"];
                    if (split) {
                      data["lcyAmountFrom"] = split?.includes("&&&&")
                        ? split.split("&&&&").pop().split("::")[0].split(":")[1]
                        : split?.split("::")[0]?.split(":")[1];
                      data["lcyAmountTo"] = split?.includes("&&&&")
                        ? split.split("&&&&").pop().split("::")[1].split(":")[1]
                        : split?.split("::")[1]?.split(":")[1];
                      data["criteriaMapSplit"] = split?.includes("&&&&")
                        ? split.split("&&&&").pop()
                        : split;
                    }
                  });
                }
              }

              this.applyCriteriaFormattedData.forEach((data) => {
                delete data.id;
                data["taxTypeOption"] = this.taxTypeOption;
                data["setAsOption"] = this.setAsOption;
                data["action"] = res["action"];
                data["invalidTaxAmount"] = false;
                data["status"] = "Active";
              });
              // this.setSelectedOptions();

              console.log("::", this.applyCriteriaFormattedData);
              // console.log("::", this.applyCriteriaDataTableColumns);

              this.coreService.showSuccessToast(
                `Tax Setting data fetched Successfully`
              );
              this.coreService.removeLoadingScreen();
            } else {
              this.applyCriteriaFormattedData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.applyCriteriaDataTableColumns = [];
              if (res && res["msg"]) {
                this.coreService.showWarningToast(res["msg"]);
              } else {
                this.coreService.showWarningToast(
                  "No active data found for this Tax Setting."
                );
              }
              this.coreService.removeLoadingScreen();
            }
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getTaxSettingForEditApi", err);
          this.coreService.showWarningToast(
            "Something went wrong, Please try again later"
          );
        }
      );
  }

  getCriteriaMasterData() {
    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
    }
    forkJoin({
      criteriaMasterData: this.taxSettingsService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addBankRouteCriteriaData:
        this.taxSettingsService.getAddTaxSettingsCriteriaData(
          this.appCtrl.value.code,
          this.moduleCtrl.value.code,
          this.formName
        ),
    })
      .pipe(
        take(1),
        map((response) => {
          this.formatMasterData(response.criteriaMasterData);
          const criteriaMasterData = response.criteriaMasterData;
          this.criteriaDataDetailsJson = response.addBankRouteCriteriaData;
          this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
            (data) => {
              if (data["criteriaType"] == "Slab") {
                this.cmCriteriaSlabType.push(data["fieldName"]);
              }
            }
          );

          if (this.mode == "add") {
            this.taxCode = this.criteriaDataDetailsJson.data.taxCode;
            this.taxID = this.taxCode;
            this.taxDescription = this.criteriaDataDetailsJson.data.taxCodeDesc;
          }

          this.cmCriteriaDataDetails = [
            ...this.criteriaDataDetailsJson.data.listCriteria
              .cmCriteriaDataDetails,
          ];

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
          return criteriaMasterData;
        })
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
            this.criteriaMasterData = res;
            if (this.mode == "edit") {
              if (
                !(
                  this.taxSettingsService.applicationName ||
                  this.taxSettingsService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/tax-settings`]);
              } else {
                this.getTaxSettingForEditApi(this.taxID, "edit");
              }
            } else if (this.mode == "clone") {
              if (
                !(
                  this.taxSettingsService.applicationName ||
                  this.taxSettingsService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/tax-settings`]);
              } else {
                this.getTaxSettingForEditApi(this.taxID, "clone");
              }
            } else {
              this.showContent = true;
              this.coreService.removeLoadingScreen();
            }
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
  formatMasterData(masterData: any) {
    const formattedMasterData = [].concat.apply([], Object.values(masterData));
    this.formattedMasterData = formattedMasterData;
  }
  getCorrespondentValues(
    fieldName: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.taxSettingsService
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
            if (res[fieldName]) {
              this.setCriteriaSharedComponent.valueCtrl.enable();
              this.setCriteriaSharedComponent.hideValuesDropdown = false;
              this.setCriteriaSharedComponent.showValueInput = false;

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
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.coreService.showWarningToast("Some error in fetching data");
          this.resetCriteriaDropdowns();
        }
      );
  }

  resetCriteriaDropdowns() {
    this.setCriteriaSharedComponent.resetCriteriaDropdowns();
  }

  applyCriteria(postDataCriteria: FormData) {
    postDataCriteria.append("taxCode", this.taxID);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.appCtrl.value.code);
    postDataCriteria.append("form", this.formName);
    postDataCriteria.append("moduleName", this.moduleCtrl.value.code);
    this.isApplyCriteriaClicked = true;
    if (this.isTaxSettingLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "taxSettingLinkedWarning",
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
      this.taxCriteriaSearchApi(postDataCriteria);
    }
  }

  taxCriteriaSearchApi(formData: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];
    this.coreService.displayLoadingScreen();

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.taxSettingsService.postTaxCriteriaSearch(formData).subscribe(
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
          if (!res["duplicate"]) {
            this.applyCriteriaResponse = JSON.parse(JSON.stringify(res));
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaIsDuplicate = res["duplicate"];
            let reqData =
              this.criteriaDataService.decodeCriteriaMapIntoTableFields(res);

            let crtfields = this.setCriteriaService.decodeFormattedCriteria(
              reqData.critMap,
              this.criteriaMasterData,
              ["LCY Amount"]
            );
            this.taxTypeOption = res["data"].taxTypeOption.map((option) => {
              return { code: option.code, codeName: option.codeName };
            });
            this.setAsOption = res["data"].setAsOption.map((option) => {
              return { code: option.code, codeName: option.codeName };
            });

            if (res["criteriaMap"].indexOf("&&&&") >= 0) {
              this.isLcyFieldPresent = true;
            } else {
              this.isLcyFieldPresent = false;
            }

            if (!this.isLcyFieldPresent) {
              this.applyCriteriaFormattedData = [res["data"].taxSetting];
              this.applyCriteriaFormattedData.forEach((data) => {
                data["criteriaMapSplit"] = null;
              });
              console.log(this.applyCriteriaFormattedData);
            } else {
              if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
                let lcyOprFields = crtfields.filter((crt) => {
                  return crt.includes("LCY Amount");
                });
                this.applyCriteriaDataTableColumns.splice(-4, 0, {
                  field: "lcyAmount",
                  header: "LCY Amount",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                lcyOprFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].taxSetting)
                  );
                  apiData["lcyAmount"] = field;
                  apiData["criteriaMapSplit"] = field;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              } else if (res["criteriaMap"].indexOf("from") >= 0) {
                let lcySlabFields = reqData.lcySlabArr;
                this.applyCriteriaDataTableColumns.splice(-4, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-4, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                lcySlabFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].taxSetting)
                  );
                  apiData["lcyAmountFrom"] = field.from;
                  apiData["lcyAmountTo"] = field.to;
                  apiData[
                    "criteriaMapSplit"
                  ] = `from:${field["from"]}::to:${field["to"]}`;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              }
            }

            this.applyCriteriaFormattedData.forEach((data) => {
              delete data.id;
              data["taxTypeOption"] = this.taxTypeOption;
              data["setAsOption"] = this.setAsOption;
              data["action"] = res["data"].action;
              data["criteriaMap"] = this.appliedCriteriaCriteriaMap;
              data["invalidTaxAmount"] = false;
              data["status"] = "Active";
              data["userID"] = this.userId;
              data["taxCode"] = this.taxCode;
            });
            // this.setSelectedOptions();

            console.log("::", this.applyCriteriaFormattedData);
            // console.log("::", this.applyCriteriaDataTableColumns);

            this.coreService.showSuccessToast(`Criteria Applied Successfully`);
            this.coreService.removeLoadingScreen();
          } else {
            this.applyCriteriaFormattedData = [];
            this.appliedCriteriaCriteriaMap = null;
            this.appliedCriteriaIsDuplicate = null;
            this.applyCriteriaDataTableColumns = [];
            this.coreService.showWarningToast(
              "Applied criteria already exists."
            );
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        console.log("error in Tax setting Apply API", err);
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.taxSettingsService
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
              this.savingCriteriaTemplateError =
                "Criteria Template already exists.";
            } else {
              this.savingCriteriaTemplateError = null;
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
    this.taxSettingsService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
        this.formName
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

  saveAddNewTax(action) {
    if (
      this.setCriteriaSharedComponent.getCurrentCriteriaMap() !=
      this.appliedCriteriaCriteriaMap
    ) {
      this.coreService.showWarningToast(
        "Recent changes in Criteria map has not been applied, Saving last applied data"
      );
    }

    if (
      this.mode != "clone" ||
      (this.mode == "clone" && this.isApplyCriteriaClicked)
    ) {
      this.coreService.displayLoadingScreen();
      let isRequiredFields = false;
      let invalidTaxAmount = false;
      let taxTypeMissing = false;
      let setAsMissing = false;
      let taxMissing = false;
      this.applyCriteriaFormattedData.forEach((element) => {
        console.log(element);

        if (element["invalidTaxAmount"]) {
          invalidTaxAmount = true;
        }
        element["taxCodeDesc"] = this.taxDescription
          ? this.taxDescription.replace(/\s/g, "").length
            ? this.taxDescription
            : null
          : null;
        if (!element["taxCodeDesc"]) {
          isRequiredFields = true;
        }
        if (!element["taxType"]) {
          taxTypeMissing = true;
        }
        if (!element["setAs"]) {
          setAsMissing = true;
        }
        if (!element["tax"] && element["tax"] != "0") {
          taxMissing = true;
        }
      });
      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill required fields.");
      } else if (taxTypeMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Tax Type.");
      } else if (setAsMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Set As.");
      } else if (taxMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill Tax Amount.");
      } else if (invalidTaxAmount) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid Tax Amount.");
      } else {
        let duplicateTaxType = false;
        if (
          this.applyCriteriaFormattedData[0]["lcyAmountFrom"] ||
          this.applyCriteriaFormattedData[0]["lcyAmount"]
        ) {
          let taxTypeObj = {};
          if (this.applyCriteriaFormattedData[0]["lcyAmountFrom"]) {
            this.applyCriteriaFormattedData.forEach((data) => {
              if (
                taxTypeObj[data["lcyAmountFrom"]] &&
                taxTypeObj[data["lcyAmountFrom"]].length
              ) {
                taxTypeObj[data["lcyAmountFrom"]].push(data["taxType"]);
              } else {
                taxTypeObj[data["lcyAmountFrom"]] = [data["taxType"]];
              }
            });
          } else {
            this.applyCriteriaFormattedData.forEach((data) => {
              if (
                taxTypeObj[data["lcyAmount"]] &&
                taxTypeObj[data["lcyAmount"]].length
              ) {
                taxTypeObj[data["lcyAmount"]].push(data["taxType"]);
              } else {
                taxTypeObj[data["lcyAmount"]] = [data["taxType"]];
              }
            });
          }
          Object.values(taxTypeObj).forEach((taxTypeArr: any) => {
            if (new Set(taxTypeArr).size !== taxTypeArr.length) {
              this.coreService.removeLoadingScreen();
              this.coreService.showWarningToast(
                "Duplicate Tax type value found for a particular LCY Amount !"
              );
              duplicateTaxType = true;
              return;
            }
          });
        } else {
          let taxTypeArr = this.applyCriteriaFormattedData.map((data) => {
            return data["taxType"];
          });
          if (new Set(taxTypeArr).size !== taxTypeArr.length) {
            this.coreService.removeLoadingScreen();
            this.coreService.showWarningToast(
              "Duplicate Tax type value found !"
            );
            duplicateTaxType = true;
            return;
          }
        }
        if (!duplicateTaxType) {
          let service;
          this.decodeSelectedOptions();
          if (this.mode == "edit") {
            let data = {
              data: this.applyCriteriaFormattedData,
              duplicate: this.appliedCriteriaIsDuplicate,
              criteriaMap: this.appliedCriteriaCriteriaMap,
              taxCode: this.taxID,
            };
            service = this.taxSettingsService.updateTaxSetting(
              this.userId,
              data,
              this.appCtrl.value.code,
              this.moduleCtrl.value.code,
              this.formName
            );
            console.log("::", data);
          } else {
            let data = {
              data: this.applyCriteriaFormattedData,
              duplicate: this.appliedCriteriaIsDuplicate,
              criteriaMap: this.appliedCriteriaCriteriaMap,
            };
            service = this.taxSettingsService.addNewTax(
              data,
              this.appCtrl.value.code,
              this.moduleCtrl.value.code,
              this.formName
            );
          }

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
                    this.coreService.showWarningToast(
                      "Something went wrong, Please try again later"
                    );
                  }
                } else {
                  if (res["msg"]) {
                    this.coreService.showSuccessToast(res.msg);
                    if (action == "save") {
                      this.router.navigate([`navbar/tax-settings`]);
                    } else if (action == "saveAndAddNew") {
                      this.taxSettingsService.applicationName = null;
                      this.taxSettingsService.moduleName = null;
                      this.router.navigate([`navbar/tax-settings/add-tax`]);
                    }
                  }
                }
              },
              (err) => {
                this.coreService.removeLoadingScreen();
                console.log("error in saveAddNewTax", err);
                this.coreService.showWarningToast(
                  "Something went wrong, Please try again later"
                );
              }
            );
          }
        }
      }
    } else {
      this.coreService.showWarningToast("Applied criteria already exists.");
    }
  }

  reset() {
    if (this.mode == "edit") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetTaxDataConfirmation",
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
        key: "resetTaxDataConfirmation",
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
        key: "resetTaxDataConfirmation",
        accept: () => {
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.taxDescription = "";

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
    this.applyCriteriaFormattedData.forEach((data) => {
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
    this.applyCriteriaFormattedData.forEach((data) => {
      data["taxType"] = data["taxTypeOption"].filter(
        (option) => option["codeName"] == data["taxType"]
      )[0]["code"];
      data["setAs"] = data["setAsOption"].filter(
        (option) => option["codeName"] == data["setAs"]
      )[0]["code"];
    });
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }
  selectedColumn(selectCol: any, value: any, index: any) {
    console.log(selectCol, value, index);
    if (selectCol == "setAs") {
      if (selectCol == "setAs" && value["code"] == "Percentage") {
        this.applyCriteriaFormattedData[index]["tax"] = 0;
        this.applyCriteriaFormattedData[index]["invalidTaxAmount"] = true;
        this.coreService.showWarningToast("Please enter tax greater than zero");
      } else {
        if (Number(this.applyCriteriaFormattedData[index].lcyAmountFrom)) {
          this.applyCriteriaFormattedData[index]["tax"] = Number(
            this.applyCriteriaFormattedData[index].lcyAmountFrom
          );
        } else {
          if (this.applyCriteriaFormattedData[index].lcyAmount) {
            let lcyAmountNum =
              this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[3];
            let lcyAmountOpr =
              this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[2];
            if (lcyAmountOpr == ">=") {
              console.log(lcyAmountNum);
              this.applyCriteriaFormattedData[index]["tax"] =
                Number(lcyAmountNum);
            } else if (lcyAmountOpr == ">") {
              this.applyCriteriaFormattedData[index]["tax"] =
                Number(lcyAmountNum) + 1;
            } else if (lcyAmountOpr == "=") {
              this.applyCriteriaFormattedData[index]["tax"] =
                Number(lcyAmountNum);
            } else {
              this.applyCriteriaFormattedData[index]["tax"] = 0;
            }
          } else {
            this.applyCriteriaFormattedData[index]["tax"] = 0;
          }
        }
      }
    }
    this.applyCriteriaFormattedData[index][selectCol] = value.codeName;
  }

  changeValueInput(
    selectCol: any,
    inputCol: any,
    event: any,
    index: any,
    valueInputElm: any
  ) {
    console.log(
      selectCol,
      inputCol,
      event,
      this.applyCriteriaFormattedData[index]
    );
    this.applyCriteriaFormattedData[index]["invalidTaxAmount"] = false;
    let max = 1000000;
    let min = 0;
    if (this.applyCriteriaFormattedData[index][selectCol] == "Percentage") {
      max = 100;
    }
    if (this.applyCriteriaFormattedData[index].lcyAmount?.length) {
      let lcyAmountNum =
        this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[3];
      let lcyAmountOpr =
        this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[2];

      if (this.applyCriteriaFormattedData[index][selectCol] == "Percentage") {
        max = 100;
      } else if (
        this.applyCriteriaFormattedData[index][selectCol] == "Amount"
      ) {
        if (
          Number(this.applyCriteriaFormattedData[index].lcyAmountFrom) > 0 &&
          Number(this.applyCriteriaFormattedData[index].lcyAmountTo) > 0
        ) {
          min = Number(this.applyCriteriaFormattedData[index].lcyAmountFrom);
          max = Number(this.applyCriteriaFormattedData[index].lcyAmountTo);
        } else if (lcyAmountOpr == "=") {
          min = Number(lcyAmountNum);
          max = Number(lcyAmountNum);
        } else if (lcyAmountOpr == ">=") {
          min = Number(lcyAmountNum);
          max = 1000000;
        } else if (lcyAmountOpr == ">") {
          min = Number(lcyAmountNum) + 1;
          max = 1000000;
        } else if (lcyAmountOpr == "<=") {
          min = 0;
          max = Number(lcyAmountNum);
        } else if (lcyAmountOpr == "<") {
          min = 0;
          max = Number(lcyAmountNum) - 1;
        } else {
          max = 1000000;
        }
      }
    } else if (
      this.applyCriteriaFormattedData[index].lcyAmountFrom?.length ||
      this.applyCriteriaFormattedData[index].lcyAmountTo?.length
    ) {
      min = Number(this.applyCriteriaFormattedData[index].lcyAmountFrom);
      max = Number(this.applyCriteriaFormattedData[index].lcyAmountTo);
    }

    if (event.value <= max) {
      this.applyCriteriaFormattedData[index][inputCol] = event.value;
    } else {
      let lastValueEntered = valueInputElm.lastValue;
      valueInputElm.input.nativeElement.value = lastValueEntered;
    }
    let isDisplayError = false;
    if (event.value == 0) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidTaxAmount"] = true;
      this.coreService.showWarningToast("Please enter tax greater than zero");
      return false;
    } else if (event.value < min || event.value > max) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidTaxAmount"] = true;
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
    }
  }

  clone(index: any, selectRow: any, fieldName: any) {
    let clonedRow = {
      ...selectRow,
    };
    clonedRow[fieldName] = "clone,delete";
    clonedRow["linked"] = "N";
    this.applyCriteriaFormattedData.splice(index + 1, 0, clonedRow);
  }
  delete(index: any) {
    this.applyCriteriaFormattedData.splice(index, 1);
  }
}
