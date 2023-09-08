import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { CoreService } from 'src/app/core.service';

@Component({
  selector: 'app-add-customer-benef',
  templateUrl: './add-customer-benef.component.html',
  styleUrls: ['./add-customer-benef.component.scss']
})
export class AddCustomerBenefComponent implements OnInit {
  
  @Input('formData') formData: any
  @Input('beneData') beneData: any

  @Output() postData = new EventEmitter<any>();

  masterData = {
    serviceCategory: [
      {
        code: "Bank",
        codeName: "Bank",
      },
      {
        code: "Cash",
        codeName: "Cash",
      },
      {
        code: "Utility",
        codeName: "Utility",
      },
    ],
    bankAccountType: [
      {
        code: "Saving A/c",
        codeName: "Saving A/c",
      },
      {
        code: "Current A/c",
        codeName: "Current A/c",
      },
    ],
    bankName: [
      {
        code: "SBI",
        codeName: "SBI",
      },
      {
        code: "ICICI",
        codeName: "ICICI",
      },
      {
        code: "HDFC",
        codeName: "HDFC",
      },
      {
        code: "AXIS",
        codeName: "AXIS",
      },
    ],
    salaryDateEmpDetails: [],
    banksBranch: [
      {
        code: "Hyderabad",
        codeName: "Hyderabad",
      },
      {
        code: "Mumbai",
        codeName: "Mumbai",
      },
      {
        code: "Delhi",
        codeName: "Delhi",
      },
    ],
    nationality: [
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
    utilityBiller: [
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
    countryOfResidence: [
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
    "permanentCountry ": [
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
    countryOfBirth: [
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
    country: [
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
    utilityType: [
      {
        code: "Gst",
        codeName: "Gst",
      },
      {
        code: "Rtgs",
        codeName: "Rtgs",
      },
      {
        code: "Imps",
        codeName: "Imps",
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
    gender: [
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

  custId = null;
  userId = null;
  submitted =false;
  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");

  individualForm: FormGroup;
  formSections: any[] = [];
  apiData: any = {};

  objectKeys = Object.keys;
 
  formDataOrg = {}
  beneDataOrg = {}

  constructor(
    private coreService: CoreService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
  }
  
  ngOnChanges(e: any){
    console.log("ngonchanges", e)
    
    if(e.formData && e.formData.currentValue){
      this.formDataOrg = JSON.parse(JSON.stringify((e.formData.currentValue)))
      this.setFormByData(e.formData.currentValue)
    }

    if(e.beneData && e.beneData.currentValue){
      this.beneDataOrg = JSON.parse(JSON.stringify((e.beneData.currentValue)))
      if(Object.keys(this.formDataOrg).length){
        this.setBenefEditFormData(e.beneData.currentValue)
      }
    }

  }

  setFormByData(data: any) {
    this.apiData = data;
    this.individualForm = this.formBuilder.group({});
    console.log(data);
    let allFormSections = [];
    Object.keys(data).forEach((key) => {
      let formSection = {
        formName: key,
        fields: data[key]
          .map((secData) => {
            let fieldData = {
              name: secData["fieldName"],
              formLableFieldSequence: secData["formLableFieldSequence"],
              fieldName: secData["fieldName"],
              fieldType: secData["fieldType"],
              fieldSubtype: secData["fieldSubtype"],
              fieldLabel: secData["fieldLabel"],
              required: secData["isMandatory"] == "Y" ? true : false,
              enable: secData["isEnable"] == "Y" ? true : false,
              visible:
                !secData["isVisibile"] || secData["isVisibile"] == "Y"
                  ? true
                  : false,
              validLength: secData["validLength"],
              defaultValue: secData["defaultValue"],
              apiKey: secData["apiKey"],
              minLength:
                secData["validLength"]?.length > 0 &&
                secData["validLength"] != "null"
                  ? +secData["validLength"].split("-")[0]
                  : false,
              maxLength:
                secData["validLength"]?.length > 0 &&
                secData["validLength"] != "null"
                  ? +secData["validLength"].split("-")[1]
                  : 100,
              regex:
                secData["regex"] &&
                secData["regex"] != "null" &&
                secData["regex"].trim().length
                  ? secData["regex"]
                  : false,
              minDate:
                secData["fieldType"] == "date"
                  ? secData["minDate"]
                    ? new Date(secData["minDate"])
                    : this.pastYear
                  : this.pastYear,
              maxDate:
                secData["fieldType"] == "date"
                  ? secData["maxDate"]
                    ? new Date(secData["maxDate"])
                    : this.futureYear
                  : this.futureYear,
              defaultDate:
                secData["fieldType"] == "date"
                  ? secData["initialDate"]
                    ? new Date(secData["initialDate"])
                    : new Date()
                  : new Date(),
            };
            return fieldData;
          })
          .sort((a, b) => a.formLableFieldSequence - b.formLableFieldSequence),
      };
      allFormSections.push(formSection);
    });

    this.formSections = allFormSections;
    console.log(this.formSections);
    this.formSections.forEach((section) => {
      let haveVisibleFields = true;
      const sectionGroup = new UntypedFormGroup({});
      section.fields.forEach((field) => {
        if (field.visible) {
          haveVisibleFields = true;
        }
        let validators = [];
        if (field.validLength?.length > 0 && field.validLength != "null") {
          let min = +field.validLength?.split("-")[0];
          let max = +field.validLength?.split("-")[1];
          validators.push(Validators.minLength(min));
          validators.push(Validators.maxLength(max));
        }
        if (field.required) {
          validators.push(Validators.required);
        }
        if (field.regex) {
          validators.push(Validators.pattern(field.regex));
        }
        sectionGroup.addControl(
          field.name,
          this.formBuilder.control(
            {
              value:
                field.defaultValue?.length > 0 && field.defaultValue != "null"
                  ? field.defaultValue
                  : "",
              disabled: !field.enable,
            },
            validators
          )
        );
      });
      section["isVisible"] = haveVisibleFields ? true : false;
      this.individualForm.addControl(section.formName, sectionGroup);
    });

    this.coreService.removeLoadingScreen();
  }

  setBenefEditFormData(data: any) {
    console.log("dataedit",data)
    this.apiData = data;
    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field["fieldName"] in data) {
          if (
            field.fieldType == "select" ||
            field.fieldType == "smart-search"
          ) {
            let value = data[field["fieldName"]]
              ? {
                  code: data[field["fieldName"]],
                  codeName: data[field["fieldName"]],
                }
              : "";
            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "checkbox") {
            let value = data[field["fieldName"]] == true ? true : false;
            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "date") {
            let dateFormatted = data[field["fieldName"]]
              ? !isNaN(Date.parse(data[field["fieldName"]]))
                ? new Date(data[field["fieldName"]]).toLocaleDateString("en-GB")
                : new Date(
                    data[field["fieldName"]].split("/").reverse().join("-")
                  ).toLocaleDateString("en-GB")
              : "";

            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(dateFormatted);
          } else {
            this.individualForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(data[field["fieldName"]]);
          }
        }
      });
    });
  }

onSubmit(): void {
    this.submitted = true;

    if (this.individualForm.invalid) {
      this.coreService.showWarningToast("Some fields are invalid");
      return;
    }

    this.coreService.displayLoadingScreen();

    let data = this.individualForm.getRawValue();

    let payloadData = Object.assign({}, ...Object.values(data));

    this.formSections.forEach((section) => {
      
        section.fields.forEach((field) => {
          if (
            field.fieldType == "select" ||
            field.fieldType == "smart-search"
          ) {
            let value = payloadData[field["fieldName"]]
              ? payloadData[field["fieldName"]]["codeName"]
              : "";
            payloadData[field["fieldName"]] = value;
          } else if (field.fieldType == "checkbox") {
            let value = payloadData[field["fieldName"]] == true ? true : false;
            payloadData[field["fieldName"]] = value;
          } else if (field.fieldType == "date") {
            let dateFormatted = payloadData[field["fieldName"]]
              ? !isNaN(Date.parse(payloadData[field["fieldName"]]))
                ? new Date(payloadData[field["fieldName"]]).toLocaleDateString(
                    "en-GB"
                  )
                : new Date(
                    payloadData[field["fieldName"]]
                      .split("/")
                      .reverse()
                      .join("-")
                  ).toLocaleDateString("en-GB")
              : "";
            payloadData[field["fieldName"]] = dateFormatted;
          } else {
            payloadData[field["fieldName"]] =
              payloadData[field["fieldName"]] == "null" ||
              payloadData[field["fieldName"]] == null
                ? ""
                : payloadData[field["fieldName"]];
          }
        });
      });
      console.log("payloadData",payloadData)

  //   let payloadFormData = new FormData();
  //   console.log("post",payloadFormData)
  //   for (var pair of payloadFormData.entries()) {
  //     console.log(pair[0]+ ', ' + pair[1]); 
  // }
  //     for (let key in payloadData) {
  //       payloadFormData.append(key, payloadData[key]);
  //     }
  //     console.log("formdata",payloadFormData)
      this.postData.emit(payloadData);
  // this.saveBeneficiaryCustomer()


  }
    // payloadData["status"] = "Active";
   
}