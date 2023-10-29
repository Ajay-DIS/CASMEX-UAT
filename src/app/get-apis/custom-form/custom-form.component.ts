import { Component, OnInit } from "@angular/core";
import { CoreService } from "../../core.service";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SetCriteriaService } from "../../shared/components/set-criteria/set-criteria.service";

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
  constructor(
    private route: ActivatedRoute,
    private coreService: CoreService,
    private http: HttpClient,
    private setCriteriaService: SetCriteriaService
  ) {}
  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.getMasterData();
  }
  getMasterData() {
    return this.http
      .get(`remittance/formRulesController/getCriteriaMasterData`, {
        headers: new HttpHeaders()
          .set("userId", String(this.userData.userId))
          .set("form", "Loyalty Programs Manager")
          .set("applications", "Casmex Core")
          .set("moduleName", "Loyalty Programs"),
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
          .set("applications", "Casmex Core")
          .set("moduleName", "Loyalty Programs"),
      })
      .subscribe((res: any) => {
        this.coreService.removeLoadingScreen();
        console.log("response ", res);
        if (res.LoyaltySettingData && res.LoyaltySettingData.length) {
          this.responseMessage = res.msg;
          this.tableData = res.LoyaltySettingData;
        } else {
          this.tableData = [];
          this.responseMessage = res.msg;
          this.coreService.showWarningToast(res.msg);
        }
      });
  }
}
