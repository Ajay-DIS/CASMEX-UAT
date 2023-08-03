import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../core.service';
import { CustomerProfileService } from './customer-profile.service';
import { MultiSelect } from 'primeng/multiselect';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Observable, forkJoin } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss']
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

  showTable = false

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  linkedFormRuleCode: any = [];
  constructor(private router: Router,private coreService: CoreService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private customerService:CustomerProfileService
    ) { }

  customerMap = {
    userType: "", uniqueIdentifier: "", uniqueIdentifierValue: ""
  }
  customerData:any=[];
  customerIndividualDataApi = {
    "customerFullName": [
        "Test  bala User",
        "Test user bala bandi"
    ],
    "idType": [
        "passport"
    ],
    "nationality": [
        "inidan"
    ],
    "data": {
        "CmIndividualCustomerDetails": [
            {
                "customerCode": 64,
                "fullName": "Test  bala User",
                "nationality": "inidan",
                "mobileNumber": "23255",
                "status": "Active",
                "idType": "passport",
                "idNumber": 1234
            },
            {
                "customerCode": 62,
                "fullName": "Test user bala bandi",
                "nationality": "inidan",
                "mobileNumber": "23255",
                "status": "Active",
                "idType": "passport",
                "idNumber": 1234
            },
            {
                "customerCode": 63,
                "fullName": "Test  bala User",
                "nationality": "inidan",
                "mobileNumber": "23255",
                "status": "Active",
                "idType": "passport",
                "idNumber": 1234
            }
        ]
    },
    "mobileNumber": [
        "23255"
    ],
    "customerCode": [
        64,
        62,
        63
    ],
    "idNumber": [
        1234
    ],
    "status": "200"
};
  customerCorporateDataApi= {
      "customerFullName": [
          "null null null",
          "raju yogesh mishra",
          "Test null ewhe"
      ],
      "idType": [
          "passport"
      ],
      "nationality": [
          null,
          "Japanese",
          "indian"
      ],
      "data": {
          "CmCooperateCustomerDetails": [
              {
                  "customerCode": 50,
                  "fullName": "Test null ewhe",
                  "nationality": "Japanese",
                  "mobileNumber": "4545454545",
                  "status": "A",
                  "idType": "passport",
                  "idNumber": 123456
              },
              {
                  "customerCode": 48,
                  "fullName": "null null null",
                  "nationality": null,
                  "mobileNumber": "5154545445",
                  "status": "A",
                  "idType": "passport",
                  "idNumber": 123456
              },
              {
                  "customerCode": 43,
                  "fullName": "raju yogesh mishra",
                  "nationality": "indian",
                  "mobileNumber": "2345",
                  "status": "A",
                  "idType": "passport",
                  "idNumber": 123456
              },
              {
                  "customerCode": 46,
                  "fullName": "raju yogesh mishra",
                  "nationality": "indian",
                  "mobileNumber": "2345",
                  "status": "A",
                  "idType": "passport",
                  "idNumber": 123456
              },
              {
                  "customerCode": 47,
                  "fullName": "null null null",
                  "nationality": null,
                  "mobileNumber": "5154545445",
                  "status": "A",
                  "idType": "passport",
                  "idNumber": 123456
              }
          ]
      },
      "mobileNumber": [
          "2345",
          "4545454545",
          "5154545445"
      ],
      "customerCode": [
          48,
          50,
          43,
          46,
          47
      ],
      "idNumber": [
          123456
      ],
      "status": "200"
  } ;
  customerInfoMeta = {
    ddlUserTypeOptions: [{name:"Individual",code:"Individual"}, {name:"Corporate",code:"Corporate"}],
    ddlUserUniqueIdentifierOptions: [{name: "Primary ID", code: "primaryId"}, {name: "Customer Code", code: "customerCode"},{name:"Customer Name", code:"customerName"}],
    customerMapConditions: [],
    tblCustomerDataArray: [],
  }
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

  searchCustomerMap(type: any) {
    console.log(type)
    this.showTable = true;
    if(type == 'Corporate'){
      this.customerData = this.customerCorporateDataApi.data.CmCooperateCustomerDetails;
    }else{
      this.customerData = this.customerIndividualDataApi.data.CmIndividualCustomerDetails;
    }
    this.customerCode = this.customerIndividualDataApi.customerCode.map(
      (code) => {
        return { label: code, value: code };
      }
    );
    this.fullName = this.customerIndividualDataApi.customerFullName.map(
      (code) => {
        return { label: code, value: code };
      }
    );
    this.nationality = this.customerIndividualDataApi.nationality.map(
      (code) => {
        return { label: code, value: code };
      }
    );
    this.mobileNumber = this.customerIndividualDataApi.mobileNumber.map(
      (code) => {
        return { label: code, value: code };
      }
    );
    this.idType = this.customerIndividualDataApi.idType.map(
      (code) => {
        return { label: code, value: code };
      }
    );
    this.idNumber = this.customerIndividualDataApi.idNumber.map(
      (code) => {
        return { label: code, value: code };
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
    console.log(data)
    this.updateCustomerStatus(data["customerCode"],reqStatus, e.target, data, cusType);
  }

  updateCustomerStatus(cusId: any,status: any, sliderElm: any, ruleData: any, cusType: any) {
    let service: Observable<any>;
    console.log(this.userData)
    if(cusType == "Corporate"){
      service = this.customerService.updateCustomerCorporateStatus(this.userData['userId'], status, cusId.toString())
    }else{
      service = this.customerService.updateCustomerIndividualStatus(this.userData['userId'], status, cusId.toString())
    }
    service.subscribe((res) => {
      let message = "";
      console.log(res)
      // if (res["error"] == "true") {
      //   this.coreService.removeLoadingScreen();
      //   message = `Kindly deactivate the Rule code: ${res["msg"]} ( ${ruleData["criteriaMap"]} ) to activate the current record.`;
      //   this.coreService.showWarningToast(message);
      // } else {
      //   if (res["msg"]) {
      //     message = res["msg"];
      //     sliderElm.checked = sliderElm!.checked;
      //     // this.getDecodedDataForListing(
      //     //   this.userData.userId,
      //     // );
      //     this.coreService.showSuccessToast(message);
      //   } else {
      //     this.coreService.removeLoadingScreen();
      //     message = "Something went wrong, Please try again later";
      //     this.coreService.showWarningToast(message);
      //   }
      // }
    }, (err)=>{
      console.log(err)
      this.coreService.removeLoadingScreen()
    });
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
