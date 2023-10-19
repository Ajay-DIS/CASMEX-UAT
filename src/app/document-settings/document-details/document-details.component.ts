import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";
import { DocumentSettingsService } from "../document-settings.service";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";

@Component({
  selector: "app-document-details",
  templateUrl: "./document-details.component.html",
  styleUrls: ["./document-details.component.scss"],
  providers: [DialogService, MessageService],
})
export class DocumentDetailsComponent implements OnInit {
  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;

  primaryColor = "var(--primary-color)";

  userId = "";
  documentID = "";
  mode = "add";
  formName = "Document Settings";

  documentCode = "No Data";
  documentDesc = "";

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

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  formattedMasterData: any = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  documentOption: any[] = [];
  documentNoTypeOption: any[] = [];

  primaryDocSelected: boolean = false;

  applyCriteriaDataTableColumns: any[] = [];
  columnsCopy: any[] = [
    {
      field: "document",
      header: "Document",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "documentNoType",
      header: "Document No. Type",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },

    {
      field: "lengthMinMax",
      header: "Length (Min / Max)",

      fieldType: "input",
      frozen: false,
      info: "Format should be Min digit/Max digit",
    },
    {
      field: "gracePeriodDays",
      header: "Grace Period (Day)",

      fieldType: "input",
      frozen: false,
      info: "Numeric field",
    },
    {
      field: "expireAlertDays",
      header: "Expiry Date Alert (Day)",
      fieldType: "input",
      frozen: false,
      info: "Numeric field (1-100)",
    },
    {
      field: "isMandatory",
      header: "Is Mandatory",

      fieldType: "checkbox",
      frozen: false,
      info: null,
    },
    {
      field: "isDefault",
      header: "Is Primary Document",

      fieldType: "checkbox",
      frozen: false,
      info: null,
    },
    {
      field: "issueCountry",
      header: "Issue Country",
      fieldType: "checkbox",
      frozen: false,
      info: null,
    },
    {
      field: "frontSide",
      header: "Front Side",
      fieldType: "checkbox",
      frozen: false,
      info: null,
    },
    {
      field: "backSide",
      header: "Back Side",

      fieldType: "checkbox",
      frozen: false,
      info: null,
    },
    {
      field: "bypassImage",
      header: "Bypass Image",

      fieldType: "checkbox",
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
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;

  applyCriteriaResponse: any[] = [];
  editDocResponse: any[] = [];

  isLcyFieldPresent = false;

  isDocSettingLinked: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private documentService: DocumentSettingsService,
    private criteriaDataService: CriteriaDataService,
    private setCriteriaService: SetCriteriaService
  ) {}

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
      this.documentID = params.id;
    }
    this.documentService.getAppModuleList().subscribe(
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
                this.documentService.applicationName ||
                this.documentService.moduleName
              )
            ) {
              if (this.mode != "add") {
                this.router.navigate([`navbar/document-settings`]);
              } else {
                this.coreService.removeLoadingScreen();
              }
            } else {
              if (this.mode != "add") {
                this.appCtrl.setValue({
                  name: this.documentService.applicationName,
                  code: this.documentService.applicationName,
                });
                this.moduleCtrl.setValue({
                  name: this.documentService.moduleName,
                  code: this.documentService.moduleName,
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
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }

  applyCriteria(postDataCriteria: FormData) {
    postDataCriteria.append("docSettingsCode", this.documentCode);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.appCtrl.value.code);
    postDataCriteria.append("form", this.formName);
    postDataCriteria.append("moduleName", this.moduleCtrl.value.code);
    this.isApplyCriteriaClicked = true;
    if (this.isDocSettingLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "documentSettingLinkedWarning",
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
      this.applyCriteriaApi(postDataCriteria);
    }
  }

  getDocSettingForEditApi(docId: any, mode: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    // APICALL
    this.documentService
      .getDocumentForEdit(
        docId,
        mode,
        this.documentService.applicationName,
        this.documentService.moduleName,
        this.formName
      )
      .subscribe((res) => {
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
            this.editDocResponse = JSON.parse(JSON.stringify(res));

            this.documentCode = res["documentSettingsCode"];
            if (res["documentSettingsDesc"]) {
              this.documentDesc = res["documentSettingsDesc"];
            }
            this.isDocSettingLinked = !res["criteriaUpdate"];
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];

            // let reqData =
            //   this.criteriaDataService.decodeCriteriaMapIntoTableFields(res);

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(res);

            this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
              this.criteriaCodeText,
              this.criteriaMasterData,
              ["LCY Amount"]
            );

            this.documentOption = res["documentOption"].map((docOption) => {
              return { code: docOption.dtmCode, name: docOption.dtmName };
            });
            this.documentNoTypeOption = res["documentNoTypeOption"].map(
              (docOption) => {
                return { code: docOption, name: docOption };
              }
            );

            let amtSlabPresent = false;
            let dateSlabPresent = false;

            if (res["criteriaMap"].indexOf("from:") >= 0) {
              amtSlabPresent = true;
            }

            if (res["criteriaMap"].indexOf("trnStartDate:") >= 0) {
              dateSlabPresent = true;
            }

            if (amtSlabPresent && dateSlabPresent) {
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "dateFrom",
                header: "Date From",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "dateTo",
                header: "Date To",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "lcyAmountFrom",
                header: "Amount From",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "lcyAmountTo",
                header: "Amount To",
                fieldType: "text",
              });

              this.applyCriteriaFormattedData = [];
            } else {
              if (amtSlabPresent) {
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
              } else if (dateSlabPresent) {
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
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

                  if (criteriaMapThirdSplit.includes("trnStartDate:")) {
                    data["dateFrom"] = criteriaMapThirdSplit
                      .split("::")[0]
                      .split(":")[1];
                    data["dateTo"] = criteriaMapThirdSplit
                      .split("::")[1]
                      .split(":")[1];
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
                  } else if (criteriaMapSecSplit.includes("trnStartDate:")) {
                    data["dateFrom"] = criteriaMapThirdSplit
                      .split("::")[0]
                      .split(":")[1];
                    data["dateTo"] = criteriaMapThirdSplit
                      .split("::")[1]
                      .split(":")[1];
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
            //     this.applyCriteriaDataTableColumns.splice(-12, 0, {
            //       field: "lcyAmount",
            //       header: "LCY Amount",
            //       fieldType: "text",
            //     });
            //     this.applyCriteriaFormattedData = res["data"];
            //     this.applyCriteriaFormattedData.forEach((data) => {
            //       let split = data["criteriaMapSplit"];
            //       data["lcyAmount"] = split.includes("&&&&")
            //         ? split.split("&&&&").pop()
            //         : split;
            //       data["criteriaMapSplit"] = split.includes("&&&&")
            //         ? split.split("&&&&").pop()
            //         : split;
            //     });
            //   } else if (res["criteriaMap"].indexOf("from") >= 0) {
            //     this.applyCriteriaDataTableColumns.splice(-12, 0, {
            //       field: "lcyAmountFrom",
            //       header: "Amount From",
            //       fieldType: "text",
            //     });
            //     this.applyCriteriaDataTableColumns.splice(-12, 0, {
            //       field: "lcyAmountTo",
            //       header: "Amount To",
            //       fieldType: "text",
            //     });
            //     this.applyCriteriaFormattedData = res["data"];
            //     this.applyCriteriaFormattedData.forEach((data) => {
            //       let split = data["criteriaMapSplit"];
            //       data["lcyAmountFrom"] = split.includes("&&&&")
            //         ? split.split("&&&&").pop().split("::")[0].split(":")[1]
            //         : split.split("::")[0].split(":")[1];
            //       data["lcyAmountTo"] = split.includes("&&&&")
            //         ? split.split("&&&&").pop().split("::")[1].split(":")[1]
            //         : split.split("::")[1].split(":")[1];

            //       data["criteriaMapSplit"] = split.includes("&&&&")
            //         ? split.split("&&&&").pop()
            //         : split;
            //     });
            //   }
            // }

            this.applyCriteriaFormattedData.forEach((data) => {
              delete data.id;
              data["documentOption"] = this.documentOption;
              data["documentNoTypeOption"] = this.documentNoTypeOption;
              data["action"] = res["action"];
              data["invalidLength"] = false;
              data["invalidGraceDays"] = false;
              data["invalidExpiryAlertDays"] = false;
              data["status"] = "Active";
            });

            console.log("::", this.applyCriteriaFormattedData);

            this.coreService.showSuccessToast(
              `Document data fetched Successfully`
            );
            this.coreService.removeLoadingScreen();
          } else {
            this.applyCriteriaFormattedData = [];
            this.appliedCriteriaCriteriaMap = null;
            this.appliedCriteriaIsDuplicate = null;
            this.applyCriteriaDataTableColumns = [];
            this.coreService.showWarningToast(
              "No active data found for this Document."
            );
            this.coreService.removeLoadingScreen();
          }
        }
      });
  }

  applyCriteriaApi(formData: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];
    this.coreService.displayLoadingScreen();

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    // APICALL
    this.documentService.applyCriteriaSearch(formData).subscribe(
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

          console.log(res);

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
            this.documentOption = res["data"].documentOption.map(
              (docOption) => {
                return { code: docOption.dtmCode, name: docOption.dtmName };
              }
            );
            this.documentNoTypeOption = res["data"].documentNoTypeOption.map(
              (docOption) => {
                return { code: docOption, name: docOption };
              }
            );

            let amtSlabPresent = false;
            let dateSlabPresent = false;

            let baseCriteriaMap = res["criteriaMap"].split("&&&&")[0];

            if (res["criteriaMap"].indexOf("from:") >= 0) {
              amtSlabPresent = true;
            }

            if (res["criteriaMap"].indexOf("trnStartDate:") >= 0) {
              dateSlabPresent = true;
            }

            if (amtSlabPresent && dateSlabPresent) {
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "dateFrom",
                header: "Date From",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "dateTo",
                header: "Date To",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
                field: "lcyAmountFrom",
                header: "Amount From",
                fieldType: "text",
              });
              this.applyCriteriaDataTableColumns.splice(-12, 0, {
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
                    JSON.stringify(res["data"].DocumentSettings)
                  );
                  console.log(fieldAmt);
                  apiData["dateFrom"] = fieldDate.trnStartDate;
                  apiData["dateTo"] = fieldDate.trnEndDate;
                  apiData["lcyAmountFrom"] = fieldAmt.from;
                  apiData["lcyAmountTo"] = fieldAmt.to;

                  apiData[
                    "criteriaMapSplit"
                  ] = `${baseCriteriaMap}&&&&from:${fieldAmt["from"]}::to:${fieldAmt["to"]}&&&&trnStartDate:${fieldDate["trnStartDate"]}::trnEndDate:${fieldDate["trnEndDate"]}`;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              });
            } else {
              if (amtSlabPresent) {
                let lcySlabFields = reqData.lcySlabArr;
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                lcySlabFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].DocumentSettings)
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
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-12, 0, {
                  field: "dateTo",
                  header: "Date To",
                  fieldType: "text",
                });
                this.applyCriteriaFormattedData = [];
                dateSlabFields.forEach((field) => {
                  let apiData = JSON.parse(
                    JSON.stringify(res["data"].DocumentSettings)
                  );
                  apiData["dateFrom"] = field.trnStartDate;
                  apiData["dateTo"] = field.trnEndDate;
                  apiData[
                    "criteriaMapSplit"
                  ] = `${baseCriteriaMap}&&&&trnStartDate:${field["trnStartDate"]}::trnEndDate:${field["trnEndDate"]}`;
                  this.applyCriteriaFormattedData.push(apiData);
                });
              } else if (!amtSlabPresent && !dateSlabPresent) {
                this.applyCriteriaFormattedData = [
                  res["data"].DocumentSettings,
                ];
                this.applyCriteriaFormattedData.forEach((data) => {
                  data["criteriaMapSplit"] = baseCriteriaMap;
                });
              }
            }

            // %---old

            // if (res["criteriaMap"].includes("&&&&")) {
            //   if (res["criteriaMap"].split("&&&&").length == 3) {
            //   } else if (res["criteriaMap"].split("&&&&").length == 2) {
            //   }
            // } else {
            //   this.applyCriteriaFormattedData = [res["data"].DocumentSettings];
            //   this.applyCriteriaFormattedData.forEach((data) => {
            //     data["criteriaMapSplit"] = null;
            //   });
            //   console.log(this.applyCriteriaFormattedData);
            // }

            // if (res["criteriaMap"].indexOf("&&&&") >= 0) {
            //   this.isLcyFieldPresent = true;
            // } else {
            //   this.isLcyFieldPresent = false;
            // }

            // if (!this.isLcyFieldPresent) {
            //   this.applyCriteriaFormattedData = [res["data"].DocumentSettings];
            //   this.applyCriteriaFormattedData.forEach((data) => {
            //     data["criteriaMapSplit"] = null;
            //   });
            //   console.log(this.applyCriteriaFormattedData);
            // } else {
            //   if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
            //     let lcyOprFields = crtfields.filter((crt) => {
            //       return crt.includes("LCY Amount");
            //     });
            //     this.applyCriteriaDataTableColumns.splice(-12, 0, {
            //       field: "lcyAmount",
            //       header: "LCY Amount",
            //       fieldType: "text",
            //     });
            //     this.applyCriteriaFormattedData = [];
            //     lcyOprFields.forEach((field) => {
            //       let apiData = JSON.parse(
            //         JSON.stringify(res["data"].DocumentSettings)
            //       );
            //       apiData["lcyAmount"] = field;
            //       apiData["criteriaMapSplit"] = field;
            //       this.applyCriteriaFormattedData.push(apiData);
            //     });
            //   } else if (res["criteriaMap"].indexOf("from") >= 0) {
            //     let lcySlabFields = reqData.lcySlabArr;
            //     this.applyCriteriaDataTableColumns.splice(-12, 0, {
            //       field: "lcyAmountFrom",
            //       header: "Amount From",
            //       fieldType: "text",
            //     });
            //     this.applyCriteriaDataTableColumns.splice(-12, 0, {
            //       field: "lcyAmountTo",
            //       header: "Amount To",
            //       fieldType: "text",
            //     });
            //     this.applyCriteriaFormattedData = [];
            //     lcySlabFields.forEach((field) => {
            //       let apiData = JSON.parse(
            //         JSON.stringify(res["data"].DocumentSettings)
            //       );
            //       apiData["lcyAmountFrom"] = field.from;
            //       apiData["lcyAmountTo"] = field.to;
            //       apiData[
            //         "criteriaMapSplit"
            //       ] = `from:${field["from"]}::to:${field["to"]}`;
            //       this.applyCriteriaFormattedData.push(apiData);
            //     });
            //   }
            // }

            this.applyCriteriaFormattedData.forEach((data) => {
              delete data.id;
              data["documentOption"] = this.documentOption;
              data["documentNoTypeOption"] = this.documentNoTypeOption;
              data["action"] = res["data"].action;
              data["criteriaMap"] = this.appliedCriteriaCriteriaMap;
              data["invalidLength"] = false;
              data["invalidGraceDays"] = false;
              data["invalidExpiryAlertDays"] = false;
              data["status"] = "Active";
              data["userID"] = this.userId;
              data["documentCode"] = this.documentCode;
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
        console.log("error in Doc Setting Apply API", err);
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

  checkBoxUpdate(e: any, field: any, rowIndex: any) {
    if (field == "isDefault") {
      console.log(e);
      if (e == true) {
        this.applyCriteriaFormattedData.forEach((data, i) => {
          if (i != rowIndex) {
            data[field] = false;
          }
        });
      }
    }
  }

  selectedColumn(selectCol: any, value: any, index: any) {
    this.applyCriteriaFormattedData[index][selectCol] = value.name;

    console.log(this.applyCriteriaFormattedData[index]);
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
    clonedRow["isDefault"] = false;
    this.applyCriteriaFormattedData.splice(index + 1, 0, clonedRow);
  }
  delete(index: any) {
    this.applyCriteriaFormattedData.splice(index, 1);
  }

  formatValidation(e: any, field: any, inp: any, rowIndex: any) {
    if (field == "lengthMinMax") {
      const pattern = /^(\d+)\/(\d+)$/;
      if (e.length) {
        const match = e.match(pattern);
        if (match) {
          const min = parseInt(match[1]);
          const max = parseInt(match[2]);
          if (min <= max) {
            inp.classList.remove("inputError");
            this.applyCriteriaFormattedData[rowIndex]["invalidLength"] = false;
          } else {
            inp.classList.add("inputError");
            this.applyCriteriaFormattedData[rowIndex]["invalidLength"] = true;
          }
        } else {
          inp.classList.add("inputError");
          this.applyCriteriaFormattedData[rowIndex]["invalidLength"] = true;
        }
      } else {
        inp.classList.remove("inputError");
        this.applyCriteriaFormattedData[rowIndex]["invalidLength"] = false;
      }
    } else if (field == "gracePeriodDays") {
      const pattern = /^\d+$/;
      if (e.length) {
        const match = e.match(pattern);
        if (match) {
          inp.classList.remove("inputError");
          this.applyCriteriaFormattedData[rowIndex]["invalidGraceDays"] = false;
        } else {
          inp.classList.add("inputError");
          this.applyCriteriaFormattedData[rowIndex]["invalidGraceDays"] = true;
        }
      } else {
        inp.classList.remove("inputError");
        this.applyCriteriaFormattedData[rowIndex]["invalidGraceDays"] = false;
      }
    } else if (field == "expireAlertDays") {
      const pattern = /^\d+$/;
      if (e.length) {
        const match = e.match(pattern);
        if (match) {
          if (Number(e) > 100 || Number(e) < 1) {
            inp.classList.add("inputError");
            this.applyCriteriaFormattedData[rowIndex][
              "invalidExpiryAlertDays"
            ] = true;
          } else {
            inp.classList.remove("inputError");
            this.applyCriteriaFormattedData[rowIndex][
              "invalidExpiryAlertDays"
            ] = false;
          }
        } else {
          inp.classList.add("inputError");
          this.applyCriteriaFormattedData[rowIndex]["invalidExpiryAlertDays"] =
            true;
        }
      } else {
        inp.classList.remove("inputError");
        this.applyCriteriaFormattedData[rowIndex]["invalidExpiryAlertDays"] =
          false;
      }
    }
  }

  getCriteriaMasterData() {
    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
    }
    forkJoin({
      criteriaMasterData: this.documentService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addBankRouteCriteriaData: this.documentService.getAddDocumentCriteriaData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
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
                this.cmCriteriaSlabType["Slab"] = data["fieldName"];
              }
              if (data["criteriaType"] == "date") {
                this.cmCriteriaSlabType["date"] = data["fieldName"];
              }
            }
          );

          if (this.mode == "add") {
            this.documentCode = this.criteriaDataDetailsJson.data.documentCode;
            this.documentID = this.documentCode;
            this.documentDesc = this.criteriaDataDetailsJson.data.documentDesc;
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
                  this.documentService.applicationName ||
                  this.documentService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/document-settings`]);
              } else {
                this.getDocSettingForEditApi(this.documentID, "edit");
              }
            } else if (this.mode == "clone") {
              if (
                !(
                  this.documentService.applicationName ||
                  this.documentService.moduleName
                )
              ) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/document-settings`]);
              } else {
                this.getDocSettingForEditApi(this.documentID, "clone");
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

  resetCriteriaDropdowns() {
    this.setCriteriaSharedComponent.resetCriteriaDropdowns();
  }

  getCorrespondentValues(
    fieldName: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.documentService
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
          this.resetCriteriaDropdowns();
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  getAllTemplates() {
    this.documentService
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
            if (res["data"] && res.data.length) {
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

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.documentService
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

  saveAddNewDocument(action) {
    console.log(
      "::payloaddata",
      JSON.stringify(this.applyCriteriaFormattedData, null, 2)
    );
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
      let invalidGraceDays = false;
      let invalidExpiryAlertDays = false;
      let invalidLength = false;
      let docMissing = false;
      let primaryDocNos = 0;
      this.applyCriteriaFormattedData.forEach((element) => {
        if (element["isDefault"]) {
          primaryDocNos++;
        }
        if (element["invalidLength"]) {
          invalidLength = true;
        }
        if (element["invalidGraceDays"]) {
          invalidGraceDays = true;
        }
        if (element["invalidExpiryAlertDays"]) {
          invalidExpiryAlertDays = true;
        }
        element["documentDesc"] = this.documentDesc
          ? this.documentDesc.replace(/\s/g, "").length
            ? this.documentDesc
            : null
          : null;
        if (!element["documentDesc"]) {
          isRequiredFields = true;
        }
        if (!element["document"]) {
          docMissing = true;
        }
      });

      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill required fields.");
      } else if (docMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Document.");
      } else if (invalidLength) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid Min/Max Length.");
      } else if (invalidGraceDays) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid Grace Days.");
      } else if (invalidExpiryAlertDays) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast(
          "Please Enter Valid Expiry Alert Days."
        );
      } else if (primaryDocNos > 1) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast(
          "More than 1 Primary document selected."
        );
      } else {
        if (this.checkDuplicateDocuments()) {
          return;
        } else {
          let service;
          // this.decodeSelectedOptions();
          if (this.mode == "edit") {
            service = this.documentService.updateDocument(
              this.userId,
              this.applyCriteriaFormattedData,
              this.appCtrl.value.code,
              this.moduleCtrl.value.code,
              this.formName,
              this.mode
            );
          } else {
            service = this.documentService.saveNewDocument(
              this.userId,
              this.applyCriteriaFormattedData,
              this.appCtrl.value.code,
              this.moduleCtrl.value.code,
              this.formName,
              this.mode
            );
          }
          if (service) {
            service.subscribe(
              (res) => {
                console.log(res);
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
                      this.router.navigate([`navbar/document-settings`]);
                    } else if (action == "saveAndAddNew") {
                      this.documentService.applicationName = null;
                      this.documentService.moduleName = null;
                      this.router.navigate([
                        `navbar/document-settings/add-document`,
                      ]);
                    }
                  }
                }
              },
              (err) => {
                this.coreService.removeLoadingScreen();
                console.log("error in savingDocument", err);
              }
            );
          }
        }
      }
    } else {
      this.coreService.showWarningToast("Applied criteria already exists.");
    }
  }

  checkDuplicateDocuments() {
    let isDuplicateDocFound = false;
    let currCritMap = this.applyCriteriaFormattedData[0]["criteriaMap"];
    let amtSlabPresent = false;
    let dateSlabPresent = false;

    if (currCritMap.indexOf("from:") >= 0) {
      amtSlabPresent = true;
    }

    if (currCritMap.indexOf("trnStartDate:") >= 0) {
      dateSlabPresent = true;
    }

    if (amtSlabPresent || dateSlabPresent) {
      let docTypeObj = {};
      if (amtSlabPresent && dateSlabPresent) {
        this.applyCriteriaFormattedData.forEach((dataD) => {
          if (
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`] &&
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`].length
          ) {
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`].push(
              dataD["document"]
            );
          } else {
            docTypeObj[`${dataD["dateFrom"]}_${dataD["lcyAmountFrom"]}`] = [
              dataD["document"],
            ];
          }
        });
      } else {
        if (amtSlabPresent) {
          this.applyCriteriaFormattedData.forEach((data) => {
            if (
              docTypeObj[data["lcyAmountFrom"]] &&
              docTypeObj[data["lcyAmountFrom"]].length
            ) {
              docTypeObj[data["lcyAmountFrom"]].push(data["document"]);
            } else {
              docTypeObj[data["lcyAmountFrom"]] = [data["document"]];
            }
          });
        } else if (dateSlabPresent) {
          this.applyCriteriaFormattedData.forEach((data) => {
            if (
              docTypeObj[data["dateFrom"]] &&
              docTypeObj[data["dateFrom"]].length
            ) {
              docTypeObj[data["dateFrom"]].push(data["document"]);
            } else {
              docTypeObj[data["dateFrom"]] = [data["document"]];
            }
          });
        }
      }
      console.log("::doctypeobj", docTypeObj);
      Object.values(docTypeObj).forEach((docTypeArr: any) => {
        if (new Set(docTypeArr).size !== docTypeArr.length) {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(
            "Duplicate document found for a particular Amount or Date !"
          );
          isDuplicateDocFound = true;
        }
      });
    } else {
      let docTypeArr = this.applyCriteriaFormattedData.map((data) => {
        return data["document"];
      });
      if (new Set(docTypeArr).size !== docTypeArr.length) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Duplicate document found !");
        isDuplicateDocFound = true;
      }
    }

    return isDuplicateDocFound;
  }

  // setSelectedOptions() {
  //   this.applyCriteriaFormattedData.forEach((data) => {
  //     if (data["document"]) {
  //       data["document"] = this.documentOption.filter(
  //         (option) => option["code"] == data["document"]
  //       )[0]["name"];
  //     }

  //     if (data["documentNoType"]) {
  //       data["documentNoType"] = this.documentNoTypeOption.filter(
  //         (option) => option["code"] == data["documentNoType"]
  //       )[0]["name"];
  //     }
  //   });
  // }

  // decodeSelectedOptions() {
  //   this.applyCriteriaFormattedData.forEach((data) => {
  //     data["document"] = data["documentOption"].filter(
  //       (option) => option["name"] == data["document"]
  //     )[0]["code"];
  //     data["documentNoType"] = data["documentNoTypeOption"].filter(
  //       (option) => option["name"] == data["documentNoType"]
  //     )[0]["code"];
  //   });
  // }

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

  reset() {
    if (this.mode == "edit" || this.mode == "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetDocumentDataConfirmation",
        accept: () => {
          this.coreService.displayLoadingScreen();
          // this.getCriteriaMasterData();
          // this.getAllTemplates();
          // this.coreService.setHeaderStickyStyle(true);
          // this.coreService.setSidebarBtnFixedStyle(true);
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.documentDesc = "";

          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
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
        key: "resetDocumentDataConfirmation",
        accept: () => {
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.documentDesc = "";

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
}
