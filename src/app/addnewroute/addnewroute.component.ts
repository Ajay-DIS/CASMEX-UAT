import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PaymentModeService } from '../payment-mode-settings/payment-mode-service.service';


@Component({
  selector: 'app-addnewroute',
  templateUrl: './addnewroute.component.html',
  styleUrls: ['./addnewroute.component.css']
})
export class AddnewrouteComponent implements OnInit {
  criteriaText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  criteriaOperations: any[] = [];
  clickforsave = false;
  userId = "";
  criteriaName = "";
  criteriaTemplatesDdlOptions:any = [];
  criteriaMapDdlOptions = [{
    name: "Select Criteria", code: ""
  },{
    name: "Correspodent", code: "Correspodent"
  }, {
    name: "Country", code: "Country"
  }, {
    name: "Service Type", code: "ServiceType"
  }, {
    name: "Service Category", code: "ServiceCategory"
  }, {
    name: "LCY Amount", code: "LCYAmount"
  }, {
    name: "Orginations", code: "Orginations"
  }]
  criteriaEqualsDdlOptions = [{
    name: "Select Codition", code: ""
  },{
    name: "Any", code: ""
  }, {
    name: "Equal To", code: "="
  }, {
    name: "Not Equal To", code: "!="
  }]
  correspondentDdlOptions = [{name: "Select Value", code:""}];
  criteriaMap = {
    criteria: "", condition: "", val: ""
  }
  
  constructor(
    private paymentModeService: PaymentModeService,
    private activatedRoute: ActivatedRoute,private ngxToaster: ToastrService,
  ) { }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.params;
    this.userId = localStorage.getItem("loggedInUserId");
    this.getAllTemplates();
    if (params && params.id) {
      this.paymentModeService.getPaymentModeByCriteriaId(params.id).subscribe((response: any) => {
        console.log(response);
        const co = response.cmCriteriaData.cmCriteriaDataDetails[0].operations.split(',')
        this.criteriaOperations = co;
        response.cmCriteriaData.cmCriteriaDataDetails.map((item: any) => {
          this.testData.push(item);
        });
      });
    }

  }

  addCriteriaMap() {
    console.log("criteria", this.criteriaMap)
    this.criteriaText.push(this.criteriaMap.criteria+this.criteriaMap.condition+this.criteriaMap.val)
  }

  onChange(controlId, event) {
     console.log("event", event)
    this.criteriaMap[controlId] = event.code;
    switch (controlId) {
      case 'criteria': 
      //this.criteriaMap.criteria = event.code
      if(event.code == "Correspodent") {
        this.correspondentDdlOptions = [{
          name: "Select Value", code: ""
        },{
          name: "HDFC", code: "HDFC"
        }, {
          name: "SBI", code: "SBI"
        }, {
          name: "ICICI", code: "ICICI"
        }]
      } else if(event.code == "Country") {
        this.correspondentDdlOptions = [{
          name: "Select Value", code: ""
        },{
          name: "INDIA", code: "INDIA"
        }, {
          name: "US", code: "US"
        }, {
          name: "UK", code: "UK"
        }]
      } else if(event.code == "ServiceType") {
        this.correspondentDdlOptions = [{
          name: "Select Value", code: ""
        },{
          name: "Bank", code: "Bank"
        }, {
          name: "Utility", code: "Utility"
        }]
      } else if(event.code == "ServiceCategory") {
        this.correspondentDdlOptions = [{
          name: "Select Value", code: ""
        },{
          name: "Cash", code: "Cash"
        }, {
          name: "Onlinee", code: "Online"
        }, {
          name: "NEFT", code: "NEFT"
        }]
      } else if(event.code == "Orginations") {
        this.correspondentDdlOptions = [{
          name: "Select Value", code: ""
        },{
          name: "HDFC", code: "HDFC"
        }, {
          name: "SBI", code: "SBI"
        }, {
          name: "ICICI", code: "ICICI"
        }]
      }
      break;
      // case 'condition': 
      // this.criteriaMap.condition = event.code
      // break;
      // case 'val':
      //   this.criteriaMap.val = event.code
      //   break;
      default: break;
    }
  }

  changeCriteriaFields(criteriaName: any){
    const criteria = this.testData.find(item => item.displayName ===criteriaName)
    this.criteriaOperations = criteria.operations.split(',');
  }
  ondeletecriteria(i){
    this.criteriaText.splice(i,1);
    
  }

  openClickForSave() {
    if(this.criteriaText.length) {
      this.clickforsave = true;
    } else {
      this.ngxToaster.warning("Please add criteria.")
    }
    

  }

  saveCriteriaAsTemplate(){
    if (this.criteriaName == "") {
      this.ngxToaster.warning("Please select the critera as per your requirement");
      return
    }
    
    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("criteriaName", this.criteriaName);
    formData.append("criteriaMap", this.criteriaText.join(";"));
    this.paymentModeService.currentCriteriaSaveAsTemplate(formData).subscribe(response=> {
      console.log("respomse", response)
      //this.criteriaTemplatesDdlOptions.push(payload);//need  to be remove  after sit working
      if(response.msg == "Duplicate criteria, please modify existing criteria") {
        this.ngxToaster.warning(response.msg)
        
      } else {
        this.ngxToaster.success(response.msg)
        this.clickforsave = false;
        this.getAllTemplates();
      }
    })
  }

  getAllTemplates() {
    this.paymentModeService.getAllCriteriaTemplates().subscribe(response=> {
      console.log("response", response)
      if(response.data && response.data.length) {
        this.criteriaTemplatesDdlOptions = response.data;
      } else {
        this.ngxToaster.warning(response.msg)
      }
      
    })
  }

  selectCriteriaTemplate(item) {
    console.log("event", item)
    let selectedData = this.criteriaTemplatesDdlOptions.filter(x=> x.criteriaName == item)[0]
    this.criteriaText = selectedData.criteriaMap.split(';')
    console.log("test", this.criteriaText)
  }
}
