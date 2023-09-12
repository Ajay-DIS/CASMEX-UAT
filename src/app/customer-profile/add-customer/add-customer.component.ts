import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { zip } from "rxjs";
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
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService
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
  };

  kycData = [];
  // prettier-ignore

  mode = "add";
  custId = null;
  custType = "IND";

  CustomerData: any = null;

  uploadedKycData = [];
  uploadedRepresentativeData = [];
  uploadedBeneficialData = [];

  uploadedKycDoc: any = {};
  uploadedRepresentativeDoc: any = {};
  uploadedBeneficialDoc: any = {};

  editIndexKyc = -1;
  editApiIdKyc = "";
  editIndexRepresentative = -1;
  editApiIdRepresentative = "";
  editIndexBeneficial = -1;
  editApiIdBeneficial = "";

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS

  // --------------------AJAY STARTSSSSSSSSSSSSSSSSSS
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
      } else {
        this.activeTabIndex = 0;
      }
    }
    console.log(this.custId, this.custType);
    if (this.custType == "IND") {
      this.http
        .get(`/remittance/formRulesController/getFormRules`, {
          headers: new HttpHeaders()
            .set(
              "criteriaMap",
              "Country = IND;Form = Customer Profile;Customer Type = IND"
            )
            .set("form", "Customer Profile_Form Rules")
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
    for (let i = 1; i <= 30; i++) {
      this.masterData.salaryDateEmpDetails.push({
        code: `${i}`,
        codeName: `${i}`,
      });
    }
  }

  handleChange(event: any) {
    this.activeTabIndex = event.index;
    if (this.activeTabIndex != 0) {
      this.coreService.showWarningToast("Unsaved change has been reset");
      if (this.individualForm) {
        this.individualForm.reset();
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
      let haveVisibleFields = false;
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

    this.disableInputsFile();
    this.coreService.removeLoadingScreen();
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
            ?.get("contactHouseBulidingNumber")?.value,
          permanentBlockNumber: this.individualForm
            .get("Contact Details")
            ?.get("contactBlockNumber")?.value,
          permanentStreetNumber: this.individualForm
            .get("Contact Details")
            ?.get("contactStreetNumber")?.value,
          permanentCity: this.individualForm
            .get("Contact Details")
            ?.get("contactCity")?.value,
          permanentPinZipcode: this.individualForm
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

      this.individualForm.get("Contact Details").patchValue(address);
    }
  }

  disableInputsFile() {
    this.individualForm
      ?.get("KYC Doc Upload")
      ?.get("uploadFrontSideFile")
      ?.disable();
    this.individualForm
      ?.get("KYC Doc Upload")
      ?.get("uploadBackSideFile")
      ?.disable();
    this.individualForm
      ?.get("Beneficial Owner Details")
      ?.get("idCopyUploadFile")
      ?.disable();
    this.individualForm
      ?.get("Representative Details")
      ?.get("idCopyUploadFile")
      ?.disable();
    this.individualForm
      ?.get("Representative Details")
      ?.get("authorizationLetterUploadFile")
      ?.disable();
    this.individualForm
      ?.get("Representative Details")
      ?.get("otherDocumentUploadFile")
      ?.disable();
  }

  fileUploadChange(e: any, section: any, field: any, docId: any) {
    console.log(e.target.files[0], field);
    if (e.target.files[0]) {
      this.coreService.displayLoadingScreen();
      setTimeout(() => {
        this.individualForm
          ?.get(section)
          ?.get(field)
          .patchValue(e.target.files[0].name);

        if (section == "KYC Doc Upload") {
          this.uploadedKycDoc[field] = e.target.files[0];
        }
        if (section == "Beneficial Owner Details") {
          this.uploadedBeneficialDoc[field] = e.target.files[0];
        }
        if (section == "Representative Details") {
          this.uploadedRepresentativeDoc[field] = e.target.files[0];
        }

        console.log(this.uploadedKycDoc);
        console.log(this.uploadedBeneficialDoc);
        console.log(this.uploadedRepresentativeDoc);
        this.coreService.removeLoadingScreen();
      }, 1500);
    }
  }

  selectRowForEdit(row: any, index: any) {
    this.uploadedKycDoc = {
      uploadFrontSideFile: row["uploadFrontSideFile"],
      uploadBackSideFile: row["uploadBackSideFile"],
      ...(row["uploadFrontSideOriginal"]?.length && {
        uploadFrontSideOriginal: row["uploadFrontSideOriginal"],
      }),
      ...(row["uploadBackSideOriginal"]?.length && {
        uploadBackSideOriginal: row["uploadBackSideOriginal"],
      }),
      ...(row["uploadBackSide"]?.length && {
        uploadBackSide: row["uploadBackSide"],
      }),
      ...(row["uploadFrontSide"]?.length && {
        uploadFrontSide: row["uploadFrontSide"],
      }),
      ...(row["customerId"] && { customerId: row["customerId"] }),
      ...(row["status"]?.length && { status: row["status"] }),
      ...(row["customerType"]?.length && {
        customerType: row["customerType"],
      }),
      ...(row["createdBy"]?.length && {
        createdBy: row["createdBy"],
      }),
      ...(row["updatedBy"]?.length && {
        updatedBy: row["updatedBy"],
      }),
      ...(row["createdDateTime"]?.length && {
        createdDateTime: row["createdDateTime"],
      }),
      ...(row["updatedDateTime"]?.length && {
        updatedDateTime: row["updatedDateTime"],
      }),
    };

    console.log("row", row);
    console.log("index", index);
    this.editIndexKyc = index;
    if (row.id && row.id != "") {
      this.editApiIdKyc = row.id;
    }
    this.individualForm
      .get("KYC Doc Upload")
      .get("documentType")
      ?.patchValue(
        this.masterData["documentType"].filter(
          (opt) => opt.codeName == row.documentType
        )[0]
      );
    this.individualForm
      .get("KYC Doc Upload")
      .get("idNumber")
      ?.patchValue(row.idNumber);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idIssueDate")
      ?.patchValue(row.idIssueDate);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idExpiryDate")
      ?.patchValue(row.idExpiryDate);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idIssueAuthority")
      ?.patchValue(row.idIssueAuthority);
    this.individualForm
      .get("KYC Doc Upload")
      .get("idIssueCountry")
      ?.patchValue(
        this.masterData["idIssueCountry"].filter(
          (opt) => opt.codeName == row.idIssueCountry
        )[0]
      );
    this.individualForm
      .get("KYC Doc Upload")
      .get("uploadFrontSideFile")
      ?.patchValue(row.uploadFrontSideFileName);
    this.individualForm
      .get("KYC Doc Upload")
      .get("uploadBackSideFile")
      ?.patchValue(row.uploadBackSideFileName);
    this.individualForm
      .get("KYC Doc Upload")
      .get("imageByPassed")
      ?.patchValue(row.imageByPassed);
    this.individualForm
      .get("KYC Doc Upload")
      .get("hereByConfirm")
      ?.patchValue(row.hereByConfirm);

    // this.individualForm.get("KYC Doc Upload").get("idNumber").disable();
  }
  selectRowForEditBeneficial(row: any, index: any) {
    this.uploadedBeneficialDoc = {
      idCopyUploadFile: row["idCopyUploadFile"],
      ...(row["idCopyUploadOriginalName"]?.length && {
        idCopyUploadOriginalName: row["idCopyUploadOriginalName"],
      }),
      ...(row["idCopyUploadName"]?.length && {
        idCopyUploadName: row["idCopyUploadName"],
      }),
      ...(row["customerId"] && { customerId: row["customerId"] }),
      ...(row["status"]?.length && { status: row["status"] }),
      ...(row["createdBy"]?.length && {
        createdBy: row["createdBy"],
      }),
      ...(row["updatedBy"]?.length && {
        updatedBy: row["updatedBy"],
      }),
      ...(row["createdDateTime"]?.length && {
        createdDateTime: row["createdDateTime"],
      }),
      ...(row["updatedDateTime"]?.length && {
        updatedDateTime: row["updatedDateTime"],
      }),
    };
    console.log("row", row);
    this.editIndexBeneficial = index;
    if (row.id && row.id != "") {
      this.editApiIdBeneficial = row.id;
    }
    this.individualForm
      .get("Beneficial Owner Details")
      .get("ownershipType")
      ?.patchValue(
        this.masterData["ownershipType"].filter(
          (opt) => opt.codeName == row.ownershipType
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("category")
      ?.patchValue(
        this.masterData["category"].filter(
          (opt) => opt.codeName == row.category
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("noOfPartner")
      ?.patchValue(row.noOfPartner);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("percentage")
      ?.patchValue(row.percentage);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("firstName")
      ?.patchValue(row.firstName);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("middleName")
      ?.patchValue(row.middleName);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("lastName")
      ?.patchValue(row.lastName);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("gender")
      ?.patchValue(
        this.masterData["gender"].filter((opt) => opt.codeName == row.gender)[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("dateOfBirth")
      ?.patchValue(row.dateOfBirth);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("countryOfBirth")
      ?.patchValue(
        this.masterData["countryOfBirth"].filter(
          (opt) => opt.codeName == row.countryOfBirth
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("nationality")
      ?.patchValue(
        this.masterData["nationality"].filter(
          (opt) => opt.codeName == row.nationality
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("relationship")
      ?.patchValue(
        this.masterData["relationship"].filter(
          (opt) => opt.codeName == row.relationship
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("documentType")
      ?.patchValue(
        this.masterData["documentType"].filter(
          (opt) => opt.codeName == row.documentType
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("idNumber")
      ?.patchValue(row.idNumber);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("idIssueDate")
      ?.patchValue(row.idIssueDate);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("idExpiryDate")
      ?.patchValue(row.idExpiryDate);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("idIssueAuthority")
      ?.patchValue(row.idIssueAuthority);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("idIssueCountry")
      ?.patchValue(
        this.masterData["idIssueCountry"].filter(
          (opt) => opt.codeName == row.idIssueCountry
        )[0]
      );
    this.individualForm
      .get("Beneficial Owner Details")
      .get("visaExpiryDate")
      ?.patchValue(row.visaExpiryDate);
    this.individualForm
      .get("Beneficial Owner Details")
      .get("idCopyUploadFile")
      ?.patchValue(row.idCopyUploadFileName);

    // this.individualForm
    //   .get("Beneficial Owner Details")
    //   .get("idNumber")
    //   .disable();
  }
  selectRowForEditRepresentative(row: any, index: any) {
    this.uploadedRepresentativeDoc = {
      idCopyUploadFile: row["representativeIdCopyUploadFile"],
      authorizationLetterUploadFile:
        row["representativeAuthorizationLetterFile"],
      otherDocumentUploadFile: row["otherDocumentUploadFile"],

      ...(row["representativeIdCopyUploadOriginalName"]?.length && {
        representativeIdCopyUploadOriginalName:
          row["representativeIdCopyUploadOriginalName"],
      }),
      ...(row["representativeAuthorizationLetterOriginalName"]?.length && {
        representativeAuthorizationLetterOriginalName:
          row["representativeAuthorizationLetterOriginalName"],
      }),
      ...(row["otherDocumentUploadOriginal"]?.length && {
        otherDocumentUploadOriginal: row["otherDocumentUploadOriginal"],
      }),

      ...(row["representativeIdCopyUploadName"]?.length && {
        representativeIdCopyUploadName: row["representativeIdCopyUploadName"],
      }),
      ...(row["representativeAuthorizationLetterName"]?.length && {
        representativeAuthorizationLetterName:
          row["representativeAuthorizationLetterName"],
      }),
      ...(row["otherDocumentUpload"]?.length && {
        otherDocumentUpload: row["otherDocumentUpload"],
      }),

      ...(row["customerId"] && { customerId: row["customerId"] }),
      ...(row["status"]?.length && { status: row["status"] }),
      ...(row["customerType"]?.length && {
        customerType: row["customerType"],
      }),
      ...(row["createdBy"]?.length && {
        createdBy: row["createdBy"],
      }),
      ...(row["updatedBy"]?.length && {
        updatedBy: row["updatedBy"],
      }),
      ...(row["createdDateTime"]?.length && {
        createdDateTime: row["createdDateTime"],
      }),
      ...(row["updatedDateTime"]?.length && {
        updatedDateTime: row["updatedDateTime"],
      }),
    };
    console.log("row", row);
    this.editIndexRepresentative = index;
    if (row.id && row.id != "") {
      this.editApiIdRepresentative = row.id;
    }
    this.individualForm
      .get("Representative Details")
      .get("representativeFirstName")
      ?.patchValue(row.representativeFirstName);
    this.individualForm
      .get("Representative Details")
      .get("representativeMiddleName")
      ?.patchValue(row.representativeMiddleName);
    this.individualForm
      .get("Representative Details")
      .get("representativeLastName")
      ?.patchValue(row.representativeLastName);
    this.individualForm
      .get("Representative Details")
      .get("representativeGender")
      ?.patchValue(
        this.masterData["representativeGender"].filter(
          (opt) => opt.codeName == row.representativeGender
        )[0]
      );
    this.individualForm
      .get("Representative Details")
      .get("representativeDateOfBirth")
      ?.patchValue(row.representativeDateOfBirth);
    this.individualForm
      .get("Representative Details")
      .get("representativeCountryOfBirth")
      ?.patchValue(
        this.masterData["representativeCountryOfBirth"].filter(
          (opt) => opt.codeName == row.representativeCountryOfBirth
        )[0]
      );
    this.individualForm
      .get("Representative Details")
      .get("representativeNationality")
      ?.patchValue(
        this.masterData["representativeNationality"].filter(
          (opt) => opt.codeName == row.representativeNationality
        )[0]
      );
    this.individualForm
      .get("Representative Details")
      .get("representativeRelationship")
      ?.patchValue(
        this.masterData["representativeRelationship"].filter(
          (opt) => opt.codeName == row.representativeRelationship
        )[0]
      );
    this.individualForm
      .get("Representative Details")
      .get("representativeDocumentType")
      ?.patchValue(
        this.masterData["representativeDocumentType"].filter(
          (opt) => opt.codeName == row.representativeDocumentType
        )[0]
      );
    this.individualForm
      .get("Representative Details")
      .get("representativeIdNumber")
      ?.patchValue(row.representativeIdNumber);
    this.individualForm
      .get("Representative Details")
      .get("representativeIdIssueDate")
      ?.patchValue(row.representativeIdIssueDate);
    this.individualForm
      .get("Representative Details")
      .get("representativeIdExpiryDate")
      ?.patchValue(row.representativeIdExpiryDate);
    this.individualForm
      .get("Representative Details")
      .get("representativeIdIssueAuthority")
      ?.patchValue(row.representativeIdIssueAuthority);
    this.individualForm
      .get("Representative Details")
      .get("representativeIdIssueCountry")
      ?.patchValue(
        this.masterData["representativeIssueCountry"].filter(
          (opt) => opt.codeName == row.representativeIdIssueCountry
        )[0]
      );
    this.individualForm
      .get("Representative Details")
      .get("representativeVisaExpiryDate")
      ?.patchValue(row.representativeVisaExpiryDate);
    this.individualForm
      .get("Representative Details")
      .get("representativeAuthorizationLetterExpiryDate")
      ?.patchValue(row.representativeAuthorizationLetterExpiryDate);
    this.individualForm
      .get("Representative Details")
      .get("representativeMaximumAllowedAmount")
      ?.patchValue(row.representativeMaximumAllowedAmount);
    this.individualForm
      .get("Representative Details")
      .get("idCopyUploadFile")
      ?.patchValue(row.representativeIdCopyUploadFileName);
    this.individualForm
      .get("Representative Details")
      .get("authorizationLetterUploadFile")
      ?.patchValue(row.representativeAuthorizationLetterFileName);
    this.individualForm
      .get("Representative Details")
      .get("otherDocumentUploadFile")
      ?.patchValue(row.otherDocumentUploadFileName);

    // this.individualForm
    //   .get("Representative Details")
    //   .get("representativeIdNumber")
    //   .disable();
  }

  addKyc() {
    let kycData = this.individualForm.get("KYC Doc Upload").getRawValue();
    console.log("fields", kycData);
    let kycDataObj = {
      idNumber: kycData.idNumber,
      imageByPassed: kycData.imageByPassed,
      hereByConfirm: kycData.hereByConfirm,
      uploadBackSideFileName: kycData.uploadBackSideFile,
      uploadFrontSideFileName: kycData.uploadFrontSideFile,
      uploadBackSideFile: this.uploadedKycDoc.uploadBackSideFile
        ? this.uploadedKycDoc.uploadBackSideFile
        : "",
      uploadFrontSideFile: this.uploadedKycDoc.uploadFrontSideFile
        ? this.uploadedKycDoc.uploadFrontSideFile
        : "",
      documentType: kycData.documentType?.codeName
        ? kycData.documentType?.codeName
        : "",
      idIssueDate: kycData.idIssueDate
        ? !isNaN(Date.parse(kycData.idIssueDate))
          ? new Date(kycData.idIssueDate).toLocaleDateString("en-GB")
          : new Date(
              kycData.idIssueDate.split("/").reverse().join("-")
            ).toLocaleDateString("en-GB")
        : "",
      idExpiryDate: kycData.idExpiryDate
        ? !isNaN(Date.parse(kycData.idExpiryDate))
          ? new Date(kycData.idExpiryDate).toLocaleDateString("en-GB")
          : new Date(
              kycData.idExpiryDate.split("/").reverse().join("-")
            ).toLocaleDateString("en-GB")
        : "",
      idIssueAuthority: kycData.idIssueAuthority,
      idIssueCountry: kycData.idIssueCountry?.codeName
        ? kycData.idIssueCountry?.codeName
        : "",

      ...(this.uploadedKycDoc["uploadFrontSideOriginal"]?.length && {
        uploadFrontSideOriginal: this.uploadedKycDoc["uploadFrontSideOriginal"],
      }),
      ...(this.uploadedKycDoc["uploadBackSideOriginal"]?.length && {
        uploadBackSideOriginal: this.uploadedKycDoc["uploadBackSideOriginal"],
      }),
      ...(this.uploadedKycDoc["uploadBackSide"]?.length && {
        uploadBackSide: this.uploadedKycDoc["uploadBackSide"],
      }),
      ...(this.uploadedKycDoc["uploadFrontSide"]?.length && {
        uploadFrontSide: this.uploadedKycDoc["uploadFrontSide"],
      }),
      ...(this.uploadedKycDoc["customerId"] && {
        customerId: this.uploadedKycDoc["customerId"],
      }),
      ...(this.uploadedKycDoc["status"]?.length && {
        status: this.uploadedKycDoc["status"],
      }),
      ...(this.uploadedKycDoc["customerType"]?.length && {
        customerType: this.uploadedKycDoc["customerType"],
      }),
      ...(this.uploadedKycDoc["createdBy"]?.length && {
        createdBy: this.uploadedKycDoc["createdBy"],
      }),
      ...(this.uploadedKycDoc["updatedBy"]?.length && {
        updatedBy: this.uploadedKycDoc["updatedBy"],
      }),
      ...(this.uploadedKycDoc["createdDateTime"]?.length && {
        createdDateTime: this.uploadedKycDoc["createdDateTime"],
      }),
      ...(this.uploadedKycDoc["updatedDateTime"]?.length && {
        updatedDateTime: this.uploadedKycDoc["updatedDateTime"],
      }),
    };
    let index = this.editIndexKyc;
    console.log("index", index);
    if (index == -1) {
      kycDataObj["id"] = "";
      kycDataObj["operation"] = "add";
      this.uploadedKycData.push(kycDataObj);
    } else {
      if (this.editApiIdKyc != "") {
        kycDataObj["id"] = this.editApiIdKyc;
        kycDataObj["operation"] = "edit";
      } else {
        kycDataObj["id"] = "";
        kycDataObj["operation"] = "add";
      }
      this.uploadedKycData[index] = kycDataObj;
    }
    this.individualForm.get("KYC Doc Upload").reset();
    // this.individualForm.get("KYC Doc Upload").get("idNumber").enable();
    console.log(this.uploadedKycData);
    this.editIndexKyc = -1;
    this.editApiIdKyc = "";
    this.uploadedKycDoc = {};
    this.uploadedBeneficialDoc = {};
    this.uploadedRepresentativeDoc = {};
  }
  addBeneficial() {
    let beneficialData = this.individualForm
      .get("Beneficial Owner Details")
      .getRawValue();
    console.log("fields", beneficialData);
    let beneficialDataObj = {
      ownershipType: beneficialData.ownershipType?.codeName
        ? beneficialData.ownershipType?.codeName
        : "",
      category: beneficialData.category?.codeName
        ? beneficialData.category?.codeName
        : "",
      noOfPartner: beneficialData.noOfPartner,
      percentage: beneficialData.percentage,
      firstName: beneficialData.firstName,
      middleName: beneficialData.middleName,
      lastName: beneficialData.lastName,
      gender: beneficialData.gender?.codeName
        ? beneficialData.gender?.codeName
        : "",
      dateOfBirth: beneficialData.dateOfBirth
        ? !isNaN(Date.parse(beneficialData.dateOfBirth))
          ? new Date(beneficialData.dateOfBirth).toLocaleDateString("en-GB")
          : new Date(
              beneficialData.dateOfBirth.split("/").reverse().join("-")
            ).toLocaleDateString("en-GB")
        : "",
      countryOfBirth: beneficialData.countryOfBirth?.codeName
        ? beneficialData.countryOfBirth?.codeName
        : "",
      nationality: beneficialData.nationality?.codeName
        ? beneficialData.nationality?.codeName
        : "",
      relationship: beneficialData.relationship?.codeName
        ? beneficialData.relationship?.codeName
        : "",
      documentType: beneficialData.documentType?.codeName
        ? beneficialData.documentType?.codeName
        : "",
      idNumber: beneficialData.idNumber,
      idIssueDate: beneficialData.idIssueDate
        ? !isNaN(Date.parse(beneficialData.idIssueDate))
          ? new Date(beneficialData.idIssueDate).toLocaleDateString("en-GB")
          : new Date(
              beneficialData.idIssueDate.split("/").reverse().join("-")
            ).toLocaleDateString("en-GB")
        : "",
      idExpiryDate: beneficialData.idExpiryDate
        ? !isNaN(Date.parse(beneficialData.idExpiryDate))
          ? new Date(beneficialData.idExpiryDate).toLocaleDateString("en-GB")
          : new Date(
              beneficialData.idExpiryDate.split("/").reverse().join("-")
            ).toLocaleDateString("en-GB")
        : "",
      idIssueAuthority: beneficialData.idIssueAuthority,
      idIssueCountry: beneficialData.idIssueCountry?.codeName
        ? beneficialData.idIssueCountry?.codeName
        : "",
      visaExpiryDate: beneficialData.visaExpiryDate
        ? !isNaN(Date.parse(beneficialData.visaExpiryDate))
          ? new Date(beneficialData.visaExpiryDate).toLocaleDateString("en-GB")
          : new Date(
              beneficialData.visaExpiryDate.split("/").reverse().join("-")
            ).toLocaleDateString("en-GB")
        : "",
      idCopyUploadFileName: beneficialData.idCopyUploadFile,
      idCopyUploadFile: this.uploadedBeneficialDoc.idCopyUploadFile
        ? this.uploadedBeneficialDoc.idCopyUploadFile
        : "",

      ...(this.uploadedBeneficialDoc["idCopyUploadOriginalName"]?.length && {
        idCopyUploadOriginalName:
          this.uploadedBeneficialDoc["idCopyUploadOriginalName"],
      }),
      ...(this.uploadedBeneficialDoc["idCopyUploadName"]?.length && {
        idCopyUploadName: this.uploadedBeneficialDoc["idCopyUploadName"],
      }),
      ...(this.uploadedBeneficialDoc["customerId"] && {
        customerId: this.uploadedBeneficialDoc["customerId"],
      }),
      ...(this.uploadedBeneficialDoc["status"]?.length && {
        status: this.uploadedBeneficialDoc["status"],
      }),
      ...(this.uploadedBeneficialDoc["createdBy"]?.length && {
        createdBy: this.uploadedBeneficialDoc["createdBy"],
      }),
      ...(this.uploadedBeneficialDoc["updatedBy"]?.length && {
        updatedBy: this.uploadedBeneficialDoc["updatedBy"],
      }),
      ...(this.uploadedBeneficialDoc["createdDateTime"]?.length && {
        createdDateTime: this.uploadedBeneficialDoc["createdDateTime"],
      }),
      ...(this.uploadedBeneficialDoc["updatedDateTime"]?.length && {
        updatedDateTime: this.uploadedBeneficialDoc["updatedDateTime"],
      }),
    };
    let index = this.editIndexBeneficial;
    console.log("index", index);
    if (index == -1) {
      beneficialDataObj["id"] = "";
      beneficialDataObj["operation"] = "add";
      this.uploadedBeneficialData.push(beneficialDataObj);
    } else {
      if (this.editApiIdBeneficial != "") {
        beneficialDataObj["id"] = this.editApiIdBeneficial;
        beneficialDataObj["operation"] = "edit";
      } else {
        beneficialDataObj["id"] = "";
        beneficialDataObj["operation"] = "add";
      }
      this.uploadedBeneficialData[index] = beneficialDataObj;
    }
    this.individualForm.get("Beneficial Owner Details").reset();
    // this.individualForm.get("Beneficial Owner Details").get("idNumber").enable();
    console.log(this.uploadedBeneficialData);
    this.editIndexBeneficial = -1;
    this.editApiIdBeneficial = "";
  }
  addRepresentative() {
    let representativeData = this.individualForm
      .get("Representative Details")
      .getRawValue();
    console.log("fields", representativeData);
    let representativeDataObj = {
      representativeFirstName: representativeData.representativeFirstName,
      representativeMiddleName: representativeData.representativeMiddleName,
      representativeLastName: representativeData.representativeLastName,
      representativeGender: representativeData.representativeGender?.codeName
        ? representativeData.representativeGender?.codeName
        : "",
      representativeDateOfBirth: representativeData.representativeDateOfBirth
        ? !isNaN(Date.parse(representativeData.representativeDateOfBirth))
          ? new Date(
              representativeData.representativeDateOfBirth
            ).toLocaleDateString("en-GB")
          : new Date(
              representativeData.representativeDateOfBirth
                .split("/")
                .reverse()
                .join("-")
            ).toLocaleDateString("en-GB")
        : "",
      representativeCountryOfBirth: representativeData
        .representativeCountryOfBirth?.codeName
        ? representativeData.representativeCountryOfBirth?.codeName
        : "",
      representativeNationality: representativeData.representativeNationality
        ?.codeName
        ? representativeData.representativeNationality?.codeName
        : "",
      representativeRelationship: representativeData.representativeRelationship
        ?.codeName
        ? representativeData.representativeRelationship?.codeName
        : "",
      representativeDocumentType: representativeData.representativeDocumentType
        ?.codeName
        ? representativeData.representativeDocumentType?.codeName
        : "",
      representativeIdNumber: representativeData.representativeIdNumber,
      representativeIdIssueDate: representativeData.representativeIdIssueDate
        ? !isNaN(Date.parse(representativeData.representativeIdIssueDate))
          ? new Date(
              representativeData.representativeIdIssueDate
            ).toLocaleDateString("en-GB")
          : new Date(
              representativeData.representativeIdIssueDate
                .split("/")
                .reverse()
                .join("-")
            ).toLocaleDateString("en-GB")
        : "",
      representativeIdExpiryDate: representativeData.representativeIdExpiryDate
        ? !isNaN(Date.parse(representativeData.representativeIdExpiryDate))
          ? new Date(
              representativeData.representativeIdExpiryDate
            ).toLocaleDateString("en-GB")
          : new Date(
              representativeData.representativeIdExpiryDate
                .split("/")
                .reverse()
                .join("-")
            ).toLocaleDateString("en-GB")
        : "",
      representativeIdIssueAuthority:
        representativeData.representativeIdIssueAuthority,
      representativeIdIssueCountry: representativeData
        .representativeIdIssueCountry?.codeName
        ? representativeData.representativeIdIssueCountry?.codeName
        : "",
      representativeVisaExpiryDate:
        representativeData.representativeVisaExpiryDate
          ? !isNaN(Date.parse(representativeData.representativeVisaExpiryDate))
            ? new Date(
                representativeData.representativeVisaExpiryDate
              ).toLocaleDateString("en-GB")
            : new Date(
                representativeData.representativeVisaExpiryDate
                  .split("/")
                  .reverse()
                  .join("-")
              ).toLocaleDateString("en-GB")
          : "",
      representativeAuthorizationLetterExpiryDate:
        representativeData.representativeAuthorizationLetterExpiryDate
          ? !isNaN(
              Date.parse(
                representativeData.representativeAuthorizationLetterExpiryDate
              )
            )
            ? new Date(
                representativeData.representativeAuthorizationLetterExpiryDate
              ).toLocaleDateString("en-GB")
            : new Date(
                representativeData.representativeAuthorizationLetterExpiryDate
                  .split("/")
                  .reverse()
                  .join("-")
              ).toLocaleDateString("en-GB")
          : "",
      representativeMaximumAllowedAmount:
        representativeData.representativeMaximumAllowedAmount,
      representativeIdCopyUploadFileName: representativeData.idCopyUploadFile,
      representativeAuthorizationLetterFileName:
        representativeData.authorizationLetterUploadFile,
      otherDocumentUploadFileName: representativeData.otherDocumentUploadFile,

      representativeIdCopyUploadFile: this.uploadedRepresentativeDoc
        .idCopyUploadFile
        ? this.uploadedRepresentativeDoc.idCopyUploadFile
        : "",
      representativeAuthorizationLetterFile: this.uploadedRepresentativeDoc
        .authorizationLetterUploadFile
        ? this.uploadedRepresentativeDoc.authorizationLetterUploadFile
        : "",
      otherDocumentUploadFile: this.uploadedRepresentativeDoc
        .otherDocumentUploadFile
        ? this.uploadedRepresentativeDoc.otherDocumentUploadFile
        : "",

      ...(this.uploadedRepresentativeDoc[
        "representativeIdCopyUploadOriginalName"
      ]?.length && {
        representativeIdCopyUploadOriginalName:
          this.uploadedRepresentativeDoc[
            "representativeIdCopyUploadOriginalName"
          ],
      }),
      ...(this.uploadedRepresentativeDoc[
        "representativeAuthorizationLetterOriginalName"
      ]?.length && {
        representativeAuthorizationLetterOriginalName:
          this.uploadedRepresentativeDoc[
            "representativeAuthorizationLetterOriginalName"
          ],
      }),
      ...(this.uploadedRepresentativeDoc["otherDocumentUploadOriginal"]
        ?.length && {
        otherDocumentUploadOriginal:
          this.uploadedRepresentativeDoc["otherDocumentUploadOriginal"],
      }),

      ...(this.uploadedRepresentativeDoc["representativeIdCopyUploadName"]
        ?.length && {
        representativeIdCopyUploadName:
          this.uploadedRepresentativeDoc["representativeIdCopyUploadName"],
      }),
      ...(this.uploadedRepresentativeDoc[
        "representativeAuthorizationLetterName"
      ]?.length && {
        representativeAuthorizationLetterName:
          this.uploadedRepresentativeDoc[
            "representativeAuthorizationLetterName"
          ],
      }),
      ...(this.uploadedRepresentativeDoc["otherDocumentUpload"]?.length && {
        otherDocumentUpload:
          this.uploadedRepresentativeDoc["otherDocumentUpload"],
      }),

      ...(this.uploadedRepresentativeDoc["customerId"] && {
        customerId: this.uploadedRepresentativeDoc["customerId"],
      }),
      ...(this.uploadedRepresentativeDoc["status"]?.length && {
        status: this.uploadedRepresentativeDoc["status"],
      }),
      ...(this.uploadedRepresentativeDoc["customerType"]?.length && {
        customerType: this.uploadedRepresentativeDoc["customerType"],
      }),
      ...(this.uploadedRepresentativeDoc["createdBy"]?.length && {
        createdBy: this.uploadedRepresentativeDoc["createdBy"],
      }),
      ...(this.uploadedRepresentativeDoc["updatedBy"]?.length && {
        updatedBy: this.uploadedRepresentativeDoc["updatedBy"],
      }),
      ...(this.uploadedRepresentativeDoc["createdDateTime"]?.length && {
        createdDateTime: this.uploadedRepresentativeDoc["createdDateTime"],
      }),
      ...(this.uploadedRepresentativeDoc["updatedDateTime"]?.length && {
        updatedDateTime: this.uploadedRepresentativeDoc["updatedDateTime"],
      }),
    };

    let index = this.editIndexRepresentative;
    console.log("index", index);
    if (index == -1) {
      representativeDataObj["id"] = "";
      representativeDataObj["operation"] = "add";
      this.uploadedRepresentativeData.push(representativeDataObj);
    } else {
      if (this.editApiIdRepresentative != "") {
        representativeDataObj["id"] = this.editApiIdRepresentative;
        representativeDataObj["operation"] = "edit";
      } else {
        representativeDataObj["id"] = "";
        representativeDataObj["operation"] = "add";
      }
      this.uploadedRepresentativeData[index] = representativeDataObj;
    }
    this.individualForm.get("Representative Details").reset();
    // this.individualForm
    //   .get("Representative Details")
    //   .get("representativeIdNumber")
    //   .enable();
    console.log(this.uploadedRepresentativeData);
    this.editIndexRepresentative = -1;
    this.editApiIdRepresentative = "";
  }

  getUploadedFileName(fileUrl) {
    var n = fileUrl.lastIndexOf("\\");
    return fileUrl.substring(n + 1);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.individualForm.invalid) {
      this.coreService.showWarningToast("Some fields are invalid");
      return;
    }

    this.coreService.displayLoadingScreen();

    let data = this.individualForm.getRawValue();

    delete data["KYC Doc Upload"];
    delete data["Beneficial Owner Details"];
    delete data["Representative Details"];

    let payloadData = Object.assign({}, ...Object.values(data));

    this.formSections.forEach((section) => {
      if (
        !(
          section.formName == "KYC Doc Upload" ||
          section.formName == "Beneficial Owner Details" ||
          section.formName == "Representative Details"
        )
      ) {
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
      }
    });

    // payloadData["status"] = "Active";
    if (this.mode == "edit") {
      payloadData["createdBy"] = this.CustomerData["createdBy"]
        ? this.CustomerData["createdBy"]
        : "";
      payloadData["createdDateTime"] = this.CustomerData["createdDateTime"]
        ? this.CustomerData["createdDateTime"]
        : "";
      payloadData["updatedBy"] = this.CustomerData["updatedBy"]
        ? this.CustomerData["updatedBy"]
        : "";
      payloadData["updatedDateTime"] = this.CustomerData["updatedDateTime"]
        ? this.CustomerData["updatedDateTime"]
        : "";
      payloadData["id"] = this.custId;

      let formData = new FormData();
      for (let key in payloadData) {
        formData.append(key, payloadData[key]);
      }

      // formData.append("uploadDocuments[0].idNumber", "21");
      // formData.append("uploadDocuments[0].operation", "null");
      // formData.append("uploadDocuments[0].uploadFrontSideFileName", "");
      // formData.append("uploadDocuments[0].uploadBackSideFileName", "");
      // formData.append("uploadDocuments[0].uploadFrontSideFile", "");
      // formData.append("uploadDocuments[0].uploadBackSideFile", "");
      // formData.append("uploadDocuments[0].uploadFrontSide", "");
      // formData.append("uploadDocuments[0].uploadBackSide", "");
      // formData.append("uploadDocuments[0].uploadFrontSideOriginal", "1.txt");
      // formData.append("uploadDocuments[0].uploadBackSideOriginal", "2.txt");
      // formData.append("uploadDocuments[0].customerId", "102");
      // formData.append("uploadDocuments[0].status", "Active");
      // formData.append("uploadDocuments[0].customerType", "COR");
      // formData.append("uploadDocuments[0].idIssueDate", "23/01/2023");
      // formData.append("uploadDocuments[0].idExpiryDate", "23/01/2023");
      // formData.append("uploadDocuments[0].createdBy", "");
      // formData.append("uploadDocuments[0].updatedBy", "yogeshm");
      // formData.append("uploadDocuments[0].createdDateTime", "");
      // formData.append("uploadDocuments[0].updatedDateTime", "");

      if (this.uploadedKycData.length) {
        for (let i = 0; i < this.uploadedKycData.length; i++) {
          for (let key in this.uploadedKycData[i]) {
            if (key == "idIssueDate" || key == "idExpiryDate") {
              let date = this.uploadedKycData[i][key]
                ? this.uploadedKycData[i][key]
                : "";
              formData.append(`uploadDocuments[${i}].${key}`, date);
            } else if (
              key == "uploadFrontSideFile" ||
              key == "uploadBackSideFile"
            ) {
              let file =
                this.uploadedKycData[i][key] &&
                this.uploadedKycData[i][key] != ""
                  ? this.uploadedKycData[i][key]
                  : "";
              if (file != "") {
                formData.append(`uploadDocuments[${i}].${key}`, file);
              }
            } else {
              if (
                !(this.uploadedKycData[i]["operation"] == "add" && key == "id")
              ) {
                formData.append(
                  `uploadDocuments[${i}].${key}`,
                  this.uploadedKycData[i][key]
                );
              }
            }
          }
        }
      } else {
      }
      if (this.uploadedBeneficialData.length) {
        for (let i = 0; i < this.uploadedBeneficialData.length; i++) {
          for (let key in this.uploadedBeneficialData[i]) {
            if (
              key == "dateOfBirth" ||
              key == "idIssueDate" ||
              key == "idExpiryDate" ||
              key == "visaExpiryDate"
            ) {
              let date = this.uploadedBeneficialData[i][key]
                ? this.uploadedBeneficialData[i][key]
                : "";
              formData.append(`beneficialOwerDetailsDto[${i}].${key}`, date);
            } else if (key == "idCopyUploadFile") {
              let file =
                this.uploadedBeneficialData[i][key] &&
                this.uploadedBeneficialData[i][key] != ""
                  ? this.uploadedBeneficialData[i][key]
                  : "";
              if (file != "") {
                formData.append(`beneficialOwerDetailsDto[${i}].${key}`, file);
              }
            } else {
              if (
                !(
                  this.uploadedBeneficialData[i]["operation"] == "add" &&
                  key == "id"
                )
              ) {
                formData.append(
                  `beneficialOwerDetailsDto[${i}].${key}`,
                  this.uploadedBeneficialData[i][key]
                );
              }
            }
          }
        }
      } else {
      }
      if (this.uploadedRepresentativeData.length) {
        for (let i = 0; i < this.uploadedRepresentativeData.length; i++) {
          for (let key in this.uploadedRepresentativeData[i]) {
            if (
              key == "representativeDateOfBirth" ||
              key == "representativeIdIssueDate" ||
              key == "representativeIdExpiryDate" ||
              key == "representativeVisaExpiryDate" ||
              key == "representativeAuthorizationLetterExpiryDate"
            ) {
              let date = this.uploadedRepresentativeData[i][key]
                ? this.uploadedRepresentativeData[i][key]
                : "";
              formData.append(`representativeDetailsDto[${i}].${key}`, date);
            } else if (
              key == "representativeIdCopyUploadFile" ||
              key == "representativeAuthorizationLetterFile" ||
              key == "otherDocumentUploadFile"
            ) {
              let file =
                this.uploadedRepresentativeData[i][key] &&
                this.uploadedRepresentativeData[i][key] != ""
                  ? this.uploadedRepresentativeData[i][key]
                  : "";
              if (file != "") {
                formData.append(`representativeDetailsDto[${i}].${key}`, file);
              }
            } else {
              if (
                !(
                  this.uploadedRepresentativeData[i]["operation"] == "add" &&
                  key == "id"
                )
              ) {
                formData.append(
                  `representativeDetailsDto[${i}].${key}`,
                  this.uploadedRepresentativeData[i][key]
                );
              }
            }
          }
        }
      } else {
      }
      this.updateIndividualCustomer(formData);
    } else {
      let formData = new FormData();

      for (let key in payloadData) {
        formData.append(key, payloadData[key]);
      }

      console.log(this.uploadedKycData);
      if (this.uploadedKycData.length) {
        for (let i = 0; i < this.uploadedKycData.length; i++) {
          for (let key in this.uploadedKycData[i]) {
            if (key != "id") {
              if (key == "idIssueDate" || key == "idExpiryDate") {
                let date = this.uploadedKycData[i][key]
                  ? this.uploadedKycData[i][key]
                  : "";
                formData.append(`uploadDocuments[${i}].${key}`, date);
              } else if (
                key == "uploadFrontSideFile" ||
                key == "uploadBackSideFile"
              ) {
                let file =
                  this.uploadedKycData[i][key] &&
                  this.uploadedKycData[i][key] != ""
                    ? this.uploadedKycData[i][key]
                    : "";
                if (file != "") {
                  formData.append(`uploadDocuments[${i}].${key}`, file);
                }
              } else {
                formData.append(
                  `uploadDocuments[${i}].${key}`,
                  this.uploadedKycData[i][key]
                );
              }
            }
          }
        }
      } else {
      }
      if (this.uploadedBeneficialData.length) {
        for (let i = 0; i < this.uploadedBeneficialData.length; i++) {
          for (let key in this.uploadedBeneficialData[i]) {
            if (key != "id") {
              if (
                key == "dateOfBirth" ||
                key == "idIssueDate" ||
                key == "idExpiryDate" ||
                key == "visaExpiryDate"
              ) {
                let date = this.uploadedBeneficialData[i][key]
                  ? this.uploadedBeneficialData[i][key]
                  : "";
                formData.append(`beneficialOwerDetailsDto[${i}].${key}`, date);
              } else if (key == "idCopyUploadFile") {
                let file =
                  this.uploadedBeneficialData[i][key] &&
                  this.uploadedBeneficialData[i][key] != ""
                    ? this.uploadedBeneficialData[i][key]
                    : "";
                if (file != "") {
                  formData.append(
                    `beneficialOwerDetailsDto[${i}].${key}`,
                    file
                  );
                }
              } else {
                formData.append(
                  `beneficialOwerDetailsDto[${i}].${key}`,
                  this.uploadedBeneficialData[i][key]
                );
              }
            }
          }
        }
      } else {
      }
      if (this.uploadedRepresentativeData.length) {
        for (let i = 0; i < this.uploadedRepresentativeData.length; i++) {
          for (let key in this.uploadedRepresentativeData[i]) {
            if (key != "id") {
              if (
                key == "representativeDateOfBirth" ||
                key == "representativeIdIssueDate" ||
                key == "representativeIdExpiryDate" ||
                key == "representativeVisaExpiryDate" ||
                key == "representativeAuthorizationLetterExpiryDate"
              ) {
                let date = this.uploadedRepresentativeData[i][key]
                  ? this.uploadedRepresentativeData[i][key]
                  : "";
                formData.append(`representativeDetailsDto[${i}].${key}`, date);
              } else if (
                key == "representativeIdCopyUploadFile" ||
                key == "representativeAuthorizationLetterFile" ||
                key == "otherDocumentUploadFile"
              ) {
                let file =
                  this.uploadedRepresentativeData[i][key] &&
                  this.uploadedRepresentativeData[i][key] != ""
                    ? this.uploadedRepresentativeData[i][key]
                    : "";
                if (file != "") {
                  formData.append(
                    `representativeDetailsDto[${i}].${key}`,
                    file
                  );
                }
              } else {
                formData.append(
                  `representativeDetailsDto[${i}].${key}`,
                  this.uploadedRepresentativeData[i][key]
                );
              }
            }
          }
        }
      } else {
      }

      this.saveIndividualCustomer(formData);
    }
    console.log(JSON.stringify(payloadData, null, 2));
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
    if (data["uploadDocuments"]) {
      this.uploadedKycData = data["uploadDocuments"].map((key) => {
        let docData = {};
        docData["id"] = key["id"] ? key["id"] : "";
        docData["operation"] = "null";
        docData["idNumber"] = key["idNumber"] ? key["idNumber"] : "";
        docData["imageByPassed"] = key["imageByPassed"] == true ? true : false;
        docData["hereByConfirm"] = key["hereByConfirm"] == true ? true : false;
        docData["uploadBackSideFileName"] = key["uploadBackSideOriginal"]
          ? key["uploadBackSideOriginal"]
          : "";
        docData["uploadFrontSideFileName"] = key["uploadFrontSideOriginal"]
          ? key["uploadFrontSideOriginal"]
          : "";
        docData["uploadFrontSideOriginal"] = key["uploadFrontSideOriginal"]
          ? key["uploadFrontSideOriginal"]
          : "";
        docData["uploadBackSideOriginal"] = key["uploadBackSideOriginal"]
          ? key["uploadBackSideOriginal"]
          : "";
        docData["uploadBackSide"] = key["uploadBackSide"]
          ? key["uploadBackSide"]
          : "";
        docData["uploadFrontSide"] = key["uploadFrontSide"]
          ? key["uploadFrontSide"]
          : "";
        docData["customerId"] = key["customerId"] ? key["customerId"] : "";
        docData["status"] = key["status"] ? key["status"] : "Active";
        docData["customerType"] = key["customerType"]
          ? key["customerType"]
          : "";
        docData["documentType"] = key["documentType"]
          ? key["documentType"]
          : "";
        docData["idIssueDate"] = key["idIssueDate"]
          ? !isNaN(Date.parse(key["idIssueDate"]))
            ? new Date(key["idIssueDate"]).toLocaleDateString("en-GB")
            : new Date(
                key["idIssueDate"].split("/").reverse().join("-")
              ).toLocaleDateString("en-GB")
          : "";
        docData["idExpiryDate"] = key["idExpiryDate"]
          ? !isNaN(Date.parse(key["idExpiryDate"]))
            ? new Date(key["idExpiryDate"]).toLocaleDateString("en-GB")
            : new Date(
                key["idExpiryDate"].split("/").reverse().join("-")
              ).toLocaleDateString("en-GB")
          : "";
        (docData["idIssueAuthority"] = key["idIssueAuthority"]
          ? key["idIssueAuthority"]
          : ""),
          (docData["idIssueCountry"] = key["idIssueCountry"]
            ? key["idIssueCountry"]
            : "");
        docData["uploadBackSideFile"] = "";
        docData["uploadFrontSideFile"] = "";
        (docData["createdBy"] = key["createdBy"] ? key["createdBy"] : ""),
          (docData["updatedBy"] = key["updatedBy"] ? key["updatedBy"] : ""),
          (docData["createdDateTime"] = key["createdDateTime"]
            ? key["createdDateTime"]
            : ""),
          (docData["updatedDateTime"] = key["updatedDateTime"]
            ? key["updatedDateTime"]
            : "");

        return docData;
      });
      console.log(":::", this.uploadedKycData);
    }
    if (data["beneficialOwerDetailsDto"]) {
      this.uploadedBeneficialData = data["beneficialOwerDetailsDto"].map(
        (key) => {
          let docData = {};
          docData["id"] = key["id"] ? key["id"] : "";
          docData["operation"] = "null";
          docData["idNumber"] = key["idNumber"] ? key["idNumber"] : "";
          docData["category"] = key["category"] ? key["category"] : "";
          docData["ownershipType"] = key["ownershipType"]
            ? key["ownershipType"]
            : "";
          docData["noOfPartner"] = key["noOfPartner"] ? key["noOfPartner"] : "";
          docData["percentage"] = key["percentage"] ? key["percentage"] : "";
          docData["firstName"] = key["firstName"] ? key["firstName"] : "";
          docData["middleName"] = key["middleName"] ? key["middleName"] : "";
          docData["lastName"] = key["lastName"] ? key["lastName"] : "";
          docData["gender"] = key["gender"] ? key["gender"] : "";
          docData["dateOfBirth"] = key["dateOfBirth"]
            ? !isNaN(Date.parse(key["dateOfBirth"]))
              ? new Date(key["dateOfBirth"]).toLocaleDateString("en-GB")
              : new Date(
                  key["dateOfBirth"].split("/").reverse().join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["countryOfBirth"] = key["countryOfBirth"]
            ? key["countryOfBirth"]
            : "";
          docData["nationality"] = key["nationality"] ? key["nationality"] : "";
          docData["relationship"] = key["relationship"]
            ? key["relationship"]
            : "";
          docData["documentType"] = key["documentType"]
            ? key["documentType"]
            : "";
          docData["idIssueDate"] = key["idIssueDate"]
            ? !isNaN(Date.parse(key["idIssueDate"]))
              ? new Date(key["idIssueDate"]).toLocaleDateString("en-GB")
              : new Date(
                  key["idIssueDate"].split("/").reverse().join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["idExpiryDate"] = key["idExpiryDate"]
            ? !isNaN(Date.parse(key["idExpiryDate"]))
              ? new Date(key["idExpiryDate"]).toLocaleDateString("en-GB")
              : new Date(
                  key["idExpiryDate"].split("/").reverse().join("-")
                ).toLocaleDateString("en-GB")
            : "";
          (docData["idIssueAuthority"] = key["idIssueAuthority"]
            ? key["idIssueAuthority"]
            : ""),
            (docData["idIssueCountry"] = key["idIssueCountry"]
              ? key["idIssueCountry"]
              : "");
          docData["visaExpiryDate"] = key["visaExpiryDate"]
            ? !isNaN(Date.parse(key["visaExpiryDate"]))
              ? new Date(key["visaExpiryDate"]).toLocaleDateString("en-GB")
              : new Date(
                  key["visaExpiryDate"].split("/").reverse().join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["idCopyUploadFileName"] = key["idCopyUploadOriginalName"]
            ? key["idCopyUploadOriginalName"]
            : "";
          docData["idCopyUploadOriginalName"] = key["idCopyUploadOriginalName"]
            ? key["idCopyUploadOriginalName"]
            : "";
          docData["idCopyUploadName"] = key["idCopyUploadName"]
            ? key["idCopyUploadName"]
            : "";
          docData["customerId"] = key["customerId"] ? key["customerId"] : "";
          docData["status"] = key["status"] ? key["status"] : "Active";
          docData["idCopyUploadFile"] = "";
          (docData["createdBy"] = key["createdBy"] ? key["createdBy"] : ""),
            (docData["updatedBy"] = key["updatedBy"] ? key["updatedBy"] : ""),
            (docData["createdDateTime"] = key["createdDateTime"]
              ? key["createdDateTime"]
              : ""),
            (docData["updatedDateTime"] = key["updatedDateTime"]
              ? key["updatedDateTime"]
              : "");

          return docData;
        }
      );

      console.log(this.uploadedBeneficialData);
    }
    if (data["representativeDetailsDto"]) {
      this.uploadedRepresentativeData = data["representativeDetailsDto"].map(
        (key) => {
          let docData = {};
          docData["id"] = key["id"] ? key["id"] : "";
          docData["operation"] = "null";
          docData["representativeIdNumber"] = key["representativeIdNumber"]
            ? key["representativeIdNumber"]
            : "";
          docData["representativeFirstName"] = key["representativeFirstName"]
            ? key["representativeFirstName"]
            : "";
          docData["representativeMiddleName"] = key["representativeMiddleName"]
            ? key["representativeMiddleName"]
            : "";
          docData["representativeLastName"] = key["representativeLastName"]
            ? key["representativeLastName"]
            : "";
          docData["representativeGender"] = key["representativeGender"]
            ? key["representativeGender"]
            : "";
          docData["representativeCountryOfBirth"] = key[
            "representativeCountryOfBirth"
          ]
            ? key["representativeCountryOfBirth"]
            : "";
          docData["representativeNationality"] = key[
            "representativeNationality"
          ]
            ? key["representativeNationality"]
            : "";
          docData["representativeRelationship"] = key[
            "representativeRelationship"
          ]
            ? key["representativeRelationship"]
            : "";
          docData["representativeDocumentType"] = key[
            "representativeDocumentType"
          ]
            ? key["representativeDocumentType"]
            : "";
          docData["representativeDateOfBirth"] = key[
            "representativeDateOfBirth"
          ]
            ? !isNaN(Date.parse(key["representativeDateOfBirth"]))
              ? new Date(key["representativeDateOfBirth"]).toLocaleDateString(
                  "en-GB"
                )
              : new Date(
                  key["representativeDateOfBirth"]
                    .split("/")
                    .reverse()
                    .join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["representativeIdIssueDate"] = key[
            "representativeIdIssueDate"
          ]
            ? !isNaN(Date.parse(key["representativeIdIssueDate"]))
              ? new Date(key["representativeIdIssueDate"]).toLocaleDateString(
                  "en-GB"
                )
              : new Date(
                  key["representativeIdIssueDate"]
                    .split("/")
                    .reverse()
                    .join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["representativeIdExpiryDate"] = key[
            "representativeIdExpiryDate"
          ]
            ? !isNaN(Date.parse(key["representativeIdExpiryDate"]))
              ? new Date(key["representativeIdExpiryDate"]).toLocaleDateString(
                  "en-GB"
                )
              : new Date(
                  key["representativeIdExpiryDate"]
                    .split("/")
                    .reverse()
                    .join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["representativeVisaExpiryDate"] = key[
            "representativeVisaExpiryDate"
          ]
            ? !isNaN(Date.parse(key["representativeVisaExpiryDate"]))
              ? new Date(
                  key["representativeVisaExpiryDate"]
                ).toLocaleDateString("en-GB")
              : new Date(
                  key["representativeVisaExpiryDate"]
                    .split("/")
                    .reverse()
                    .join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["representativeAuthorizationLetterExpiryDate"] = key[
            "representativeAuthorizationLetterExpiryDate"
          ]
            ? !isNaN(
                Date.parse(key["representativeAuthorizationLetterExpiryDate"])
              )
              ? new Date(
                  key["representativeAuthorizationLetterExpiryDate"]
                ).toLocaleDateString("en-GB")
              : new Date(
                  key["representativeAuthorizationLetterExpiryDate"]
                    .split("/")
                    .reverse()
                    .join("-")
                ).toLocaleDateString("en-GB")
            : "";
          docData["representativeIdIssueAuthority"] = key[
            "representativeIdIssueAuthority"
          ]
            ? key["representativeIdIssueAuthority"]
            : "";
          docData["representativeIdIssueCountry"] = key[
            "representativeIdIssueCountry"
          ]
            ? key["representativeIdIssueCountry"]
            : "";
          docData["representativeMaximumAllowedAmount"] = key[
            "representativeMaximumAllowedAmount"
          ]
            ? key["representativeMaximumAllowedAmount"]
            : "";
          docData["representativeIdCopyUploadFileName"] = key[
            "representativeIdCopyUploadOriginalName"
          ]
            ? key["representativeIdCopyUploadOriginalName"]
            : "";
          docData["representativeIdCopyUploadOriginalName"] = key[
            "representativeIdCopyUploadOriginalName"
          ]
            ? key["representativeIdCopyUploadOriginalName"]
            : "";
          docData["representativeIdCopyUploadName"] = key[
            "representativeIdCopyUploadName"
          ]
            ? key["representativeIdCopyUploadName"]
            : "";
          docData["representativeAuthorizationLetterFileName"] = key[
            "representativeAuthorizationLetterOriginalName"
          ]
            ? key["representativeAuthorizationLetterOriginalName"]
            : "";
          docData["representativeAuthorizationLetterOriginalName"] = key[
            "representativeAuthorizationLetterOriginalName"
          ]
            ? key["representativeAuthorizationLetterOriginalName"]
            : "";
          docData["representativeAuthorizationLetterName"] = key[
            "representativeAuthorizationLetterName"
          ]
            ? key["representativeAuthorizationLetterName"]
            : "";
          docData["otherDocumentUploadFileName"] = key[
            "otherDocumentUploadOriginal"
          ]
            ? key["otherDocumentUploadOriginal"]
            : "";
          docData["otherDocumentUploadOriginal"] = key[
            "otherDocumentUploadOriginal"
          ]
            ? key["otherDocumentUploadOriginal"]
            : "";
          docData["otherDocumentUpload"] = key["otherDocumentUpload"]
            ? key["otherDocumentUpload"]
            : "";
          docData["customerId"] = key["customerId"] ? key["customerId"] : "";
          docData["status"] = key["status"] ? key["status"] : "Active";
          docData["customerType"] = key["customerType"]
            ? key["customerType"]
            : "";
          docData["representativeIdCopyUploadFile"] = "";
          docData["representativeAuthorizationLetterFile"] = "";
          docData["otherDocumentUploadFile"] = "";

          (docData["createdBy"] = key["createdBy"] ? key["createdBy"] : ""),
            (docData["updatedBy"] = key["updatedBy"] ? key["updatedBy"] : ""),
            (docData["createdDateTime"] = key["createdDateTime"]
              ? key["createdDateTime"]
              : ""),
            (docData["updatedDateTime"] = key["updatedDateTime"]
              ? key["updatedDateTime"]
              : "");

          return docData;
        }
      );

      console.log(this.uploadedRepresentativeData);
    }
  }

  saveIndividualCustomer(payload: any) {
    this.http
      .post(
        `/remittance/corporateCustomerController/saveCorporateCustomer`,
        payload,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set("customerType", "Individual"),
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
          this.coreService.removeLoadingScreen();
        }
      );
  }

  getIndividualCustomer(custId: any) {
    this.http
      .get(
        `/remittance/corporateCustomerController/getCorporateCustomerDetails/${custId}`,
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

  updateIndividualCustomer(payload: any) {
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

  downloadDoc(type: any, dbFileNames: any) {
    this.coreService.displayLoadingScreen();
    let services = dbFileNames
      .filter((name) => {
        return name && name != "";
      })
      .map((name) => {
        return this.http.get(`/remittance/kycUpload/fileDownload/${name}`, {
          headers: new HttpHeaders().set("userId", this.userId),
          observe: "response",
          responseType: "blob",
        });
      });
    const downloadAllFiles = zip(...services);

    downloadAllFiles.subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (res && res.length > 0) {
          res.forEach((file: any) => {
            let blob: Blob = file.body as Blob;
            let a = document.createElement("a");
            a.download = file.url && file.url.split("/").pop();
            const blobUrl = window.URL.createObjectURL(blob);
            a.href = blobUrl;
            a.click();
            window.URL.revokeObjectURL(blobUrl);
          });
          this.coreService.showSuccessToast("Files downloaded successfully");
        }
      },
      (err) => {
        this.coreService.showWarningToast(
          "Some error while downloading files, Try again in sometime"
        );
        this.coreService.removeLoadingScreen();
      }
    );
  }

  viewDoc(fileUI: any, dbFileName: any) {
    console.log("::", fileUI);
    if (fileUI && fileUI != "") {
      const file = fileUI;
      file.arrayBuffer().then((arrayBuffer) => {
        const blob = new Blob([new Uint8Array(arrayBuffer)], {
          type: file.type,
        });
        const blobUrl = window.URL.createObjectURL(blob);

        window.open(blobUrl, "_blank");
        window.URL.revokeObjectURL(blobUrl);
        console.log(blob);
      });
    } else {
      this.coreService.displayLoadingScreen();
      let service;
      service = this.http.get(`/remittance/kycUpload/view/${dbFileName}`, {
        headers: new HttpHeaders().set("userId", this.userId),
        responseType: "blob",
      });

      service.subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          console.log(":::", res);
          const blobData = new Blob([res], { type: "image/jpeg" });
          const blobUrl = window.URL.createObjectURL(blobData);

          window.open(blobUrl, "_blank");
          window.URL.revokeObjectURL(blobUrl);
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast(
            "Some error while fetching file details, Try again in sometime"
          );
          this.coreService.removeLoadingScreen();
        }
      );
    }
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
        this.uploadedKycData = [];
        this.uploadedRepresentativeData = [];
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

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS
}
