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
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.bankRoutingService.applicationName = null;
    this.bankRoutingService.moduleName = null;

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    this.bankRoutingService.getBanksRoutingAppModuleList().subscribe(
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
          const criteriaMasterData = response.criteriaMasterData;
          const bankRoutingListingData = response.bankRoutingListingData;

          if (bankRoutingListingData["data"]) {
            this.bankRoutingApiData = bankRoutingListingData;
            this.bankRoutingApiData.data.forEach((tax) => {
              let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                criteriaMap: tax.criteriaMap.split("&&&&")[0],
              });
              tax.criteriaMap = (
                this.setCriteriaService.decodeFormattedCriteria(
                  criteriaCodeText,
                  criteriaMasterData,
                  [""]
                ) as []
              ).join(", ");
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
            this.noDataMsg = bankRoutingListingData["msg"];
            this.showNoDataFound = true;
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
              message = "Something went wrong, Please try again later";
              this.coreService.showWarningToast(message);
            }
          }
        }
      },
      (err) => {
        this.coreService.showWarningToast(
          "Something went wrong, Please try again later"
        );
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
}
