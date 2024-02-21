import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { Dropdown } from "primeng/dropdown";
import { DialogService } from "primeng/dynamicdialog";
import { Table } from "primeng/table";
import { CoreService } from "src/app/core.service";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { ChargeServiceService } from "../charge-service.service";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-charge-details",
  templateUrl: "./charge-details.component.html",
  styleUrls: ["./charge-details.component.scss"],
  providers: [DialogService, MessageService],
})
export class ChargeDetailsComponent implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;
  primaryColor = "var(--primary-color)";

  userId = "";
  chargeID = "";
  mode = "add";
  formName = "Charge Settings";

  chargeCode = "No Data";
  chargeDescription = "";

  deactivated: boolean = false;
  statusData: any = [];

  isChargeSettingLinked: boolean = false;

  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  objectKeys = Object.keys;
  isEditMode = false;

  editChargeSettingApiData: any = [];

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

  applyCriteriaResponse: any[] = [];
  isLcyFieldPresent = false;
  applyCriteriaDataTableColumns: any[] = [];
  columnsCopy: any[] = [
    {
      field: "setAs",
      header: "Set As",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "charge",
      header: "Charge",
      fieldType: "input",
      frozen: false,
      info: null,
    },
    {
      field: "applicableOn",
      header: "Applicable On",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "isActive",
      header: "Status",
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

  chargeTypeOption: any[] = [];
  setAsOption: any[] = [];
  applicableOnOption: any[] = [];

  chargeMin = 0;
  chargePerMax = 100;
  chargeAmountMax = 100000;

  appliedCriteriaDatajson: any = {};
  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  formattedMasterData: any = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  fieldDisplayData = {};

  setCriteriaName = "charges";

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private setCriteriaService: SetCriteriaService,
    private chargeSettingsService: ChargeServiceService,
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
      this.chargeID = params.id;
    }

    // local get app-mod

    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));
    let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
    let currAppMod = JSON.parse(sessionStorage.getItem("charge"));

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
        defApp = this.searchApplicationOptions.filter(
          (opt) => opt.code == defAppMod.applicationName.code
        )[0];
        defMod = this.searchModuleOptions.filter(
          (opt) => opt.code == defAppMod.moduleName.code
        )[0];
      }
    }

    if (defApp) {
      this.appCtrl.patchValue(defApp);
    }
    if (defMod) {
      this.moduleCtrl.patchValue(defMod);
    }
    if (this.appCtrl.value && this.moduleCtrl.value) {
      this.moduleCtrl.enable();
      this.searchAppModule();
      this.appModuleDataPresent = true;
      if (this.mode != "add") {
        this.appCtrl.disable();
        this.moduleCtrl.disable();
      }
    } else {
      if (this.mode != "add") {
        this.router.navigate([`navbar/charge-settings`]);
      } else {
        this.coreService.removeLoadingScreen();
      }
    }

    // local get app-mod end

    this.chargeSettingsService.getChargeSettingAppModuleList().subscribe(
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
          } else {
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
    this.statusData = this.chargeSettingsService.getData();
    console.log("status", this.statusData);
    if (this.statusData && this.statusData["status"] == "Inactive") {
      this.deactivated = true;
    }
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

  onKeyPress(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.charCode);

    // Allow alphanumeric characters and space
    if (!/^[a-zA-Z0-9\s]*$/.test(inputChar)) {
      event.preventDefault();
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
  }

  getChargeSettingForEditApi(chargeCode: any, operation: any) {
    console.log("HERE");
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.chargeSettingsService
      .getChargeSettingForEdit(
        chargeCode,
        operation,
        this.chargeSettingsService.applicationName,
        this.chargeSettingsService.moduleName,
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
              this.editChargeSettingApiData = JSON.parse(JSON.stringify(res));

              this.criteriaCodeText =
                this.setCriteriaService.setCriteriaMap(res);

              this.criteriaText =
                this.setCriteriaService.decodeFormattedCriteria(
                  this.criteriaCodeText,
                  this.criteriaMasterData,
                  this.fieldDisplayData
                );

              this.chargeCode = res["chargeCode"];
              if (res["chargeCodeDesc"]) {
                this.chargeDescription = res["chargeCodeDesc"];
              }
              this.isChargeSettingLinked = !res["criteriaUpdate"];
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              this.updateApplicableOnOptions(res);
              this.setAsOption = res["setAsOption"].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });
              console.log(this.applicableOnOption);

              let amtSlabPresent = false;
              let dateSlabPresent = false;

              if (res["criteriaMap"].indexOf("from:") >= 0) {
                amtSlabPresent = true;
              }

              if (res["criteriaMap"].indexOf("trnStartDate=") >= 0) {
                dateSlabPresent = true;
              }

              if (amtSlabPresent && dateSlabPresent) {
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateTo",
                  header: "Date To",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });

                this.applyCriteriaFormattedData = [];
              } else {
                if (amtSlabPresent) {
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = [];
                } else if (dateSlabPresent) {
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "dateFrom",
                    header: "Date From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "dateTo",
                    header: "Date To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = [];
                } else if (!amtSlabPresent && !dateSlabPresent) {
                  this.applyCriteriaFormattedData = [];
                }
              }
              this.applyCriteriaFormattedData = res["data"];
              this.applyCriteriaFormattedData.forEach((data) => {
                let mapSplit = data["criteriaMapSplit"];

                let criteriaMapFirstSplit = null;
                let criteriaMapSecSplit = null;
                let criteriaMapThirdSplit = null;

                if (mapSplit && mapSplit.includes("&&&&")) {
                  if (mapSplit.split("&&&&").length == 3) {
                    criteriaMapFirstSplit = mapSplit.split("&&&&")[0];
                    criteriaMapSecSplit = mapSplit.split("&&&&")[1];
                    criteriaMapThirdSplit = mapSplit.split("&&&&")[2];

                    if (criteriaMapSecSplit.includes("from:")) {
                      data["lcyAmountFrom"] = criteriaMapSecSplit
                        .split("::")[0]
                        .split(":")[1];
                      data["lcyAmountTo"] = criteriaMapSecSplit
                        .split("::")[1]
                        .split(":")[1];
                    }

                    if (criteriaMapThirdSplit.includes("trnStartDate=")) {
                      data["dateFrom"] = criteriaMapThirdSplit
                        .split("::")[0]
                        .split("=")[1];
                      data["dateTo"] = criteriaMapThirdSplit
                        .split("::")[1]
                        .split("=")[1];
                    }
                  } else if (mapSplit.split("&&&&").length == 2) {
                    criteriaMapFirstSplit = mapSplit.split("&&&&")[0];
                    criteriaMapSecSplit = mapSplit.split("&&&&")[1];

                    if (criteriaMapSecSplit.includes("from:")) {
                      data["lcyAmountFrom"] = criteriaMapSecSplit
                        .split("::")[0]
                        .split(":")[1];
                      data["lcyAmountTo"] = criteriaMapSecSplit
                        .split("::")[1]
                        .split(":")[1];
                    } else if (criteriaMapSecSplit.includes("trnStartDate=")) {
                      data["dateFrom"] = criteriaMapSecSplit
                        .split("::")[0]
                        .split("=")[1];
                      data["dateTo"] = criteriaMapSecSplit
                        .split("::")[1]
                        .split("=")[1];
                    }
                  }
                } else {
                }
              });

              // % old-

              // if (res["criteriaMap"].indexOf("&&&&") >= 0) {
              //   this.isLcyFieldPresent = true;
              // }

              // if (!this.isLcyFieldPresent) {
              //   this.applyCriteriaFormattedData = res["data"];
              // } else {
              //   if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
              //     this.applyCriteriaDataTableColumns.splice(-4, 0, {
              //       field: "lcyAmount",
              //       header: "LCY Amount",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaFormattedData = res["data"];

              //     this.applyCriteriaFormattedData.forEach((data) => {
              //       let split = data["criteriaMapSplit"];
              //       if (split) {
              //         data["lcyAmount"] = split.includes("&&&&")
              //           ? split.split("&&&&").pop()
              //           : split;
              //         data["criteriaMapSplit"] = split.includes("&&&&")
              //           ? split.split("&&&&").pop()
              //           : split;
              //       }
              //     });
              //   } else if (res["criteriaMap"].indexOf("from") >= 0) {
              //     this.applyCriteriaDataTableColumns.splice(-4, 0, {
              //       field: "lcyAmountFrom",
              //       header: "Amount From",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaDataTableColumns.splice(-4, 0, {
              //       field: "lcyAmountTo",
              //       header: "Amount To",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaFormattedData = res["data"];
              //     console.log("::", this.applyCriteriaFormattedData);
              //     this.applyCriteriaFormattedData.forEach((data) => {
              //       let split = data["criteriaMapSplit"];
              //       if (split) {
              //         data["lcyAmountFrom"] = split?.includes("&&&&")
              //           ? split.split("&&&&").pop().split("::")[0].split(":")[1]
              //           : split?.split("::")[0]?.split(":")[1];
              //         data["lcyAmountTo"] = split?.includes("&&&&")
              //           ? split.split("&&&&").pop().split("::")[1].split(":")[1]
              //           : split?.split("::")[1]?.split(":")[1];
              //         data["criteriaMapSplit"] = split?.includes("&&&&")
              //           ? split.split("&&&&").pop()
              //           : split;
              //       }
              //     });
              //   }
              // }

              this.applyCriteriaFormattedData.forEach((data) => {
                delete data.id;
                data["setAsOption"] = this.setAsOption;
                data["applicableOnOption"] = this.applicableOnOption;
                data["action"] = res["action"];
                data["invalidChargeAmount"] = false;
                data["status"] = "Active";
              });
              // this.setSelectedOptions();

              console.log("::", this.applyCriteriaFormattedData);
              // console.log("::", this.applyCriteriaDataTableColumns);

              this.coreService.showSuccessToast(
                `Charge Setting Data Fetched Successfully`
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
                  "No active data found for this charge Setting."
                );
              }
              this.coreService.removeLoadingScreen();
            }
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getChargeSettingForEditApi", err);
          this.coreService.showWarningToast(
            "Something went wrong, Please try again later"
          );
        }
      );
  }

  onActive(data: any) {
    this.confirmChargeEditStatus();
  }
  confirmChargeEditStatus() {
    let type = "";
    let reqStatus = "";
    if (this.deactivated == true) {
      reqStatus = "Active";
      type = "Activate";
    } else {
      reqStatus = "Inactive";
      type = "Deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the charge Record: ${this.chargeCode}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatusCharge",
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
    formData.append("chargeCode", this.chargeCode);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.name);
    formData.append("moduleName", this.moduleCtrl.value.name);
    formData.append("form", this.formName);
    this.updateChargeCodeStatus(formData);
  }

  updateChargeCodeStatus(formData: any) {
    this.chargeSettingsService.updateChargeSettingsStatus(formData).subscribe(
      (res) => {
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
      },
      (err) => {
        console.log(err);
        this.coreService.removeLoadingScreen();
      }
    );
  }

  getCriteriaMasterData() {
    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
    }
    forkJoin({
      criteriaMasterData: this.chargeSettingsService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.name,
        this.moduleCtrl.value.name
      ),
      addBankRouteCriteriaData:
        this.chargeSettingsService.getAddChargeSettingsCriteriaData(
          this.appCtrl.value.name,
          this.moduleCtrl.value.name,
          this.formName
        ),
    })
      .pipe(
        take(1),
        map((response) => {
          this.formatMasterData(response.criteriaMasterData);
          let criteriaMasterJson = _lodashClone(response.criteriaMasterData);
          delete criteriaMasterJson["fieldDisplay"];
          this.fieldDisplayData = response.criteriaMasterData["fieldDisplay"];
          const criteriaMasterData = criteriaMasterJson;
          this.criteriaDataDetailsJson = response.addBankRouteCriteriaData;
          this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
            (data) => {
              if (data["criteriaType"] == "Slab") {
                this.cmCriteriaSlabType["Slab"] = data["fieldName"];
              }
              if (data["criteriaType"] == "date") {
                this.cmCriteriaSlabType["date"] = data["fieldName"];
              }
            }
          );

          if (this.mode == "add") {
            this.chargeCode = this.criteriaDataDetailsJson.data.chargeCode;
            this.chargeID = this.chargeCode;
            this.chargeDescription =
              this.criteriaDataDetailsJson.data.chargeCodeDesc;
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
                  this.chargeSettingsService.applicationName ||
                  this.chargeSettingsService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/charge-settings`]);
              } else {
                this.getChargeSettingForEditApi(this.chargeID, "edit");
              }
            } else if (this.mode == "clone") {
              if (
                !(
                  this.chargeSettingsService.applicationName ||
                  this.chargeSettingsService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/charge-settings`]);
              } else {
                this.getChargeSettingForEditApi(this.chargeID, "clone");
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
    this.chargeSettingsService
      .getCorrespondentValuesData(
        this.formName,
        this.appCtrl.value.name,
        criteriaMapValue,
        fieldName,
        displayName,
        this.moduleCtrl.value.name
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
    postDataCriteria.append("chargeCode", this.chargeID);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.appCtrl.value.name);
    postDataCriteria.append("form", this.formName);
    postDataCriteria.append("moduleName", this.moduleCtrl.value.name);
    this.isApplyCriteriaClicked = true;
    if (this.isChargeSettingLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "chargeSettingLinkedWarning",
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
      this.chargeCriteriaSearchApi(postDataCriteria);
    }
  }

  chargeCriteriaSearchApi(formData: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];
    this.coreService.displayLoadingScreen();

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.chargeSettingsService.postChargeCriteriaSearch(formData).subscribe(
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
          if (res["msg"] && res["msg"] == "No search criteria available.") {
            this.applyCriteriaFormattedData = [];
            this.appliedCriteriaCriteriaMap = null;
            this.appliedCriteriaIsDuplicate = null;
            this.applyCriteriaDataTableColumns = [];
            this.coreService.showWarningToast(res["msg"]);
            return;
          }

          if (!res["duplicate"]) {
            this.applyCriteriaResponse = JSON.parse(JSON.stringify(res));
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.updateApplicableOnOptions(res["data"]);
            this.appliedCriteriaIsDuplicate = res["duplicate"];
            let reqData =
              this.criteriaDataService.decodeCriteriaMapIntoTableFields(res);

            let crtfields = this.setCriteriaService.decodeFormattedCriteria(
              reqData.critMap,
              this.criteriaMasterData,
              this.fieldDisplayData
            );
            this.setAsOption = res["data"].setAsOption.map((option) => {
              return { code: option.code, codeName: option.codeName };
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
              this.applyCriteriaDataTableColumns.splice(-5, 0, {
                field: "dateFrom",
                header: "Date From",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-5, 0, {
                field: "dateTo",
                header: "Date To",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-5, 0, {
                field: "lcyAmountFrom",
                header: "Amount From",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-5, 0, {
                field: "lcyAmountTo",
                header: "Amount To",
                fieldType: "text",
              });

              this.applyCriteriaFormattedData = [];

              let dateSlabFields = reqData.dateSlabArr;
              let lcySlabFields = reqData.lcySlabArr;

              dateSlabFields.forEach((fieldDate) => {
                console.log(lcySlabFields);
                lcySlabFields.forEach((fieldAmt) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].chargeSetting)
                  );
                  console.log(fieldAmt);
                  apiData["dateFrom"] = fieldDate.trnStartDate;
                  apiData["dateTo"] = fieldDate.trnEndDate;
                  apiData["lcyAmountFrom"] = fieldAmt.from;
                  apiData["lcyAmountTo"] = fieldAmt.to;

                  apiData[
                    "criteriaMapSplit"
                  ] = `${baseCriteriaMap}&&&&from:${fieldAmt["from"]}::to:${fieldAmt["to"]}&&&&trnStartDate=${fieldDate["trnStartDate"]}::trnEndDate=${fieldDate["trnEndDate"]}`;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              });
            } else {
              if (amtSlabPresent) {
                let lcySlabFields = reqData.lcySlabArr;
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                lcySlabFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].chargeSetting)
                  );
                  apiData["lcyAmountFrom"] = field.from;
                  apiData["lcyAmountTo"] = field.to;
                  apiData[
                    "criteriaMapSplit"
                  ] = `${baseCriteriaMap}&&&&from:${field["from"]}::to:${field["to"]}`;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              } else if (dateSlabPresent) {
                let dateSlabFields = reqData.dateSlabArr;
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateTo",
                  header: "Date To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                dateSlabFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].chargeSetting)
                  );
                  apiData["dateFrom"] = field.trnStartDate;
                  apiData["dateTo"] = field.trnEndDate;
                  apiData[
                    "criteriaMapSplit"
                  ] = `${baseCriteriaMap}&&&&trnStartDate=${field["trnStartDate"]}::trnEndDate=${field["trnEndDate"]}`;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              } else if (!amtSlabPresent && !dateSlabPresent) {
                this.applyCriteriaFormattedData = [res["data"].chargeSetting];
                this.applyCriteriaFormattedData.forEach((data) => {
                  data["criteriaMapSplit"] = baseCriteriaMap;
                });
              }
            }

            this.applyCriteriaFormattedData.forEach((data) => {
              delete data.id;
              data["criteriaMap"] = this.appliedCriteriaCriteriaMap;
              data["setAsOption"] = this.setAsOption;
              data["applicableOnOption"] = this.applicableOnOption;
              data["action"] = res["data"].action;
              data["invalidChargeAmount"] = false;
              data["status"] = "Active";
              data["userID"] = this.userId;
              data["chargeCode"] = this.chargeCode;

              console.log("filter", data);
              console.log("filter1", data["criteriaMap"]);
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
        console.log("error in charge setting Apply API", err);
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }
  updateApplicableOnOptions(data: any) {
    console.log(data);
    console.log(this.appliedCriteriaCriteriaMap);
    if (this.appliedCriteriaCriteriaMap) {
      const conditions = this.appliedCriteriaCriteriaMap.split(";");
      const chargeTypeCondition = conditions.find((condition) =>
        condition.includes("Charge Type")
      );

      if (chargeTypeCondition) {
        const chargeTypeMatch = /Charge Type = (.+?)(?:&&&&|$)/.exec(
          chargeTypeCondition
        );

        console.log("chargeTypeMatch", chargeTypeMatch);

        if (chargeTypeMatch && chargeTypeMatch[1]) {
          const chargeTypeToRemove = chargeTypeMatch[1].trim();
          console.log("chargeTypeToRemove", chargeTypeToRemove);

          data.applicableOnOption = data.applicableOnOption?.filter(
            (option) => option.codeName !== chargeTypeToRemove
          );
        }
      }
    }

    this.applicableOnOption = data.applicableOnOption?.map((option) => {
      return { code: option.code, codeName: option.codeName };
    });
    console.log(data.applicableOnOption);
  }
  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.name);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.name);
    this.coreService.displayLoadingScreen();
    this.chargeSettingsService
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
    this.chargeSettingsService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.name,
        this.moduleCtrl.value.name,
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

  saveAddNewCharge(action) {
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
      let invalidChargeAmount = false;
      let setAsMissing = false;
      let applicableOnMissing = false;
      let chargeMissing = false;
      this.applyCriteriaFormattedData.forEach((data) => {
        if (data["isActive"] == "N") {
          data["chargeCodeDesc"] = this.chargeDescription
            ?.replace(/\s+/g, " ")
            .trim()
            .toUpperCase()
            ? this.chargeDescription.replace(/\s/g, "").length
              ? this.chargeDescription
                  ?.replace(/\s+/g, " ")
                  .trim()
                  .toUpperCase()
              : null
            : null;
          if (data["charge"] == "null" || data["charge"] == null) {
            data["charge"] = "";
          }
        }
      });
      let activeData = this.applyCriteriaFormattedData.filter(
        (d) => d["isActive"] == "Y"
      );

      activeData.forEach((element) => {
        console.log(element);

        if (element["invalidChargeAmount"]) {
          invalidChargeAmount = true;
        }
        element["chargeCodeDesc"] = this.chargeDescription
          ?.replace(/\s+/g, " ")
          .trim()
          .toUpperCase()
          ? this.chargeDescription.replace(/\s/g, "").length
            ? this.chargeDescription?.replace(/\s+/g, " ").trim().toUpperCase()
            : null
          : null;
        if (!element["chargeCodeDesc"]) {
          isRequiredFields = true;
        }
        if (!element["setAs"] || element["setAs"] == "null") {
          setAsMissing = true;
        }
        if (!element["applicableOn"] || element["applicableOn"] == "null") {
          applicableOnMissing = true;
        }
        if (!element["charge"] && element["charge"] != "0") {
          chargeMissing = true;
        }
      });
      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill Charge Description.");
      } else if (setAsMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Set As.");
      } else if (applicableOnMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Applicable On.");
      } else if (chargeMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill Charge Amount.");
      } else if (invalidChargeAmount) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid charge Amount.");
      } else {
        if (this.checkDuplicateSetAs() && this.checkDuplicateApplicableOn()) {
          return;
        } else {
          let service;
          if (this.mode == "edit") {
            let data = {
              data: this.applyCriteriaFormattedData,
              duplicate: this.appliedCriteriaIsDuplicate,
              criteriaMap: this.appliedCriteriaCriteriaMap,
              chargeCode: this.chargeID,
            };
            service = this.chargeSettingsService.updateChargeSetting(
              this.userId,
              data,
              this.appCtrl.value.name,
              this.moduleCtrl.value.name,
              this.formName
            );
            console.log("::", data);
          } else {
            let data = {
              data: this.applyCriteriaFormattedData,
              duplicate: this.appliedCriteriaIsDuplicate,
              criteriaMap: this.appliedCriteriaCriteriaMap,
            };
            service = this.chargeSettingsService.addNewCharge(
              data,
              this.appCtrl.value.name,
              this.moduleCtrl.value.name,
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
                      this.router.navigate([`navbar/charge-settings`]);
                    } else if (action == "saveAndAddNew") {
                      this.chargeSettingsService.applicationName = null;
                      this.chargeSettingsService.moduleName = null;
                      this.router.navigate([
                        `navbar/charge-settings/add-charge`,
                      ]);
                    }
                  }
                }
              },
              (err) => {
                this.coreService.removeLoadingScreen();
                console.log("error in saveAddNewCharge", err);
                this.coreService.showWarningToast(
                  "Something went wrong, Please try again later"
                );
              }
            );
          }
        }
      }
    } else {
      this.coreService.showWarningToast("Similar Record already exists.");
    }
  }

  checkDuplicateApplicableOn(): boolean {
    let isDuplicateApplicableOnFound = false;
    let currCritMap = this.applyCriteriaFormattedData[0]["criteriaMap"];
    let amtSlabPresent = false;
    let dateSlabPresent = false;

    let activeData = this.applyCriteriaFormattedData.filter(
      (d) => d["isActive"] == "Y"
    );

    if (currCritMap.indexOf("from:") >= 0) {
      amtSlabPresent = true;
    }

    if (currCritMap.indexOf("trnStartDate=") >= 0) {
      dateSlabPresent = true;
    }

    if (amtSlabPresent || dateSlabPresent) {
      let docTypeObj = {};
      if (amtSlabPresent && dateSlabPresent) {
        activeData.forEach((dataD) => {
          if (
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`] &&
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`].length
          ) {
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`].push(
              dataD["ApplicableOn"]
            );
          } else {
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`] = [
              dataD["ApplicableOn"],
            ];
          }
        });
      } else {
        if (amtSlabPresent) {
          activeData.forEach((data) => {
            if (
              docTypeObj[data["lcyAmountFrom"]] &&
              docTypeObj[data["lcyAmountFrom"]].length
            ) {
              docTypeObj[data["lcyAmountFrom"]].push(data["ApplicableOn"]);
            } else {
              docTypeObj[data["lcyAmountFrom"]] = [data["ApplicableOn"]];
            }
          });
        } else if (dateSlabPresent) {
          activeData.forEach((data) => {
            if (
              docTypeObj[data["dateFrom"]] &&
              docTypeObj[data["dateFrom"]].length
            ) {
              docTypeObj[data["dateFrom"]].push(data["ApplicableOn"]);
            } else {
              docTypeObj[data["dateFrom"]] = [data["ApplicableOn"]];
            }
          });
        }
      }
      console.log("::doctypeobj", docTypeObj);
      Object.values(docTypeObj).forEach((docTypeArr: any) => {
        if (new Set(docTypeArr).size !== docTypeArr.length) {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(
            "Duplicate set as option found for a particular Amount or Date !"
          );
          isDuplicateApplicableOnFound = true;
        }
      });
    } else {
      let docTypeArr = activeData.map((data) => {
        return data["ApplicableOn"];
      });
      if (new Set(docTypeArr).size !== docTypeArr.length) {
        this.coreService.removeLoadingScreen();
        if (this.mode == "clone") {
          this.coreService.showWarningToast("Similar Record Already Exists");
        } else {
          this.coreService.showWarningToast("Duplicate Set As Option Found");
        }
        isDuplicateApplicableOnFound = true;
      }
    }
    return isDuplicateApplicableOnFound;
  }
  checkDuplicateSetAs(): boolean {
    let isDuplicateSetAsFound = false;
    let currCritMap = this.applyCriteriaFormattedData[0]["criteriaMap"];
    let amtSlabPresent = false;
    let dateSlabPresent = false;

    let activeData = this.applyCriteriaFormattedData.filter(
      (d) => d["isActive"] == "Y"
    );

    if (currCritMap.indexOf("from:") >= 0) {
      amtSlabPresent = true;
    }

    if (currCritMap.indexOf("trnStartDate=") >= 0) {
      dateSlabPresent = true;
    }

    if (amtSlabPresent || dateSlabPresent) {
      let docTypeObj = {};
      if (amtSlabPresent && dateSlabPresent) {
        activeData.forEach((dataD) => {
          if (
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`] &&
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`].length
          ) {
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`].push(
              dataD["setAs"]
            );
          } else {
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`] = [
              dataD["setAs"],
            ];
          }
        });
      } else {
        if (amtSlabPresent) {
          activeData.forEach((data) => {
            if (
              docTypeObj[data["lcyAmountFrom"]] &&
              docTypeObj[data["lcyAmountFrom"]].length
            ) {
              docTypeObj[data["lcyAmountFrom"]].push(data["setAs"]);
            } else {
              docTypeObj[data["lcyAmountFrom"]] = [data["setAs"]];
            }
          });
        } else if (dateSlabPresent) {
          activeData.forEach((data) => {
            if (
              docTypeObj[data["dateFrom"]] &&
              docTypeObj[data["dateFrom"]].length
            ) {
              docTypeObj[data["dateFrom"]].push(data["setAs"]);
            } else {
              docTypeObj[data["dateFrom"]] = [data["setAs"]];
            }
          });
        }
      }
      console.log("::doctypeobj", docTypeObj);
      Object.values(docTypeObj).forEach((docTypeArr: any) => {
        if (new Set(docTypeArr).size !== docTypeArr.length) {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(
            "Duplicate set as option found for a particular Amount or Date !"
          );
          isDuplicateSetAsFound = true;
        }
      });
    } else {
      let docTypeArr = activeData.map((data) => {
        return data["setAs"];
      });
      if (new Set(docTypeArr).size !== docTypeArr.length) {
        this.coreService.removeLoadingScreen();
        if (this.mode == "clone") {
          this.coreService.showWarningToast("Similar Record Already Exists");
        } else {
          this.coreService.showWarningToast("Duplicate Set As Option Found");
        }
        isDuplicateSetAsFound = true;
      }
    }
    return isDuplicateSetAsFound;
  }

  reset() {
    if (this.mode == "edit") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetChargeDataConfirmation",
        accept: () => {
          this.coreService.displayLoadingScreen();
          // this.getCriteriaMasterData();
          // this.getAllTemplates();
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.chargeDescription = "";
          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
          // this.coreService.setHeaderStickyStyle(true);
          // this.coreService.setSidebarBtnFixedStyle(true);
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
        key: "resetChargeDataConfirmation",
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
        key: "resetChargeDataConfirmation",
        accept: () => {
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.chargeDescription = "";

          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
          // this.appCtrl.reset();
          // this.moduleCtrl.reset();
          // this.moduleCtrl.disable();
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

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Y";
      type = "Activate";
    } else {
      reqStatus = "N";
      type = "Deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the charge Record?`;
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        data["isActive"] = reqStatus;
        this.setHeaderSidebarBtn();
        console.log("accepting", reqStatus);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
        console.log("reject");
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
        this.applyCriteriaFormattedData[index]["charge"] = 0;
        this.applyCriteriaFormattedData[index]["invalidChargeAmount"] = true;
      } else {
        if (Number(this.applyCriteriaFormattedData[index].lcyAmountFrom)) {
          this.applyCriteriaFormattedData[index]["charge"] = Number(
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
              this.applyCriteriaFormattedData[index]["charge"] =
                Number(lcyAmountNum);
            } else if (lcyAmountOpr == ">") {
              this.applyCriteriaFormattedData[index]["charge"] =
                Number(lcyAmountNum) + 1;
            } else if (lcyAmountOpr == "=") {
              this.applyCriteriaFormattedData[index]["charge"] =
                Number(lcyAmountNum);
            } else {
              this.applyCriteriaFormattedData[index]["charge"] = 0;
            }
          } else {
            this.applyCriteriaFormattedData[index]["charge"] = 0;
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
    this.applyCriteriaFormattedData[index]["invalidChargeAmount"] = false;
    let max = 1000000;
    let min = 0;

    if (this.applyCriteriaFormattedData[index][selectCol] == "Percentage") {
      max = 100;
    } else if (this.applyCriteriaFormattedData[index][selectCol] == "Amount") {
      if (this.applyCriteriaFormattedData[index].lcyAmount?.length) {
        let lcyAmountNum =
          this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[3];
        let lcyAmountOpr =
          this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[2];
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
      } else if (
        this.applyCriteriaFormattedData[index].lcyAmountFrom?.length ||
        this.applyCriteriaFormattedData[index].lcyAmountTo?.length
      ) {
        min = Number(this.applyCriteriaFormattedData[index].lcyAmountFrom);
        max = Number(this.applyCriteriaFormattedData[index].lcyAmountTo);
      }
    }

    let isDisplayError = false;
    if (event.value == 0) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidChargeAmount"] = true;
      return false;
    } else if (event.value < min || event.value > max) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidChargeAmount"] = true;
      this.coreService.showWarningToast(
        "Please enter charge between " + min + " to " + max
      );
      if (event.value <= max && event.value >= min) {
        this.applyCriteriaFormattedData[index][inputCol] = event.value;
        this.applyCriteriaFormattedData[index]["invalidChargeAmount"] = false;
      } else if (event.value > max) {
        let lastValueEntered = valueInputElm.lastValue;
        valueInputElm.input.nativeElement.value = lastValueEntered;
        this.applyCriteriaFormattedData[index]["invalidChargeAmount"] = false;
      } else if (event.value < min) {
      }
      return false;
    }
  }

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
    clonedRow["isActive"] = "Y";
    this.applyCriteriaFormattedData.splice(index + 1, 0, clonedRow);
  }
  delete(index: any) {
    this.applyCriteriaFormattedData.splice(index, 1);
  }
}
