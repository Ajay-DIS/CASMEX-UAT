import { Component, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import { CoreService } from "src/app/core.service";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { ChargeServiceService } from "../charge-service.service";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { MultiSelect } from "primeng/multiselect";

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-charge-listing",
  templateUrl: "./charge-listing.component.html",
  styleUrls: ["./charge-listing.component.scss"],
})
export class ChargeListingComponent implements OnInit {
  formName = "Charge Settings";
  applicationName = "Web Application";
  chargeListingData: any[];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  cols: any[] = [
    { field: "chargeCode", header: "Charge Code", width: "10%" },
    { field: "chargeCodeDesc", header: "Charge Description", width: "25%" },
    { field: "criteriaMap", header: "Criteria", width: "50%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

  showchargeCodeOptions: boolean = false;
  showchargeCodeDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  chargeCode = [];
  chargeCodeDesc = [];
  criteriaMap = [];
  status = [];

  userData: any = {};
  selectedFilterchargeCode: any[] = [];
  selectedFilterchargeCodeDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  chargeListingApiData: any = {};
  loading: boolean = true;

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  noDataMsg: string = "Charge Setting Data Not Available";

  linkedChargeCode: any = [];

  fieldDisplayData = {};

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private chargeService: ChargeServiceService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();

    const translationKey = "Home.Settings";

    // Update translation
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.chargeService.applicationName = null;
    this.chargeService.moduleName = null;

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    // getting app-mod from localstorage

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
      this.searchAppModule();
    }

    // getting app-mod from localstorage ends

    this.chargeService.getChargeSettingAppModuleList().subscribe(
      (res) => {
        // this.coreService.removeLoadingScreen();
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
            // this.coreService.removeLoadingScreen();
          } else {
            // this.coreService.removeLoadingScreen();
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
      modules: new UntypedFormControl({ value: "", disabled: false }, [
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

  searchAppModule() {
    let currAppMod = {
      applicationName: this.appCtrl.value,
      moduleName: this.moduleCtrl.value,
    };
    sessionStorage.setItem("charge", JSON.stringify(currAppMod));
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.name,
      this.moduleCtrl.value.name
    );
  }
  getDecodedDataForListing(userId: any, appValue: any, moduleValue: any) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.chargeService.getCriteriaMasterData(
        this.userData.userId,
        this.formName,
        appValue,
        moduleValue
      ),
      chargeSettingListingData: this.chargeService.getChargeCodeData(
        userId,
        this.formName,
        appValue,
        moduleValue
      ),
    })
      .pipe(
        take(1),
        map((response) => {
          let criteriaMasterJson = _lodashClone(response.criteriaMasterData);
          delete criteriaMasterJson["fieldDisplay"];
          this.fieldDisplayData = response.criteriaMasterData["fieldDisplay"];
          const criteriaMasterData = criteriaMasterJson;
          const chargeSettingListingData = response.chargeSettingListingData;

          if (chargeSettingListingData["data"]) {
            this.chargeListingApiData = chargeSettingListingData;
            this.chargeListingApiData.data.forEach((charge) => {
              let beforeSplit = charge.criteriaMap.split("&&&&")[0];
              const sections = charge.criteriaMap.split("&&&&");
              let amounts = "";
              let dates = "";
              let afterSplit = "";

              // Process each section
              sections.forEach((section) => {
                if (section.includes("from") && section.includes("to")) {
                  // Extract the amounts
                  const amountsArray = section
                    .split("#")
                    .map((amountSection) => {
                      const [from, to] = amountSection
                        .split("::")
                        .map((part) => part.split(":")[1]);
                      return `Between ${from} - ${to}`;
                    });
                  amounts = amountsArray.join(" & ");
                } else if (
                  section.startsWith("trnStartDate") &&
                  section.includes("trnEndDate")
                ) {
                  // Extract the dates
                  const dateSections = section.split("#").map((dateSection) => {
                    const [startDate, endDate] = dateSection
                      .split("::")
                      .map((part) => part.split("=")[1]);
                    return `Between ${startDate} - ${endDate}`;
                  });
                  dates = dateSections.join(" & ");
                }
              });

              if (amounts.length && dates.length) {
                afterSplit += `Amount (${amounts}), Date (${dates})`;
              } else if (amounts.length) {
                afterSplit += `Amount (${amounts})`;
              } else if (dates.length) {
                afterSplit += `Date (${dates})`;
              }

              if (beforeSplit.length) {
                let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                  criteriaMap: beforeSplit,
                });
                charge.criteriaMap = (
                  this.setCriteriaService.decodeFormattedCriteria(
                    criteriaCodeText,
                    criteriaMasterData,
                    this.fieldDisplayData
                  ) as []
                ).join(", ");
                if (afterSplit?.length) {
                  charge.criteriaMap = charge.criteriaMap + ", " + afterSplit;
                }
              } else {
                if (afterSplit?.length) {
                  charge.criteriaMap = afterSplit;
                }
              }
            });
            this.chargeListingData = [...this.chargeListingApiData.data];
            this.showNoDataFound = false;
            this.linkedChargeCode = [
              ...this.chargeListingApiData.linkedChargeCode,
            ];
            this.chargeCode = this.chargeListingApiData.chargeCode.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.chargeCodeDesc = this.chargeListingApiData.chargeCodeDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.criteriaMap = this.chargeListingApiData.criteriaMap.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.status = this.chargeListingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            if (chargeSettingListingData["msg"]) {
              this.coreService.showWarningToast(
                chargeSettingListingData["msg"]
              );
            }
            this.showNoDataFound = true;
            this.chargeListingData = [];
          }
          return chargeSettingListingData;
        })
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.showNoDataFound = true;
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (!res["data"]) {
              this.showNoDataFound = true;
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.chargeListingData = null;
          this.showNoDataFound = true;
          this.loading = false;
          console.log("Error in getting charge seting list data", err);
          this.coreService.showWarningToast(
            "Some Error in getting charge seting list data"
          );
        }
      );
  }

  viewChargeSetting(data: any) {
    this.chargeService.applicationName = this.appCtrl.value.name;
    this.chargeService.moduleName = this.moduleCtrl.value.name;
    this.router.navigate([
      "navbar",
      "charge-settings",
      "add-charge",
      data.chargeCode,
      "edit",
    ]);
    this.chargeService.setData(data);
  }

  isLinked(id: any) {
    return this.linkedChargeCode.includes(id);
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Active";
      type = "activate";
    } else {
      reqStatus = "Inactive";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    let isLinkedMsg = `Active Transactions Exist. </br>`;
    if (
      reqStatus == "Inactive" &&
      this.linkedChargeCode.includes(data["chargeCode"])
    ) {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Charge Record: ${data["chargeCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Charge Record: ${data["chargeCode"]}?`;
    }
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, data);
        this.setHeaderSidebarBtn(true);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn(false);
      },
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

  updateStatus(e: any, reqStatus: any, data: any) {
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("chargeCode", data["chargeCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.name);
    formData.append("moduleName", this.moduleCtrl.value.name);
    formData.append("form", this.formName);
    this.updateChargeCodeStatus(formData, e.target, data);
  }

  updateChargeCodeStatus(formData: any, sliderElm: any, chargeData: any) {
    this.chargeService.updateChargeSettingsStatus(formData).subscribe(
      (res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Charge code: ${res["msg"]} ( ${chargeData["criteriaMap"]} ) to activate the current record.`;
          this.coreService.showWarningToast(message);
        } else {
          if (res["msg"]) {
            message = res["msg"];
            sliderElm.checked = sliderElm!.checked;
            this.getDecodedDataForListing(
              this.userData.userId,
              this.appCtrl.value.name,
              this.moduleCtrl.value.name
            );
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

  cloneCharge(data: any) {
    this.chargeService.applicationName = this.appCtrl.value.name;
    this.chargeService.moduleName = this.moduleCtrl.value.name;
    this.router.navigate([
      "navbar",
      "charge-settings",
      "add-charge",
      data.chargeCode,
      "clone",
    ]);
  }

  addNewChargePage() {
    this.router.navigate(["navbar", "charge-settings", "add-charge"]);
  }

  toggleFilterVisibility(field) {
    this[`show${field}Options`] = !this[`show${field}Options`];
  }

  hideFilterVisibility(field) {
    this[`show${field}Options`] = false;
  }

  getSelectedFilterArr(field: any) {
    return this[`selectedFilter${field}`];
  }

  setSelectedFilter(ms: MultiSelect, field: any) {
    this[`selectedFilter${field}`] = ms.value;
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }

  copyToClipboard(text: string) {
    this.coreService.copyToClipboard(text);
  }
}
