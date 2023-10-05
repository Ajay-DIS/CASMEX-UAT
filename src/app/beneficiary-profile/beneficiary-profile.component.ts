import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmDialog } from "primeng/confirmdialog";
import { CoreService } from "../core.service";
import { ConfirmationService } from "primeng/api";
import { CustomerProfileService } from "../customer-profile/customer-profile.service";
import { Observable } from "rxjs";
import { MultiSelect } from "primeng/multiselect";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-beneficiary-profile",
  templateUrl: "./beneficiary-profile.component.html",
  styleUrls: ["./beneficiary-profile.component.scss"],
})
export class BeneficiaryProfileComponent implements OnInit {
  showcustomerCodeOptions: boolean = false;
  showfullNameOptions: boolean = false;
  shownationalityOptions: boolean = false;
  showmobileNumberOptions: boolean = false;
  showidTypeOptions: boolean = false;
  showidNumberOptions: boolean = false;
  // showtotalBenificiaryOptions: boolean = false;
  showstatusOptions: boolean = false;

  customerCode = [];
  fullName = [];
  nationality = [];
  mobileNumber = [];
  idType = [];
  idNumber = [];
  totalBenificiary = [];
  status = [];

  userData: any = {};
  selectedFiltercustomerCode: any[] = [];
  selectedFilterfullName: any[] = [];
  selectedFilternationality: any[] = [];
  selectedFiltermobileNumber: any[] = [];
  selectedFilteridType: any[] = [];
  selectedFilteridNumber: any[] = [];
  // selectedFiltertotalBenificiary: any[] = [];
  selectedFilterstatus: any[] = [];

  loading: boolean = true;

  noDataMsg: string = "Form Rule Data Not Available";

  showTable = false;

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  formName = null;
  applicationName = "Casmex Core";
  moduleName = "Remittance";
  pageNumber = "0";
  pageSize = "10";

