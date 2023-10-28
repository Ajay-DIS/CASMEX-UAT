import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MultiSelect } from "primeng/multiselect";
import { CoreService } from "src/app/core.service";
import { TaxSettingsService } from "../tax-settings.service";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-tax-listing",
  templateUrl: "./tax-listing.component.html",
  styleUrls: ["./tax-listing.component.scss"],
})
export class TaxListingComponent implements OnInit {
  formName = "Tax Settings";
  applicationName = "Web Application";
  taxListingData: any[];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  cols: any[] = [
    { field: "taxCode", header: "Tax Code", width: "10%" },
    { field: "taxCodeDesc", header: "Tax Description", width: "25%" },
    { field: "criteriaMap", header: "Criteria", width: "50%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

  showtaxCodeOptions: boolean = false;
  showtaxCodeDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  taxCode = [];
  taxCodeDesc = [];
  criteriaMap = [];
  status = [];

  userData: any = {};
  selectedFiltertaxCode: any[] = [];
  selectedFiltertaxCodeDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  taxListingApiData: any = {};
  loading: boolean = true;

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  noDataMsg: string = "Tax Setting Data Not Available";

  linkedTaxCode: any = [];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private taxSettingsService: TaxSettingsService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.taxSettingsService.applicationName = null;
    this.taxSettingsService.moduleName = null;

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    this.taxSettingsService.getTaxSettingAppModuleList().subscribe(
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
          if (!res["msg"]) {
            this.searchApplicationOptions = JSON.parse(
              localStorage.getItem("appAccess")
            );
            this.searchModuleOptions = JSON.parse(
              localStorage.getItem("modAccess")
            );
            let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
            let currAppMod = JSON.parse(sessionStorage.getItem("tax"));

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
            } else {
              this.coreService.removeLoadingScreen();
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
    sessionStorage.setItem("tax", JSON.stringify(currAppMod));
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.name,
      this.moduleCtrl.value.name
    );
  }
  getDecodedDataForListing(userId: any, appValue: any, moduleValue: any) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.taxSettingsService.getCriteriaMasterData(
        this.userData.userId,
        this.formName,
        appValue,
        moduleValue
      ),
      taxSettingListingData: this.taxSettingsService.getTaxCodeData(
        userId,
        this.formName,
        appValue,
        moduleValue
      ),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          const taxSettingListingData = response.taxSettingListingData;

          if (taxSettingListingData["data"]) {
            this.taxListingApiData = taxSettingListingData;
            this.taxListingApiData.data.forEach((tax) => {
              let beforeSplit = tax.criteriaMap.split("&&&&")[0];
              const sections = tax.criteriaMap.split("&&&&");
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

              let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                criteriaMap: beforeSplit,
              });

              tax.criteriaMap = (
                this.setCriteriaService.decodeFormattedCriteria(
                  criteriaCodeText,
                  criteriaMasterData,
                  [""]
                ) as []
              ).join(", ");
              if (afterSplit?.length) {
                tax.criteriaMap = tax.criteriaMap + ", " + afterSplit;
              }
            });
            this.taxListingData = [...this.taxListingApiData.data];
            this.showNoDataFound = false;
            this.linkedTaxCode = [...this.taxListingApiData.linkedTaxCode];
            this.taxCode = this.taxListingApiData.taxCode.map((code) => {
              return { label: code, value: code };
            });
            this.taxCodeDesc = this.taxListingApiData.taxCodeDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.criteriaMap = this.taxListingApiData.criteriaMap.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.status = this.taxListingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            this.noDataMsg = taxSettingListingData["msg"];
            this.showNoDataFound = true;
            this.taxListingData = [];
          }
          return taxSettingListingData;
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
          this.taxListingData = null;
          this.showNoDataFound = true;
          this.loading = false;
          console.log("Error in getting tax seting list data", err);
          this.coreService.showWarningToast(
            "Some Error in getting tax seting list data"
          );
        }
      );
  }

  viewTaxSetting(data: any) {
    this.taxSettingsService.applicationName = this.appCtrl.value.name;
    this.taxSettingsService.moduleName = this.moduleCtrl.value.name;
    this.router.navigate([
      "navbar",
      "tax-settings",
      "add-tax",
      data.taxCode,
      "edit",
    ]);
  }

  isLinked(id: any) {
    return this.linkedTaxCode.includes(id);
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
      this.linkedTaxCode.includes(data["taxCode"])
    ) {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Tax Record: ${data["taxCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Tax Record: ${data["taxCode"]}?`;
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
    formData.append("taxCode", data["taxCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.name);
    formData.append("moduleName", this.moduleCtrl.value.name);
    formData.append("form", this.formName);
    this.updateTaxCodeStatus(formData, e.target, data);
  }

  updateTaxCodeStatus(formData: any, sliderElm: any, taxData: any) {
    this.taxSettingsService.updateTaxSettingsStatus(formData).subscribe(
      (res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Tax code: ${res["msg"]} ( ${taxData["criteriaMap"]} ) to activate the current record.`;
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

  cloneTax(data: any) {
    this.taxSettingsService.applicationName = this.appCtrl.value.name;
    this.taxSettingsService.moduleName = this.moduleCtrl.value.name;
    this.router.navigate([
      "navbar",
      "tax-settings",
      "add-tax",
      data.taxCode,
      "clone",
    ]);
  }

  addNewTaxPage() {
    this.router.navigate(["navbar", "tax-settings", "add-tax"]);
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
}
