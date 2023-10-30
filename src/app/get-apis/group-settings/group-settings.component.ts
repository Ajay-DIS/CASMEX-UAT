import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CoreService } from "../../core.service";
import { SetCriteriaService } from "../../shared/components/set-criteria/set-criteria.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-group-settings",
  templateUrl: "./group-settings.component.html",
  styleUrls: ["./group-settings.component.scss"],
})
export class GroupSettingsComponent implements OnInit {
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
    private setCriteriaService: SetCriteriaService,
    private http: HttpClient,
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
    let currAppMod = JSON.parse(sessionStorage.getItem("bankRoute"));

    let defApp = null;
    let defMod = null;

    if (currAppMod) {
      console.log(currAppMod);
      defApp = this.searchApplicationOptions.filter(
        (opt) => opt.code == currAppMod.applicationName.code
      )[0];
      defMod = this.searchModuleOptions.filter(
        (opt) => opt.code == currAppMod.moduleName.code
      )[0];
    } else {
      if (defAppMod) {
        defApp = this.searchApplicationOptions.filter(
          (opt) => opt.code == defAppMod.applicationName.code
        )[0];
        defMod = this.searchModuleOptions.filter(
          (opt) => opt.code == defAppMod.moduleName.code
        )[0];
      }
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
          .set("form", "Bank Routings")
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
      .get(`remittance/banksRoutingController/getBankRouting`, {
        headers: new HttpHeaders()
          .set("criteriaMap", this.newcriteriaMapCode)
          .set("form", "Bank Routings")
          .set("applications", this.appCtrl.value.name)
          .set("moduleName", this.moduleCtrl.value.name),
      })
      .subscribe(
        (res: any) => {
          this.coreService.removeLoadingScreen();
          console.log("response ", res);
          if (res.RouteData && res.RouteData.length) {
            this.responseMessage = res.msg;
            this.tableData = res.RouteData;
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
