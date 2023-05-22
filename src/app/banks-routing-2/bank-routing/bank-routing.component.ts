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
import { MessageService, TreeNode } from "primeng/api";

@Component({
  selector: "app-bank-routing",
  templateUrl: "./bank-routing.component.html",
  styleUrls: ["./bank-routing.component.scss"],
  providers: [DialogService, MessageService],
})
export class BankRoutingComponent2 implements OnInit {
  constructor(
    private router: Router,
    private bankRoutingService: BankRoutingService,
    private coreService: CoreService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private route: ActivatedRoute
  ) {}
  @ViewChild("dt") table: Table;
  @ViewChild("statusInp") statusInp: HTMLInputElement;

  showRouteCodesOptions: boolean = false;
  showCountriesOptions: boolean = false;
  showRouteBankNamesOptions: boolean = false;
  showRouteServiceTypesOptions: boolean = false;
  showRouteServiceCategoriesOptions: boolean = false;
  showRouteToBankNamesOptions: boolean = false;
  showRouteToServiceTypesOptions: boolean = false;
  showRouteToServiceCategoriesOptions: boolean = false;
  showISCorrespondentsOptions: boolean = false;
  showStatusesOptions: boolean = false;

  bankRoutingApiData: BankRoutingApiData;

  bankRoutingData: BankRouting[];

  routeCode: any[] = [
    { label: "code1", value: "code1" },
    { label: "code2", value: "code2" },
    { label: "code3", value: "code3" },
    { label: "code4", value: "code4" },
  ];
  country: any[];
  routeBankName: any[];
  routeServiceType: any[];
  routeServiceCategory: any[];
  routeToBankName: any[];
  routeToServiceType: any[];
  routeToServiceCategory: any[];
  iSCorrespondent: any[];
  status: any[];

  userData: UserData;

  noDataMsg: string = "Banks Routing Data Not Available";

  selectedFilterrouteCode: any[] = [];
  selectedFiltercountry: any[] = [];
  selectedFilterrouteBankName: any[] = [];
  selectedFilterrouteServiceCategory: any[] = [];
  selectedFilterrouteServiceType: any[] = [];
  selectedFilteriSCorrespondent: any[] = [];
  selectedFilterrouteToBankName: any[] = [];
  selectedFilterrouteToServiceCategory: any[] = [];
  selectedFilterrouteToServiceType: any[] = [];
  selectedFilterstatus: any[] = [];

  loading = true;

  // grouping
  bankRoutesGroups: { groupID: string; routes: BankRouting[] }[] = [];
  // grouping end

  // treetable
  objectKeys = Object.keys;
  cols = [
    { field: "routeCode", header: "Route Code", width: "4%" },
    { field: "country", header: "Country", width: "4%" },
    { field: "routeBankName", header: "Bank Routing", width: "4%" },
    { field: "routeServiceCategory", header: "Service Category", width: "4%" },
    { field: "routeServiceType", header: "Service Type", width: "4%" },
    { field: "iSCorrespondent", header: "Is Correspondent", width: "4%" },
    { field: "routeToBankName", header: "Route To", width: "4%" },
    {
      field: "routeToServiceCategory",
      header: "Service Category",
      width: "4%",
    },
    { field: "routeToServiceType", header: "Service Type", width: "4%" },
    { field: "status", header: "Status", width: "4%" },
  ];

  // treetable end

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    this.getBanksRoutingData(this.userData.userId);
  }

  viewBankRouting(data: any) {
    this.router.navigate([
      "navbar",
      "bank-routing",
      "addnewroute",
      data.groupID,
    ]);
  }

  updateStatus(e: any, bankRoute: string) {
    this.coreService.displayLoadingScreen();
    e.preventDefault();

    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Active";
    } else {
      reqStatus = "Inactive";
    }

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("routeCode", bankRoute);
    formData.append("status", reqStatus);
    this.updateBankRouteStatus(formData, e.target);
  }

  updateBankRouteStatus(data: any, sliderElm: any) {
    this.bankRoutingService.updateBankRouteStatus(data).subscribe((res) => {
      if (res["msg"]) {
        sliderElm.checked = sliderElm!.checked;
        this.coreService.showSuccessToast(res["msg"]);
        this.getBanksRoutingData(this.userData.userId);
      }
    });
  }

  getBanksRoutingData(id: string) {
    this.bankRoutingService.getBankRoutingData(id).subscribe(
      (res) => {
        console.log("::bankRoutingDataApi", res);
        if (res["data"]) {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          this.bankRoutingApiData = res as BankRoutingApiData;
          this.bankRoutingApiData.data.forEach((route) => {
            route.createdDate = new Date(route.createdDate);
          });

          // % Before grouping
          this.bankRoutingData = [...this.bankRoutingApiData.data];
          // % Before grouping end
          // .sort(
          //   (a, b) => a.createdDate - b.createdDate
          // );
          this.routeCode = this.bankRoutingApiData.routeCode.map((code) => {
            return { label: code, value: code };
          });
          this.country = this.bankRoutingApiData.country.map((code) => {
            return { label: code, value: code };
          });
          this.routeBankName = this.bankRoutingApiData.routeBankName.map(
            (code) => {
              return { label: code, value: code };
            }
          );
          this.routeServiceType = this.bankRoutingApiData.routeServiceType.map(
            (code) => {
              return { label: code, value: code };
            }
          );
          this.routeServiceCategory =
            this.bankRoutingApiData.routeServiceCategory.map((code) => {
              return { label: code, value: code };
            });
          this.routeToBankName = this.bankRoutingApiData.routeToBankName.map(
            (code) => {
              return { label: code, value: code };
            }
          );
          this.routeToServiceType =
            this.bankRoutingApiData.routeToServiceType.map((code) => {
              return { label: code, value: code };
            });
          this.routeToServiceCategory =
            this.bankRoutingApiData.routeToServiceCategory.map((code) => {
              return { label: code, value: code };
            });
          this.iSCorrespondent = this.bankRoutingApiData.iSCorrespondent.map(
            (code) => {
              return { label: code, value: code };
            }
          );
          this.status = this.bankRoutingApiData.status.map((code) => {
            return { label: code, value: code };
          });
        } else {
          this.noDataMsg = res["msg"];
          this.loading = false;
          this.coreService.removeLoadingScreen();
        }
      },
      (err) => {
        console.log(err);
        this.loading = false;
        this.coreService.removeLoadingScreen();
      }
    );
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
    console.log(ms.value, this[`selectedFilter${field}`]);
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }
}
