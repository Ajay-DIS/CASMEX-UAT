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

@Component({
  selector: "app-bank-routing",
  templateUrl: "./bank-routing.component.html",
  styleUrls: ["./bank-routing.component.scss"],
  providers: [DialogService, MessageService],
})
export class BankRoutingComponent2 implements OnInit {
  formName = "Bank Routings";
  applicationName = "Web Application";
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
    private setCriteriaService: SetCriteriaService
  ) {}
  @ViewChild("dt") table: Table;
  @ViewChild("statusInp") statusInp: HTMLInputElement;

  showNoDataFound :boolean= false;

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

    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    this.getBanksRoutingData(this.userData.userId);
  }

  getDecodedDataForListing(userId: any) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.bankRoutingService.getCriteriaMasterData(
        this.formName,
        this.applicationName
      ),
      bankRoutingListingData:
        this.bankRoutingService.getBankRoutingData(userId),
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
            this.showNoDataFound =false;
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
            // this.criteriaMap = this.bankRoutingApiData.criteriaMap.map(
            //   (criteriaMap) => {
            //     let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
            //       criteriaMap: criteriaMap.split("&&&&")[0],
            //     });
            //     let code = (
            //       this.setCriteriaService.decodeFormattedCriteria(
            //         criteriaCodeText,
            //         criteriaMasterData,
            //         [""]
            //       ) as []
            //     ).join(", ");
            //     return { label: code, value: code };
            //   }
            // );
            this.status = this.bankRoutingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            this.noDataMsg = bankRoutingListingData["msg"];
            this.showNoDataFound =true;
          }
          return bankRoutingListingData;
        })
      )
      .subscribe(
        (res) => {
          if (!res["data"]) {
            console.log("No data Found");
            this.showNoDataFound =true;
          }
          this.coreService.removeLoadingScreen();
          this.loading = false;
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.showNoDataFound =true;
          this.loading = false;
          console.log("Error in getting bank routing list data", err);
        }
      );
  }

  viewBankRouting(data: any) {
    this.router.navigate([
      "navbar",
      "bank-routing",
      "addnewroute",
      data.routeCode,
      "edit",
    ]);
  }

  cloneRoute(data: any) {
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
    console.log(reqStatus, this.linkedRouteCode, data["routeCode"]);
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
        `Do you wish to ` + type + ` the Bank Route: ${data["routeCode"]}?`;
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
    console.log(e.target, reqStatus);
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("routeCode", data["routeCode"]);
    formData.append("status", reqStatus);
    this.updateBankRouteStatus(formData, e.target, data);
  }

  updateBankRouteStatus(formData: any, sliderElm: any, routeData: any) {
    this.bankRoutingService.updateBankRouteStatus(formData).subscribe((res) => {
      let message = "";
      if (res["error"] == "true") {
        this.coreService.removeLoadingScreen();
        message = `Kindly deactivate the Route code: ${res["msg"]} ( ${routeData["criteriaMap"]} ) to activate the current record.`;
        this.coreService.showWarningToast(message);
      } else {
        if (res["msg"]) {
          message = res["msg"];
          sliderElm.checked = sliderElm!.checked;
          this.getBanksRoutingData(this.userData.userId);
          this.coreService.showSuccessToast(message);
        } else {
          this.coreService.removeLoadingScreen();
          message = "Something went wrong, Please try again later";
          this.coreService.showWarningToast(message);
        }
      }
    });
  }

  getBanksRoutingData(id: string) {
    this.getDecodedDataForListing(this.userData.userId);
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
    console.log(field);
    this[`selectedFilter${field}`] = ms.value;
    console.log(ms.value, this[`selectedFilter${field}`]);
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }
}
