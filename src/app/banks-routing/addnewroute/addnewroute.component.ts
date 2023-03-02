import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { element } from "protractor";
import { PaymentModeService } from "../../payment-mode-settings/payment-mode-service.service";
import { BankRoutingService } from "../bank-routing.service";
import { TransactionCriteriaModal } from "../transaction-criteria-modal/transaction-criteria-modal";
import { Table } from "primeng/table";

@Component({
  selector: "app-addnewroute",
  templateUrl: "./addnewroute.component.html",
  styleUrls: ["./addnewroute.component.css"],
  providers: [DialogService, MessageService],
})
export class AddnewrouteComponent implements OnInit {
  //suresh start
  @ViewChild('table', {static: false}) table!: Table;
  bankRoutesData:any = [];
  bankRoutesColumns = [
    { field: 'country', header: 'Country', editable: false, visible: true },
    { field: 'routeBankName', header: 'Route Bank Name', editable: false, visible: true },
    { field: 'routeServiceCategory', header: 'Service Category', editable: false, visible: true },
    { field: 'routeServiceType', header: 'Service type', editable: false, visible: true },
    { field: 'isCorrespondent', header: 'Is Correspondent', editable: false, visible: true },
    { field: 'lcyAmountFrom', header: 'LCY Amount From', editable: false, visible: false },
    { field: 'lcyAmountTo', header: 'LCY Amount To', editable: false, visible: false },
    { field: 'routeToBankName', header: 'Route to', editable: true , visible: true},
    { field: 'routeToServiceCategory', header: 'Service Category', editable: true , visible: true},
    { field: 'routeToServiceType', header: 'Service type', editable: true , visible: true}

  ];
  isSelectedRouteToBankName  = false;
  isSelectedRouteToServiceCategory = false;
  apiResponse = {
    "data":[
       {
          "id":"1",
          "country":"India23442",
          "routeBankName":"SBI",
          "routeServiceCategory":"Bank",
          "routeServiceType":"NEFT",
          "isCorrespondent":"Yes21344",
          "routeToBankName": "",
          "routeToBankNameOption":[
             {
                "id":1,
                "code":"SBI",
                "codeName":"SBI",
                "isCorrespondent":"Y",
                "status":"A"
             },
             {
                "id":2,
                "code":"HDFC",
                "codeName":"HDFC",
                "isCorrespondent":"Y",
                "status":"A"
             },
             {
                "id":3,
                "code":"ICICI",
                "codeName":"ICICI",
                "isCorrespondent":"N",
                "status":"A"
             }
          ],
          "routeToServiceCategory":"",
          "routeToServiceCategoryOption":[
             {
                "id":1,
                "code":"Bank",
                "codeName":"Bank",
                "status":"A"
             },
             {
                "id":2,
                "code":"Cash",
                "codeName":"Cash",
                "status":"A"
             },
             {
                "id":3,
                "code":"Utility",
                "codeName":"Utility",
                "status":"A"
             }
          ],
          "routeToServiceType": "",
          "routeToServiceTypeOption":[
             {
                "id":1,
                "code":"NEFT",
                "codeName":"NEFT",
                "status":"A"
             },
             {
                "id":2,
                "code":"RTGS",
                "codeName":"RTGS",
                "status":"A"
             },
             {
                "id":3,
                "code":"IMPS",
                "codeName":"IMPS",
                "status":"A"
             },
             {
                "id":4,
                "code":"Cash pick up",
                "codeName":"Cash pick up",
                "status":"A"
             },
             {
                "id":5,
                "code":"A/C transfer",
                "codeName":"A/C transfer",
                "status":"A"
             }
          ],
          "lcyAmountFrom":null,
          "lcyAmountTo":null
       },
       {
          "id":"2",
          "country":"India2344",
          "routeBankName":"HDFC",
          "routeServiceCategory":"Cash",
          "routeServiceType":"RTGS",
          "isCorrespondent":"Yes21344",
          "routeToBankName": "",
          "routeToBankNameOption":[
             {
                "id":1,
                "code":"SBI",
                "codeName":"SBI",
                "isCorrespondent":"Y",
                "status":"A"
             },
             {
                "id":2,
                "code":"HDFC",
                "codeName":"HDFC",
                "isCorrespondent":"Y",
                "status":"A"
             },
             {
                "id":3,
                "code":"ICICI",
                "codeName":"ICICI",
                "isCorrespondent":"N",
                "status":"A"
             }
          ],
          "routeToServiceCategory":"",
          "routeToServiceCategoryOption":[
             {
                "id":1,
                "code":"Bank",
                "codeName":"Bank",
                "status":"A"
             },
             {
                "id":2,
                "code":"Cash",
                "codeName":"Cash",
                "status":"A"
             },
             {
                "id":3,
                "code":"Utility",
                "codeName":"Utility",
                "status":"A"
             }
          ],
          "routeToServiceType":"",
          "routeToServiceTypeOption":[
             {
                "id":1,
                "code":"NEFT",
                "codeName":"NEFT",
                "status":"A"
             },
             {
                "id":2,
                "code":"RTGS",
                "codeName":"RTGS",
                "status":"A"
             },
             {
                "id":3,
                "code":"IMPS",
                "codeName":"IMPS",
                "status":"A"
             },
             {
                "id":4,
                "code":"Cash pick up",
                "codeName":"Cash pick up",
                "status":"A"
             },
             {
                "id":5,
                "code":"A/C transfer",
                "codeName":"A/C transfer",
                "status":"A"
             }
          ],
          "lcyAmountFrom":null,
          "lcyAmountTo":null
       }
    ],
    "userId": "yogeshm",
    "routeDesc": "new g",
    "criteriaMap": "",
    "LCY":"No"
 }
 //suresh end
  criteriaText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  criteriaOperations: any[] = [];
  clickforsave = false;
  userId = "";
  criteriaName = "";
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [
    // {
    //   name: "Select Criteria",
    //   code: "",
    // },
    // {
    //   name: "Correspodent",
    //   code: "Correspodent",
    // },
    // {
    //   name: "Country",
    //   code: "Country",
    // },
    // {
    //   name: "Service Type",
    //   code: "ServiceType",
    // },
    // {
    //   name: "Service Category",
    //   code: "ServiceCategory",
    // },
    // {
    //   name: "LCY Amount",
    //   code: "LCYAmount",
    // },
    // {
    //   name: "Orginations",
    //   code: "Orginations",
    // },
  ];
  criteriaEqualsDdlOptions = [
    // {
    //   name: "Any",
    //   code: "",
    // },
    // {
    //   name: "Equal To",
    //   code: "=",
    // },
    // {
    //   name: "Not Equal To",
    //   code: "!=",
    // }
  ];
  correspondentDdlOptions = [];
  criteriaMap: any = {
    criteria: "",
    condition: "",
    val: "",
  };
  //data from API
  cmCriteriaDataDetails: any = [
    {
      id: 153,
      fieldName: "Organization",
      displayName: "Organization",
      fieldType: "Dropdown",
      operations: "equal,not-equal",
      orderID: 3,
      iSMandatory: "yes",
      values: ["HDFC", "SBI", "ICICI", "any"],
    },
    {
      id: 154,
      fieldName: "Country",
      displayName: "Country",
      fieldType: "Dropdown",
      operations: "equal,not-equal",
      orderID: 2,
      iSMandatory: "yes",
      values: ["India", "US", "UK"],
    },
    {
      id: 152,
      fieldName: "Service Category",
      displayName: "Service Category",
      fieldType: "Dropdown",
      operations: "equal,not-equal",
      orderID: 5,
      iSMandatory: "yes",
      values: ["Cash", "Online", "NEFT"],
    },
    {
      id: 151,
      fieldName: "Correspondent",
      displayName: "Correspondent",
      fieldType: "Dropdown",
      operations: "equal,not-equal",
      orderID: 1,
      iSMandatory: "yes",
      values: ["HDFC", "SBI", "ICICI"],
    },
    {
      id: 155,
      fieldName: "Service Type",
      displayName: "Service Type",
      fieldType: "Dropdown",
      operations: "equal,not-equal",
      orderID: 4,
      iSMandatory: "yes",
      values: ["Bank", "Utility"],
    },
  ];

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;
  

