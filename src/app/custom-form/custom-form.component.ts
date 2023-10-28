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
import { SetCriteriaService } from "../shared/components/set-criteria/set-criteria.service";

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
    private http: HttpClient,
    private setCriteriaService: SetCriteriaService
  ) {}
  submitted = false;
  form: FormGroup;
  formSections: any[] = [];
  userData: any = {};

  noDataMsg = "No data found.";

  objectKeys = Object.keys;

  showForm: boolean = false;
  criteriaMapCode = "";
  newcriteriaMapCode = "";
  masterData: any = [];
  criteriaMapCodeArray: any = [];
  criteriaCodeText: any[] = [];

  apiData1 = "Country = IND;Form = Customer Profile;Customer Type = IND";

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
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.getCriteriaMasterData();
  }

  setFormByData(data: any) {
    this.apiData = data;
    this.form = this.formBuilder.group({});

    let replica = false;
    let allFormSections = [];
    Object.keys(data).forEach((key) => {
      if (data[key][0]["criteriaMapSplit"]?.split("&&&&").length > 1) {
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
            inputType:
              secData["fieldType"] && secData["fieldType"] != "null"
                ? secData["fieldType"]
                : "text",
            fieldName:
              secData["fieldName"] && secData["fieldName"] != "null"
                ? secData["fieldName"]
                : false,
            criteriaSplit: replica
              ? secData["criteriaMapSplit"].split("&&&&")[1]
              : null,
            fieldLabel:
              secData["fieldLabel"] && secData["fieldLabel"] != "null"
                ? secData["fieldLabel"]
                : secData["fieldName"],
            required: secData["isMandatory"] == "Y" ? true : false,
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
          // if (field.inputType == "number") {
          // let newMin = +("1" + "0".repeat(min));
          // let newMax = +"9".repeat(max);
          // validators.push(Validators.min(newMin));
          // validators.push(Validators.max(newMax));
          // validators.push(Validators.pattern("^d{10}$"));
          // } else {
          validators.push(Validators.minLength(min));
          validators.push(Validators.maxLength(max));
          // }
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
      this.form.addControl(section.formName, sectionGroup);
    });
  }

  // getFieldType(field: any): string {
  //   switch (field.type) {
  //     case "input":
  //       return "text";
  //     case "select":
  //     case "multiselect":
  //       return "select";
  //     case "checkbox":
  //       return "checkbox";
  //     default:
  //       return "text";
  //   }
  // }

  Apply() {
    this.criteriaMapCodeArray = this.criteriaMapCode
      ?.split("&&&&")[0]
      ?.split(", ");
    this.criteriaCodeText = this.setCriteriaService.setCriteriaMap({
      criteriaMap: this.criteriaMapCode.trim(),
    });
    let decodedFormattedCriteriaArr = this.criteriaMapCodeArray.map((crt) => {
      let formatCrt;
      let opr;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
        opr = "!=";
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
        opr = ">=";
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
        opr = "<=";
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
        opr = "<";
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
        opr = ">";
      } else {
        formatCrt = crt.replace(/[=]/g, "");
        opr = "=";
      }
      let key = formatCrt.split("  ")[0];
      let val = formatCrt.split("  ")[1];
      return { [key]: val };
    });

    let newCrtMap = this.criteriaMapCode.trim();
    decodedFormattedCriteriaArr.forEach((crt) => {
      let copyCrtMap = newCrtMap;
      let nameVal = (Object.values(crt)[0] as string).split("&&&&")[0];
      console.log("keys", Object.keys(crt)[0]);
      let filtercrt = this.masterData[Object.keys(crt)[0]?.trim()]?.filter(
        (d) => {
          return d.codeName == nameVal;
        }
      );
      if (filtercrt?.length) {
        let codeVal = filtercrt[0]["code"] as string;
        newCrtMap = copyCrtMap.replace(nameVal, codeVal);
      }
    });
    console.log("newCrtMap", newCrtMap.split(", ").join(";"));
    this.newcriteriaMapCode = newCrtMap.split(", ").join(";");
    this.coreService.displayLoadingScreen();

    this.http
      .get(`/remittance/formRulesController/getFormRules`, {
        headers: new HttpHeaders()
          .set("criteriaMap", this.newcriteriaMapCode.trim())
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

  getCriteriaMasterData() {
    return this.http
      .get(`remittance/formRulesController/getCriteriaMasterData`, {
        headers: new HttpHeaders()
          .set("userId", String(this.userData.userId))
          .set("form", "Customer Profile_Form Rules")
          .set("applications", "Casmex Core")
          .set("moduleName", "Remittance"),
      })
      .subscribe((res) => {
        this.masterData = res;
      });
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
