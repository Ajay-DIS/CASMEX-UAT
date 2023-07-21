import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import { CoreService } from "src/app/core.service";
import { FormRuleService } from "../form-rule.service";
import { MultiSelect } from "primeng/multiselect";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-form-rule-listing",
  templateUrl: "./form-rule-listing.component.html",
  styleUrls: ["./form-rule-listing.component.scss"],
})
export class FormRuleListingComponent implements OnInit {
  formName = "Form Rules";
  // applicationName = "Web Application";

  formRuleListingData: any = [];
  formRuleData: any = [];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  cols: any[] = [
    { field: "formRuleCode", header: "Rule Code", width: "10%" },
    { field: "formRuleDesc", header: "Rule Description", width: "20%" },
    { field: "criteriaMap", header: "Criteria", width: "55%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

  showformRuleCodeOptions: boolean = false;
  showformRuleDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  formRuleCode = [];
  formRuleDesc = [];
  criteriaMap = [];
  status = [];

  userData: any = {};
  selectedFilterformRuleCode: any[] = [];
  selectedFilterformRuleDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];

  formruleListingApiData: any = {};
  loading: boolean = true;

  noDataMsg: string = "Form Rule Data Not Available";

  linkedFormRuleCode: any = [];

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private formRuleService: FormRuleService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.formRuleService.applicationName = null;
    this.formRuleService.moduleName = null;
    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    this.setSelectAppModule();

    this.formRuleService.getFormRulesAppModuleList().subscribe((res) => {
      this.coreService.removeLoadingScreen();
      console.log("appModuleList", res);
      if (!res["msg"]) {
        this.searchApplicationOptions = res["data"]["cmApplicationMaster"].map(
          (app) => {
            return { name: app.name, code: app.name };
          }
        );
        this.searchModuleOptions = res["data"][
          "cmPrimaryModuleMasterDetails"
        ].map((app) => {
          return { name: app.codeName, code: app.codeName };
        });
      } else {
      }
    });
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

  searchAppModule() {
    console.log("Hi");
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.code,
      this.moduleCtrl.value.code
    );
  }

