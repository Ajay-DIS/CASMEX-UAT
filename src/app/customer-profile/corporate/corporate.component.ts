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
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
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

  mode = "add";
  custId = null;
  custType = "COR";

  CustomerData: any = null;

  uploadedDoc = {};
  uploadedKycData = [];
  uploadedRepresentativeData = [];
  uploadedBeneficialData = [];
  uploadedRepresDoc = {};
  uploadedBenefiDoc = {};

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

    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      this.custId = params.id;
      this.custType = params.type;
    }
    console.log(this.custId, this.custType);

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
            this.setFormByData(res);
            if (this.mode == "edit") {
              this.getCorporateCustomer(this.custId);
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

  setFormByData(data: any) {
    this.apiData = data;
    this.corporateForm = this.formBuilder.group({});

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
          })
          .sort((a, b) => a.formLableFieldSequence - b.formLableFieldSequence),
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
          permanentCountry: this.corporateForm
            .get("Contact Details")
            ?.get("contactCountry")?.value,
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

  disableInputsFile() {
    this.corporateForm
      ?.get("KYC Doc Upload")
      ?.get("uploadFrontSide")
      ?.disable();
    this.corporateForm
      ?.get("KYC Doc Upload")
      ?.get("uploadBackSide")
      ?.disable();
  }

  fileUploadChange(e: any, section: any, field: any, docId: any) {
    console.log(e.target.files[0], field);
    this.corporateForm
      ?.get(section)
      ?.get(field)
      .patchValue(e.target.files[0].name);
    if (this.uploadedDoc && this.uploadedDoc["idNumber"] == docId) {
      this.uploadedDoc[field] = e.target.files[0].name;
    } else {
      this.uploadedDoc["idNumber"] = docId;
      this.uploadedDoc[field] = e.target.files[0].name;
    }
    console.log(this.uploadedDoc);
  }

  selectRowForEdit(row) {
    console.log("row", row);
    this.corporateForm
      .get("KYC Doc Upload")
      .get("documentType")
      .patchValue(
        this.masterData["documentType"].filter(
          (opt) => opt.codeName == row.docType
        )[0]
      );
    this.corporateForm
      .get("KYC Doc Upload")
      .get("idNumber")
      .patchValue(row.idNumber);
    this.corporateForm
      .get("KYC Doc Upload")
      .get("idIssueDate")
      .patchValue(row.idIssueDate);
    this.corporateForm
      .get("KYC Doc Upload")
      .get("idExpiryDate")
      .patchValue(row.idExpiryDate);
    this.corporateForm
      .get("KYC Doc Upload")
      .get("idIssueAuthority")
      .patchValue(row.idIssueAuthority);
    this.corporateForm
      .get("KYC Doc Upload")
      .get("idIssueCountry")
      .patchValue(
        this.masterData["idIssueCountry"].filter(
          (opt) => opt.codeName == row.idIssueCountry
        )[0]
      );
    this.corporateForm
      .get("KYC Doc Upload")
      .get("uploadFrontSide")
      .patchValue(row.uploadFrontSide);
    this.corporateForm
      .get("KYC Doc Upload")
      .get("uploadBackSide")
      .patchValue(row.uploadBackSide);

    this.corporateForm.get("KYC Doc Upload").get("idNumber").disable();
  }
  selectRowForEditBeneficial(row) {
    console.log("row", row);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("ownershipType")
      .patchValue(
        this.masterData["ownershipType"].filter(
          (opt) => opt.codeName == row.ownershipType
        )[0]
      );
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("category")
      .patchValue(
        this.masterData["category"].filter(
          (opt) => opt.codeName == row.category
        )[0]
      );
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("noOfPartner")
      .patchValue(row.noOfPartner);
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("percentage")
      .patchValue(row.percentage);
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("firstName")
      .patchValue(row.firstName);
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("middelName")
      .patchValue(row.middelName);
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("lastName")
      .patchValue(row.lastName);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("gender")
      .patchValue(
        this.masterData["gender"].filter(
          (opt) => opt.codeName == row.gender
        )[0]
      );
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("dateOfBirth")
      .patchValue(row.dateOfBirth);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("countryOfBirth")
      .patchValue(
        this.masterData["countryOfBirth"].filter(
          (opt) => opt.codeName == row.countryOfBirth
        )[0]
      );
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("nationality")
      .patchValue(
        this.masterData["nationality"].filter(
          (opt) => opt.codeName == row.nationality
        )[0]
      );
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("relationship")
      .patchValue(
        this.masterData["relationship"].filter(
          (opt) => opt.codeName == row.relationship
        )[0]
      );
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("documentType")
      .patchValue(
        this.masterData["documentType"].filter(
          (opt) => opt.codeName == row.docType
        )[0]
      );
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("idNumber")
      .patchValue(row.idNumber);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("idIssueDate")
      .patchValue(row.idIssueDate);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("IdExpireDate")
      .patchValue(row.IdExpireDate);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("idIssueAuthority")
      .patchValue(row.idIssueAuthority);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("idIssueCountry")
      .patchValue(
        this.masterData["idIssueCountry"].filter(
          (opt) => opt.codeName == row.idIssueCountry
        )[0]
      );
      this.corporateForm
      .get("Beneficial Owner Details")
      .get("visaExpireDate")
      .patchValue(row.visaExpireDate);
    this.corporateForm
      .get("Beneficial Owner Details")
      .get("idCopyUpload")
      .patchValue(row.idCopyUpload);

    this.corporateForm.get("Beneficial Owner Details").get("idNumber").disable();
  }
  selectRowForEditRepresentative(row) {
    console.log("row", row);
    this.corporateForm
      .get("Representative Details")
      .get("representativeFirstName")
      .patchValue(row.representativeFirstName);
    this.corporateForm
      .get("Representative Details")
      .get("representativeMiddelName")
      .patchValue(row.representativeMiddelName);
    this.corporateForm
      .get("Representative Details")
      .get("representativeLastName")
      .patchValue(row.representativeLastName);
    this.corporateForm
      .get("Representative Details")
      .get("representativeGender")
      .patchValue(
        this.masterData["representativeGender"].filter(
          (opt) => opt.codeName == row.representativeGender
        )[0]
      );
    this.corporateForm
      .get("Representative Details")
      .get("representativeDob")
      .patchValue(row.representativeDob);
    this.corporateForm
      .get("Representative Details")
      .get("representativeCountryOfBirth")
      .patchValue(
        this.masterData["representativeCountryOfBirth"].filter(
          (opt) => opt.codeName == row.representativeCountryOfBirth
        )[0]
      );
    this.corporateForm
      .get("Representative Details")
      .get("representativeNationality")
      .patchValue(
        this.masterData["representativeNationality"].filter(
          (opt) => opt.codeName == row.representativeNationality
        )[0]
      );
    this.corporateForm
      .get("Representative Details")
      .get("representativeRelationship")
      .patchValue(
        this.masterData["representativeRelationship"].filter(
          (opt) => opt.codeName == row.representativeRelationship
        )[0]
      );
    this.corporateForm
      .get("Representative Details")
      .get("representativeDocumentType")
      .patchValue(
        this.masterData["representativeDocumentType"].filter(
          (opt) => opt.codeName == row.representativeDocumentType
        )[0]
      );
    this.corporateForm
      .get("Representative Details")
      .get("representativeIdNumber")
      .patchValue(row.representativeIdNumber);
    this.corporateForm
      .get("Representative Details")
      .get("representativeIdIssueDate")
      .patchValue(row.representativeIdIssueDate);
    this.corporateForm
      .get("Representative Details")
      .get("representativeIdExpireDate")
      .patchValue(row.representativeIdExpireDate);
    this.corporateForm
      .get("Representative Details")
      .get("representativeIdIssueAuthority")
      .patchValue(row.representativeIdIssueAuthority);
    this.corporateForm
      .get("Representative Details")
      .get("representativeIdIssueCountry")
      .patchValue(
        this.masterData["representativeIdIssueCountry"].filter(
          (opt) => opt.codeName == row.representativeIdIssueCountry
        )[0]
      );
    this.corporateForm
      .get("Representative Details")
      .get("representativeVisaExpireDate")
      .patchValue(row.representativeVisaExpireDate);
    this.corporateForm
      .get("Representative Details")
      .get("authorizationLetterExpiryDate")
      .patchValue(row.authorizationLetterExpiryDate);
    this.corporateForm
      .get("Representative Details")
      .get("maximumAllowedAmount")
      .patchValue(row.maximumAllowedAmount);
    this.corporateForm
      .get("Representative Details")
      .get("idCopyUpload")
      .patchValue(row.idCopyUpload);
    this.corporateForm
      .get("Representative Details")
      .get("authorizationLetterUpload")
      .patchValue(row.authorizationLetterUpload);
    this.corporateForm
      .get("Representative Details")
      .get("otherDocumentUpload")
      .patchValue(row.otherDocumentUpload);

    this.corporateForm
      .get("Representative Details")
      .get("representativeIdNumber")
      .disable();
  }

  addKyc() {
    let kycData = this.corporateForm.get("KYC Doc Upload").getRawValue();
    console.log("fields", kycData);
    let kycDataObj = {
      idNumber: this.uploadedDoc["idNumber"]
        ? this.uploadedDoc["idNumber"]
        : kycData.idNumber,
      uploadBackSide: this.uploadedDoc["uploadBackSide"]
        ? this.uploadedDoc["uploadBackSide"]
        : kycData.uploadBackSide,
      uploadFrontSide: this.uploadedDoc["uploadFrontSide"]
        ? this.uploadedDoc["uploadFrontSide"]
        : kycData.uploadFrontSide,
      docType: kycData.documentType?.codeName,
      idIssueDate: kycData.idIssueDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(kycData.idIssueDate))
        : "",
      idExpiryDate: kycData.idExpiryDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(kycData.idExpiryDate))
        : "",
      idIssueAuthority: kycData.idIssueAuthority,
      idIssueCountry: kycData.idIssueCountry?.codeName,
    };
    let index = this.uploadedKycData.findIndex(
      (x) => x.idNumber == kycDataObj["idNumber"]
    );
    console.log("index", index);
    if (index == -1) {
      this.uploadedKycData.push(kycDataObj);
    } else {
      this.uploadedKycData[index] = kycDataObj;
    }
    this.corporateForm.get("KYC Doc Upload").reset();
    this.corporateForm.get("KYC Doc Upload").get("idNumber").enable();
    this.uploadedDoc = {};
  }
  addBeneficial(){
    let beneficialData = this.corporateForm
      .get("Beneficial Owner Details")
      .getRawValue();
      console.log("fields", beneficialData);
      let beneficialDataObj = {
        ownershipType: beneficialData.ownershipType?.codeName,
        category: beneficialData.category?.codeName,
        noOfPartner: beneficialData.noOfPartner,
        percentage: beneficialData.percentage,
        firstName: beneficialData.firstName,
        middelName: beneficialData.middelName,
        lastName: beneficialData.lastName,
        gender: beneficialData.gender?.codeName,
        dateOfBirth: beneficialData.dateOfBirth
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(beneficialData.dateOfBirth))
          : "",
        countryOfBirth: beneficialData.countryOfBirth?.codeName,
        nationality: beneficialData.nationality?.codeName,
        relationship: beneficialData.relationship?.codeName,
        docType: beneficialData.documentType?.codeName,
        idNumber: this.uploadedBenefiDoc["idNumber"]
        ? this.uploadedBenefiDoc["idNumber"]
        : beneficialData.idNumber,
        idIssueDate: beneficialData.idIssueDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(beneficialData.idIssueDate))
        : "",
        IdExpireDate: beneficialData.IdExpireDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(beneficialData.IdExpireDate))
        : "",
      idIssueAuthority: beneficialData.idIssueAuthority,
      idIssueCountry: beneficialData.idIssueCountry?.codeName,
      visaExpireDate: beneficialData.visaExpireDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(beneficialData.visaExpireDate))
        : "",
        idCopyUpload: this.uploadedBenefiDoc["idCopyUpload"]
        ? this.uploadedBenefiDoc["idCopyUpload"]
        : beneficialData.idCopyUpload,

      };
      let index = this.uploadedBeneficialData.findIndex(
        (x) =>
          x.idNumber ==
          beneficialDataObj["idNumber"]
      );
      console.log("index", index);
      if (index == -1) {
        this.uploadedBeneficialData.push(beneficialDataObj);
      } else {
        this.uploadedBeneficialData[index] = beneficialDataObj;
      }
      this.corporateForm.get("Beneficial Owner Details").reset();
      this.corporateForm
        .get("Beneficial Owner Details")
        .get("idNumber")
        .enable();
      this.uploadedBenefiDoc = {}; 
  }
  addRepresentative() {
    let representativeData = this.corporateForm
      .get("Representative Details")
      .getRawValue();
    console.log("fields", representativeData);
    let representativeDataObj = {
      representativeFirstName: representativeData.representativeFirstName,
      representativeMiddelName: representativeData.representativeMiddelName,
      representativeLastName: representativeData.representativeLastName,
      representativeGender: representativeData.representativeGender?.codeName,
      representativeDob: representativeData.representativeDob
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(representativeData.representativeDob))
        : "",
      representativeCountryOfBirth:
        representativeData.representativeCountryOfBirth?.codeName,
      representativeNationality:
        representativeData.representativeNationality?.codeName,
      representativeRelationship:
        representativeData.representativeRelationship?.codeName,
      representativeDocumentType:
        representativeData.representativeDocumentType?.codeName,
      representativeIdNumber: this.uploadedRepresDoc["representativeIdNumber"]
        ? this.uploadedRepresDoc["representativeIdNumber"]
        : representativeData.representativeIdNumber,
      representativeIdIssueDate: representativeData.representativeIdIssueDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(representativeData.representativeIdIssueDate))
        : "",
      representativeIdExpireDate: representativeData.representativeIdExpireDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(representativeData.representativeIdExpireDate))
        : "",
      representativeIdIssueAuthority:
        representativeData.representativeIdIssueAuthority,
      representativeIdIssueCountry:
        representativeData.representativeIdIssueCountry?.codeName,
      representativeVisaExpireDate:
        representativeData.representativeVisaExpireDate
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(representativeData.representativeVisaExpireDate))
          : "",
      authorizationLetterExpiryDate:
        representativeData.authorizationLetterExpiryDate
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(
              new Date(representativeData.authorizationLetterExpiryDate)
            )
          : "",
      maximumAllowedAmount: representativeData.maximumAllowedAmount,
      idCopyUpload: this.uploadedRepresDoc["idCopyUpload"]
        ? this.uploadedRepresDoc["idCopyUpload"]
        : representativeData.idCopyUpload,
      authorizationLetterUpload: this.uploadedRepresDoc[
        "authorizationLetterUpload"
      ]
        ? this.uploadedRepresDoc["authorizationLetterUpload"]
        : representativeData.authorizationLetterUpload,
      otherDocumentUpload: this.uploadedRepresDoc["otherDocumentUpload"]
        ? this.uploadedRepresDoc["otherDocumentUpload"]
        : representativeData.otherDocumentUpload,
    };
    let index = this.uploadedRepresentativeData.findIndex(
      (x) =>
        x.representativeIdNumber ==
        representativeDataObj["representativeIdNumber"]
    );
    console.log("index", index);
    if (index == -1) {
      this.uploadedRepresentativeData.push(representativeDataObj);
    } else {
      this.uploadedRepresentativeData[index] = representativeDataObj;
    }
    this.corporateForm.get("Representative Details").reset();
    this.corporateForm
      .get("Representative Details")
      .get("representativeIdNumber")
      .enable();
    this.uploadedRepresDoc = {};
  }
 
  getUploadedFileName(fileUrl) {
    var n = fileUrl.lastIndexOf("\\");
    return fileUrl.substring(n + 1);
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
      payloadData["createdBy"] = this.CustomerData["createdBy"];
      payloadData["createdDateTime"] = this.CustomerData["createdDateTime"];
      payloadData["updatedBy"] = this.CustomerData["updatedBy"];
      payloadData["updatedDateTime"] = this.CustomerData["updatedDateTime"];
      payloadData["idExpireDate"] = this.CustomerData["idExpireDate"];
      payloadData["id"] = this.custId;
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
