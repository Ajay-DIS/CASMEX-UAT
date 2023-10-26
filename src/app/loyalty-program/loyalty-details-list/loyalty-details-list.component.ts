import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoyaltyService } from "../loyalty.service";
import { ConfirmationService } from "primeng/api";
import { CoreService } from "src/app/core.service";
import { HttpClient } from "@angular/common/http";
import { MultiSelect } from "primeng/multiselect";
import { Observable } from "rxjs";

@Component({
  selector: "app-loyalty-details-list",
  templateUrl: "./loyalty-details-list.component.html",
  styleUrls: ["./loyalty-details-list.component.scss"],
})
export class LoyaltyDetailsListComponent implements OnInit {
  showcustomerCodeOptions: boolean = false;
  showcustomerNameOptions: boolean = false;
  showredeemDateOptions: boolean = false;
  showmobileNumberOptions: boolean = false;
  showpromotionRedeemedOptions: boolean = false;
  showpromotionDetailsOptions: boolean = false;
  // showtotalBenificiaryOptions: boolean = false;
  // showstatusOptions: boolean = false;

  selectedFiltercustomerCode: any[] = [];
  selectedFiltercustomerName: any[] = [];
  selectedFilterredeemDate: any[] = [];
  selectedFiltermobileNumber: any[] = [];
  selectedFilterpromotionRedeemed: any[] = [];
  selectedFilterpromotionDetails: any[] = [];
  // selectedFiltertotalBenificiary: any[] = [];
  // selectedFilterstatus: any[] = [];

  customerCode = [];
  customerName = [];
  mobileNumber = [];
  redeemDate = [];
  promotionRedeemed = [];
  promotionDetails = [];

  userData: any = {};

  loyaltyListData: any = [];

  pageNumber = 0;
  pageSize = 10;
  totalPages = 5;
  totalRecords = 0;
  sortBy = "id";
  orderBy = "DESC";

  criteriaMap = "NA";

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private loyaltyService: LoyaltyService,
    private http: HttpClient
  ) {}

  cols: any[] = [
    { field: "customerCode", header: "Customer Code", width: "10%" },
    {
      field: "customerName",
      header: "Customer Name",
      width: "30%",
    },
    { field: "mobileNumber", header: "Mobile Number", width: "15%" },
    { field: "redeemDate", header: "Redeem Date", width: "15%" },
    { field: "promotionRedeemed", header: "Promotion Redeemed", width: "15%" },
    { field: "promotionDetails", header: "Promotion Details", width: "15%" },
  ];

  sortOrder: any = {
    customerCode: 0,
    customerName: 0,
    mobileNumber: 0,
    redeemDate: 0,
    promotionRedeemed: 0,
    promotionDetails: 0,
  };
  copySortOrder: any = {
    customerCode: 0,
    customerName: 0,
    mobileNumber: 0,
    redeemDate: 0,
    promotionRedeemed: 0,
    promotionDetails: 0,
  };

  searchField = "Customer ID";

  // totalRecords = 55;
  customerTableLoading = false;
  globalSearch = false;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));

    // this.getLoyaltyCustomerListData(this.criteriaMap);
  }

  loadCustomers(e: any) {
    // this.resetSortIcons();
    if (!this.globalSearch) {
      this.pageNumber = e.first ? e.first / this.pageSize + 1 : 1;
      console.log(
        "::event, pageSize, pageNumber",
        e,
        this.pageSize,
        this.pageNumber
      );
      let updatedCriteriaMap = this.criteriaMap;
      if (e.rows) {
        this.pageSize = e.rows;
      }
      if (e.sortField) {
        if (e.sortOrder == 1) {
          this.orderBy = "DESC";
        } else {
          this.orderBy = "ASC";
        }
        switch (e.sortField) {
          case "customerCode":
            this.sortBy = "customerCode";
            break;
          case "customerName":
            this.sortBy = "customerName";
            break;
          case "mobileNumber":
            this.sortBy = "mobileNumber";
            break;
          case "redeemDate":
            this.sortBy = "redeemDate";
            break;
          case "promotionRedeemed":
            this.sortBy = "promotionRedeemed";
            break;
          case "promotionDetails":
            this.sortBy = "promotionDetails";
            break;

          default:
            this.sortBy = "customerCode";
            break;
        }
      } else {
        this.sortBy = "customerCode";
        this.orderBy = "DESC";
      }
      if (e.filters && Object.keys(e.filters).length > 0) {
        let filterCrtMap = "";
        for (const prop in e.filters) {
          switch (prop) {
            case "customerCode":
              filterCrtMap = `customerCode = ${e.filters[prop]["value"]}`;
              break;
            case "customerName":
              filterCrtMap = `customerName = ${e.filters[prop]["value"]}`;
              break;
            case "mobileNumber":
              filterCrtMap = `contactMobileNumber = ${e.filters[prop]["value"]}`;
              break;
            case "redeemDate":
              filterCrtMap = `redeemDate = ${e.filters[prop]["value"]}`;
              break;
            case "promotionRedeemed":
              filterCrtMap = `promotionRedeemed = ${e.filters[prop]["value"]}`;
              break;
            case "promotionDetails":
              filterCrtMap = `promotionDetails = ${e.filters[prop]["value"]}`;
              break;

            default:
              filterCrtMap = "";
              break;
          }
          if (updatedCriteriaMap?.length && updatedCriteriaMap != "NA") {
            if (filterCrtMap?.length) {
              updatedCriteriaMap += `;${filterCrtMap}`;
            }
          } else {
            updatedCriteriaMap = filterCrtMap;
          }
        }
        console.log("updatedCriteriaMap", updatedCriteriaMap);
        this.getLoyaltyCustomerListData(updatedCriteriaMap);
      } else {
        this.getLoyaltyCustomerListData(this.criteriaMap);
      }
    }
    this.sortBy = "customerCode";
    this.orderBy = "DESC";
    this.globalSearch = false;
  }

  getLoyaltyCustomerListData(criteriaMap: any) {
    this.coreService.displayLoadingScreen();
    let service: Observable<any>;

    console.log(
      "::header",
      this.userData["userId"],
      criteriaMap,
      `${this.pageNumber}`,
      `${this.pageSize}`,
      this.sortBy,
      this.orderBy
    );
    service = this.loyaltyService.getCustomerLoyaltyDetailsData(
      (this.userData["userId"] = "Yogeshm"),
      criteriaMap,
      `${this.pageNumber}`,
      `${this.pageSize}`,
      this.sortBy,
      this.orderBy
    );

    service.subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (res["status"] == "200") {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
            this.loyaltyListData = [];
          } else {
            this.loyaltyListData = res.data?.CmCustomerLoyaltyProgramDetails;
            this.totalPages = res.data?.TotalPages;
            this.totalRecords = res.data?.TotalCount;
            // this.totalRecords = res.data.PaginationDetails.totalCount;
            // this.customerCode = res.customerCode?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.fullName = res.customerFullName?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.nationality = res.nationality?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.mobileNumber = res.mobileNumber?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.idType = res.idType?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            // this.idNumber = res.idNumber?.map((code) => {
            //   if (code) return { label: code, value: code };
            // });
            if (this.loyaltyListData) {
              this.loyaltyListData.forEach((data) => {
                data["promotionDetails"] = data["promotionDetails"]
                  .split("#")
                  .join("\n");
              });
            }
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        // this.coreService.showWarningToast("Error in fething data");
      }
    );
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
