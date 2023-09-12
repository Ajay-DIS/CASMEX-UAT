import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { CoreService } from 'src/app/core.service';

@Component({
  selector: 'app-add-beneficiary',
  templateUrl: './add-beneficiary.component.html',
  styleUrls: ['./add-beneficiary.component.scss']
})
export class AddBeneficiaryComponent implements OnInit {
  Select: "Select";
  constructor(
    private coreService: CoreService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService
  ) { }

  activeTabIndex: any = '0';
  previousTabIndex: any = '0';

  formData: any;
  beneData:any;

  userId = null;
  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date(this.today.setFullYear(this.today.getFullYear() - 18));
  expiryMinDate = new Date();
  issueMaxDate = new Date();
  objectKeys = Object.keys;
  showForm: boolean = false;
  submitted = false;

  individualForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];

  noDataMsg = null;

  Options = [
    { name: "first", code: "NY" },
    { name: "second", code: "RM" },
    { name: "third", code: "LDN" },
  ];

  masterData = {
    professionEmpDetails: [
      {
        code: "plumber",
        codeName: "plumber",
      },
      {
        code: "driver",
        codeName: "driver",
      },
    ],
    politicallyExposedPersonPersonalDetails: [
      {
        code: "yes",
        codeName: "yes",
      },
      {
        code: "no",
        codeName: "no",
      },
    ],
    visaStatusEmpDetails: [
      {
        code: "Work Permit",
        codeName: "Work Permit",
      },
      {
        code: "Resident",
        codeName: "Resident",
      },
      {
        code: "Non Resident",
        codeName: "Non Resident",
      },
      {
        code: "Citizen",
        codeName: "Citizen",
      },
      {
        code: "Tourist",
        codeName: "Tourist",
      },
      {
        code: "Other",
        codeName: "Other",
      },
    ],
    salaryDateEmpDetails: [],
    customerGroupPersonalDetails: [
      {
        code: "1",
        codeName: "1",
      },
      {
        code: "2",
        codeName: "2",
      },
    ],
    nationalityPersonalDetails: [
      {
        code: "Indian",
        codeName: "Indian",
      },
      {
        code: "Japanese",
        codeName: "Japanese",
      },
      {
        code: "American",
        codeName: "American",
      },
    ],
    representativeNationality: [
      {
        code: "Indian",
        codeName: "Indian",
      },
      {
        code: "Japanese",
        codeName: "Japanese",
      },
      {
        code: "American",
        codeName: "American",
      },
    ],
    countryOfEstablishment: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    countryOfOperation: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    countryOfTrade: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    contactCountry: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    permanentCountry: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    countryOfBirthPersonalDetails: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    idIssueCountry: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    representativeCountryOfBirth: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    representativeIssueCountry: [
      {
        code: "Japan",
        codeName: "Japan",
      },
      {
        code: "India",
        codeName: "India",
      },
      {
        code: "America",
        codeName: "America",
      },
    ],
    relationship: [
      {
        code: "Brother",
        codeName: "Brother",
      },
      {
        code: "Uncle",
        codeName: "Uncle",
      },
    ],
    representativeRelationship: [
      {
        code: "Brother",
        codeName: "Brother",
      },
      {
        code: "Uncle",
        codeName: "Uncle",
      },
    ],
    documentType: [
      {
        code: "Aadhar",
        codeName: "Aadhar",
      },
      {
        code: "Voter",
        codeName: "Voter",
      },
    ],
    representativeDocumentType: [
      {
        code: "Aadhar",
        codeName: "Aadhar",
      },
      {
        code: "Voter",
        codeName: "Voter",
      },
    ],
    genderPersonalDetails: [
      {
        code: "Male",
        codeName: "Male",
      },
      {
        code: "Female",
        codeName: "Female",
      },
      {
        code: "Others",
        codeName: "Others",
      },
    ],
    representativeGender: [
      {
        code: "Male",
        codeName: "Male",
      },
      {
        code: "Female",
        codeName: "Female",
      },
      {
        code: "Others",
        codeName: "Others",
      },
    ],
    businessActivites: [
      {
        code: "Manufacturing",
        codeName: "Manufacturing",
      },
      {
        code: "Trading",
        codeName: "Trading",
      },
      {
        code: "Services",
        codeName: "Services",
      },
    ],
    legalStatus: [
      {
        code: "Private Limited",
        codeName: "Private Limited",
      },
      {
        code: "Public Limited",
        codeName: "Public Limited",
      },
      {
        code: "Sole Proprietorship",
        codeName: "Sole Proprietorship",
      },
      {
        code: "Partnership",
        codeName: "Partnership",
      },
      {
        code: "Limited Liability Partnership",
        codeName: "Limited Liability Partnership",
      },
    ],
    ownershipType: [
      {
        code: "Sponsor",
        codeName: "Sponsor",
      },
      {
        code: "Partner",
        codeName: "Partner",
      },
      {
        code: "Both",
        codeName: "Both",
      },
    ],
    category: [
      {
        code: "First",
        codeName: "First",
      },
      {
        code: "Second",
        codeName: "Second",
      },
    ],
  };

  mode = "add";
  custId = null;
  custType = "IND";
  customerId = null;
  status = null;

  CustomerData: any = null;

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.activatedRoute.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];

    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      this.custId = params.id;
      this.custType = params.type;
      if (this.custType == "COR") {
        console.log("Here");
        this.activeTabIndex = 1;
        this.previousTabIndex = 1
      } else {
        this.activeTabIndex = 0;
      }
    }
    console.log(this.custId, this.custType);
    
      this.getFormRulesFields(this.custType)

  }

  handleChange(event: any) {
    console.log(this.previousTabIndex, this.activeTabIndex, event)
    this.activeTabIndex = event.index;
    if (this.activeTabIndex != this.previousTabIndex) {
      this.previousTabIndex = this.activeTabIndex
      this.coreService.showWarningToast("Unsaved change has been reset");
      if (this.individualForm) {
        this.individualForm.reset();
      }
      if(this.activeTabIndex == '0'){
        console.log("IND cal")
        this.getFormRulesFields('IND')
        this.custType = 'IND'
      }else{
        this.getFormRulesFields('COR')
        this.custType = 'COR'
        console.log("COR cal")
      }
    }
  }

  getFormRulesFields(custType: any){
    this.coreService.displayLoadingScreen();
    this.http
        .get(`/remittance/formRulesController/getFormRules`, {
          headers: new HttpHeaders()
            .set(
              "criteriaMap",
              `Country = IND;Form = Customer Profile;Customer Type = ${custType == 'IND' ? 'IND' : 'COR'}`
            )
            .set("form", "Customer Profile Beneficiary_Form Rules")
            .set("moduleName", "Remittance")
            .set("applications", "Casmex Core"),
        })
        .subscribe(
          (res) => {
            this.showForm = true;
            if (res["msg"]) {
              this.noDataMsg = res["msg"];
              this.apiData = {};
              this.coreService.removeLoadingScreen();
            } else {
              // this.setFormByData(res);
              this.formData = res
              console.log("API called",this.formData)
              if (this.mode == "edit") {
                this.getBeneficiaryData(this.custId);
              }
            }
          },
          (err) => {
            this.coreService.showWarningToast(
              "Some error while fetching data, Try again in sometime"
            );
            this.noDataMsg = true;
            this.coreService.removeLoadingScreen();
          }
        );
  }

  getBeneficiaryData(custId: any) {
    this.http
      .get(
        `/remittance/beneficiaryProfileController/getBeneficiaryProfile/${custId}`,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            console.log(res["responseData"]);
             this.beneData = res['responseData']
            // this.setCustomerFormData(res["data"]);
            console.log()
            this.customerId = res['responseData']['customerId'];
            this.status = res['responseData']['status']
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while fetching data, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
  }

  onSubmit(payload:any, custType: any): void {
    this.submitted = true;
      let payloadFormData = new FormData();
      for (let key in payload) {
        payloadFormData.append(key, payload[key]);
      }
      console.log("formdata",payloadFormData)
      if(this.mode == "edit"){
        payload["id"] = +this.custId;
        payload["customerId"] =this.customerId;
        payload["customerType"]= this.custType == 'COR' ? 'Corporate' : 'Individual';
        payload["status"] = String(this.status)
        this.saveBeneficiaryForEdit(payload, custType);
      }else{;
        payload["customerId"] =+this.custId;;
        payload["customerType"]= this.custType == 'COR' ? 'Corporate' : 'Individual';
        payload["status"] = String(this.status='Active')
        this.saveBeneficiaryCustomer(payload, custType);
      }
  
  }
  saveBeneficiaryForEdit(payload: any, custType: any) {
    this.http.put(
      `/remittance/beneficiaryProfileController/updateBeneficiaryProfile`,
      payload,
      {
        headers: new HttpHeaders()
          .set("userId", this.userId)
          .set("customerType", this.custType == 'COR' ? 'Corporate' : 'Individual'),
      }
    )
    .subscribe(
      (res) => {
        if (res["status"] == "200") {
          if (res["data"]) {
            this.coreService.showSuccessToast(res["data"]);
          } else {
            this.coreService.showSuccessToast(
              "Profile data Updated successfully saved"
            );
          }
          this.router.navigate(["navbar", "customer-profile"]);
          // this.onReset()
        } else {
          this.coreService.removeLoadingScreen();
        }
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while saving data, Try again in sometime"
        );
        console.log("err",err)
        this.coreService.removeLoadingScreen();
      }
    );
  }
  saveBeneficiaryCustomer(payload: any, custType: any) {
    console.log(this.userId)
    console.log(this.custType)
    this.http.post(
        `/remittance/beneficiaryProfileController/saveBeneficiaryProfile`,
        payload,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set("customerType", this.custType == 'COR' ? 'Corporate' : 'Individual'),
        }
      )
      .subscribe(
        (res) => {
          if (res["status"] == "200") {
            if (res["data"]) {
              this.coreService.showSuccessToast(res["data"]);
            } else {
              this.coreService.showSuccessToast(
                "Profile data successfully saved"
              );
            }
            this.router.navigate(["navbar", "customer-profile"]);
            // this.onReset()
          } else {
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while saving data, Try again in sometime"
          );
          console.log("err",err)
          this.coreService.removeLoadingScreen();
        }
      );
  }

  updateBeneficiaryCustomer(payload: any) {
    this.http
      .put(
        `/remittance/corporateCustomerController/updateCorporateCustomer`,
        payload,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set("customerType", "Individual"),
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            if (res["data"]) {
              this.coreService.showSuccessToast(res["data"]);
            } else {
              this.coreService.showSuccessToast(
                "Profile data updated successfully"
              );
            }
            // this.onReset()
          }
        },
        (err) => {
          this.coreService.showWarningToast(
            "Some error while saving data, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
  }

  onReset(): void {
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
    this.confirmationService.confirm({
      message:
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        "Resetting will result in the removal of all data. Are you sure you want to proceed ?",
      key: "resetINDWarning",
      accept: () => {
        this.submitted = false;
        if (this.individualForm) {
          this.individualForm.reset();
        }
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }
  setHeaderSidebarBtn() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }
}
