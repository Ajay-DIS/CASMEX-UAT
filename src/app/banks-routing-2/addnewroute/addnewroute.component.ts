import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";

import { BankRoutingService } from "../bank-routing.service";
import { Table } from "primeng/table";
import { map, take } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { Dropdown } from "primeng/dropdown";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-addnewroute",
  templateUrl: "./addnewroute.component.html",
  styleUrls: ["./addnewroute.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddnewrouteComponent2 implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;

  primaryColor = "var(--primary-color)";

  userId = "";
  routeID = "";
  mode = "add";
  formName = "Bank Routings";

  routeCode: any = "No Data";
  routeDescription: any = "";

  isBankRoutingLinked: boolean = false;

  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  objectKeys = Object.keys;
  isEditMode = false;

  editBankRouteApiData: any = [];

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
      field: "routeToBankName",
      header: "Route To",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "routeToServiceCategory",
      header: "Service Category",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "routeToServiceType",
      header: "Service Type",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
  ];
  applyCriteriaFormattedData: any[] = [];

  routeToBankNameOption: any[] = [];
  routeToServiceCategoryOption: any[] = [];
  routeToServiceTypeOption: any[] = [];

  appliedCriteriaDatajson: any = {};
  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  formattedMasterData: any = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  constructor(
    private bankRoutingService: BankRoutingService,
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private setCriteriaService: SetCriteriaService,
    private criteriaDataService: CriteriaDataService,
    private confirmationService: ConfirmationService,
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
      this.routeID = params.id;
    }

    this.bankRoutingService.getBanksRoutingAppModuleList().subscribe(
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
                this.bankRoutingService.applicationName ||
                this.bankRoutingService.moduleName
              )
            ) {
              if (this.mode != "add") {
                this.router.navigate([`navbar/bank-routing`]);
              } else {
                this.coreService.removeLoadingScreen();
              }
            } else {
              if (this.mode != "add") {
                this.appCtrl.setValue({
                  name: this.bankRoutingService.applicationName,
                  code: this.bankRoutingService.applicationName,
                });
                this.moduleCtrl.setValue({
                  name: this.bankRoutingService.moduleName,
                  code: this.bankRoutingService.moduleName,
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

  getBanksRoutingForEditApi(routeCode: any, operation: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.bankRoutingService
      .getBanksRoutingForEdit(
        routeCode,
        operation,
        this.bankRoutingService.applicationName,
        this.bankRoutingService.moduleName,
        this.formName
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
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
              this.showContent = true;
              this.editBankRouteApiData = JSON.parse(JSON.stringify(res));

              this.criteriaCodeText =
                this.setCriteriaService.setCriteriaMap(res);

              this.criteriaText =
                this.setCriteriaService.decodeFormattedCriteria(
                  this.criteriaCodeText,
                  this.criteriaMasterData,
                  this.cmCriteriaSlabType
                );

              this.routeCode = res["routeCode"];
              if (res["routeDesc"]) {
                this.routeDescription = res["routeDesc"];
              }
              this.isBankRoutingLinked = !res["criteriaUpdate"];
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];

              this.routeToBankNameOption = res["routeToBankNameOption"].map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );
              this.routeToServiceCategoryOption = res[
                "routeToServiceCategoryOption"
              ].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });
              this.routeToServiceTypeOption = res[
                "routeToServiceTypeOption"
              ].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });

              if (res["criteriaMap"].indexOf("&&&&") >= 0) {
                this.isLcyFieldPresent = true;
              }

              if (!this.isLcyFieldPresent) {
                this.applyCriteriaFormattedData = res["data"];
              } else {
                if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
                  this.applyCriteriaDataTableColumns.splice(-3, 0, {
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
                  this.applyCriteriaDataTableColumns.splice(-3, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-3, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = res["data"];
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
                data["routeToBankNameOption"] = this.routeToBankNameOption;
                data["routeToServiceCategoryOption"] =
                  this.routeToServiceCategoryOption;
                data["routeToServiceTypeOption"] =
                  this.routeToServiceTypeOption;
                data["status"] = "Active";
              });

              this.coreService.showSuccessToast(
                `Bank Routing data fetched Successfully`
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
                  "No active data found for this Bank Routing."
                );
              }
              this.coreService.removeLoadingScreen();
            }
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getBanksRoutingForEditApi", err);
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
      criteriaMasterData: this.bankRoutingService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addBankRouteCriteriaData:
        this.bankRoutingService.getAddBankRouteCriteriaData(
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
            this.routeCode = this.criteriaDataDetailsJson.data.routeCode;
            this.routeID = this.routeCode;
            this.routeDescription = this.criteriaDataDetailsJson.data.routeDesc;
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
                  this.bankRoutingService.applicationName ||
                  this.bankRoutingService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/bank-routing`]);
              } else {
                this.getBanksRoutingForEditApi(this.routeID, "edit");
              }
            } else if (this.mode == "clone") {
              if (
                !(
                  this.bankRoutingService.applicationName ||
                  this.bankRoutingService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/bank-routing`]);
              } else {
                this.getBanksRoutingForEditApi(this.routeID, "clone");
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
    this.bankRoutingService
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
          this.resetCriteriaDropdowns();
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  resetCriteriaDropdowns() {
    this.setCriteriaSharedComponent.resetCriteriaDropdowns();
  }

  applyCriteria(postDataCriteria: FormData) {
    postDataCriteria.append("routeCode", this.routeID);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.appCtrl.value.code);
    postDataCriteria.append("form", this.formName);
    postDataCriteria.append("moduleName", this.moduleCtrl.value.code);
    this.isApplyCriteriaClicked = true;
    if (this.isBankRoutingLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "bankRoutingLinkedWarning",
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
      this.routeBankCriteriaSearchApi(postDataCriteria);
    }
  }

  routeBankCriteriaSearchApi(formData: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];
    this.coreService.displayLoadingScreen();

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.bankRoutingService.postRouteBankCriteriaSearch(formData).subscribe(
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
            let resData = res["data"];
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaIsDuplicate = res["duplicate"];
            let reqData =
              this.criteriaDataService.decodeCriteriaMapIntoTableFields(res);

            let crtfields = this.setCriteriaService.decodeFormattedCriteria(
              reqData.critMap,
              this.criteriaMasterData,
              ["LCY Amount"]
            );

            this.routeToBankNameOption = resData["routeToBankNameOption"].map(
              (option) => {
                return { code: option.code, codeName: option.codeName };
              }
            );
            this.routeToServiceCategoryOption = resData[
              "routeToServiceCategoryOption"
            ].map((option) => {
              return { code: option.code, codeName: option.codeName };
            });
            this.routeToServiceTypeOption = resData[
              "routeToServiceTypeOption"
            ].map((option) => {
              return { code: option.code, codeName: option.codeName };
            });

            if (res["criteriaMap"].indexOf("&&&&") >= 0) {
              this.isLcyFieldPresent = true;
            } else {
              this.isLcyFieldPresent = false;
            }

            if (!this.isLcyFieldPresent) {
              this.applyCriteriaFormattedData = [
                resData?.bankRoutingsCriteriaDetails,
              ];
              this.applyCriteriaFormattedData.forEach((data) => {
                data["criteriaMapSplit"] = null;
              });
            } else {
              if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
                let lcyOprFields = crtfields.filter((crt) => {
                  return crt.includes("LCY Amount");
                });
                this.applyCriteriaDataTableColumns.splice(-3, 0, {
                  field: "lcyAmount",
                  header: "LCY Amount",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                lcyOprFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(resData?.bankRoutingsCriteriaDetails)
                  );
                  apiData["lcyAmount"] = field;
                  apiData["criteriaMapSplit"] = field;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              } else if (res["criteriaMap"].indexOf("from") >= 0) {
                let lcySlabFields = reqData.lcySlabArr;
                this.applyCriteriaDataTableColumns.splice(-3, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-3, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                lcySlabFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(resData?.bankRoutingsCriteriaDetails)
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
              data["routeToBankNameOption"] = this.routeToBankNameOption;
              data["routeToServiceCategoryOption"] =
                this.routeToServiceCategoryOption;
              data["routeToServiceTypeOption"] = this.routeToServiceTypeOption;
              data["criteriaMap"] = this.appliedCriteriaCriteriaMap;
              data["status"] = "Active";
              data["userId"] = this.userId;
              data["routeCode"] = this.routeCode;
            });

            this.coreService.showSuccessToast(`Criteria Applied Successfully`);
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
        console.log("error in BankCriteriaSearchApi", err);
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .currentCriteriaSaveAsTemplate(templateFormData)
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
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
          this.coreService.showWarningToast(
            "Something went wrong, Please try again later"
          );
        }
      );
  }

  getAllTemplates() {
    this.bankRoutingService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
        this.formName
      )
      .subscribe((res) => {
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
      });
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }

  selectedColumn(field: any, value: any, index: any) {
    this.applyCriteriaFormattedData[index][field] = value["codeName"];
  }

  setSelectedOptions() {
    this.applyCriteriaFormattedData.forEach((data) => {
      data["routeToBankNameOption"].filter((option) => {
        option["code"] == data["routeToBankName"];
      });
      if (data["routeToBankName"]) {
        data["routeToBankName"] = data["routeToBankNameOption"].filter(
          (option) => option["code"] == data["routeToBankName"]
        )[0]["codeName"];
      }

      if (data["routeToServiceCategory"]) {
        data["routeToServiceCategory"] = data[
          "routeToServiceCategoryOption"
        ].filter(
          (option) => option["code"] == data["routeToServiceCategory"]
        )[0]["codeName"];
      }

      if (data["routeToServiceType"]) {
        data["routeToServiceType"] = data["routeToServiceTypeOption"].filter(
          (option) => option["code"] == data["routeToServiceType"]
        )[0]["codeName"];
      }
    });
  }
  decodeSelectedOptions() {
    this.applyCriteriaFormattedData.forEach((data) => {
      data["routeToBankName"] = data["routeToBankNameOption"].filter(
        (option) => option["codeName"] == data["routeToBankName"]
      )[0]["code"];
      data["routeToServiceCategory"] = data[
        "routeToServiceCategoryOption"
      ].filter(
        (option) => option["codeName"] == data["routeToServiceCategory"]
      )[0]["code"];
      data["routeToServiceType"] = data["routeToServiceTypeOption"].filter(
        (option) => option["codeName"] == data["routeToServiceType"]
      )[0]["code"];
    });
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  reset() {
    if (this.mode == "edit") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetDataConfirmation",
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
        key: "resetDataConfirmation",
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
        key: "resetDataConfirmation",
        accept: () => {
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.routeDescription = "";
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

  saveAddNewRoute(action) {
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
      let routeToBankNameMissing = false;
      let routeToServiceCategoryMissing = false;
      let routeToServiceTypeMissing = false;
      this.applyCriteriaFormattedData.forEach((element) => {
        element["routeDesc"] = this.routeDescription
          ? this.routeDescription.replace(/\s/g, "").length
            ? this.routeDescription
            : null
          : null;
        if (!element["routeDesc"]) {
          isRequiredFields = true;
        }
        if (!element["routeToBankName"]) {
          routeToBankNameMissing = true;
        }
        if (!element["routeToServiceCategory"]) {
          routeToServiceCategoryMissing = true;
        }
        if (!element["routeToServiceType"]) {
          routeToServiceTypeMissing = true;
        }
      });
      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill required fields.");
      } else if (routeToBankNameMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Route to bank name.");
      } else if (routeToServiceCategoryMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast(
          "Please Select Route to service category."
        );
      } else if (routeToServiceTypeMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast(
          "Please Select Route to service type."
        );
      } else {
        let service;
        this.decodeSelectedOptions();
        if (this.mode == "edit") {
          let data = {
            data: this.applyCriteriaFormattedData,
            duplicate: this.appliedCriteriaIsDuplicate,
            criteriaMap: this.appliedCriteriaCriteriaMap,
            routeCode: this.routeID,
          };
          service = this.bankRoutingService.updateRoute(
            this.userId,
            data,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formName
          );
        } else {
          let data = {
            data: this.applyCriteriaFormattedData,
            duplicate: this.appliedCriteriaIsDuplicate,
            criteriaMap: this.appliedCriteriaCriteriaMap,
          };
          service = this.bankRoutingService.addNewRoute(
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
                    "Some error in fetching data"
                  );
                }
              } else {
                if (res["msg"]) {
                  this.coreService.showSuccessToast(res.msg);
                  if (action == "save") {
                    this.router.navigate([`navbar/bank-routing`]);
                  } else if (action == "saveAndAddNew") {
                    this.bankRoutingService.applicationName = null;
                    this.bankRoutingService.moduleName = null;
                    this.router.navigate([`navbar/bank-routing/addnewroute`]);
                  }
                }
              }
            },
            (err) => {
              this.coreService.removeLoadingScreen();
              console.log("error in saveAddNewRoute", err);
              this.coreService.showWarningToast("Some error in fetching save");
            }
          );
        }
      }
    } else {
      this.coreService.showWarningToast("Applied criteria already exists.");
    }
  }
}
