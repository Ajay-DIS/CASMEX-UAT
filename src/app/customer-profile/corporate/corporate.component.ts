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
  selector: "app-corporate",
  templateUrl: "./corporate.component.html",
  styleUrls: ["./corporate.component.scss"],
})
export class CorporateComponent implements OnInit {
  constructor(
    private coreService: CoreService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date().setFullYear(new Date().getFullYear() - 18);
  expiryMinDate = new Date();
  issueMaxDate = new Date();
  objectKeys = Object.keys;
  showForm: boolean = true;
  submitted = false;

  corporateForm: FormGroup;
  formSections: any[] = [];
  apiData: any = [];

  Options = [
    { name: "first", code: "NY" },
    { name: "second", code: "RM" },
    { name: "third", code: "LDN" },
  ];

  // prettier-ignore
  customerCorporate: any[] = [
    {
      section: "Company Details",
      fields: [
        {
          fieldName: "nameOfTheCorporate",
          fieldLabel: "Name Of The Corporate",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: "^[a-zA-Z ]*$",
        },
        {
          fieldName: "countryOfEstablishment",
          fieldLabel: "Country of Establishment",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: true,
          regex: null
        },
        {
          fieldName: "dateOfEstablishment",
          fieldLabel: "Date of Establishment",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory: true,
          dateType: "issue",
          regex: null,
        },
        {
          fieldName: "businessPurpose",
          fieldLabel: "Business Purpose",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "countryOfOperation ",
          fieldLabel: "Country of Operation ",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "businessActivities ",
          fieldLabel: "Business Activities",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: false,
          regex: null,
        },
        {
          fieldName: "legalStatus ",
          fieldLabel: "Legal status",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "countryOfTrade",
          fieldLabel: "Country of Trade ",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "licenseNumber",
          fieldLabel: "License Number",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory: true,
          regex: null,
        },
        {
          fieldName: "licenseExpiryDate",
          fieldLabel: "License Expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory: true,
          dateType: "expiry",
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
      section: "Contact Details",
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
          isMandatory:true
        },
        {
          fieldName: "blockNumber",
          fieldLabel: "Block number",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "streetName",
          fieldLabel: "Street Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "city",
          fieldLabel: "City",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "pinZipCode",
          fieldLabel: "Pin/Zip Code",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory:true
        },
        {
          fieldName: "sameAsAbove",
          fieldLabel: "Same as above",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory:false
        },
      ],
    },
    {
      section: "KYC Doc Upload",
      fields: [
        {
          fieldName: "documentType",
          fieldLabel: "Document Type",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory:true
        },
        {
          fieldName: "idNumber",
          fieldLabel: "ID Number",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory:true
        },
        {
          fieldName: "idIssueDate",
          fieldLabel: "ID Issue Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:false,
          dateType: "issue",
        },
        {
          fieldName: "idExpiryDate",
          fieldLabel: "ID Expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:true,
          dateType: "expiry",
        },
        {
          fieldName: "idIssueAuthority",
          fieldLabel: "ID Issue Authority",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "idIssueCountry",
          fieldLabel: "ID Issue Country",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory:false
        },
        {
          fieldName: "uploadFrontSide",
          fieldLabel: "Upload Front Side",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory:false
        },
        {
          fieldName: "uploadBackSide",
          fieldLabel: "Upload Back Side",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory:false
        },
        {
          fieldName: "imagebypassed",
          fieldLabel: "Image bypassed",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory:false
        },
        {
          fieldName: "herebyConfirmthatIdDetailsProvidedAreVerified",
          fieldLabel: "Hereby confirm that ID details provided are verified",
          fieldType: "input",
          fieldSubtype: "checkbox",
          isMandatory:false
        },
      ],
    },
    {
      section: "Beneficial Owner Details",
      fields: [
        {
          fieldName: "ownershipType",
          fieldLabel: "Ownership Type",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory:true,
          regex:null
        },
        {
          fieldName: "NoOfPartner",
          fieldLabel: "No. of Partner",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory:true,
          regex:"^[0-9]+$"
        },
        {
          fieldName: "Percentage",
          fieldLabel: "Percentage",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory:true,
          regex:null
        },
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
          fieldName: "idCopyUpload",
          fieldLabel: "ID copy upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory: false,
          regex: null,
        },
      ],
    },
    {
      section: "Representative Details",
      fields: [
        {
          fieldName: "firstName",
          fieldLabel: "First Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "middleName",
          fieldLabel: "Middle Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "lastName",
          fieldLabel: "Last Name",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "gender",
          fieldLabel: "Gender",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory:false
        },
        {
          fieldName: "dob",
          fieldLabel: "Date Of Birth",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:false,
          dateType: "dob",
        },
        {
          fieldName: "countryOfBirth",
          fieldLabel: "Country Of Birth",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory:false
        },
        {
          fieldName: "nationality",
          fieldLabel: "Nationality",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory:false
        },
        {
          fieldName: "relationship",
          fieldLabel: "Relationship",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory:false
        },
        {
          fieldName: "documentType",
          fieldLabel: "Document Type",
          fieldType: "select",
          fieldSubtype: null,
          isMandatory:false
        },
        {
          fieldName: "idNumber",
          fieldLabel: "ID Number",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory:false
        },
        {
          fieldName: "idIssueDate",
          fieldLabel: "ID Issue Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:false,
          dateType: "issue",
        },
        {
          fieldName: "idExpiryDate",
          fieldLabel: "ID Expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:false,
          dateType: "expiry",
        },
        {
          fieldName: "idIssueAuthority",
          fieldLabel: "ID Issue Authority",
          fieldType: "input",
          fieldSubtype: "text",
          isMandatory:false
        },
        {
          fieldName: "idIssueCountry",
          fieldLabel: "ID Issue Country",
          fieldType: "select",
          fieldSubtype: "search",
          isMandatory:false
        },
        {
          fieldName: "visaExpiryDate",
          fieldLabel: "Visa expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:false,
          dateType: "expiry",
        },
        {
          fieldName: "authorizationLetterExpiryDate",
          fieldLabel: "Authorization letter expiry Date",
          fieldType: "input",
          fieldSubtype: "date",
          isMandatory:false,
          dateType: "expiry",
        },
        {
          fieldName: "maximumAllowedAmount",
          fieldLabel: "Maximum allowed amount",
          fieldType: "input",
          fieldSubtype: "number",
          isMandatory:false
        },
        {
          fieldName: "idCopyUpload",
          fieldLabel: "ID copy upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory:false
        },
        {
          fieldName: "authorizationLetterUpload",
          fieldLabel: "Authorization letter upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory:false
        },
        {
          fieldName: "otherDocumentUpload",
          fieldLabel: "Other Document upload",
          fieldType: "input",
          fieldSubtype: "file",
          isMandatory:false
        },
      ],
    },
  ];

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.setFormByData(this.customerCorporate);
    setTimeout(()=>{
      this.coreService.removeLoadingScreen();
    },1000)
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
      this.corporateForm.addControl(section.formName, sectionGroup);
    });
    console.log(allFormSections);
    console.log(this.corporateForm);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.corporateForm.invalid) {
      return;
    }

    console.log(JSON.stringify(this.corporateForm.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    if (this.corporateForm) this.corporateForm.reset();
  }
}
