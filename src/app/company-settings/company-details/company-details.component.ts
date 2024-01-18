import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-company-details",
  templateUrl: "./company-details.component.html",
  styleUrls: ["./company-details.component.scss"],
})
export class CompanyDetailsComponent implements OnInit {
  companyForm: FormGroup;
  formSections: any = [
    {
      formName: "Basic Details",
      seqOrder: "1",
      fields: [
        {
          fieldLabel: "Company Name",
          fieldName: "companyName",
          fieldSubtype: "",
          fieldType: "text",
          fieldDisplayOrder: "1",
        },
        {
          fieldLabel: "Country",
          fieldName: "country",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "2",
        },
        {
          fieldLabel: "House/Building Number",
          fieldName: "houseNumber",
          fieldSubtype: "",
          fieldType: "text",
          fieldDisplayOrder: "3",
        },
        {
          fieldLabel: "Block Number",
          fieldName: "blockNumber",
          fieldSubtype: "",
          fieldType: "text",
          fieldDisplayOrder: "4",
        },
        {
          fieldLabel: "Street Name",
          fieldName: "streetName",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "5",
        },
        {
          fieldLabel: "Pin Code/Zip Code",
          fieldName: "pinZipCode",
          fieldSubtype: "",
          fieldType: "number",
          fieldDisplayOrder: "6",
        },
        {
          fieldLabel: "Time Zone",
          fieldName: "pinZipCode",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "7",
        },
        {
          fieldLabel: "Email",
          fieldName: "email",
          fieldSubtype: "",
          fieldType: "text",
          fieldDisplayOrder: "8",
        },
        {
          fieldLabel: "Mobile Number",
          fieldName: "mobileNumber",
          fieldSubtype: "",
          fieldType: "number",
          fieldDisplayOrder: "9",
        },
        {
          fieldLabel: "Phone Number",
          fieldName: "phoneNumber",
          fieldSubtype: "",
          fieldType: "number",
          fieldDisplayOrder: "10",
        },
        {
          fieldLabel: "Company Logo",
          fieldName: "companyLogo",
          fieldSubtype: "",
          fieldType: "file",
          fieldDisplayOrder: "11",
        },
      ],
    },
    {
      formName: "Operational Details",
      seqOrder: "2",
      fields: [
        {
          fieldLabel: "Base Currency",
          fieldName: "baseCurrency",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "1",
        },
        {
          fieldLabel: "Primary Base Currency",
          fieldName: "primaryBaseCurrency",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "2",
        },
        {
          fieldLabel: "Cross Currency",
          fieldName: "crossCurrency",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "3",
        },
        {
          fieldLabel: "Number Format",
          fieldName: "numberFormat",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "4",
        },
        {
          fieldLabel: "Date Dormat",
          fieldName: "dateFormat",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "5",
        },
      ],
    },
    {
      formName: "Appearance Settings",
      seqOrder: "3",
      fields: [
        {
          fieldLabel: "Primary Language",
          fieldName: "primaryLanguage",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "1",
        },
        {
          fieldLabel: "Theme",
          fieldName: "theme",
          fieldSubtype: "",
          fieldType: "dropdownSingle",
          fieldDisplayOrder: "2",
        },
      ],
    },
    // {
    //   formName: "Remittance Features",
    //   seqOrder: "4",
    // },
  ];

  objectKeys = Object.keys;

  deactivated: boolean = false;
  mode = "add";

  constructor(private formBuilder: FormBuilder) {}

  apiData: any = [];

  ngOnInit(): void {
    this.companyForm = this.formBuilder.group({});
    this.formSections.forEach((section) => {
      const sectionGroup = new UntypedFormGroup({});
      section.fields.forEach((field) => {
        sectionGroup.addControl(field.name, this.formBuilder.control(""));
      });
      this.companyForm.addControl(section.formName, sectionGroup);
    });
    console.log(this.companyForm);
  }
  onSubmit() {}
  onReset() {}
}
