import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/core.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss']
})
export class AddCustomerComponent implements OnInit {

  Select:"Select"
  constructor(private coreService: CoreService,private route: ActivatedRoute,) { }
  minDate = new Date();
  idExpiryDateMin:Date = new Date();
  eighteenYearsAgo = new Date(this.minDate.setFullYear(this.minDate.getFullYear()-18));
  AfterTenYears = new Date('07/31/2028');
 


  customerInfo = {
    firstName: "",middleName:"",lastName:"" ,gender:"", dateOfBirth: "",countryOfBirth:""
    ,natoinality:"", customerGroup:"",politicallyExposedPerson:"",creditToParty:"",accountPaymentMode:"",country:"",
    mobileNumber:"",phoneNumber:"",email:"",houseNumber:"",blockNumber:"",
    streetNumber:"",city:"",pinZipCode:"",permanentAddressIsSameAsAbove:"",employerName:"",
    profession:"",salaryDate:"",monthlySalary:"",visaStatus:"",documentType: "",idNumber:"",idIssueDate:"",idExpiryDate:"",
    idIssueAuthority:"",idIssueCountry:"",repFirstName:"",repMiddleName:"",repLastName:"",
    repGender:"",repDateOfBirth:"",repCountryOfBirth:"",repNatoinality:"",repRelationship:"",repDocumentType:"",
    repIdNumberDate:"",repIdIssueDate:"",repIdExpiryDate:"",repIdIssueAuthority:"",repIdIssueCountry:"",repVisaExpiryDate:"",
    repAuthorizationLetterExpiryDate:""
  }

  customerInfoMeta = {
    politicallyExposedPersonOptions: [{name: "Yes", code: "Yes"}, {name: "No", code: "No"}],
    customerGenderOptions: [{name: "Male", code: "Male"}, {name: "Female", code: "Female"}],
    salaryDateOptions:[{name: "1", code: "1"}, {name: "2", code: "2"},{name: "3", code: "3"}, {name: "4", code: "4"},{name: "5", code: "5"}, {name: "6", code: "6"},
    {name: "7", code: "7"}, {name: "8", code: "8"},{name: "9", code: "9"}, {name: "10", code: "10"},{name: "11", code: "11"}, {name: "12", code: "12"},
    {name: "13", code: "13"},{name: "14", code: "14"},{name: "15", code: "15"},{name: "16", code: "16"},
    {name: "17", code: "17"},{name: "18", code: "18"},{name: "19", code: "19"},{name: "20", code: "20"},
    {name: "21", code: "21"},{name: "22", code: "22"},{name: "23", code: "23"},{name: "24", code: "24"},
    {name: "25", code: "25"},{name: "26", code: "26"},{name: "27", code: "27"},{name: "28", code: "28"},
    {name: "29", code: "29"},{name: "30", code: "30"},{name: "31", code: "31"}],
  }

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.coreService.removeLoadingScreen();
  }

  onChange(section, controlId, controlType, event) {

  }

  myUploader(event) {

  }

  resetCustomerInfo() {

  }

  saveCustomer() {
    if(this.validationFields()) { return} else {

    }
  }

  validationFields() {
    let flag = false;
    let requiredFields = [{label: 'First Name', field:'firstName'}, {label: 'Middle Name', field:'middleName'}, 
    {label: 'Last Name', field: 'lastName'},{label: 'Country', field: 'country'},
    {label: 'Mobile Number', field: 'mobileNumber'},
    {label: 'House/Building number', field: 'houseNumber'},
    {label: 'Employer Name', field: 'employerName'},{label: 'Pin/Zip Code', field: 'pinZipCode'},
    {label: 'Profession', field: 'profession'},{label: 'Visa Status', field: 'visaStatus'},
    {label: 'Document Type', field: 'documentType'},{label: 'ID Number', field: 'idNumber'},
    {label: 'ID Expiry Date', field: 'idExpiryDate'}];
    let msgList = [];
    requiredFields.forEach(x=> {
      if(this.customerInfo[x.field] == "" || this.customerInfo[x.field]== undefined || this.customerInfo[x.field]==null) {
        msgList.push(x.label);
      }
    })
    let msg = "Please enter required fields. "+msgList.join(', ');
    (msgList.length) && (flag = true) && (this.coreService.showWarningToast(msg));
    return flag;
  }

}
