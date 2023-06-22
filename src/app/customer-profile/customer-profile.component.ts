import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss']
})
export class CustomerProfileComponent implements OnInit {

  constructor() { }

  customerMap = {
    userType: "", uniqueIdentifier: "", uniqueIdentifierValue: ""
  }

  customerInfoMeta = {
    ddlUserTypeOptions: [{name:"Individual",code:"Individual"}, {name:"Corporate",code:"Corporate"}],
    ddlUserUniqueIdentifierOptions: [{name: "Primary ID", code: "primaryId"}, {name: "Customer Code", code: "customerCode"},{name:"Customer Name", code:"customerName"}],
    customerMapConditions: [],
    tblCustomerDataArray: [],
    tblCustomerMetaData: [
      { field: 'customerCode', header: 'Customer Code' },
      { field: 'customerFullName', header: 'Customer Full Name' },
      { field: 'nationality', header: 'Nationality' },
      { field: 'mobileNumber', header: 'Mobile Number' },
      { field: 'idType', header: 'ID Type' },
      { field: 'idNumber', header: 'ID Number' },
      { field: 'totalBenificiary', header: 'Total Ben.' }
  ]
  }
// needs to check bind issue 
  ngOnInit(): void {
    this.customerInfoMeta.tblCustomerDataArray = [{
      customerCode: 1, customerFullName: "Suresh A", nationality: "Indian", mobileNumber: "9876543210", idType: "PID", idNumber:"12343323", totalBenificiary: 20  
    }]
  }  

  onChange(section: any, controlId: any, controllType: any, event) {
    console.log("event", event, section, controlId)
    if(section=="customerMap") {
      this.customerMap[controlId] = (event) && (event);
      this.customerMap.uniqueIdentifierValue = "";
      console.log("this.customerMap", this.customerMap)
    }
  }

  searchCustomerMap() {
    console.log("customerMap", this.customerMap)
    let s = []; s.push(this.customerMap);
    s = s.map(x=> {
      return x.uniqueIdentifier+'='+x.uniqueIdentifierValue
    })
    let tempArr = []; Object.assign(tempArr, this.customerInfoMeta.customerMapConditions);
    tempArr.push(s[0]);
    this.customerInfoMeta.customerMapConditions = tempArr;
    console.log("conditions", this.customerInfoMeta.customerMapConditions)
  }

}
