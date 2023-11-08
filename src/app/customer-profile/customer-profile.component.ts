import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "../core.service";
import { CustomerProfileService } from "./customer-profile.service";
import { MultiSelect } from "primeng/multiselect";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { Observable, forkJoin } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-customer-profile",
  templateUrl: "./customer-profile.component.html",
  styleUrls: ["./customer-profile.component.scss"],
})
export class CustomerProfileComponent implements OnInit {
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
  pageNumber = 1;
  pageSize = 10;
  totalPages = 5;
  totalRecords = 0;
  sortBy = "id";
  orderBy = "DESC";

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

  columns: any[] = [
    {
      field: "customerCode",
      header: "Customer Code",
      width: "10%",
      searchWidth: "120px",
    },
    {
      field: "fullName",
      header: "Customer Full Name",
      width: "36%",
      searchWidth: "100%",
    },
    // { field: "nationality", header: "Nationality" },
    {
      field: "mobileNumber",
      header: "Mobile Number",
      width: "10%",
      searchWidth: "120px",
    },
    { field: "idType", header: "ID Type", width: "8%", searchWidth: "120px" },
    {
      field: "idNumber",
      header: "ID Number",
      width: "8%",
      searchWidth: "120px",
    },
    {
      field: "beneficialCount",
      header: "Total Benf",
      width: "7%",
      searchWidth: "85px",
    },
    {
      field: "addBenificiary",
      header: "Add Benf",
      width: "7%",
    },
    {
      field: "pastTxns",
      header: "Past Txns",
      width: "7%",
    },
    {
      field: "status",
      header: "Profile Status",
      width: "7%",
    },
  ];

  sortOrder: any = {
    customerCode: 0,
    fullName: 0,
    nationality: 0,
    mobileNumber: 0,
    idType: 0,
    idNumber: 0,
    beneficialCount: 0,
    status: 0,
  };
  copySortOrder: any = {
    customerCode: 0,
    fullName: 0,
    nationality: 0,
    mobileNumber: 0,
    idType: 0,
    idNumber: 0,
    beneficialCount: 0,
    status: 0,
  };

  documentSettingData: any[] = [];

  primaryId = "NA";

  searchField = "Customer ID";

  // totalRecords = 55;
  customerTableLoading = false;
  globalSearch = true;

