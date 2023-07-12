import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { CoreService } from "../core.service";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-custom-form",
  templateUrl: "./custom-form.component.html",
  styleUrls: ["./custom-form.component.scss"],
})
export class CustomFormComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private http: HttpClient
  ) {}
  submitted = false;
  form: FormGroup;
  formSections: any[] = [];
  fields: Field[];

  noDataMsg = "No data found.";

  objectKeys = Object.keys;

  showForm: boolean = false;
  criteriaMapCode = "";

  apiData1 =
    "Form = Customer Profile;Module = Remittance;Country = IND;Organization = HDFC";

  apiData2 =
    "Form = Customer Profile;Module = Remittance;Country = IND;Organization = HDFC&&&&LCY Amount = 20;LCY Amount > 55";

  apiData3 =
    "Form = Customer Profile;Module = Remittance;Country = Any;Organization = Any";

  apiData4 =
    "Form = Customer Profile;Module = Remittance;Country = IND;Organization = HDFC&&&&from:1::to:10#from:21::to:30";

  apiData = {};

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
  }

  setFormByData(data: any) {
    this.apiData = data;
    this.form = this.formBuilder.group({});

    let replica = false;
    let allFormSections = [];
    Object.keys(data).forEach((key) => {
      if (data[key][0]["criteriaMapSplit"].split("&&&&").length > 1) {
        replica = true;
      }
      let formSection = {
        formName: key,
        fields: data[key].map((secData) => {
          let fieldData = {
            name: replica
              ? `${secData["fieldName"]}_${
                  secData["criteriaMapSplit"].split("&&&&")[1]
                }`
              : secData["fieldName"],
            type: "input",
            criteriaSplit: replica
              ? secData["criteriaMapSplit"].split("&&&&")[1]
              : null,
            label: secData["fieldName"],
            required: secData["isMandatory"] == "Y" ? true : false,
            visible: secData["isVisibile"] == "Y" ? true : false,
            validLength: secData["validLength"],
            defaultValue: secData["defaultValue"],
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
          };
          return fieldData;
        }),
      };
      allFormSections.push(formSection);
    });

    this.formSections = allFormSections;

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
        } else {
          validators.push(Validators.maxLength(40));
        }
        if (field.required) {
          validators.push(Validators.required);
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
      this.form.addControl(section.formName, sectionGroup);
    });
    console.log(allFormSections);
    console.log(this.form);
  }

  getFieldType(field: any): string {
    switch (field.type) {
      case "input":
        return "text";
      case "select":
      case "multiselect":
        return "select";
      case "checkbox":
        return "checkbox";
      default:
        return "text";
    }
  }

  Apply() {
    console.log("criteriaMapCode", this.criteriaMapCode.trim());
    this.onReset();
    this.coreService.displayLoadingScreen();
    this.http
      .get(`/remittance/formRulesController/getFormRules`, {
        headers: new HttpHeaders()
          .set("criteriaMap", this.criteriaMapCode.trim())
          .set("formName", "Form Rules")
          .set("moduleName", "Remittance")
          .set("applicationName", "Web Application"),
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

  isCheckboxFieldType(field: any): boolean {
    return field.type === "checkbox";
  }

  isSelectFieldType(field: any): boolean {
    return field.type === "select" || field.type === "multiselect";
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    console.log(JSON.stringify(this.form.value, null, 2));
  }

  onReset(): void {
    this.submitted = false;
    if (this.form) this.form.reset();
  }
}

export class Field {
  name: string;
  type: string;
  label: string;
  required: boolean;
  visible: boolean;
  validLength: string;
  defaultValue: string;
}