  constructor(
    private paymentModeService: PaymentModeService,
    private activatedRoute: ActivatedRoute,
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private bankRoutingService: BankRoutingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.bankRoutingService.getTransactionCriteriaRange().subscribe((res) => {
      this.txnCriteriaRangeFormData = res;
    });

    const params = this.activatedRoute.snapshot.params;
    this.userId = localStorage.getItem("loggedInUserId");
    this.getAllTemplates();
    this.getBanksRoutingData(this.userId);
    
    if (params && params.id) {
      this.paymentModeService
        .getPaymentModeByCriteriaId(params.id)
        .subscribe((response: any) => {
          console.log(response);
          const co =
            response.cmCriteriaData.cmCriteriaDataDetails[0].operations.split(
              ","
            );
          this.criteriaOperations = co;
          response.cmCriteriaData.cmCriteriaDataDetails.map((item: any) => {
            this.testData.push(item);
          });
        });
    }

    this.cmCriteriaDataDetails.forEach((element) => {
      this.criteriaMapDdlOptions.push({
        name: element.displayName,
        code: element.fieldName,
      });

      // operations.forEach(x:any=> {
      //   this.criteriaEqualsDdlOptions.push({name: x, })
      // })
    });
  }

  addCriteriaMap() {
    let criteria =
      this.criteriaMap.criteria.name +
      this.criteriaMap.condition.code +
      this.criteriaMap.val.code;
    //console.log("criteria", criteria, )
    let index = this.criteriaText.indexOf(criteria);
    //validation 1
    if (this.criteriaText.length && index != -1) {
      this.ngxToaster.warning(
        criteria + " already added, please add different case"
      );
    } else if (this.criteriaText.length) {
      if (criteria.includes("=")) {
        let splitdata = criteria.replace(/[= !=]/g, "");
        //console.log("splitData", splitdata)

        this.criteriaText.forEach((element) => {
          let splitText = element.replace(/[= !=]/g, "");
          if (splitText == splitdata) {
            this.ngxToaster.warning(
              " Please select different criteria for Correspondent"
            );
          } else {
            let lhs = criteria.substring(0, criteria.indexOf("=") + 1);
            //let rhs = criteria.substring(criteria.indexOf("=") + 1);
            // console.log("lshhh", lhs, element);
            let elementLhs = element.substring(0, element.indexOf("=") + 1);
            //let elementRhs = element.substring(element.indexOf("=") + 1);
            if (lhs == elementLhs) {
              this.ngxToaster.warning(
                "Please delete existing criteria " +
                  element +
                  ", then add" +
                  criteria
              );
            } else {
              this.criteriaText.push(criteria);
            }
          }
        });
      }
    } else {
      this.criteriaText.push(criteria);
    }

    //validation 2
  }

