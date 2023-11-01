import { Component, OnInit } from "@angular/core";
import { CoreService } from "../../core.service";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SetCriteriaService } from "../../shared/components/set-criteria/set-criteria.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-custom-form",
  templateUrl: "./custom-form.component.html",
  styleUrls: ["./custom-form.component.scss"],
})
export class CustomFormComponent implements OnInit {
  products: any = [];
  tableData: any = [];
  userData: any = {};
  responseMessage = "";

  criteriaMapDes = "";

  newcriteriaMapCode = "";
  masterData: any = [];
  criteriaMapCodeArray: any = [];
  criteriaCodeText: any[] = [];

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private coreService: CoreService,
    private http: HttpClient,
    private setCriteriaService: SetCriteriaService,
    private fb: UntypedFormBuilder
  ) {}
  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));
    let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));

    let defApp = null;
    let defMod = null;

    if (defAppMod) {
      defApp = this.searchApplicationOptions.filter(
        (opt) => opt.code == defAppMod.applicationName.code
      )[0];
      defMod = this.searchModuleOptions.filter(
        (opt) => opt.code == "Loyalty Programs"
      )[0];
    }

    if (defApp) {
      this.appCtrl.patchValue(defApp);
    }
    if (defMod) {
      this.moduleCtrl.patchValue(defMod);
    }

    this.getMasterData();
  }

  setSelectAppModule() {
    this.selectAppModule = this.fb.group({
      applications: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      modules: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
    });
  }

  get appCtrl() {
    return this.selectAppModule.get("applications");
  }
  get moduleCtrl() {
    return this.selectAppModule.get("modules");
  }

  getMasterData() {
    return this.http
      .get(`remittance/formRulesController/getCriteriaMasterData`, {
        headers: new HttpHeaders()
          .set("userId", String(this.userData.userId))
          .set("form", "Loyalty Programs Manager")
          .set("applications", this.appCtrl.value.name)
          .set("moduleName", this.moduleCtrl.value.name),
      })
      .subscribe((res: any) => {
        console.log("masterdata", res);
        this.masterData = res;
      });
  }
  Apply() {
    console.log("criteriaMapDes", this.criteriaMapDes);
    this.criteriaMapCodeArray = this.criteriaMapDes
      ?.split("&&&&")[0]
      ?.split(", ");
    this.criteriaCodeText = this.setCriteriaService.setCriteriaMap({
      criteriaMap: this.criteriaMapDes,
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

    let newCrtMap = this.criteriaMapDes;
    decodedFormattedCriteriaArr.forEach((crt) => {
      console.log("crt", crt);
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
    this.http;
    this.http
      .get(`remittance/loyaltyProgramController/getLoyaltySetting`, {
        headers: new HttpHeaders()
          .set("criteriaMap", this.newcriteriaMapCode)
          .set("form", "Loyalty Programs Manager")
          .set("applications", this.appCtrl.value.name)
          .set("moduleName", this.moduleCtrl.value.name),
      })
      .subscribe(
        (res: any) => {
          this.coreService.removeLoadingScreen();
          console.log("response ", res);
          if (res.LoyaltySettingData && res.LoyaltySettingData.length) {
            this.responseMessage = res.msg;
            this.tableData = res.LoyaltySettingData;
            this.tableData.forEach((tax) => {
              let beforeSplit = tax.Criteria.split("&&&&")[0];
              const sections = tax.Criteria.split("&&&&");
              let amounts = "";
              let dates = "";
              let afterSplit = "";

              // Process each section
              sections.forEach((section) => {
                if (section.includes("from") && section.includes("to")) {
                  // Extract the amounts
                  const amountsArray = section
                    .split("#")
                    .map((amountSection) => {
                      const [from, to] = amountSection
                        .split("::")
                        .map((part) => part.split(":")[1]);
                      return `Between ${from} - ${to}`;
                    });
                  amounts = amountsArray.join(" & ");
                } else if (
                  section.startsWith("trnStartDate") &&
                  section.includes("trnEndDate")
                ) {
                  // Extract the dates
                  const dateSections = section.split("#").map((dateSection) => {
                    const [startDate, endDate] = dateSection
                      .split("::")
                      .map((part) => part.split("=")[1]);
                    return `Between ${startDate} - ${endDate}`;
                  });
                  dates = dateSections.join(" & ");
                }
              });

              if (amounts.length && dates.length) {
                afterSplit += `Amount (${amounts}), Date (${dates})`;
              } else if (amounts.length) {
                afterSplit += `Amount (${amounts})`;
              } else if (dates.length) {
                afterSplit += `Date (${dates})`;
              }

              if (beforeSplit.length) {
                let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                  criteriaMap: beforeSplit,
                });
                tax.Criteria = (
                  this.setCriteriaService.decodeFormattedCriteria(
                    criteriaCodeText,
                    this.masterData,
                    [""]
                  ) as []
                ).join(", ");
                if (afterSplit?.length) {
                  tax.Criteria = tax.Criteria + ", " + afterSplit;
                }
              } else {
                if (afterSplit?.length) {
                  tax.Criteria = afterSplit;
                }
              }
            });
          } else {
            this.tableData = [];
            this.responseMessage = res.msg;
            this.coreService.showWarningToast(res.msg);
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.coreService.showWarningToast("Format is incorrect");
        }
      );
  }
}
