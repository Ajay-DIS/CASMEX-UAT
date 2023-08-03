import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-corporate",
  templateUrl: "./corporate.component.html",
  styleUrls: ["./corporate.component.scss"],
})
export class CorporateComponent implements OnInit, OnChanges {
  constructor(
    private coreService: CoreService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {}

  @Input("activeIndex") activeTabIndex: any;

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

  corporateForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];

  uploadedFiles: any[] = [];

  noDataMsg = null;

  Options = [
    { name: "first", code: "NY" },
    { name: "second", code: "RM" },
    { name: "third", code: "LDN" },
  ];

  // prettier-ignore

  masterData = {
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

  mode = "edit";

  ngOnChanges(changes: any) {
    if (changes["activeTabIndex"]) {
      if (changes["activeTabIndex"]["currentValue"] != 1) {
        this.coreService.showWarningToast("Unsaved change has been reset");
        this.onReset();
      }
    }
  }

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];

    if (this.corporateForm) this.onReset();
    this.http
      .get(`/remittance/formRulesController/getFormRules`, {
        headers: new HttpHeaders()
          .set(
            "criteriaMap",
            "Country = IND;Form = Customer Profile;Customer Type = COR"
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
            this.coreService.removeLoadingScreen();
            this.setFormByData(res);
            if (this.mode == "edit") {
              this.getCorporateCustomer("49");
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

  getMinDate(dateType: any) {
    let minDate = new Date();
    if (dateType == "expiry") {
    } else if (dateType == "issue") {
      minDate.setFullYear(1950);
    } else if (dateType == "dob") {
      minDate.setFullYear(1950);
    } else {
      minDate.setFullYear(1950);
    }
    return minDate;
  }

  getMaxDate(dateType: any) {
    let maxDate = new Date();
    if (dateType == "expiry") {
      maxDate.setFullYear(2050);
    } else if (dateType == "issue") {
    } else if (dateType == "dob") {
      maxDate.setFullYear(maxDate.getFullYear() - 18);
    } else {
      maxDate.setFullYear(2050);
    }
    return maxDate;
  }

  getDefaultDate(dateType: any) {
    let defDate = new Date();
    if (dateType == "expiry") {
    } else if (dateType == "issue") {
    } else if (dateType == "dob") {
      defDate.setFullYear(defDate.getFullYear() - 18);
    } else {
    }
    return defDate;
  }

  setFormByData(data: any) {
    console.log(data);
    this.apiData = data;
    this.corporateForm = this.formBuilder.group({});

    let allFormSections = [];
    Object.keys(data).forEach((key) => {
      let formSection = {
        formName: key,
        fields: data[key].map((secData) => {
          let fieldData = {
            name: secData["fieldName"],
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
                : 40,
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
        }),
      };
      allFormSections.push(formSection);
    });

    this.formSections = allFormSections;

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
      this.corporateForm.addControl(section.formName, sectionGroup);
    });
    console.log(allFormSections);
    console.log(this.corporateForm);
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
          permanentCountry: this.corporateForm
            .get("Contact Details")
            ?.get("contractCountry")?.value,
          permanentHouseBuildingNumber: this.corporateForm
            .get("Contact Details")
            ?.get("contactHouseBulidingNumber")?.value,
          permanentBlockNumber: this.corporateForm
            .get("Contact Details")
            ?.get("contactBlockNumber")?.value,
          permanentStreetNumber: this.corporateForm
            .get("Contact Details")
            ?.get("contactStreetNumber")?.value,
          permanentCity: this.corporateForm
            .get("Contact Details")
            ?.get("contactCity")?.value,
          permanentPinZipcode: this.corporateForm
            .get("Contact Details")
            ?.get("contactPinZipcode")?.value,
        };
      } else {
        address = {
          permanentCountry: "",
          permanentHouseBuildingNumber: "",
          permanentBlockNumber: "",
          permanentStreetNumber: "",
          permanentCity: "",
          permanentPinZipcode: "",
        };
      }

      console.log(address);

      this.corporateForm.get("Contact Details").patchValue(address);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.corporateForm.invalid) {
      return;
    }
    let payloadData = Object.assign(
      {},
      ...Object.values(this.corporateForm.value)
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
      payloadData["id"] = "49";
      this.updateCorporateCustomer(payloadData);
    } else {
      this.saveCorporateCustomer(payloadData);
    }
    console.log(JSON.stringify(payloadData, null, 2));
  }

  saveCorporateCustomer(payload: any) {
    this.http
      .post(
        `/remittance/cooperateCustomerController/saveCooperateCustomer`,
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

  getCorporateCustomer(custId: any) {
    this.http
      .get(
        `/remittance/cooperateCustomerController/getCooperateCustomerDetails/${custId}`,
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
            this.corporateForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "checkbox") {
            let value = data[field["fieldName"]] == true ? true : false;
            this.corporateForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(value);
          } else if (field.fieldType == "date") {
            let dateFormatted = data[field["fieldName"]]
              ? new Date(data[field["fieldName"]]).toLocaleDateString("en-US")
              : "";
            this.corporateForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(dateFormatted);
          } else {
            this.corporateForm
              .get(section.formName)
              .get(field.fieldName)
              .patchValue(data[field["fieldName"]]);
          }
        }
      });
    });
  }

  updateCorporateCustomer(payload: any) {
    this.http
      .put(
        `/remittance/cooperateCustomerController/updateCooperateCustomer`,
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
    if (this.corporateForm) this.corporateForm.reset();
  }
}
