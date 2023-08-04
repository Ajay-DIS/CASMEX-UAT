import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-add-customer",
  templateUrl: "./add-customer.component.html",
  styleUrls: ["./add-customer.component.scss"],
})
export class AddCustomerComponent implements OnInit {
  Select: "Select";

  constructor(
    private coreService: CoreService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {}
  @Input("activeIndex") activeTabIndex: any;

  // --------------------AJAY STSARTSSSSSSSSSSSSSS

  userId = null;
  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date(this.today.setFullYear(this.today.getFullYear() - 18));
  expiryMinDate = new Date();
  issueMaxDate = new Date();
  objectKeys = Object.keys;
  showForm: boolean = true;
  submitted = false;

  individualForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];

  uploadedFiles: any[] = [];

  noDataMsg = null;

  Options = [
    { name: "first", code: "NY" },
    { name: "second", code: "RM" },
    { name: "third", code: "LDN" },
  ];

  masterData = {
    profession: [
      {
        code: "plumber",
        codeName: "plumer",
      },
      {
        code: "driver",
        codeName: "driver",
      },
    ],
    politicallyExposedPerson: [
      {
        code: "yes",
        codeName: "yes",
      },
      {
        code: "no",
        codeName: "no",
      },
    ],
    visaStatus: [
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
    salaryDate:[],
    customerGroup: [
      {
        code: "1",
        codeName: "1",
      },
      {
        code: "2",
        codeName: "2",
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
        codeName: "America ",
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
        codeName: "America ",
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
        codeName: "America ",
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
        codeName: "America ",
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
        codeName: "America ",
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
        codeName: "America ",
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
        codeName: "America ",
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
        codeName: "America ",
      },
    ],
    representativeIdIssueCountry: [
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
        codeName: "America ",
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


  kycData = [];
  // prettier-ignore
  

  mode = "add";
  custId = null;
  custType = "IND";

  CustomerData: any = null;

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS

  // --------------------AJAY STARTSSSSSSSSSSSSSSSSSS
  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
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
        this.activeTabIndex = 1;
      } else {
        this.activeTabIndex = 0;
      }
    }
    console.log(this.custId, this.custType);
    for(let i=1; i<=30; i++){
    this.masterData.salaryDate.push({code: i,codeName:i})
    }

    this.http.get(`/remittance/formRulesController/getFormRules`, {
      headers: new HttpHeaders()
        .set(
          "criteriaMap",
          "Country = IND;Form = Customer Profile;Customer Type = IND"
        )
        .set("form", "Form Rules")
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
          this.setFormByData(res);
          if (this.mode == "edit") {
            this.getIndividualCustomer(this.custId);
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


  handleChange(event: any) {
    this.activeTabIndex = event.index;
    if (this.activeTabIndex != 0) {
      this.coreService.showWarningToast("Unsaved change has been reset");
      this.onReset();
    }
  }

  setFormByData(data: any) {
    this.apiData = data;
    this.individualForm = this.formBuilder.group({});
console.log(data)
    let allFormSections = [];
    Object.keys(data).forEach((key) => {

      let formSection = {
        formName: key,
        fields: data[key].map((secData) => {
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
                : secData["minDate"],
            maxDate:
              secData["fieldType"] == "date"
                ? secData["maxDate"]
                  ? new Date(secData["maxDate"])
                  : this.pastYear
                : secData["maxDate"],
            defaultDate:
              secData["fieldType"] == "date"
                ? secData["initialDate"]
                  ? new Date(secData["initialDate"])
                  : this.pastYear
                : secData["initialDate"],
          };
          return fieldData;
        }).sort((a, b) => a.formLableFieldSequence - b.formLableFieldSequence),
      };
      allFormSections.push(formSection);
    });

    this.formSections = allFormSections;
console.log(this.formSections)
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
            field.defaultValue?.length > 0 && field.defaultValue != "null"
              ? field.defaultValue
              : "",
            validators
          )
        );
      });
      section["isVisible"] = haveVisibleFields ? true : false;
      this.individualForm.addControl(section.formName, sectionGroup);
    });

    this.coreService.removeLoadingScreen();
  }

  onUpload(event: any) {
    console.log(event);
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.coreService.showWarningToast("File Uploaded");
  }

  sameAddress(event: any, fieldName: any) {
    if (fieldName == "permanentAddressSameAsAbove") {
      let address;
      if (event.checked) {
        address = {
          permanentCountry: this.individualForm
            .get("Contact Details")
            ?.get("contactCountry")?.value,
          permanentHouseBuildingNumber: this.individualForm
            .get("Contact Details")
            ?.get("contactHouseBuildingNo")?.value,
          permanentBlockNumber: this.individualForm
            .get("Contact Details")
            ?.get("contactBlockNumber")?.value,
          permanentStreetName: this.individualForm
            .get("Contact Details")
            ?.get("contactStreetName")?.value,
          permanentCity: this.individualForm
            .get("Contact Details")
            ?.get("contactCity")?.value,
          permanentPinZipCode: this.individualForm
            .get("Contact Details")
            ?.get("contactPinZipCode")?.value,
        };
      } else {
        address = {
          permanentCountry: "",
          permanentHouseBuildingNumber: "",
          permanentBlockNumber: "",
          permanentStreetName: "",
          permanentCity: "",
          permanentPinZipCode: "",
        };
      }

      console.log(address);

      this.individualForm.get("Contact Details").patchValue(address);
    }
  }

  selectRowForEdit(row) {
    console.log("row", row);
    // this.individualForm.setValue()
    this.individualForm
      .get("KYC Doc Upload")
      .get("documentType")
      .patchValue(this.Options.filter((opt) => opt.name == row.docType)[0]);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idNumber")
      .patchValue(row.idNumber);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idIssueDate")
      .patchValue(row.idIssueDate);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idExpiryDate")
      .patchValue(row.idExpiryDate);
    console.log(
      "gett",
      this.individualForm.get("KYC Doc Upload").get("idExpiryDate")
    );
    console.log("roww", row.idExpiryDate);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idIssueAuthority")
      .patchValue(row.idIssueAuthority);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idIssueCountry")
      .patchValue(row.idIssueCountry);
    this.individualForm
      .get("KYC Doc Upload")
      .get("uploadFrontSide")
      .setValue("fileName", row.uploadFrontSide);
    this.individualForm
      .get("KYC Doc Upload")
      .get("uploadBackSide")
      .patchValue(row.uploadBackSide);
  }

  addKyc() {
    // console.log("fields", this.individualForm)
    // let kycData = this.individualForm.value["KYC Doc Upload"];
    // let kycDataObj = {
    //   docType: kycData.documentType.name,
    //   idNumber: kycData.idNumber,
    //   idIssueDate: kycData.idIssueDate
    //     ? new Intl.DateTimeFormat("en-US", {
    //         year: "numeric",
    //         month: "2-digit",
    //         day: "2-digit",
    //       }).format(new Date(kycData.idIssueDate))
    //     : "",
    //   idExpiryDate: kycData.idExpiryDate
    //     ? new Intl.DateTimeFormat("en-US", {
    //         year: "numeric",
    //         month: "2-digit",
    //         day: "2-digit",
    //       }).format(new Date(kycData.idExpiryDate))
    //     : "",
    //   idIssueAuthority: kycData.idIssueAuthority,
    //   idIssueCountry: kycData.idIssueCountry,
    //   uploadFrontSide: kycData.uploadFrontSide
    //     ? this.getUploadedFileName(kycData.uploadFrontSide)
    //     : "",
    //   uploadBackSide: kycData.uploadBackSide
    //     ? this.getUploadedFileName(kycData.uploadBackSide)
    //     : "",
    // };
    // this.individualForm.reset();
    
    // let index = this.customerIndividual[3].uploadedKyc.findIndex(
    //   (x) => x.idNumber == kycDataObj.idNumber
    // );
    // console.log("index", index);
    // if (index == -1) {
    //   this.customerIndividual[3].uploadedKyc.push(kycDataObj);
    // } else {
    //   this.customerIndividual[3].uploadedKyc[index] = kycDataObj;
    // }
  }

  getUploadedFileName(fileUrl) {
    var n = fileUrl.lastIndexOf("\\");
    return fileUrl.substring(n + 1);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.individualForm.invalid) {
      return;
    }
    let payloadData = Object.assign(
      {},
      ...Object.values(this.individualForm.value)
    );

    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.fieldType == "select" || field.fieldType == "smart-search") {
          let value = payloadData[field["fieldName"]]
            ? payloadData[field["fieldName"]]["codeName"]
            : "";
          payloadData[field["fieldName"]] = value;
        }
        if (field.fieldType == "checkbox") {
          let value = payloadData[field["fieldName"]] == true ? true : false;
          payloadData[field["fieldName"]] = value;
        }
        if (field.fieldType == "date") {
          let dateFormatted = payloadData[field["fieldName"]]
            ? new Date(payloadData[field["fieldName"]])
                .toLocaleDateString("en-GB")
                .split("/")
                .reverse()
                .join("-")
            : "";
          payloadData[field["fieldName"]] = dateFormatted;
        }
      });
    });

    payloadData["status"] = "A";
    if (this.mode == "edit") {
      payloadData["createdBy"] = this.CustomerData["createdBy"];
      payloadData["createdDateTime"] = this.CustomerData["createdDateTime"];
      payloadData["updatedBy"] = this.CustomerData["updatedBy"];
      payloadData["updatedDateTime"] = this.CustomerData["updatedDateTime"];
      payloadData["idExpireDate"] = this.CustomerData["idExpireDate"];
      payloadData["id"] = this.custId;
      this.updateIndividualCustomer(payloadData);
    } else {
      this.saveIndividualCustomer(payloadData);
    }
    console.log(JSON.stringify(payloadData, null, 2));
  }

  saveIndividualCustomer(payload: any) {
    this.http
      .post(
        `/remittance/individualCustomerController/saveIndividualCustomer`,
        payload,
        {
          headers: new HttpHeaders().set("userId", this.userId),
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            this.coreService.showSuccessToast(res["data"]);
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


  getIndividualCustomer(custId: any) {
    this.http
      .get(
        `/remittance/individualCustomerController/getIndividualCustomerDetails/${custId}`,
        {
          headers: new HttpHeaders().set("userId", this.userId),
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            console.log(res["data"]);
            this.setCustomerFormData(res["data"]);
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

  setCustomerFormData(data: any) {
    this.CustomerData = data;
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
              ? new Date(data[field["fieldName"]]).toLocaleDateString("en-US")
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

  updateIndividualCustomer(payload: any) {
    this.http
      .put(
        `/remittance/individualCustomerController/updateIndividualCustomer`,
        payload,
        {
          headers: new HttpHeaders().set("userId", this.userId),
        }
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          if (res["status"] == "200") {
            this.coreService.showSuccessToast(res["data"]);
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
    this.submitted = false;
    if (this.individualForm) this.individualForm.reset();
  }

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS
}