  onChange(controlId, event) {
    console.log("event", event);
    //this.criteriaMap[controlId] = event.code;
    switch (controlId) {
      case "criteria":
        let selectdCorrespondent = this.cmCriteriaDataDetails.filter(
          (x) => event.code == x.fieldName
        );
        console.log("seleccted data", selectdCorrespondent);
        let operations = selectdCorrespondent[0].operations.split(",");
        this.criteriaEqualsDdlOptions = [];
        operations.forEach((element) => {
          this.criteriaEqualsDdlOptions.push({
            name: element,
            code: element == "equal" ? "=" : "!=",
          });
        });
        let values = selectdCorrespondent[0].values;
        this.correspondentDdlOptions = [];
        values.forEach((element) => {
          this.correspondentDdlOptions.push({ name: element, code: element });
        });
        break;
      // case 'condition':
      // this.criteriaMap.condition = event.code
      // break;
      // case 'val':
      //   this.criteriaMap.val = event.code
      //   break;
      default:
        break;
    }
  }

  changeCriteriaFields(criteriaName: any) {
    const criteria = this.testData.find(
      (item) => item.displayName === criteriaName
    );
    this.criteriaOperations = criteria.operations.split(",");
  }
  ondeletecriteria(i) {
    this.criteriaText.splice(i, 1);
  }

  openClickForSave() {
    if (this.criteriaText.length) {
      this.clickforsave = true;
    } else {
      this.ngxToaster.warning("Please add criteria.");
    }
  }

  saveCriteriaAsTemplate() {
    if (this.criteriaName == "") {
      this.ngxToaster.warning(
        "Please select the critera as per your requirement"
      );
      return;
    }

    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("criteriaName", this.criteriaName);
    formData.append("criteriaMap", this.criteriaText.join(";"));
    this.paymentModeService
      .currentCriteriaSaveAsTemplate(formData)
      .subscribe((response) => {
        console.log("respomse", response);
        //this.criteriaTemplatesDdlOptions.push(payload);//need  to be remove  after sit working
        if (
          response.msg == "Duplicate criteria, please modify existing criteria"
        ) {
          this.ngxToaster.warning(response.msg);
        } else {
          this.ngxToaster.success(response.msg);
          this.clickforsave = false;
          this.getAllTemplates();
        }
      });
  }