  getDecodedDataForListing(userId: any, appValue: any, moduleValue: any) {
    console.log(userId, appValue, moduleValue);
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.formRuleService.getCriteriaMasterData(
        userId,
        this.formName,
        appValue,
        moduleValue
      ),
      formRuleListingData: this.formRuleService.getRuleCodeData(
        userId,
        this.formName,
        appValue,
        moduleValue
      ),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          const formRuleListingData = response.formRuleListingData;

          console.log(":formRuleListingData", formRuleListingData);
          if (Object.keys(criteriaMasterData).length) {
            if (formRuleListingData["data"]) {
              this.formruleListingApiData = formRuleListingData;
              this.formruleListingApiData.data.forEach((rule) => {
                let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                  criteriaMap: rule.criteriaMap.split("&&&&")[0],
                });
                rule.criteriaMap = (
                  this.setCriteriaService.decodeFormattedCriteria(
                    criteriaCodeText,
                    criteriaMasterData,
                    [""]
                  ) as []
                ).join(", ");

                rule.criteriaMap = rule.criteriaMap.split("&&&&")[0];
              });
              this.formRuleData = [...this.formruleListingApiData.data];
              this.showNoDataFound = false;
              this.linkedFormRuleCode = [
                ...this.formruleListingApiData.linkedFormRuleCode,
              ];
              this.formRuleCode = this.formruleListingApiData.formRuleCode.map(
                (code) => {
                  return { label: code, value: code };
                }
              );
              this.formRuleDesc = this.formruleListingApiData.formRuleDesc.map(
                (code) => {
                  return { label: code, value: code };
                }
              );
              this.criteriaMap = this.formruleListingApiData.criteriaMap.map(
                (criteriaMap) => {
                  let criteriaCodeText = this.setCriteriaService.setCriteriaMap(
                    {
                      criteriaMap: criteriaMap.split("&&&&")[0],
                    }
                  );
                  let code = (
                    this.setCriteriaService.decodeFormattedCriteria(
                      criteriaCodeText,
                      criteriaMasterData,
                      [""]
                    ) as []
                  ).join(", ");
                  return { label: code, value: code };
                }
              );
              this.status = this.formruleListingApiData.status.map((code) => {
                return { label: code, value: code };
              });
            }
          } else {
            this.noDataMsg = formRuleListingData["msg"];
            this.showNoDataFound = true;
          }
          return formRuleListingData;
        })
      )
      .subscribe(
        (res) => {
          console.log(this.formRuleData);
          console.log(res);
          if (!res["data"]) {
            console.log("No data Found");
            this.showNoDataFound = true;
          }
          this.coreService.removeLoadingScreen();
          this.loading = false;
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.formRuleData = null;
          this.loading = false;
          this.showNoDataFound = true;
          console.log(this.formRuleData);
          console.log("Error in getting form rule list data", err);
        }
      );
  }

  viewFormRules(data: any) {
    this.formRuleService.applicationName = this.appCtrl.value.code;
    this.formRuleService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "form-rules",
      "addnewformrule",
      data.formRuleCode,
      "edit",
    ]);
  }

  isLinked(id: any) {
    return this.linkedFormRuleCode.includes(id);
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    console.log("codeeeeee", data);
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Active";
      type = "activate";
    } else {
      reqStatus = "Inactive";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    let isLinkedMsg = `Active Transactions Exist. </br>`;
    console.log(reqStatus, this.linkedFormRuleCode, data["formRuleCode"]);
    if (
      reqStatus == "Inactive" &&
      this.linkedFormRuleCode.includes(data["formRuleCode"])
    ) {
      completeMsg =
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Rule Record: ${data["formRuleCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Rule Record: ${data["formRuleCode"]}?`;
    }
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        this.updateStatus(e, reqStatus, data);
        this.setHeaderSidebarBtn(true);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn(false);
      },
    });
  }

  setHeaderSidebarBtn(accept: boolean) {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    if (!accept) {
      setTimeout(() => {
        this.coreService.removeLoadingScreen();
      }, 1000);
    }
  }

  updateStatus(e: any, reqStatus: any, data: any) {
    console.log(e.target, reqStatus);
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("formRuleCode", data["formRuleCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.code);
    formData.append("moduleName", this.moduleCtrl.value.code);
    formData.append("form", this.formName);
    this.updateFormRuleStatus(formData, e.target, data);
    // }
  }

  updateFormRuleStatus(formData: any, sliderElm: any, ruleData: any) {
    this.formRuleService.updateFormRuleStatus(formData).subscribe((res) => {
      let message = "";
      if (res["error"] == "true") {
        this.coreService.removeLoadingScreen();
        message = `Kindly deactivate the Rule code: ${res["msg"]} ( ${ruleData["criteriaMap"]} ) to activate the current record.`;
        this.coreService.showWarningToast(message);
      } else {
        if (res["msg"]) {
          message = res["msg"];
          sliderElm.checked = sliderElm!.checked;
          this.getDecodedDataForListing(
            this.userData.userId,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code
          );
          this.coreService.showSuccessToast(message);
        } else {
          this.coreService.removeLoadingScreen();
          message = "Something went wrong, Please try again later";
          this.coreService.showWarningToast(message);
        }
      }
    });
  }

  cloneFormRule(data: any) {
    this.formRuleService.applicationName = this.appCtrl.value.code;
    this.formRuleService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "form-rules",
      "addnewformrule",
      data.formRuleCode,
      "clone",
    ]);
  }

  addNewFormRule() {
    this.router.navigate(["navbar", "form-rules", "addnewformrule"]);
  }

  toggleFilterVisibility(field) {
    this[`show${field}Options`] = !this[`show${field}Options`];
  }

  hideFilterVisibility(field) {
    this[`show${field}Options`] = false;
  }

  getSelectedFilterArr(field: any) {
    return this[`selectedFilter${field}`];
  }

  setSelectedFilter(ms: MultiSelect, field: any) {
    this[`selectedFilter${field}`] = ms.value;
    console.log(ms.value, this[`selectedFilter${field}`]);
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }
}