  docIdOptions: any[] = [];
  docIdSelected: any = {};

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.formName = "Customer Profile";
    this.getApiDataForsearchCriteria();
    // this.getCustomerListData(this.criteriaMap);
    this.currentCriteriaMapKey = "id = ";
    this.currentCriteriaKey = "Customer ID = ";
  }

  getDocSettingData() {
    this.http
      .get(`remittance/documentSettingsController/getDocumentSetting`, {
        headers: new HttpHeaders()
          .set("criteriaMap", "Country = IN;Form = Customer Profile")
          .set("form", "Document Settings")
          .set("moduleName", "Remittance")
          .set("applications", "Casmex Core"),
      })
      .subscribe(
        (res) => {
          console.log("DOC DATA", res);
          if (res["TaxSettingData"]) {
            this.documentSettingData = res["TaxSettingData"];
          } else {
            this.currentCriteria = "";
            this.currentCriteriaMapKey = "";
          }
          if (this.documentSettingData.length) {
            this.docIdOptions = [];
            this.documentSettingData.forEach((doc) => {
              let isPrime = doc.IsDefault == "true" ? true : false;
              let docId = {
                name: doc["Document"],
                code: `documentType = ${doc["Document"]}`,
                isPrime: isPrime,
              };
              this.docIdOptions.push(docId);
              if (isPrime) {
                this.docIdSelected = docId;
                this.currentCriteria = `ID Type = ${docId.name}`;
                this.currentCriteriaMapKey = `documentType = ${docId.name}`;
              }
            });
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching doc data, Try again in sometime"
          );
        }
      );
  }

  onDocIdChange(e: any) {
    console.log(e);

    if (e.value && e.value?.split(" = ")[1]) {
      this.criteriaMap = e.value;
      this.currentCriteria = `ID Type = ${e.value.split(" = ")[1]}`;
      this.currentCriteriaMapKey = `documentType = ${e.value.split(" = ")[1]}`;
    }
  }

  // resetSortIcons() {
  //   const allSortIcons = document.querySelectorAll(".sort-icon");
  //   if (allSortIcons.length) {
  //     allSortIcons.forEach((icon) => {
  //       icon.classList.add("pi-sort-alt");
  //       icon.classList.remove("pi-sort-amount-up");
  //       icon.classList.remove("pi-sort-amount-down");
  //     });
  //   }
  // }

  // customSort(e: any, field: any) {
  //   // this.resetSortIcons();
  //   const sortIconField = e.target?.firstElementChild
  //     ? e.target?.firstElementChild
  //     : e.target;
  //   if (field && field in this.sortOrder && sortIconField) {
  //     if (this.sortOrder[field] == 0) {
  //       this.sortOrder[field] = 1;
  //       sortIconField.classList.remove("pi-sort-alt");
  //       sortIconField.classList.remove("pi-sort-amount-up");
  //       sortIconField.classList.add("pi-sort-amount-down");
  //     } else if (this.sortOrder[field] == 1) {
  //       this.sortOrder[field] = -1;
  //       sortIconField.classList.remove("pi-sort-alt");
  //       sortIconField.classList.remove("pi-sort-amount-down");
  //       sortIconField.classList.add("pi-sort-amount-up");
  //     } else {
  //       this.sortOrder[field] = 1;
  //       sortIconField.classList.remove("pi-sort-alt");
  //       sortIconField.classList.remove("pi-sort-amount-up");
  //       sortIconField.classList.add("pi-sort-amount-down");
  //     }
  //     switch (field) {
  //       case "customerCode":
  //       case "mobileNumber":
  //       case "idNumber":
  //       case "beneficialCount":
  //         (this.customerData as Array<any>)?.sort((a, b) => {
  //           if (this.sortOrder[field] >= 0) {
  //             return b[field] - a[field];
  //           } else {
  //             return a[field] - b[field];
  //           }
  //         });
  //         break;

  //       default:
  //         (this.customerData as Array<any>)?.sort((a, b) => {
  //           const strA = a[field].toUpperCase();
  //           const strB = b[field].toUpperCase();
  //           if (this.sortOrder[field] >= 0) {
  //             if (strA < strB) {
  //               return 1;
  //             }
  //             if (strA > strB) {
  //               return -1;
  //             }
  //             return 0;
  //           } else {
  //             if (strB < strA) {
  //               return 1;
  //             }
  //             if (strB > strA) {
  //               return -1;
  //             }
  //             return 0;
  //           }
  //         });
  //         break;
  //     }
  //   }
  // }

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
            this.sortBy = "id";
            break;
          case "fullName":
            if (this.customerType && this.customerType == "Corporate") {
              this.sortBy = "nameOfTheCorporate";
            } else {
              this.sortBy = "fullName";
            }
            break;
          case "nationality":
            this.sortBy = "nationalityPersonalDetails";
            break;
          case "mobileNumber":
            this.sortBy = "contactMobileNumber";
            break;
          case "idType":
            this.sortBy = "documentType";
            break;
          case "idNumber":
            this.sortBy = "idNumber";
            break;
          case "beneficialCount":
            this.sortBy = "beneficiaryCount";
            break;
          case "status":
            this.sortBy = "status";
            break;

          default:
            this.sortBy = "id";
            break;
        }
      } else {
        this.sortBy = "id";
        this.orderBy = "DESC";
      }
      if (e.filters && Object.keys(e.filters).length > 0) {
        let filterCrtMap = "";
        for (const prop in e.filters) {
          switch (prop) {
            case "customerCode":
              filterCrtMap = `id = ${e.filters[prop]["value"]}`;
              break;
            case "fullName":
              if (this.customerType && this.customerType == "Corporate") {
                filterCrtMap = `nameOfTheCorporate = ${e.filters[prop]["value"]}`;
              } else {
                filterCrtMap = `fullName = ${e.filters[prop]["value"]}`;
              }
              break;
            case "nationality":
              filterCrtMap = `nationalityPersonalDetails = ${e.filters[prop]["value"]}`;
              break;
            case "mobileNumber":
              filterCrtMap = `contactMobileNumber = ${e.filters[prop]["value"]}`;
              break;
            case "idType":
              filterCrtMap = `documentType = ${e.filters[prop]["value"]}`;
              break;
            case "idNumber":
              filterCrtMap = `idNumber = ${e.filters[prop]["value"]}`;
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
        this.getCustomerListData(updatedCriteriaMap);
      } else {
        this.getCustomerListData(this.criteriaMap);
      }
    }
    this.sortBy = "id";
    this.orderBy = "DESC";
    this.globalSearch = false;
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
          this.coreService.removeLoadingScreen();
          this.searchCriteriaApiData = res["data"];
          this.searchCriteriaOptions = this.searchCriteriaApiData.map(
            (data) => {
              return {
                name: data.displayName,
                code: data.fieldName,
              };
            }
          );
          this.searchCriteriaOptions.unshift(
            ...[{ name: "Customer ID", code: "id" }]
          );
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast("Error in fething data");
        }
      );
  }
  onUserTypeChange(value: any) {
    this.formName = "Customer Profile";
    console.log("type", value);
    if (value == "Corporate") {
      console.log("colums", this.columns);
      this.columns.forEach((column) => {
        if (column.field === "fullName") {
          column.header = "Corporate Name";
        }
      });
    }
    this.type = value;
    this.criteriaMap = "NA";
    this.searchCriteria = [];
    this.currentCriteriaValue = null;
    this.currentCriteriaKey = "Customer ID = ";
    this.currentCriteriaMapKey = "id = ";
    this.searchCriteriaMap = [];
    this.getApiDataForsearchCriteria();
    this.showTable = false;
    this.globalSearch = true;
    // this.getCustomerListData(this.criteriaMap);
    this.customerFieldType = null;
    this.criteriaType = "text";
  }

  onCriteriaChange(value: any) {
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
    })[0]
      ? this.searchCriteriaApiData.filter((opt) => {
          return opt.fieldName == value;
        })[0].criteriaType
      : "text";
    if (this.criteriaType == "SQL") {
      this.getDocSettingData();
    }
  }
  ondeletecriteria(i: any, criteria: any) {
    this.searchCriteria.splice(i, 1);
    this.searchCriteriaMap.splice(i, 1);
    this.currentCriteriaValue = null;
    this.criteriaMap =
      this.searchCriteriaMap.length > 1
        ? this.searchCriteriaMap.join(";")
        : this.searchCriteriaMap.length == 1
        ? this.searchCriteriaMap[0]
        : "NA";
    this.globalSearch = true;
    this.showTable = false;
    if (this.searchCriteria.length) {
      this.getCustomerListData(this.criteriaMap);
    }
  }
  searchCustomerMap(type: any) {
    console.log("currentkey", this.currentCriteriaMapKey);
    console.log("search", this.searchCriteriaMap);
    console.log("criteriaType", this.criteriaType);
    if (
      this.searchCriteriaMap.filter((crt) => {
        return (
          crt.split(" = ")[0] == this.currentCriteriaMapKey.split(" = ")[0]
        );
      }).length > 0
    ) {
      this.coreService.showWarningToast(
        "This search criteria is already exists, delete it first."
      );
    } else {
      if (
        this.currentCriteriaValue == null ||
        this.currentCriteriaValue == ""
      ) {
        if (this.criteriaType == "SQL") {
          if (this.currentCriteria && this.currentCriteria.length > 0) {
            this.searchCriteria.push(this.currentCriteria);
            this.searchCriteriaMap.push(this.currentCriteriaMapKey);
            this.criteriaMap = this.searchCriteriaMap.join(";");
          } else {
            this.coreService.showWarningToast("Please select value");
            return;
          }
        } else {
          this.coreService.showWarningToast("Please enter the search value");
          return;
        }
      } else if (
        (typeof this.currentCriteriaValue == "string" &&
          this.currentCriteriaValue?.trim().length) ||
        this.currentCriteriaValue
      ) {
        if (this.criteriaType == "date") {
          let criteriaData = new Date(
            this.currentCriteriaValue
          ).toLocaleDateString("en-GB");
          console.log("criteriaData", criteriaData);
          this.currentCriteria = this.currentCriteriaKey + criteriaData;
          this.searchCriteria.push(this.currentCriteria);

          this.currentCriteriaMap = this.currentCriteriaMapKey + criteriaData;
          this.searchCriteriaMap.push(this.currentCriteriaMap);
          this.criteriaMap = this.searchCriteriaMap.join(";");
        } else {
          this.currentCriteria =
            this.currentCriteriaKey + this.currentCriteriaValue;
          this.searchCriteria.push(this.currentCriteria);

          this.currentCriteriaMap =
            this.currentCriteriaMapKey + this.currentCriteriaValue;
          this.searchCriteriaMap.push(this.currentCriteriaMap);
          this.criteriaMap = this.searchCriteriaMap.join(";");
        }
      }
      this.globalSearch = true;
      this.showTable = false;
      this.getCustomerListData(this.criteriaMap);
      this.currentCriteriaValue = null;
      // this.customerFieldType = null;
      // this.currentCriteriaKey = "Customer ID = ";
      // this.currentCriteriaMapKey = "id = ";
    }
  }

  getCustomerListData(criteriaMap: any) {
    this.coreService.displayLoadingScreen();
    let service: Observable<any>;

    console.log(
      "::header",
      this.userData["userId"],
      criteriaMap,
      `${this.pageNumber}`,
      `${this.pageSize}`,
      this.type,
      this.sortBy,
      this.orderBy
    );
    service = this.customerService.getCustomerCorporateData(
      this.userData["userId"],
      criteriaMap,
      `${this.pageNumber}`,
      `${this.pageSize}`,
      this.type,
      this.sortBy,
      this.orderBy
    );

    service.subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (res["status"] == "200") {
          if (res["error"]) {
            this.showTable = false;
            this.coreService.showWarningToast(res["error"]);
            this.customerData = [];
          } else {
            this.showTable = true;
            this.customerData = res.data?.CmCorporateCustomerDetails;
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
          }
        } else {
          this.showTable = false;
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        // this.coreService.showWarningToast("Error in fething data");
        this.showTable = false;
      }
    );
  }
  addNewCustomer(type: any) {
    this.router.navigate([
      "navbar",
      "customer-profile",
      "addnewcustomer",
      type,
    ]);
  }
  addNewBeneficiary(rowData: any, type: any) {
    this.router.navigate([
      "navbar",
      "beneficiary-profile",
      "addnewbeneficiary",
      type,
      rowData.customerCode,
      rowData.fullName,
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
    service = this.customerService.updateCustomerCorporateStatus(
      this.userData["userId"],
      status,
      cusId.toString(),
      cusType
    );
    service.subscribe(
      (res) => {
        if (res["status"] == "200") {
          sliderElm.checked = !sliderElm.checked;
          this.searchCustomerMap(this.customerType);
          this.coreService.showSuccessToast(res["data"]);
          this.coreService.removeLoadingScreen();
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
  editbeneficiary(beneData: any, rowData: any) {
    console.log("rowdata", rowData);
    let custype = beneData.customerType == "Individual" ? "IND" : "COR";
    this.router.navigate([
      "navbar",
      "beneficiary-profile",
      "addnewbeneficiary",
      custype,
      rowData.customerCode,
      rowData.fullName,
      beneData.id,
      "edit",
    ]);
  }
  beneficiaryListData(expanded, rowData: any, customerType) {
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
              this.customerData.forEach((element) => {
                if (element["customerCode"] == rowData.customerCode) {
                  element["orders"] = res["data"];
                }
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
    this.globalSearch = true;
    this.showTable = false;
    this.getCustomerListData(this.criteriaMap);
    this.customerFieldType = null;
    this.criteriaType = "text";
  }

  searchByEnter(e: any) {
    if (this.customerType) {
      this.searchCustomerMap(this.customerType);
    } else {
      this.coreService.showWarningToast("Please select customer type");
    }
  }
}