  linkedFormRuleCode: any = [];
  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private customerService: CustomerProfileService,
    private http: HttpClient
  ) {}

  customerType = "";
  customerFieldType = "";
  criteriaTypechange = "";
  type = "Individual";

  criteriaType: any = "text";

  customerData: any = [];
  userTypeOptions = [
    { name: "Individual", code: "Individual" },
    { name: "Corporate", code: "Corporate" },
  ];

  searchCriteriaApiData = [];

  searchCriteriaOptions = [];
  searchCriteria = [];
  currentCriteriaKey = "";
  currentCriteriaValue = "";
  currentCriteria = "";

  currentCriteriaMapKey = "";
  searchCriteriaMap = [];
  currentCriteriaMap = "";
  criteriaMap = "NA";
  cols = [];

  colsIND: any[] = [
    { field: "customerCode", header: "Customer Code" },
    { field: "fullName", header: "Customer Full Name" },
    { field: "nationality", header: "Nationality" },
    { field: "mobileNumber", header: "Mobile Number" },
    { field: "idType", header: "ID Type" },
    { field: "idNumber", header: "ID Number" },
    { field: "beneficialCount", header: "Total Benf", width: "8%" },
    { field: "addBenificiary", header: "Add Benf" },
    // { field: "pastTxns", header: "Past Txns",  },
    { field: "status", header: "Profile Status" },
  ];
  colsCOR: any[] = [
    { field: "customerCode", header: "Customer Code", width: "8%" },
    { field: "fullName", header: "Customer Full Name", width: "15%" },
    { field: "nationality", header: "Nationality", width: "15%" },
    { field: "mobileNumber", header: "Mobile Number", width: "15%" },
    { field: "idType", header: "ID Type", width: "8%" },
    { field: "idNumber", header: "ID Number", width: "15%" },
    { field: "beneficialCount", header: "Total Benf", width: "8%" },
    { field: "addBenificiary", header: "Add Benf", width: "8%" },
    // { field: "pastTxns", header: "Past Txns", width: "8%" },
    { field: "status", header: "Profile Status", width: "8%" },
  ];

  totalRecords = 55;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.formName = "Customer Profile";
    this.getApiDataForsearchCriteria();
    this.getCustomerListData();
    this.currentCriteriaMapKey = "customerId = ";
    this.currentCriteriaKey = "Customer ID = ";
    this.cols = this.colsIND;
  }

  loadCustomers(e: any) {
    const pageSize = 10;
    const pageNumber = e.first ? e.first / +this.pageSize + 1 : 1;
    console.log("::lazy event", e);
    console.log("::pageSize", pageSize);
    console.log("::pageNumber", pageNumber);
  }

  getApiDataForsearchCriteria() {
    this.coreService.displayLoadingScreen();
    this.customerService
      .getDataForsearchCriteria(
        this.userData["userId"],
        this.applicationName,
        this.moduleName,
        this.formName
      )
      .subscribe(
        (res) => {
          // this.coreService.removeLoadingScreen();
          console.log(res);
          this.searchCriteriaApiData = res["data"];
          console.log(this.searchCriteriaApiData);
          this.searchCriteriaOptions = this.searchCriteriaApiData.map(
            (data) => {
              return { name: data.displayName, code: data.fieldName };
            }
          );
          this.searchCriteriaOptions.unshift(
            ...[{ name: "Customer ID", code: "customerId" }]
          );
        },
        (err) => {
          // this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast("Error in fething data");
        }
      );
  }
  onUserTypeChange(value: any) {
    console.log(value);

    this.formName = "Customer Profile";
    this.type = value;
    console.log(this.formName);
    this.criteriaMap = "NA";
    this.searchCriteria = [];
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = "Customer ID = ";
    this.currentCriteriaMapKey = "customerId = ";
    this.searchCriteriaMap = [];
    this.getApiDataForsearchCriteria();
    this.getCustomerListData();
    this.customerFieldType = null;
  }

  onCriteriaChange(value: any) {
    console.log(value);
    this.criteriaTypechange = value;
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = `${
      this.searchCriteriaOptions.filter((opt) => {
        return opt.code == value;
      })[0]["name"]
    } = `;
    this.currentCriteriaMapKey = `${
      this.searchCriteriaOptions.filter((opt) => {
        return opt.code == value;
      })[0]["code"]
    } = `;
    this.criteriaType = this.searchCriteriaApiData.filter((opt) => {
      return opt.fieldName == value;
    })[0].criteriaType;
    console.log(this.currentCriteriaKey);
    console.log(this.currentCriteriaMapKey);
  }
  ondeletecriteria(i: any, criteria: any) {
    this.searchCriteria.splice(i, 1);
    console.log(i);
    console.log(criteria);
    this.searchCriteriaMap.splice(i, 1);
    this.criteriaMap = this.searchCriteriaMap.join(";");
    console.log(this.criteriaMap);
    this.criteriaMap = "NA";
    this.getCustomerListData();
  }
  searchCustomerMap(type: any) {
    console.log(typeof this.currentCriteriaValue);
    console.log("::", this.criteriaTypechange);

    console.log("::", this.currentCriteriaMapKey);
    console.log("::", this.searchCriteriaMap);
    console.log(
      "::",
      this.searchCriteriaMap.filter((crt) => {
        return (
          crt.split(" = ")[0] == this.currentCriteriaMapKey.split(" = ")[0]
        );
      })
    );

    if (
      this.searchCriteriaMap.filter((crt) => {
        return (
          crt.split(" = ")[0] == this.currentCriteriaMapKey.split(" = ")[0]
        );
      }).length > 0
    ) {
      this.coreService.showWarningToast("field already exits");
    } else {
      if (
        this.currentCriteriaValue == null ||
        this.currentCriteriaValue == ""
      ) {
        this.coreService.showWarningToast("please enter the value");
      } else if (
        (typeof this.currentCriteriaValue == "string" &&
          this.currentCriteriaValue?.trim().length) ||
        this.currentCriteriaValue
      ) {
        this.currentCriteria =
          this.currentCriteriaKey + this.currentCriteriaValue;
        console.log(this.currentCriteria);
        this.searchCriteria.push(this.currentCriteria);

        this.currentCriteriaMap =
          this.currentCriteriaMapKey + this.currentCriteriaValue;
        console.log(this.currentCriteriaMap);
        this.searchCriteriaMap.push(this.currentCriteriaMap);
        this.criteriaMap = this.searchCriteriaMap.join(";");
        console.log(this.criteriaMap);
      }
    }

    this.getCustomerListData();
    this.currentCriteriaValue = null;
    this.customerFieldType = null;
    this.currentCriteriaKey = "Customer ID = ";
    this.currentCriteriaMapKey = "customerId = ";
  }

  getCustomerListData() {
    // console.log(this.searchCriteria);
    // this.coreService.displayLoadingScreen();
    // console.log(this.type);
    // this.showTable = false;
    // let service: Observable<any>;
    // // if (this.type == "Corporate") {
    // service = this.customerService.getCustomerCorporateData(
    //   this.userData["userId"],
    //   this.criteriaMap,
    //   this.pageNumber,
    //   this.pageSize,
    //   this.type
    // );
    // // } else {
    // //   service = this.customerService.getCustomerIndividualData(
    // //     this.userData["userId"],
    // //     this.criteriaMap,
    // //     this.pageNumber,
    // //     this.pageSize
    // //   );
    // // }
    // service.subscribe(
    //   (res) => {
    //     console.log(res);
    //     if (res["status"] == "200") {
    //       this.showTable = true;
    //       this.coreService.removeLoadingScreen();
    //       if (this.type == "Corporate") {
    //         this.cols = this.colsCOR;
    //         this.customerData = res.data.CmCorporateCustomerDetails;
    //       } else {
    //         this.cols = this.colsIND;
    //         this.customerData = res.data.CmCorporateCustomerDetails;
    //         this.customerData?.forEach((element) => {
    //           element["orders"] = [];
    //         });
    //         console.log("customer dataa indi", this.customerData);
    //       }
    //       // this.totalRecords = res.data.PaginationDetails.totalCount;
    //       this.customerCode = res.customerCode?.map((code) => {
    //         if (code) return { label: code, value: code };
    //       });
    //       this.fullName = res.customerFullName?.map((code) => {
    //         if (code) return { label: code, value: code };
    //       });
    //       this.nationality = res.nationality?.map((code) => {
    //         if (code) return { label: code, value: code };
    //       });
    //       this.mobileNumber = res.mobileNumber?.map((code) => {
    //         if (code) return { label: code, value: code };
    //       });
    //       this.idType = res.idType?.map((code) => {
    //         if (code) return { label: code, value: code };
    //       });
    //       this.idNumber = res.idNumber?.map((code) => {
    //         if (code) return { label: code, value: code };
    //       });
    //     }
    //   },
    //   (err) => {
    //     this.coreService.removeLoadingScreen();
    //     // this.coreService.showWarningToast("Error in fething data");
    //     this.showTable = false;
    //   }
    // );
  }
  addNewBeneficiary(rowData: any, type: any) {
    this.router.navigate([
      "navbar",
      "beneficiary-profile",
      "addnewbeneficiary",
      type,
      rowData.customerCode,
      "add",
    ]);
  }
  confirmStatus(e: any, data: any, cusType: any) {
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
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the Customer Record: ${data["customerCode"]}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, data, cusType);
        this.setHeaderSidebarBtn(true);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn(false);
      },
    });
  }

  confirmBeneficiaryStatus(e: any, data: any, cusType: any) {
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
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the Beneficiary Record: ${data["id"]}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateBeneStatus(e, reqStatus, data, cusType);
        this.setHeaderSidebarBtn(true);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn(false);
      },
    });
  }

  updateBeneStatus(e: any, reqStatus: any, data: any, cusType: any) {
    this.coreService.displayLoadingScreen();
    console.log(data);
    this.updateBeneficiaryStatus(
      data["id"],
      reqStatus,
      e.target,
      data,
      cusType
    );
  }
  updateBeneficiaryStatus(
    cusId: any,
    status: any,
    sliderElm: any,
    ruleData: any,
    cusType: any
  ) {
    let service: Observable<any>;
    console.log(this.userData);
    // if (cusType == "Corporate") {
    service = this.customerService.updateBeneficiaryStatusApi(
      this.userData["userId"],
      status,
      cusId.toString(),
      cusType
    );
    // } else {
    //   service = this.customerService.updateCustomerIndividualStatus(
    //     this.userData["userId"],
    //     status,
    //     cusId.toString()
    //   );
    // }
    service.subscribe(
      (res) => {
        console.log(res);
        if (res["status"] == "200") {
          sliderElm.checked = sliderElm!.checked;
          this.searchCustomerMap(this.customerType);
          this.coreService.showSuccessToast(res["data"]);
        } else {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(res["msg"]);
        }
      },
      (err) => {
        console.log(err);
        this.coreService.removeLoadingScreen();
      }
    );
  }
  updateStatus(e: any, reqStatus: any, data: any, cusType: any) {
    this.coreService.displayLoadingScreen();
    console.log(data);
    this.updateCustomerStatus(
      data["customerCode"],
      reqStatus,
      e.target,
      data,
      cusType
    );
  }

  updateCustomerStatus(
    cusId: any,
    status: any,
    sliderElm: any,
    ruleData: any,
    cusType: any
  ) {
    let service: Observable<any>;
    console.log(this.userData);
    // if (cusType == "Corporate") {
    service = this.customerService.updateCustomerCorporateStatus(
      this.userData["userId"],
      status,
      cusId.toString(),
      cusType
    );
    // } else {
    //   service = this.customerService.updateCustomerIndividualStatus(
    //     this.userData["userId"],
    //     status,
    //     cusId.toString()
    //   );
    // }
    service.subscribe(
      (res) => {
        console.log(res);
        if (res["status"] == "200") {
          sliderElm.checked = sliderElm!.checked;
          this.searchCustomerMap(this.customerType);
          this.coreService.showSuccessToast(res["data"]);
        } else {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(res["msg"]);
        }
      },
      (err) => {
        console.log(err);
        this.coreService.removeLoadingScreen();
      }
    );
  }
  editCustomer(rowData: any, type: any) {
    this.router.navigate([
      "navbar",
      "customer-profile",
      "addnewcustomer",
      type,
      rowData.customerCode,
      "edit",
    ]);
  }
  editbeneficiary(beneData: any) {
    let custype = beneData.customerType == "Individual" ? "IND" : "COR";
    this.router.navigate([
      "navbar",
      "beneficiary-profile",
      "addnewbeneficiary",
      custype,
      beneData.id,
      "edit",
    ]);
  }
  beneficiaryListData(expanded, rowData: any, customerType) {
    console.log("expanded", expanded);
    console.log("customerType", customerType);
    console.log("customerCode", rowData.customerCode);
    if (expanded == false) {
      this.http
        .get(
          `/remittance/beneficiaryProfileController/getBeneficiaryProfileList`,
          {
            headers: new HttpHeaders()
              .set("customerType", customerType)
              .set("customerId", String(rowData.customerCode)),
          }
        )
        .subscribe(
          (res) => {
            if (res["msg"]) {
              this.noDataMsg = res["msg"];
              this.coreService.removeLoadingScreen();
            } else {
              console.log("respose", res);
              this.customerData.forEach((element) => {
                if (element["customerCode"] == rowData.customerCode) {
                  element["orders"] = res["data"];
                }
                console.log("orders", element["orders"]);
              });
            }
          },
          (err) => {
            console.log("err", err);
            this.coreService.showWarningToast(
              "Some error while fetching data, Try again in sometime"
            );
            this.coreService.removeLoadingScreen();
          }
        );
    }
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

  clearCriteria() {
    this.criteriaMap = "NA";
    this.searchCriteria = [];
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = "Customer ID = ";
    this.currentCriteriaMapKey = "id = ";
    this.searchCriteriaMap = [];
    this.getApiDataForsearchCriteria();
    this.getCustomerListData();
    this.customerFieldType = null;
  }

  searchByEnter(e: any) {
    if (this.customerType) {
      this.searchCustomerMap(this.customerType);
    } else {
      this.coreService.showWarningToast("Please select customer type");
    }
  }
}
