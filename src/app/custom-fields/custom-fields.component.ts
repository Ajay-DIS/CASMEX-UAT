import { Component, OnInit } from "@angular/core";
import { CustomfieldServiceService } from "./customfield-service.service";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "../core.service";
import { SetCriteriaService } from "../shared/components/set-criteria/set-criteria.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-custom-fields",
  templateUrl: "./custom-fields.component.html",
  styleUrls: ["./custom-fields.component.scss"],
})
export class CustomFieldsComponent implements OnInit {
  products: any = [];
  taxSettingData: any = [];
  userData: any = {};
  responseMessage = "";

  criteriaMapDes = "";

  appName = "Casmex Core";
  moduleName = "Remittance";
  formName = "Tax Settings";

  newcriteriaMapCode = "";
  masterData: any = [];
  criteriaMapCodeArray: any = [];
  criteriaCodeText: any[] = [];

  constructor(
    private customService: CustomfieldServiceService,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private setCriteriaService: SetCriteriaService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    // this.getTaxSettingapiData();
    this.getMasterData();
  }
  getMasterData() {
    return this.http
      .get(`remittance/formRulesController/getCriteriaMasterData`, {
        headers: new HttpHeaders()
          .set("userId", String(this.userData.userId))
          .set("form", "Tax Settings")
          .set("applications", "Casmex Core")
          .set("moduleName", "Remittance"),
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
    this.customService
      .getTaxSettingData(
        this.newcriteriaMapCode,
        this.appName,
        this.moduleName,
        this.formName
      )
      .subscribe((res: any) => {
        this.coreService.removeLoadingScreen();
        console.log("response ", res);
        if (res.TaxSettingData && res.TaxSettingData.length) {
          this.responseMessage = res.msg;
          this.taxSettingData = res.TaxSettingData;
        } else {
          this.taxSettingData = [];
          this.responseMessage = res.msg;
          this.coreService.showWarningToast(res.msg);
        }
      });
  }
}
