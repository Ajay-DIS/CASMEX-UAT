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
import { ToastrService } from "ngx-toastr";

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
    private ngxToaster: ToastrService,
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

  // dummyBankRoutingData = {
  //   routeCode: ["R0006", "R0007", "R0001", "R0004", "R0005", "R0002", "R0003"],
  //   country: ["India234", "India2", "India23", "India2344", "India"],
  //   routeToBankName: ["SBI12344", "SBI1", "SBI", "SBI12", "SBI1234", "SBI123"],
  //   data: [
  //     {
  //       id: 7,
  //       userID: "yogeshm",
  //       routeCode: "R0001",
  //       country: "India",
  //       routeBankName: "ICICI10",
  //       routeServiceCategory: "DF11",
  //       routeServiceType: "Cash",
  //       iSCorrespondent: "Yes",
  //       routeToBankName: "SBI",
  //       routeToServiceCategory: "NFT",
  //       routeToServiceType: "NFT",
  //       createdDate: "2023-02-15T08:44:15.987+00:00",
  //       status: "Active",
  //       updatedBy: "Ajay",
  //       updatedDate: "2023-02-15T12:28:48.559+00:00",
  //       criteriaMap: "11",
  //       routeDesc: "d1",
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //     {
  //       id: 8,
  //       userID: "yogeshm",
  //       routeCode: "R0002",
  //       country: "India",
  //       routeBankName: "ICICI",
  //       routeServiceCategory: "DF1",
  //       routeServiceType: "Cash",
  //       iSCorrespondent: "Yes",
  //       routeToBankName: "SBI",
  //       routeToServiceCategory: "NFT",
  //       routeToServiceType: "NFT",
  //       createdDate: "2023-02-15T08:44:18.596+00:00",
  //       status: "Inactive",
  //       updatedBy: "Ajay",
  //       updatedDate: "2023-02-15T12:28:48.568+00:00",
  //       criteriaMap: "22",
  //       routeDesc: "d2",
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //     {
  //       id: 11,
  //       userID: "yogeshm",
  //       routeCode: "R0005",
  //       country: "India23",
  //       routeBankName: "ICICI1023",
  //       routeServiceCategory: "DF1123",
  //       routeServiceType: "Cash213",
  //       iSCorrespondent: "Yes213",
  //       routeToBankName: "SBI123",
  //       routeToServiceCategory: "NFT123",
  //       routeToServiceType: "NFT213",
  //       createdDate: "2023-02-16T06:31:23.054+00:00",
  //       status: "Active",
  //       updatedBy: null,
  //       updatedDate: null,
  //       criteriaMap: null,
  //       routeDesc: null,
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //     {
  //       id: 12,
  //       userID: "yogeshm",
  //       routeCode: "R0006",
  //       country: "India234",
  //       routeBankName: "ICICI10234",
  //       routeServiceCategory: "DF11234",
  //       routeServiceType: "Cash2134",
  //       iSCorrespondent: "Yes2134",
  //       routeToBankName: "SBI1234",
  //       routeToServiceCategory: "NFT1234",
  //       routeToServiceType: "NFT2134",
  //       createdDate: "2023-02-16T06:31:36.623+00:00",
  //       status: "Inactive",
  //       updatedBy: null,
  //       updatedDate: null,
  //       criteriaMap: null,
  //       routeDesc: null,
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //     {
  //       id: 13,
  //       userID: "yogeshm",
  //       routeCode: "R0007",
  //       country: "India2344",
  //       routeBankName: "ICICI102344",
  //       routeServiceCategory: "DF112344",
  //       routeServiceType: "Cash21344",
  //       iSCorrespondent: "Yes21344",
  //       routeToBankName: "SBI12344",
  //       routeToServiceCategory: "NFT12344",
  //       routeToServiceType: "NFT21344",
  //       createdDate: "2023-02-16T06:31:49.309+00:00",
  //       status: "Inactive",
  //       updatedBy: null,
  //       updatedDate: null,
  //       criteriaMap: null,
  //       routeDesc: null,
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //     {
  //       id: 9,
  //       userID: "yogeshm",
  //       routeCode: "R0003",
  //       country: "India",
  //       routeBankName: "ICICI10",
  //       routeServiceCategory: "DF11",
  //       routeServiceType: "Cash1",
  //       iSCorrespondent: "Yes1",
  //       routeToBankName: "SBI1",
  //       routeToServiceCategory: "NFT1",
  //       routeToServiceType: "NFT1",
  //       createdDate: "2023-02-16T06:30:55.006+00:00",
  //       status: "Active",
  //       updatedBy: null,
  //       updatedDate: null,
  //       criteriaMap: null,
  //       routeDesc: null,
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //     {
  //       id: 10,
  //       userID: "yogeshm",
  //       routeCode: "R0004",
  //       country: "India2",
  //       routeBankName: "ICICI102",
  //       routeServiceCategory: "DF112",
  //       routeServiceType: "Cash21",
  //       iSCorrespondent: "Yes21",
  //       routeToBankName: "SBI12",
  //       routeToServiceCategory: "NFT12",
  //       routeToServiceType: "NFT21",
  //       createdDate: "2023-02-16T06:31:08.691+00:00",
  //       status: "Active",
  //       updatedBy: null,
  //       updatedDate: null,
  //       criteriaMap: null,
  //       routeDesc: null,
  //       lcyAmountFrom: null,
  //       lcyAmountTo: null,
  //     },
  //   ],
  //   routeBankName: [
  //     "ICICI",
  //     "ICICI10234",
  //     "ICICI102",
  //     "ICICI102344",
  //     "ICICI10",
  //     "ICICI1023",
  //   ],
  //   routeServiceType: [
  //     "Cash1",
  //     "Cash21",
  //     "Cash21344",
  //     "Cash2134",
  //     "Cash",
  //     "Cash213",
  //   ],
  //   routeServiceCategory: [
  //     "DF11234",
  //     "DF112344",
  //     "DF1123",
  //     "DF11",
  //     "DF1",
  //     "DF112",
  //   ],
  //   routeToServiceType: [
  //     "NFT1",
  //     "NFT213",
  //     "NFT21344",
  //     "NFT21",
  //     "NFT2134",
  //     "NFT",
  //   ],
  //   routeToServiceCategory: [
  //     "NFT1",
  //     "NFT12",
  //     "NFT12344",
  //     "NFT",
  //     "NFT123",
  //     "NFT1234",
  //   ],
  //   iSCorrespondent: ["Yes1", "Yes21", "Yes", "Yes2134", "Yes213", "Yes21344"],
  //   status: ["Active", "Inactive"],
  // };

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
    { field: "routeCode", header: "Route Code" ,width: "4%" },
    { field: "country", header: "Country",width: "4%"  },
    { field: "routeBankName", header: "Bank Routing" ,width: "4%" },
    { field: "routeServiceCategory", header: "Service Category",width: "4%"  },
    { field: "routeServiceType", header: "Service Type" ,width: "4%" },
    { field: "iSCorrespondent", header: "Is Correspondent" ,width: "4%"  },
    { field: "routeToBankName", header: "Route To" ,width: "4%"  },
    { field: "routeToServiceCategory", header: "Service Category" ,width: "4%" },
    { field: "routeToServiceType", header: "Service Type" ,width: "4%"  },
    { field: "status", header: "Status", width: "4%" },
  ];

  // treetable end

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.coreService.displayLoadingScreen();
    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    this.getBanksRoutingData(this.userData.userId);
  }

  viewBankRouting(data: any) {
    this.router.navigate([
      "navbar",
      "bank-routing-2",
      "addnewroute",
      data.routeCode,
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
        this.ngxToaster.success(res["msg"]);
        this.getBanksRoutingData(this.userData.userId);
      }
    });
  }

  getBanksRoutingData(id: string) {
    this.bankRoutingService
      .getBankRoutingData(id)
      .subscribe(
        (res) => {
          console.log("::bankRoutingDataApi", res);
          if (res["data"]) {
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
            this.routeServiceType =
              this.bankRoutingApiData.routeServiceType.map((code) => {
                return { label: code, value: code };
              });
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
          }
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.loading = false;
        this.coreService.removeLoadingScreen();
      });
  }
  addNewRoutePage() {
    this.router.navigate(["navbar", "bank-routing-2", "addnewroute"]);
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
