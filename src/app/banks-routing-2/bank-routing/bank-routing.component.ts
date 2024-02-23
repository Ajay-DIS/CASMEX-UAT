import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MultiSelect } from "primeng/multiselect";
import { ActivatedRoute, Router } from "@angular/router";
import { Table } from "primeng/table";

import {
  BankRouting,
  BankRoutingApiData,
  UserData,
} from "../banks-routing.model";
import { BankRoutingService } from "../bank-routing.service";
import { CoreService } from "src/app/core.service";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService, MessageService, TreeNode } from "primeng/api";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-bank-routing",
  templateUrl: "./bank-routing.component.html",
  styleUrls: ["./bank-routing.component.scss"],
  providers: [DialogService, MessageService],
})
export class BankRoutingComponent2 implements OnInit {
  formName = "Bank Routings";
  linkedRouteCode: any = [];

  inactiveData: boolean = false;

  fieldDisplayData = {};

  constructor(
    private router: Router,
    private bankRoutingService: BankRoutingService,
    private coreService: CoreService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private setCriteriaService: SetCriteriaService,
    private fb: UntypedFormBuilder
  ) {}
  @ViewChild("dt") table: Table;
  @ViewChild("statusInp") statusInp: HTMLInputElement;

  showNoDataFound: boolean = false;

  showrouteCodeOptions: boolean = false;
  showrouteDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  bankRoutingApiData: BankRoutingApiData;

  bankRoutingData: BankRouting[];

  routeCode: any[] = [];
  routeDesc: any[] = [];
  criteriaMap: any[] = [];
  status: any[];

  userData: UserData;

  noDataMsg: string = "Banks Routing Data Not Available";

  selectedFilterrouteCode: any[] = [];
  selectedFilterrouteDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];

  loading = true;

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  objectKeys = Object.keys;
  cols = [
    { field: "routeCode", header: "Route Code", width: "10%" },
    { field: "routeDesc", header: "Route Description", width: "25%" },
    { field: "criteriaMap", header: "Criteria", width: "50%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

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

    this.bankRoutingService.applicationName = null;
    this.bankRoutingService.moduleName = null;

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    //
    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));
    let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
    let currAppMod = JSON.parse(sessionStorage.getItem("bankRoute"));

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
    if (this.appCtrl.value && this.moduleCtrl.value) {
      this.searchAppModule();
    } else {
      this.coreService.removeLoadingScreen();
    }
    //
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
    sessionStorage.setItem("bankRoute", JSON.stringify(currAppMod));
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.code,
      this.moduleCtrl.value.code
    );
  }

  getDecodedDataForListing(userId: any, appValue: any, moduleValue: any) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.bankRoutingService.getCriteriaMasterData(
        this.userData.userId,
        this.formName,
        appValue,
        moduleValue
      ),
      bankRoutingListingData: this.bankRoutingService.getBankRoutingData(
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
          const bankRoutingListingData = response.bankRoutingListingData;

          if (bankRoutingListingData["data"]) {
            this.bankRoutingApiData = bankRoutingListingData;
            this.bankRoutingApiData.data.forEach((tax) => {
              let beforeSplit = tax.criteriaMap.split("&&&&")[0];
              // let afterSplit = tax.criteriaMap.split("&&&&")[1];

              const sections = tax.criteriaMap.split("&&&&");

              // Initialize variables to store the formatted data
              let criteria = {};
              let amounts = "";
              let dates = "";
              let afterSplit = "";

              // Process each section
              sections.forEach((section) => {
                // if (section.includes("=")) {
                //   // Split section into key and value
                //   const [key, value] = section
                //     .split("=")
                //     .map((str) => str.trim());

                //   // Store the criteria in the object
                //   criteria[key] = value;
                // }
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
              // tax.criteriaMap = output;
              console.log("555", afterSplit);

              if (beforeSplit.length) {
                let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                  criteriaMap: beforeSplit,
                });
                tax.criteriaMap = (
                  this.setCriteriaService.decodeFormattedCriteria(
                    criteriaCodeText,
                    criteriaMasterData,
                    this.fieldDisplayData
                  ) as []
                ).join(", ");
                if (afterSplit?.length) {
                  tax.criteriaMap = tax.criteriaMap + ", " + afterSplit;
                }
              } else {
                if (afterSplit?.length) {
                  tax.criteriaMap = afterSplit;
                }
              }
            });

            this.bankRoutingData = [...this.bankRoutingApiData.data];
            this.showNoDataFound = false;
            this.linkedRouteCode = [...this.bankRoutingApiData.linkedRouteCode];

            this.routeCode = this.bankRoutingApiData.routeCode.map((code) => {
              return { label: code, value: code };
            });
            this.routeDesc = this.bankRoutingApiData.routeDesc.map((code) => {
              return { label: code, value: code };
            });
            this.criteriaMap = this.bankRoutingApiData.criteriaMap.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.status = this.bankRoutingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            if (bankRoutingListingData["msg"]) {
              this.coreService.showWarningToast(bankRoutingListingData["msg"]);
            }
            this.showNoDataFound = true;
            this.bankRoutingData = [];
          }
          return bankRoutingListingData;
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
            if (!res["data"]) {
              this.showNoDataFound = true;
            }
          }
          this.coreService.removeLoadingScreen();
          this.loading = false;
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.bankRoutingData = null;
          this.showNoDataFound = true;
          this.loading = false;
          console.log("Error in getting bank routing list data", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  viewBankRouting(data: any) {
    this.bankRoutingService.applicationName = this.appCtrl.value.code;
    this.bankRoutingService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "bank-routing",
      "addnewroute",
      data.routeCode,
      "edit",
    ]);
    this.bankRoutingService.setData(data);
  }

  cloneRoute(data: any) {
    this.bankRoutingService.applicationName = this.appCtrl.value.code;
    this.bankRoutingService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "bank-routing",
      "addnewroute",
      data.routeCode,
      "clone",
    ]);
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
      this.linkedRouteCode.includes(data["routeCode"])
    ) {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Bank Route: ${data["routeCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Bank Route: ${data["routeCode"]}?`;
    }
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveRouteStatus",
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
    formData.append("routeCode", data["routeCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.code);
    formData.append("moduleName", this.moduleCtrl.value.code);
    formData.append("form", this.formName);
    this.updateBankRouteStatus(formData, e.target, data);
  }

  updateBankRouteStatus(formData: any, sliderElm: any, routeData: any) {
    this.bankRoutingService.updateBankRouteStatus(formData).subscribe(
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
            message = `Kindly deactivate the Route code: ${res["msg"]} ( ${routeData["criteriaMap"]} ) to activate the current record.`;
            this.coreService.showWarningToast(message);
          } else {
            if (res["msg"]) {
              message = res["msg"];
              sliderElm.checked = sliderElm!.checked;
              this.getDecodedDataForListing(
                this.userData.userId,
                this.appCtrl.value.code,
                this.moduleCtrl.value.code
              );
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
        console.log("Error in updateBankRouteStatus", err);
        this.coreService.removeLoadingScreen();
      }
    );
  }

  isLinked(id: any) {
    return this.linkedRouteCode.includes(id);
  }

  addNewRoutePage() {
    this.router.navigate(["navbar", "bank-routing", "addnewroute"]);
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