  getAllTemplates() {
    this.paymentModeService.getAllCriteriaTemplates().subscribe((response) => {
      console.log("response", response);
      if (response.data && response.data.length) {
        this.criteriaTemplatesDdlOptions = response.data;
      } else {
        this.ngxToaster.warning(response.msg);
      }
    });
  }

  selectCriteriaTemplate(item) {
    console.log("event", item);
    let selectedData = this.criteriaTemplatesDdlOptions.filter(
      (x) => x.criteriaName == item
    )[0];
    this.criteriaText = selectedData.criteriaMap.split(";");
    console.log("test", this.criteriaText);
  }

  showTransCriteriaModal() {
    this.ref = this.dialogService.open(TransactionCriteriaModal, {
      // header: "Choose a Product",
      width: "40%",
      contentStyle: { "max-height": "300px", overflow: "auto" },
      baseZIndex: 10000,
      styleClass: "txn-criteria-modal",
      data: { txnCriteriaRange: this.txnCriteriaRangeFormData },
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.txnCriteriaRangeFormData = data;
        console.log("::addnewroute", data);
      }
    });
  }

  selectedColumn(column, row) {
    console.log("enterin select ", column, row);
    (column == "routeToBankName") && (this.isSelectedRouteToBankName = true);
    if(column == "routeToServiceCategory") {
      if(!this.isSelectedRouteToBankName) {
        this.ngxToaster.warning("Please select the route to bank first");
      } else {this.isSelectedRouteToServiceCategory = true}
    }
    if(column == "routeToServiceType") {
      let index = this.bankRoutesData.findIndex(x=> x.id == row.id );
      console.log("this.bankRoutesData[index]",this.bankRoutesData[index]["routeToServiceType"])
      // let cell = this.table.findCell(row.id, column)
      if(!this.isSelectedRouteToServiceCategory) {
        (this.ngxToaster.warning("Please select the service category first"));
      }
    }
  }

  getBanksRoutingData(id: string) {
    this.bankRoutesData = this.apiResponse.data;
    if(this.apiResponse.LCY == "Yes") {
      this.bankRoutesColumns.forEach(x=> {
        (x.field == "lcyAmountFrom" || x.field == "lcyAmountTo") && (x.visible = true);
        (x.field == "isCorrespondent") && (x.visible = false)
      })
    }
    // this.bankRoutingService
    //   .getBankRoutingData(id)
    //   .subscribe((result):any=> {
    //     if(result) {
    //       this.bankRoutesData = result["data"];
    //       this.routeToDdlOption = result["routeToBankName"].concat(result["routeBankName"]);
    //       this.serviceCategoryDdlOptions= result["routeServiceCategory"].concat(result["routeToServiceCategory"]);
    //       this.serviceTypeDdlOptions = result["routeServiceType"].concat(result["routeToServiceType"])
    //     }
    //   })
  }

  saveAddNewRoute(action) {
    let payload = {
      data: this.bankRoutesData,
      userId: this.userId,
      routeDesc: this.apiResponse.routeDesc,
      criteriaMap: this.criteriaText.join(";"),
      LCY: this.apiResponse.LCY
    }
    console.log("payload JSON", payload)
    //Api integration here
    let isRequiredFields = false;
    this.bankRoutesData.forEach(element=> {
      if(element.routeToBankName == "" || element.routeToServiceCategory=="" || element.routeToServiceType == "") {
        isRequiredFields = true;
      }
    })
    setTimeout(() => {
      if(isRequiredFields) {
        this.ngxToaster.warning("Please Select required fields.");
      } else {
        this.ngxToaster.success("Add new Route updated successfully");
        if(action == 'save') {
          this.router.navigate([`navbar/bank-routing`]);
        } else if(action == 'saveAndAddNew') {
          window.location.reload();
          //this.getBanksRoutingData(this.userId);
        }
        
        
      }
    }, 1000)
    
  }

  reset() {
    window.location.reload();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
