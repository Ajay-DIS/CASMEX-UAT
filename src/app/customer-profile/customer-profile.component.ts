import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "../core.service";
import { CustomerProfileService } from "./customer-profile.service";
import { MultiSelect } from "primeng/multiselect";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { Observable, forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";

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

  linkedFormRuleCode: any = [];
  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private customerService: CustomerProfileService
  ) {}

  customerType = "";

  criteriaType: any="text";

  customerData: any = [];
  userTypeOptions = [
    { name: "Individual", code: "Individual" },
    { name: "Corporate", code: "Corporate" },
  ];

  searchCriteriaApiData = [
    {
      id: 6,
      applicationName: "Casmex Core",
      formName: "Customer Profile Individual",
      moduleName: "Remittance",
      fieldName: "firstName",
      displayName: "First Name",
      operators: null,
      orderID: 1,
      sqlQueries: null,
      iSMandatory: "N",
      dependency: "N",
      status: "A",
      criteriaType: "text",
      masterDataDependency: null,
      hqlMasterData: null,
      hqlDependency: null,
      hqlDependencyData: null,
      createdDate: null,
    },
    {
      id: 7,
      applicationName: "Casmex Core",
      formName: "Customer Profile Individual",
      moduleName: "Remittance",
      fieldName: "phoneNumber",
      displayName:"Phone Number",
      operators: null,
      orderID: 2,
      sqlQueries: null,
      iSMandatory: "N",
      dependency: "N",
      status: "A",
      criteriaType: "number",
      masterDataDependency: null,
      hqlMasterData: null,
      hqlDependency: null,
      hqlDependencyData: null,
      createdDate: null,
    },
    {
      id: 8,
      applicationName: "Casmex Core",
      formName: "Customer Profile Individual",
      moduleName: "Remittance",
      fieldName: "lastName",
      displayName: "Last Name",
      operators: null,
      orderID: 3,
      sqlQueries: null,
      iSMandatory: "N",
      dependency: "N",
      status: "A",
      criteriaType: "text",
      masterDataDependency: null,
      hqlMasterData: null,
      hqlDependency: null,
      hqlDependencyData: null,
      createdDate: null,
    },
    {
      id: 10,
      applicationName: "Casmex Core",
      formName: "Customer Profile Individual",
      moduleName: "Remittance",
      fieldName: "dateOfBirth",
      displayName: "Date Of Birth",
      operators: null,
      orderID: 4,
      sqlQueries: null,
      iSMandatory: "N",
      dependency: "N",
      status: "A",
      criteriaType: "date",
      masterDataDependency: null,
      hqlMasterData: null,
      hqlDependency: null,
      hqlDependencyData: null,
      createdDate: null,
    },
  ];

  searchCriteriaOptions = [];
  searchCriteria = [];
  currentCriteriaKey = "";
  currentCriteriaValue = "";
  currentCriteria = "";

  currentCriteriaMapKey = "";
  searchCriteriaMap = [];
  currentCriteriaMap = ""; 
  criteriaMap = "";

  cols: any[] = [
    { field: "customerCode", header: "Customer Code", width: "8%" },
    { field: "fullName", header: "Customer Full Name", width: "8%" },
    { field: "nationality", header: "Nationality", width: "8%" },
    { field: "mobileNumber", header: "Mobile Number", width: "7%" },
    { field: "idType", header: "ID Type", width: "8%" },
    { field: "idNumber", header: "ID Number", width: "8%" },
    // { field: "totalBenificiary", header: "Total Benf", width: "8%" },
    { field: "addBenificiary", header: "Add Benf", width: "8%" },
    { field: "pastTxns", header: "Past Txns", width: "8%" },
    { field: "status", header: "Profile Status", width: "8%" },
  ];

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.coreService.removeLoadingScreen();
  }

  onUserTypeChange(value: any) {
    console.log(value);
    this.searchCriteriaOptions = this.searchCriteriaApiData.map((data) => {
      return { name: data.displayName, code: data.fieldName };
    });
  }

  onCriteriaChange(value: any) {
    console.log(value);
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
    })[0].criteriaType
    console.log(this.currentCriteriaKey);
    console.log(this.currentCriteriaMapKey);
  }
  ondeletecriteria(i:any,criteria:any){
    this.searchCriteria.splice(i, 1);
    console.log(i)
    console.log(criteria)
  }
  searchCustomerMap(type: any) {
    if (this.currentCriteriaValue.trim().length) {
      this.currentCriteria =
        this.currentCriteriaKey + this.currentCriteriaValue;
      console.log(this.currentCriteria);
      this.searchCriteria.push(this.currentCriteria);
    }
    console.log( this.searchCriteria);
    if(this.currentCriteriaValue.trim().length){
      this.currentCriteriaMap = this.currentCriteriaMapKey + this.currentCriteriaValue;
      console.log(this.currentCriteriaMap);
      this.searchCriteriaMap.push(this.currentCriteriaMap);
      this.criteriaMap = this.searchCriteriaMap.join(";");
      console.log(this.criteriaMap);
    }
    this.coreService.displayLoadingScreen();
    console.log(type);
    this.showTable = false;
    let service: Observable<any>;
    if (type == "Corporate") {
      service = this.customerService.getCustomerCorporateData(
        this.userData["userId"],
        "COR"
      );
    } else {
      service = this.customerService.getCustomerIndividualData(
        this.userData["userId"],
        "IND"
      );
    }
    service.subscribe(
      (res) => {
        console.log(res);
        if (res["status"] == "200") {
          this.showTable = true;
          this.coreService.removeLoadingScreen();
          if (type == "Corporate") {
            this.customerData = res.data.CmCooperateCustomerDetails;
          } else {
            this.customerData = res.data.CmIndividualCustomerDetails;
          }
          this.customerCode = res.customerCode.map((code) => {
            if (code) return { label: code, value: code };
          });
          this.fullName = res.customerFullName.map((code) => {
            if (code) return { label: code, value: code };
          });
          this.nationality = res.nationality.map((code) => {
            if (code) return { label: code, value: code };
          });
          this.mobileNumber = res.mobileNumber.map((code) => {
            if (code) return { label: code, value: code };
          });
          this.idType = res.idType.map((code) => {
            if (code) return { label: code, value: code };
          });
          this.idNumber = res.idNumber.map((code) => {
            if (code) return { label: code, value: code };
          });
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Error in fething data");
        this.showTable = false;
      }
    );
  }

  addNewCustomer() {
    this.router.navigate(["navbar", "customer-profile", "addnewcustomer"]);
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
    if (cusType == "Corporate") {
      service = this.customerService.updateCustomerCorporateStatus(
        this.userData["userId"],
        status,
        cusId.toString()
      );
    } else {
      service = this.customerService.updateCustomerIndividualStatus(
        this.userData["userId"],
        status,
        cusId.toString()
      );
    }
    service.subscribe(
      (res) => {
        console.log(res);
        if (res["status"] == "200") {
          sliderElm.checked = sliderElm!.checked;
          this.searchCustomerMap(this.customerType);
          this.coreService.showSuccessToast(res["data"]);
        } else {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(
            "Something went wrong, Please try again later"
          );
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
