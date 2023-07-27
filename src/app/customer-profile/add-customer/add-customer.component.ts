import { Component, OnInit } from "@angular/core";
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
    private formBuilder: FormBuilder
  ) {}
  minDate = new Date();
  idExpiryDateMin: Date = new Date();
  eighteenYearsAgo = new Date(
    this.minDate.setFullYear(this.minDate.getFullYear() - 18)
  );
  AfterTenYears = new Date("07/31/2028");

  // --------------------AJAY STSARTSSSSSSSSSSSSSS

  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date().setFullYear(new Date().getFullYear() - 18);
  expiryMinDate = new Date();
  issueMaxDate = new Date();
  objectKeys = Object.keys;
  showForm: boolean = true;
  submitted = false;

  individualForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];
  // prettier-ignore
  customerIndividual: any[] = [
    {
      section: "personal Details",
      fields: [
        {
          fieldName: "firstName",
          fieldLabel: "First Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "middleName",
          fieldLabel: "Middle Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "lastName",
          fieldLabel: "Last Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "gender",
          fieldLabel: "Gender",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "dob",
          fieldLabel: "Date Of Birth",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory: true,
          dateType: "dob",
          regex: null,
        },
        {
          fieldName: "countryOfBirth",
          fieldLabel: "Country Of Birth",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "nationality",
          fieldLabel: "Nationality",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "customerGroup",
          fieldLabel: "Customer Group",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "politicallyExposedPerson",
          fieldLabel: "Politically exposed person?",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "creditToParty",
          fieldLabel: "Credit to party",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "onAccountPaymentMode",
          fieldLabel: "On Account Payment Mode",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory: false,
          regex: null,
        },
      ],
    },
    {
      section: "contact Details",
      fields: [
        {
          fieldName: "country",
          fieldLabel: "Country",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "mobileNumber",
          fieldLabel: "Mobile Number",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory: true,
          regex: "^((\\+91-?)|0)?[0-9]{10}$",
        },
        {
          fieldName: "phoneNumber",
          fieldLabel: "Phone Number",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory: false,
          regex: "^((\\+91-?)|0)?[0-9]{10}$",
        },
        {
          fieldName: "emailId",
          fieldLabel: "Email Id",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$",
        },
        {
          fieldName: "houseBuildingNo",
          fieldLabel: "House/Building number",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "blockNumber",
          fieldLabel: "Block number",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "streetName",
          fieldLabel: "Street Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "city",
          fieldLabel: "City",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "pinZipCode",
          fieldLabel: "Pin/Zip Code",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory: true,
          regex: "^(\\d{4}|\\d{6})$",
        },
        {
          fieldName: "sameAsAbove",
          fieldLabel: "Same as above",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory: false,
          regex: null,
        },
      ],
    },
    {
      section: "employment Details",
      fields: [
        {
          fieldName: "employerName",
          fieldLabel: "Employer Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "profession",
          fieldLabel: "Profession",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "salaryDate",
          fieldLabel: "Salary Date",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "monthlySalary",
          fieldLabel: "Monthly Salary",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory: false,
          regex: "^[0-9]+$",
        },
        {
          fieldName: "visaStatus",
          fieldLabel: "Visa Status",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: true,
          regex: null,
        },
      ],
    },
    {
      section: "kyc Doc Upload",
      fields: [
        {
          fieldName: "documentType",
          fieldLabel: "Document Type",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "idNumber",
          fieldLabel: "ID Number",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "idIssueDate",
          fieldLabel: "ID Issue Date",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "issue",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "idExpiryDate",
          fieldLabel: "ID Expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "expiry",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "idIssueAuthority",
          fieldLabel: "ID Issue Authority",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "idIssueCountry",
          fieldLabel: "ID Issue Country",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "uploadFrontSide",
          fieldLabel: "Upload Front Side",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "uploadBackSide",
          fieldLabel: "Upload Back Side",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "imagebypassed",
          fieldLabel: "Image bypassed",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "herebyConfirmthatIdDetailsProvidedAreVerified",
          fieldLabel: "Hereby confirm that ID details provided are verified",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory: false,
          regex: null,
        },
      ],
    },
    {
      section: "representative Details",
      fields: [
        {
          fieldName: "firstName",
          fieldLabel: "First Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "middleName",
          fieldLabel: "Middle Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "lastName",
          fieldLabel: "Last Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "gender",
          fieldLabel: "Gender",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "dob",
          fieldLabel: "Date Of Birth",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "dob",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "countryOfBirth",
          fieldLabel: "Country Of Birth",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "nationality",
          fieldLabel: "Nationality",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "relationship",
          fieldLabel: "Relationship",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "documentType",
          fieldLabel: "Document Type",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "idNumber",
          fieldLabel: "ID Number",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "idIssueDate",
          fieldLabel: "ID Issue Date",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "issue",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "idExpiryDate",
          fieldLabel: "ID Expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "expiry",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "idIssueAuthority",
          fieldLabel: "ID Issue Authority",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: false,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "idIssueCountry",
          fieldLabel: "ID Issue Country",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "visaExpiryDate",
          fieldLabel: "Visa expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "expiry",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "authorizationLetterExpiryDate",
          fieldLabel: "Authorization letter expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          dateType: "expiry",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "maximumAllowedAmount",
          fieldLabel: "Maximum allowed amount",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory: false,
          regex: "^[0-9]+$",
        },
        {
          fieldName: "idCopyUpload",
          fieldLabel: "ID copy upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "authorizationLetterUpload",
          fieldLabel: "Authorization letter upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "otherDocumentUpload",
          fieldLabel: "Other Document upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory: false,
          regex: null,
        },
      ],
    },
  ];

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS

  customerInfo = {
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    countryOfBirth: "",
    natoinality: "",
    customerGroup: "",
    politicallyExposedPerson: "",
    creditToParty: "",
    accountPaymentMode: "",
    country: "",
    mobileNumber: "",
    phoneNumber: "",
    email: "",
    houseNumber: "",
    blockNumber: "",
    streetNumber: "",
    city: "",
    pinZipCode: "",
    permanentAddressIsSameAsAbove: "",
    employerName: "",
    profession: "",
    salaryDate: "",
    monthlySalary: "",
    visaStatus: "",
    documentType: "",
    idNumber: "",
    idIssueDate: "",
    idExpiryDate: "",
    idIssueAuthority: "",
    idIssueCountry: "",
    repFirstName: "",
    repMiddleName: "",
    repLastName: "",
    repGender: "",
    repDateOfBirth: "",
    repCountryOfBirth: "",
    repNatoinality: "",
    repRelationship: "",
    repDocumentType: "",
    repIdNumberDate: "",
    repIdIssueDate: "",
    repIdExpiryDate: "",
    repIdIssueAuthority: "",
    repIdIssueCountry: "",
    repVisaExpiryDate: "",
    repAuthorizationLetterExpiryDate: "",
  };

  customerInfoMeta = {
    politicallyExposedPersonOptions: [
      { name: "Yes", code: "Yes" },
      { name: "No", code: "No" },
    ],
    customerGenderOptions: [
      { name: "Male", code: "Male" },
      { name: "Female", code: "Female" },
    ],
    salaryDateOptions: [
      { name: "1", code: "1" },
      { name: "2", code: "2" },
      { name: "3", code: "3" },
      { name: "4", code: "4" },
      { name: "5", code: "5" },
      { name: "6", code: "6" },
      { name: "7", code: "7" },
      { name: "8", code: "8" },
      { name: "9", code: "9" },
      { name: "10", code: "10" },
      { name: "11", code: "11" },
      { name: "12", code: "12" },
      { name: "13", code: "13" },
      { name: "14", code: "14" },
      { name: "15", code: "15" },
      { name: "16", code: "16" },
      { name: "17", code: "17" },
      { name: "18", code: "18" },
      { name: "19", code: "19" },
      { name: "20", code: "20" },
      { name: "21", code: "21" },
      { name: "22", code: "22" },
      { name: "23", code: "23" },
      { name: "24", code: "24" },
      { name: "25", code: "25" },
      { name: "26", code: "26" },
      { name: "27", code: "27" },
      { name: "28", code: "28" },
      { name: "29", code: "29" },
      { name: "30", code: "30" },
      { name: "31", code: "31" },
    ],
  };

  // --------------------AJAY STARTSSSSSSSSSSSSSSSSSS
  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.setFormByData(this.customerIndividual);
    this.coreService.removeLoadingScreen();
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
    this.individualForm = this.formBuilder.group({});

    let allFormSections = [];
    this.apiData.forEach((sectionObj) => {
      let formSection = {
        formName: sectionObj.section,
        fields: sectionObj.fields.map((secData) => {
          let fieldData = {
            name: secData["fieldName"],
            fieldName: secData["fieldName"],
            fieldType: secData["fieldType"],
            fieldSubtype: secData["fieldSubtype"],
            fieldLabel: secData["fieldLabel"],
            required: secData["isMandatory"],
            enable: secData["isEnable"] == "Y" ? true : false,
            visible: secData["isVisibile"] == "Y" ? true : false,
            validLength: secData["validLength"],
            defaultValue: secData["defaultValue"],
            regex:
              secData["regex"] &&
              secData["regex"] != "null" &&
              secData["regex"].trim().length
                ? secData["regex"]
                : false,
            minDate:
              secData["dateType"] && this.getMinDate(secData["dateType"]),
            maxDate:
              secData["dateType"] && this.getMaxDate(secData["dateType"]),
            defaultDate:
              secData["dateType"] && this.getDefaultDate(secData["dateType"]),
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
        console.log(field);
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
    console.log(allFormSections);
    console.log(this.individualForm);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.individualForm.invalid) {
      return;
    }

    console.log(JSON.stringify(this.individualForm.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    if (this.individualForm) this.individualForm.reset();
  }

  // --------------------AJAY ENDSSSSSSSSSSSSSSSSSSSS

  onChange(section, controlId, controlType, event) {}

  myUploader(event) {}

  resetCustomerInfo() {}

  saveCustomer() {
    if (this.validationFields()) {
      return;
    } else {
    }
  }

  validationFields() {
    let flag = false;
    let requiredFields = [
      { label: "First Name", field: "firstName" },
      { label: "Middle Name", field: "middleName" },
      { label: "Last Name", field: "lastName" },
      { label: "Country", field: "country" },
      { label: "Mobile Number", field: "mobileNumber" },
      { label: "House/Building number", field: "houseNumber" },
      { label: "Employer Name", field: "employerName" },
      { label: "Pin/Zip Code", field: "pinZipCode" },
      { label: "Profession", field: "profession" },
      { label: "Visa Status", field: "visaStatus" },
      { label: "Document Type", field: "documentType" },
      { label: "ID Number", field: "idNumber" },
      { label: "ID Expiry Date", field: "idExpiryDate" },
    ];
    let msgList = [];
    requiredFields.forEach((x) => {
      if (
        this.customerInfo[x.field] == "" ||
        this.customerInfo[x.field] == undefined ||
        this.customerInfo[x.field] == null
      ) {
        msgList.push(x.label);
      }
    });
    let msg = "Please enter required fields. " + msgList.join(", ");
    msgList.length && (flag = true) && this.coreService.showWarningToast(msg);
    return flag;
  }
}
