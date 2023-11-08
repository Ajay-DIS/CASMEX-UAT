import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { Subscription } from "rxjs";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-add-customer-benef",
  templateUrl: "./add-customer-benef.component.html",
  styleUrls: ["./add-customer-benef.component.scss"],
})
export class AddCustomerBenefComponent implements OnInit, OnDestroy {
  @Input("formData") formData: any;
  @Input("beneData") beneData: any;
  @Input("masterData") masterData: any;

  @Output() postData = new EventEmitter<any>();

  // masterData : any =[];

  custId = null;
  userId = null;
  submitted = false;
  today = new Date();
  pastYear = new Date("01/01/1950");
  futureYear = new Date("01/01/2050");
  dobMaxDate = new Date(this.today.setFullYear(this.today.getFullYear() - 18));

  individualForm: FormGroup;
  formSections: any[] = [];
  apiData: any = {};

  objectKeys = Object.keys;

  formDataOrg = {};
  beneDataOrg = {};
  masterDataOrg = {};

  countryDialCode: any = "+91";

  countryChange$: Subscription = null;

  constructor(
    private coreService: CoreService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    console.log("mater", this.masterData);
  }

  ngOnChanges(e: any) {
    console.log("ngonchanges", e);

    if (e.formData && e.formData.currentValue) {
      this.formDataOrg = JSON.parse(JSON.stringify(e.formData.currentValue));
      this.setFormByData(e.formData.currentValue);
    }
    if (e.masterData && e.masterData.currentValue) {
      this.masterDataOrg = e.masterData.currentValue;
      console.log("masterData", e.masterData);
    }

    if (e.beneData && e.beneData.currentValue) {
      this.beneDataOrg = JSON.parse(JSON.stringify(e.beneData.currentValue));
      if (Object.keys(this.formDataOrg).length) {
        this.setBenefEditFormData(e.beneData.currentValue);
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
              newLineField: secData["newLineField"],
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
                    : this.validMinDate(secData["fieldName"])
                  : this.pastYear,
              maxDate:
                secData["fieldType"] == "date"
                  ? secData["maxDate"]
                    ? new Date(secData["maxDate"])
                    : this.validMaxDate(secData["fieldName"])
                  : this.futureYear,
              defaultDate:
                secData["fieldType"] == "date"
                  ? secData["initialDate"]
                    ? new Date(secData["initialDate"])
                    : this.validDefDate(secData["fieldName"])
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

    this.coreService.removeLoadingScreen();
    if (this.individualForm.get("Contact Details")?.get("contactCountry")) {
      this.countryChange$ = this.individualForm
        .get("Contact Details")
        ?.get("contactCountry")
        .valueChanges.subscribe((value) => {
          if (value && value.code) {
            if ("countryDialCode" in this.masterData) {
              let filterCode = this.masterData["countryDialCode"].filter(
                (dialCode: any) => dialCode.code == value.code
              );
              console.log(filterCode);
              if (filterCode && filterCode.length) {
                this.countryDialCode = filterCode[0]?.countryDialCode?.length
                  ? filterCode[0].countryDialCode
                  : "+91";
              } else {
                this.countryDialCode = "+91";
              }
            }
          }
        });
    }
  }

  validMinDate(fieldName: string) {
    return this.pastYear;
  }
  validMaxDate(fieldName: string) {
    if (fieldName == "dateOfEstablishment") {
      return new Date();
    } else if (fieldName == "dateOfBirth") {
      return this.dobMaxDate;
    } else {
      return this.futureYear;
    }
  }
  validDefDate(fieldName: string) {
    if (fieldName == "dateOfBirth") {
      return this.dobMaxDate;
    } else {
      return new Date();
    }
  }

  setBenefEditFormData(data: any) {
    console.log("dataedit", data);
    this.apiData = data;
    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field["fieldName"] in data) {
          if (
            field.fieldType == "select" ||
            field.fieldType == "smart-search"
          ) {
            let filterData = this.masterDataOrg[field["fieldName"]]?.filter(
              (msField) => {
                return msField.codeName == data[field["fieldName"]];
              }
            );
            let value = filterData?.length
              ? {
                  code: filterData[0].code,
                  codeName: filterData[0].codeName,
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
      this.coreService.showWarningToast("Please fill the Mandatory fields");
      return;
    }

    this.coreService.displayLoadingScreen();

    let data = this.individualForm.getRawValue();

    let payloadData = Object.assign({}, ...Object.values(data));

    this.formSections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.fieldType == "select" || field.fieldType == "smart-search") {
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
                  payloadData[field["fieldName"]].split("/").reverse().join("-")
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
    console.log("payloadData", payloadData);

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

  ngOnDestroy(): void {
    if (this.countryChange$) {
      this.countryChange$.unsubscribe();
    }
  }
}
