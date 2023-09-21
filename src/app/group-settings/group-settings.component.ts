import { Component, OnInit } from "@angular/core";
import { GroupServiceService } from "./group-service.service";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "../core.service";
import { SetCriteriaService } from "../shared/components/set-criteria/set-criteria.service";

@Component({
  selector: "app-group-settings",
  templateUrl: "./group-settings.component.html",
  styleUrls: ["./group-settings.component.scss"],
})
export class GroupSettingsComponent implements OnInit {
  products: any = [];
  routingData: any = [];
  userData: any = {};
  responseMessage = "";

  criteriaMapDes = "";

  appName = "Casmex Core";
  moduleName = "Remittance";
  formName = "Bank Routings";

  newcriteriaMapCode = "";
  masterData: any = [];
  criteriaMapCodeArray: any = [];
  criteriaCodeText: any[] = [];

  constructor(
    private groupService: GroupServiceService,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private setCriteriaService: SetCriteriaService
  ) {}

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    // this.getRoutingapiData();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.getMasterData();
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
      let copyCrtMap = newCrtMap;
      let nameVal = (Object.values(crt)[0] as string).split("&&&&")[0];
      console.log("keys", Object.keys(crt)[0]);
      let filtercrt = this.masterData[Object.keys(crt)[0]?.trim()]?.filter(
        (d) => {
          return d.codeName == nameVal;
        }
      );
      if (filtercrt.length) {
        let codeVal = filtercrt[0]["code"] as string;
        newCrtMap = copyCrtMap.replace(nameVal, codeVal);
      }
    });
    console.log("newCrtMap", newCrtMap.split(", ").join(";"));
    this.newcriteriaMapCode = newCrtMap.split(", ").join(";");

    this.groupService
      .getRoutingData(
        this.newcriteriaMapCode,
        this.appName,
        this.moduleName,
        this.formName
      )
      .subscribe((res: any) => {
        if (res.RouteData && res.RouteData.length) {
          this.responseMessage = res.msg;
          this.routingData = res.RouteData;
        } else {
          this.routingData = [];
          this.responseMessage = res.msg;
          this.coreService.showWarningToast(res.msg);
        }
      });
  }
  getMasterData() {
    this.groupService
      .getCriteriaMasterData(this.formName, this.appName, this.moduleName)
      .subscribe((res: any) => {
        console.log("masterdata", res);
        this.masterData = res;
      });
  }

  getRoutingapiData(appValue: any, moduleValue: any) {
    let params = [
      "Country = IND;Organization = ICICI&&&&from:1::to:2",
      "Country = IND;Organization = ICICI&&&&LCY Amount = 3000",
    ];
    this.groupService
      .getRoutingData(params, appValue, moduleValue, this.formName)
      .subscribe((res: any) => {
        console.log("response ", res);
        if (res.RouteData && res.RouteData.length) {
          this.routingData = res.RouteData;
        } else {
          this.responseMessage = res.msg;
        }
      });
  }
}
