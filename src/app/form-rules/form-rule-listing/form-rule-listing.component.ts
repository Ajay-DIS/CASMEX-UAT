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

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-form-rule-listing",
  templateUrl: "./form-rule-listing.component.html",
  styleUrls: ["./form-rule-listing.component.scss"],
})
export class FormRuleListingComponent implements OnInit {
  // formName = "Form Rules";

  formRuleListingData: any = [];
  formRuleData: any = [];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  cols: any[] = [
    { field: "formRuleCode", header: "Rule Code", width: "10%" },
    { field: "formRuleDescription", header: "Rule Description", width: "20%" },
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
  searchFormOptions: any[] = [];

  fieldDisplayData = {};

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
    this.formRuleService.formName = null;
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.setSelectAppModule();

    this.formRuleService.getFormRulesAppModuleList().subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        if (
          res["status"] &&
          typeof res["status"] == "string" &&
          (res["status"] == "400" || res["status"] == "500")
        ) {
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
          } else {
            this.coreService.showWarningToast("Some error in fetching data");
          }
        } else {
          if (!res["msg"]) {
            this.searchApplicationOptions = JSON.parse(
              localStorage.getItem("appAccess")
            );
            this.searchModuleOptions = JSON.parse(
              localStorage.getItem("modAccess")
            );
            let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
            let currAppMod = JSON.parse(sessionStorage.getItem("form"));

            let defApp = null;
            let defMod = null;

            if (currAppMod) {
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

            if (this.appCtrl.value && this.moduleCtrl.value) {
              this.formCtrl.enable();
            }
            this.searchFormOptions = res["data"]["cmCriteriaFormsMaster"]
              .filter((form) => {
                return form.criteriaForms.includes("_Form Rules");
              })
              .map((form) => {
                return { name: form.criteriaForms, code: form.criteriaForms };
              });
          } else {
          }
        }
      },
      (err) => {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );
  }

  setSelectAppModule() {
    this.selectAppModule = this.fb.group({
      applications: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      modules: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      forms: new UntypedFormControl({ value: "", disabled: false }, [
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
  get formCtrl() {
    return this.selectAppModule.get("forms");
  }

  searchAppModule() {
    let currAppMod = {
      applicationName: this.appCtrl.value,
      moduleName: this.moduleCtrl.value,
      formName: this.formCtrl.value,
    };
    sessionStorage.setItem("form", JSON.stringify(currAppMod));
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.name,
      this.moduleCtrl.value.name,
      this.formCtrl.value.name
    );
  }

  getDecodedDataForListing(
    userId: any,
    appValue: any,
    moduleValue: any,
    formValue: any
  ) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.formRuleService.getCriteriaMasterData(
        userId,
        formValue,
        appValue,
        moduleValue
      ),
      formRuleListingData: this.formRuleService.getRuleCodeData(
        userId,
        formValue,
        appValue,
        moduleValue
      ),
    })
      .pipe(
        take(1),
        map((response) => {
          let criteriaMasterJson = _lodashClone(response.criteriaMasterData);
          delete criteriaMasterJson["fieldDisplay"];
          this.fieldDisplayData = response.criteriaMasterData["fieldDisplay"];
          const criteriaMasterData = criteriaMasterJson;
          const formRuleListingData = response.formRuleListingData;

          if (Object.keys(criteriaMasterData).length) {
            if (formRuleListingData["data"]) {
              this.formruleListingApiData = formRuleListingData;
              this.formruleListingApiData.data.forEach((rule) => {
                let beforeSplit = rule.criteriaMap.split("&&&&")[0];
                const sections = rule.criteriaMap.split("&&&&");
                let criteria = {};
                let amounts = "";
                let dates = "";
                let afterSplit = "";

                // Process each section
                sections.forEach((section) => {
                  if (section.includes("from") && section.includes("to")) {
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
                    const dateSections = section
                      .split("#")
                      .map((dateSection) => {
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
                console.log("555", afterSplit);

                if (beforeSplit.length) {
                  let criteriaCodeText = this.setCriteriaService.setCriteriaMap(
                    {
                      criteriaMap: beforeSplit,
                    }
                  );
                  rule.criteriaMap = (
                    this.setCriteriaService.decodeFormattedCriteria(
                      criteriaCodeText,
                      criteriaMasterData,
                      this.fieldDisplayData
                    ) as []
                  ).join(", ");
                  if (afterSplit?.length) {
                    rule.criteriaMap = rule.criteriaMap + ", " + afterSplit;
                  }
                } else {
                  if (afterSplit?.length) {
                    rule.criteriaMap = afterSplit;
                  }
                }
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
                      this.fieldDisplayData
                    ) as []
                  ).join(", ");
                  return { label: code, value: code };
                }
              );
              this.status = this.formruleListingApiData.status.map((code) => {
                return { label: code, value: code };
              });
            } else {
              if (formRuleListingData["msg"]) {
                this.coreService.showWarningToast(formRuleListingData["msg"]);
              }
              this.showNoDataFound = true;
              this.formRuleData = [];
            }
          }
          return formRuleListingData;
        })
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.showNoDataFound = true;
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (!res["data"]) {
              this.showNoDataFound = true;
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.formRuleData = null;
          this.loading = false;
          this.showNoDataFound = true;
          console.log("Error in getting form rule list data", err);
          this.coreService.showWarningToast(
            "Some Error in getting form rule list data"
          );
        }
      );
  }

  viewFormRules(data: any) {
    this.formRuleService.applicationName = this.appCtrl.value.name;
    this.formRuleService.moduleName = this.moduleCtrl.value.name;
    this.formRuleService.formName = this.formCtrl.value.name;
    this.router.navigate([
      "navbar",
      "form-rules",
      "addnewformrule",
      data.formRuleCode,
      "edit",
    ]);
    this.formRuleService.setData(data);
  }

  isLinked(id: any) {
    return this.linkedFormRuleCode.includes(id);
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
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
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("formRuleCode", data["formRuleCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.name);
    formData.append("moduleName", this.moduleCtrl.value.name);
    formData.append("form", this.formCtrl.value.name);
    this.updateFormRuleStatus(formData, e.target, data);
  }

  updateFormRuleStatus(formData: any, sliderElm: any, ruleData: any) {
    this.formRuleService.updateFormRuleStatus(formData).subscribe(
      (res) => {
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
              this.appCtrl.value.name,
              this.moduleCtrl.value.name,
              this.formCtrl.value.name
            );
            this.coreService.showSuccessToast(message);
          } else {
            this.coreService.removeLoadingScreen();
            message = "Erro in fetching data, Please try again later";
            this.coreService.showWarningToast(message);
          }
        }
      },
      (err) => {
        console.log(err);
        this.coreService.removeLoadingScreen();
      }
    );
  }

  cloneFormRule(data: any) {
    this.formRuleService.applicationName = this.appCtrl.value.name;
    this.formRuleService.moduleName = this.moduleCtrl.value.name;
    this.formRuleService.formName = this.formCtrl.value.name;
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
  }

  fieldFilterVisible(field: any) {
    return this[`show${field}Options`];
  }

  fieldFilterOptions(field: any): [] {
    return this[field];
  }

  copyToClipboard(text: string) {
    this.coreService.copyToClipboard(text);
  }
}
