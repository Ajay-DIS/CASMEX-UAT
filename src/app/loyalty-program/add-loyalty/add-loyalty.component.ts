import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { Dropdown } from "primeng/dropdown";
import { DialogService } from "primeng/dynamicdialog";
import { Table } from "primeng/table";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import { TaxSettingsService } from "src/app/tax-settings/tax-settings.service";
import { LoyaltyService } from "../loyalty.service";

@Component({
  selector: "app-add-loyalty",
  templateUrl: "./add-loyalty.component.html",
  styleUrls: ["./add-loyalty.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddLoyaltyComponent implements OnInit {
  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;

  primaryColor = "var(--primary-color)";

  userId = "";
  taxID = "";
  mode = "add";
  formName = "Loyalty Programs";

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  programCode = "No Data";
  programDescription = "";
  programType = "";
  loyaltyType = "";
  loyaltyValue = "";
  rewardsAs = "";
  criteriaId = "0";
  criteriaTransactionAmountFrom = "0";
  criteriaTransactionAmountTo = "0";

  fileUploadLable: boolean = false;
  fileUploadValue: string[] = [];
  uploadedfileData = [];

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
      field: "promoCodeDateFrom",
      header: "Transaction From Date&Time",
      fieldType: "text",
      frozen: false,
      info: null,
    },
    {
      field: "promoCodeDateTo",
      header: "Transaction To Date&Time",
      fieldType: "text",
      frozen: false,
      info: null,
    },
    {
      field: "rewardsAs",
      header: "Reward As",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "loyaltyType",
      header: "Loyalty Type",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "loyaltyValue",
      header: "Loyalty Value",
      fieldType: "input",
      frozen: false,
      info: null,
    },
  ];
  applyCriteriaFormattedData: any[] = [];

  taxTypeOption: any[] = [];
  rewardsAsOption: any[] = [];
  loyaltyTypeOption: any[] = [];
  programTypeOptions: any[] = [];

  taxMin = 0;
  taxPerMax = 100;
  taxAmountMax = 100000;

  appliedCriteriaDatajson: any = {};

  formattedMasterData: any = [];

  Emailchecked: boolean = false;
  Msgchecked: boolean = false;
  promoCodeLength = null;
  promoCode = "";
  promoCodeDateFrom: Date;
  promoCodeDateTo: Date;
  http: any;

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
    private fb: UntypedFormBuilder,
    private loyaltyService: LoyaltyService
  ) {}

  ngOnInit(): void {
    // this.coreService.displayLoadingScreen();
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
    this.loyaltyService.getTaxSettingAppModuleList().subscribe(
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
                this.loyaltyService.applicationName ||
                this.loyaltyService.moduleName
              )
            ) {
              if (this.mode != "add") {
                this.router.navigate([`navbar/loyalty-programs`]);
              } else {
                this.coreService.removeLoadingScreen();
              }
            } else {
              if (this.mode != "add") {
                this.appCtrl.setValue({
                  name: this.loyaltyService.applicationName,
                  code: this.loyaltyService.applicationName,
                });
                this.moduleCtrl.setValue({
                  name: this.loyaltyService.moduleName,
                  code: this.loyaltyService.moduleName,
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
    this.loyaltyService.getProgramTypeData().subscribe(
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
          this.programTypeOptions = res["data"]["cmProgramTypeMaster"].map(
            (val) => {
              return { name: val["codeName"], code: val["codeName"] };
            }
          );
          console.log("program", this.programTypeOptions);
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        console.log("Error in getting values", err);
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }
  onPromoCodeLength(e) {
    console.log("promocode", e);
    // this.promoCodeLength = e.value;
    console.log("promocode", e.value);
    this.loyaltyService.getPromoCodeData(String(e.value)).subscribe(
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
          console.log("promo", res);
          this.promoCode = res["data"];
          console.log("promCode", this.promoCode);
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        console.log("Error in getting values", err);
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
    // this.promoCodeLength = "";
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
  copyInputMessage(inputElement) {
    inputElement.select();
    document.execCommand("copy");
    inputElement.setSelectionRange(0, 0);
  }

  fileUploadChange(e: any) {
    console.log(e.target.files[0]);
    this.fileUploadLable = true;

    for (var i = 0; i < e.target.files.length; i++) {
      this.fileUploadValue.push(e.target.files[i]);
      this.uploadedfileData.push(e.target.files[i]);
    }
    console.log(this.fileUploadValue);
    console.log(this.uploadedfileData);
    if (e.target.files[0]) {
      this.coreService.displayLoadingScreen();
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 1500);
    }
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
    console.log("promoCodeDateFrom", this.promoCodeDateFrom);
    let promoCodeFrom = new Date(this.promoCodeDateFrom).toLocaleString(
      "en-GB"
    );
    console.log("promoCodeFrom", promoCodeFrom);
  }

  getLoyaltyProgramForEditApi(programCode: any, operation: any) {
    console.log("HERE");
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.loyaltyService
      .getLoyaltyProgramForEdit(
        programCode,
        operation,
        this.userId,
        this.loyaltyService.applicationName,
        this.loyaltyService.moduleName,
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
              // let promoCodeFrom = new Date(res["data"]["criteriaTransactionDateFrom"]).toString();
              // new Date(
              //   kycData.idIssueDate.split("/").reverse().join("-")
              // ).toLocaleDateString("en-GB");
              this.programCode = res["programCode"];
              if (res["programDescription"]) {
                this.programDescription = res["loyaltyProgramDesc"];
              }
              if (res["data"]["0"]["criteriaTransactionDateFrom"]) {
                this.promoCodeDateFrom = new Date(
                  res["data"]["0"]["criteriaTransactionDateFrom"]
                );
              }
              console.log("promoCodeDateFrom", this.promoCodeDateFrom);
              console.log(
                "promoCodeDateFrom",
                new Date(
                  res["data"]["0"]["criteriaTransactionDateFrom"]
                ).toString()
              );
              if (res["data"]["promoCode"]) {
                this.promoCode = res["data"]["promoCode"];
              }
              if (res["data"]["programType"]) {
                this.programType = res["data"]["programType"];
              }
              if (res["data"]["criteriaTransactionDateFrom"]) {
                this.promoCodeDateTo = res["data"]["criteriaTransactionDateTo"];
              }
              this.isTaxSettingLinked = !res["criteriaUpdate"];
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];

              this.loyaltyTypeOption = res["loyaltyTypeOption"].map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );
              // // this.programTypeOptions = res["programTypeOptions"].map(
              // //   (option) => {
              // //     return { code: option.codeName, codeName: option.codeName };
              // //   }
              // // );
              this.rewardsAsOption = res["rewardsAsOption"].map((option) => {
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
                data["loyaltyTypeOption"] = this.loyaltyTypeOption;
                data["rewardsAsOption"] = this.rewardsAsOption;
                data["invalidTaxAmount"] = false;
                data["status"] = "Active";
              });
              // this.setSelectedOptions();

              console.log("::", this.applyCriteriaFormattedData);
              // console.log("::", this.applyCriteriaDataTableColumns);

              this.coreService.showSuccessToast(
                `Loyalty program data fetched Successfully`
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
      criteriaMasterData: this.loyaltyService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addBankRouteCriteriaData:
        this.loyaltyService.getAddLoyaltyProgramCriteriaData(
          this.userId,
          this.appCtrl.value.code,
          this.moduleCtrl.value.code,
          this.formName
        ),
    })
      .pipe(
        take(1),
        map((response) => {
          console.log("tax", response);
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
            this.programCode = this.criteriaDataDetailsJson.data.programCode;
            this.taxID = this.programCode;
            this.programDescription =
              this.criteriaDataDetailsJson.data.programDescription;
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
                  this.loyaltyService.applicationName ||
                  this.loyaltyService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/loyalty-programs`]);
              } else {
                this.getLoyaltyProgramForEditApi(this.taxID, "edit");
              }
            } else if (this.mode == "clone") {
              if (
                !(
                  this.loyaltyService.applicationName ||
                  this.loyaltyService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/loyalty-programs`]);
              } else {
                this.getLoyaltyProgramForEditApi(this.taxID, "clone");
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
    this.loyaltyService
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
    postDataCriteria.append("programCode", this.taxID);
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
      this.LoyaltyProgramSearchApi(postDataCriteria);
    }
  }

  LoyaltyProgramSearchApi(loyaltyFormdata: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];
    this.coreService.displayLoadingScreen();
    console.log("promoCodeDateFrom", this.promoCodeDateFrom);
    console.log("programType", this.programType);
    let promoCodeFrom = new Date(this.promoCodeDateFrom).toLocaleString(
      "en-GB"
    );
    let promoCodeTo = new Date(this.promoCodeDateTo).toLocaleString("en-GB");
    console.log("promoCodeTo", promoCodeTo);

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.loyaltyService
      .postLoyaltyProgramCriteriaSearch(loyaltyFormdata)
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
              this.loyaltyTypeOption = res["data"].loyaltyTypeOption?.map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );
              this.rewardsAsOption = res["data"].rewardsAsOption.map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );

              if (res["criteriaMap"].indexOf("&&&&") >= 0) {
                this.isLcyFieldPresent = true;
              } else {
                this.isLcyFieldPresent = false;
              }

              if (!this.isLcyFieldPresent) {
                this.applyCriteriaFormattedData = [
                  res["data"]["Loyalty Program"],
                ];
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
                      JSON.stringify(res["data"]["Loyalty Program"])
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
                      JSON.stringify(res["data"]["Loyalty Program"])
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
                data["loyaltyTypeOption"] = this.loyaltyTypeOption;
                data["rewardsAsOption"] = this.rewardsAsOption;
                data["criteriaMap"] = this.appliedCriteriaCriteriaMap;
                data["invalidTaxAmount"] = false;
                data["status"] = "Active";
                data["userId"] = this.userId;
                data["programCode"] = this.programCode;
                data["programType"] = this.programType;
                data["promoCodeDateFrom"] = promoCodeFrom;
                data["promoCodeDateTo"] = promoCodeTo;
              });
              // this.setSelectedOptions();
              console.log("::", this.applyCriteriaFormattedData);

              this.coreService.showSuccessToast(
                `Criteria Applied Successfully`
              );
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
          console.log("error in Loyalty Program Apply API", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.loyaltyService
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
    this.loyaltyService
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

  saveAddNewTax() {
    console.log("applyCriteriaFormattedData", this.applyCriteriaFormattedData);
    let promoCodeFrom = new Date(this.promoCodeDateFrom).toLocaleString(
      "en-GB"
    );
    let promoCodeTo = new Date(this.promoCodeDateTo).toLocaleString("en-GB");
    console.log("promoCodeTo", promoCodeTo);
    let formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("status", "Active");
    formData.append("programCode", this.programCode);
    formData.append("programName", null);
    formData.append("programCodeId", null);
    formData.append("criteriaId", this.criteriaId);
    formData.append("updatedDateTime", null);
    formData.append("updatedBy", null);
    formData.append("createdDateTime", null);
    formData.append("createdBy", null);
    formData.append("programImage", null);
    formData.append("companyPromotionCode", null);
    formData.append("createdUserId", null);
    formData.append("companyCode", null);
    formData.append("criteriaMapSplit", null);
    formData.append("criteriaApplicationName", null);
    formData.append(
      "criteriaTransactionAmountFrom",
      this.criteriaTransactionAmountFrom
    );
    formData.append(
      "criteriaTransactionAmountTo",
      this.criteriaTransactionAmountTo
    );
    formData.append("criteriaMap", "Country = IN");
    formData.append("programDescription", this.programDescription);
    formData.append("programType", this.programType);
    // formData.append("promoCodeLength", this.promoCodeLength);
    formData.append("customerLoyaltyPromocodeDto.promoCode", this.promoCode);
    formData.append("promoCode", this.promoCode);
    formData.append("criteriaTransactionDateFrom", promoCodeFrom);
    formData.append("criteriaTransactionDateTo", promoCodeTo);
    formData.append("loyaltyType", this.loyaltyType);
    formData.append("loyaltyValue", this.loyaltyValue);
    formData.append("rewardsAs", this.rewardsAs);
    console.log("formData", ...formData);

    if (this.uploadedfileData.length) {
      for (let i = 0; i < this.uploadedfileData.length; i++) {
        for (let key in this.uploadedfileData[i]) {
          if (key == "idIssueDate" || key == "idExpiryDate") {
            let date = this.uploadedfileData[i][key]
              ? this.uploadedfileData[i][key]
              : "";
            formData.append(`customerLoyaltyPromoImagesDto[${i}].${key}`, date);
          } else if (
            key == "uploadFrontSideFile" ||
            key == "uploadBackSideFile"
          ) {
            let file =
              this.uploadedfileData[i][key] &&
              this.uploadedfileData[i][key] != ""
                ? this.uploadedfileData[i][key]
                : "";
            if (file != "") {
              formData.append(
                `customerLoyaltyPromoImagesDto[${i}].${key}`,
                file
              );
            }
          } else {
            if (
              !(this.uploadedfileData[i]["operation"] == "add" && key == "id")
            ) {
              formData.append(
                `uploadDocuments[${i}].${key}`,
                this.uploadedfileData[i][key]
              );
            }
          }
        }
      }
    }

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
      let loyaltyTypeMissing = false;
      let rewardsAsMissing = false;
      let loyaltyValueMissing = false;
      this.applyCriteriaFormattedData.forEach((element) => {
        console.log(element);

        if (element["invalidTaxAmount"]) {
          invalidTaxAmount = true;
        }
        element["programDescription"] = this.programDescription
          ? this.programDescription.replace(/\s/g, "").length
            ? this.programDescription
            : null
          : null;
        if (!element["programDescription"]) {
          isRequiredFields = true;
        }
        if (!element["loyaltyType"]) {
          loyaltyTypeMissing = true;
        }
        if (!element["rewardsAs"]) {
          rewardsAsMissing = true;
        }
        if (!element["loyaltyValue"] && element["loyaltyValue"] != "0") {
          loyaltyValueMissing = true;
        }
      });
      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill required fields.");
      } else if (loyaltyTypeMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select loyalty Type.");
      } else if (rewardsAsMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Set As.");
      } else if (loyaltyValueMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill loyalty value.");
      } else if (invalidTaxAmount) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid loyalty Amount.");
      } else {
        let duplicateloyaltyType = false;
        if (
          this.applyCriteriaFormattedData[0]["lcyAmountFrom"] ||
          this.applyCriteriaFormattedData[0]["lcyAmount"]
        ) {
          let loyaltyTypeObj = {};
          if (this.applyCriteriaFormattedData[0]["lcyAmountFrom"]) {
            this.applyCriteriaFormattedData.forEach((data) => {
              if (
                loyaltyTypeObj[data["lcyAmountFrom"]] &&
                loyaltyTypeObj[data["lcyAmountFrom"]].length
              ) {
                loyaltyTypeObj[data["lcyAmountFrom"]].push(data["loyaltyType"]);
              } else {
                loyaltyTypeObj[data["lcyAmountFrom"]] = [data["loyaltyType"]];
              }
            });
          } else {
            this.applyCriteriaFormattedData.forEach((data) => {
              if (
                loyaltyTypeObj[data["lcyAmount"]] &&
                loyaltyTypeObj[data["lcyAmount"]].length
              ) {
                loyaltyTypeObj[data["lcyAmount"]].push(data["loyaltyType"]);
              } else {
                loyaltyTypeObj[data["lcyAmount"]] = [data["loyaltyType"]];
              }
            });
          }
          Object.values(loyaltyTypeObj).forEach((loyaltyTypeArr: any) => {
            if (new Set(loyaltyTypeArr).size !== loyaltyTypeArr.length) {
              this.coreService.removeLoadingScreen();
              this.coreService.showWarningToast(
                "Duplicate loyalty type value found for a particular LCY Amount !"
              );
              duplicateloyaltyType = true;
              return;
            }
          });
        } else {
          let loyaltyTypeArr = this.applyCriteriaFormattedData.map((data) => {
            return data["loyaltyType"];
          });
          if (new Set(loyaltyTypeArr).size !== loyaltyTypeArr.length) {
            this.coreService.removeLoadingScreen();
            this.coreService.showWarningToast(
              "Duplicate loyalty type value found !"
            );
            duplicateloyaltyType = true;
            return;
          }
        }
        if (!duplicateloyaltyType) {
          let service;
          // this.decodeSelectedOptions();
          if (this.mode == "edit") {
            let data = {
              data: this.applyCriteriaFormattedData,
              duplicate: this.appliedCriteriaIsDuplicate,
              criteriaMap: this.appliedCriteriaCriteriaMap,
              programCode: this.taxID,
            };
            service = this.loyaltyService.updateLoyaltyProgram(
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
            service = this.loyaltyService.addNewLoyaltyProgram(
              formData,
              this.userId,
              this.mode,
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

                    this.loyaltyService.applicationName = null;
                    this.loyaltyService.moduleName = null;
                    this.router.navigate([`navbar/loyalty-programs`]);
                    this.coreService.removeLoadingScreen();
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
          this.programDescription = "";

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
      if (data["loyaltyType"]) {
        data["loyaltyType"] = data["loyaltyTypeOption"].filter(
          (option) => option["code"] == data["loyaltyType"]
        )[0]["codeName"];
      }

      if (data["rewardsAs"]) {
        data["rewardsAs"] = data["rewardsAsOption"].filter(
          (option) => option["code"] == data["rewardsAs"]
        )[0]["codeName"];
      }
    });
  }
  decodeSelectedOptions() {
    this.applyCriteriaFormattedData.forEach((data) => {
      data["loyaltyType"] = data["loyaltyTypeOption"].filter(
        (option) => option["codeName"] == data["loyaltyType"]
      )[0]["code"];
      data["rewardsAs"] = data["rewardsAsOption"].filter(
        (option) => option["codeName"] == data["rewardsAs"]
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
    if (selectCol == "rewardsAs") {
      this.rewardsAs = value.codeName;
    }
    if (selectCol == "loyaltyType") {
      this.loyaltyType = value.codeName;
      if (selectCol == "loyaltyType" && value["code"] == "Percentage") {
        this.applyCriteriaFormattedData[index]["loyaltyValue"] = 0;
        this.applyCriteriaFormattedData[index]["invalidTaxAmount"] = true;
        // this.coreService.showWarningToast(
        //   "Please enter loyalty value greater than zero"
        // );
      } else {
        if (Number(this.applyCriteriaFormattedData[index].lcyAmountFrom)) {
          this.applyCriteriaFormattedData[index]["loyaltyValue"] = Number(
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
              this.applyCriteriaFormattedData[index]["loyaltyValue"] =
                Number(lcyAmountNum);
            } else if (lcyAmountOpr == ">") {
              this.applyCriteriaFormattedData[index]["loyaltyValue"] =
                Number(lcyAmountNum) + 1;
            } else if (lcyAmountOpr == "=") {
              this.applyCriteriaFormattedData[index]["loyaltyValue"] =
                Number(lcyAmountNum);
            } else {
              this.applyCriteriaFormattedData[index]["loyaltyValue"] = 0;
            }
          } else {
            this.applyCriteriaFormattedData[index]["loyaltyValue"] = 0;
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
      // this.coreService.showWarningToast(
      //   "Please enter loyalty greater than zero"
      // );
      return false;
    } else if (event.value < min || event.value > max) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidTaxAmount"] = true;
      this.coreService.showWarningToast(
        "Please enter loyalty between " + min + " to " + max
      );
      return false;
    }
    this.loyaltyValue = event.value;
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
