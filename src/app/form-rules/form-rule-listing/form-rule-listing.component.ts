import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { CoreService } from 'src/app/core.service';
import { FormRuleService } from '../form-rule.service';
import { MultiSelect } from 'primeng/multiselect';
import { forkJoin } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { SetCriteriaService } from 'src/app/shared/components/set-criteria/set-criteria.service';

@Component({
  selector: 'app-form-rule-listing',
  templateUrl: './form-rule-listing.component.html',
  styleUrls: ['./form-rule-listing.component.scss']
})
export class FormRuleListingComponent implements OnInit {
  formName = "Form Rules";
  applicationName = "Web Application";

  formRuleListingData:any[]=[
        {
            "id": 0,
            "userID": null,
            "ruleCode": "F0009",
            "country": null,
            "createdDate": null,
            "status": "Active",
            "updatedBy": null,
            "updatedDate": null,
            "criteriaMap": "Country = IND;State = UP;Module = PM11",
            "ruleCodeDesc": "again new clone and edited",
            "lcyAmountFrom": null,
            "lcyAmountTo": null,
            "lcySlab": null,
            "ruleCodeID": null,
            "criteriaID": null,
            "lcyAmount": null,
            "state": null,
            "amountType": null,
            "customerType": null,
            "module": null,
            "ruleType": null,
            "setAs": null,
            "rule": null,
            "linked": null,
            "linkedWith": null
        },
        {
            "id": 0,
            "userID": null,
            "ruleCode": "F0008",
            "country": null,
            "createdDate": null,
            "status": "Active",
            "updatedBy": null,
            "updatedDate": null,
            "criteriaMap": "Country = IND;State = UP",
            "ruleCodeDesc": "again new",
            "lcyAmountFrom": null,
            "lcyAmountTo": null,
            "lcySlab": null,
            "ruleCodeID": null,
            "criteriaID": null,
            "lcyAmount": null,
            "state": null,
            "amountType": null,
            "customerType": null,
            "module": null,
            "ruleType": null,
            "setAs": null,
            "rule": null,
            "linked": null,
            "linkedWith": null
        },
        {
            "id": 0,
            "userID": null,
            "ruleCode": "F0007",
            "country": null,
            "createdDate": null,
            "status": "Active",
            "updatedBy": null,
            "updatedDate": null,
            "criteriaMap": "Country = IND;State = KL;Module = PM7&&&&from:1::to:20",
            "ruleCodeDesc": "new rule clone and edited",
            "lcyAmountFrom": null,
            "lcyAmountTo": null,
            "lcySlab": null,
            "ruleCodeID": null,
            "criteriaID": null,
            "lcyAmount": null,
            "state": null,
            "amountType": null,
            "customerType": null,
            "module": null,
            "ruleType": null,
            "setAs": null,
            "rule": null,
            "linked": null,
            "linkedWith": null
        },
        {
            "id": 0,
            "userID": null,
            "ruleCode": "F0006",
            "country": null,
            "createdDate": null,
            "status": "Active",
            "updatedBy": null,
            "updatedDate": null,
            "criteriaMap": "Country = IND;State = KL",
            "ruleCodeDesc": "new rule",
            "lcyAmountFrom": null,
            "lcyAmountTo": null,
            "lcySlab": null,
            "ruleCodeID": null,
            "criteriaID": null,
            "lcyAmount": null,
            "state": null,
            "amountType": null,
            "customerType": null,
            "module": null,
            "ruleType": null,
            "setAs": null,
            "rule": null,
            "linked": null,
            "linkedWith": null
        },
    
];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound :boolean= false;

  cols: any[] = [
    { field: "ruleCode", header: "Rule Code", width: "10%" },
    { field: "ruleCodeDesc", header: "Rule Description", width: "20%" },
    { field: "criteriaMap", header: "Criteria", width: "55%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

  showruleCodeOptions: boolean = false;
  showruleCodeDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  ruleCode = [];
  ruleCodeDesc = [];
  criteriaMap = [];
  status = [];

  userData: any = {};
  selectedFilterruleCode: any[] = [];
  selectedFilterruleCodeDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];

  formruleListingApiData: any = {};
  loading: boolean = true;

  noDataMsg: string = "Form Rule Data Not Available";

  linkedRuleCode: any = [];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private formRuleService:FormRuleService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));
    console.log("userData", localStorage.getItem("userData"));
    // this.getRuleCodeListData(this.userData.userId);
    this.loading = false;
  }

  getDecodedDataForListing(userId: any) {
    // this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.formRuleService.getCriteriaMasterData(
        this.formName,
        this.applicationName
      ),
      formRuleListingData: this.formRuleService.getRuleCodeData(userId),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          const formRuleListingData = response.formRuleListingData;

          console.log(":formRuleListingData", formRuleListingData);
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

              // rule.criteriaMap = rule.criteriaMap.split("&&&&")[0];
            });
            this.formRuleListingData = [...this.formruleListingApiData.data];
           this.showNoDataFound = false;
            this.linkedRuleCode = [...this.formruleListingApiData.linkedRuleCode];
            this.ruleCode = this.formruleListingApiData.ruleCode.map((code) => {
              return { label: code, value: code };
            });
            this.ruleCodeDesc = this.formruleListingApiData.ruleCodeDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.criteriaMap = this.formruleListingApiData.criteriaMap.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            // this.criteriaMap = this.formRuleListingData.criteriaMap.map(
            //   (criteriaMap) => {
            //     let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
            //       criteriaMap: criteriaMap.split("&&&&")[0],
            //     });
            //     let code = (
            //       this.setCriteriaService.decodeFormattedCriteria(
            //         criteriaCodeText,
            //         criteriaMasterData,
            //         [""]
            //       ) as []
            //     ).join(", ");
            //     return { label: code, value: code };
            //   }
            // );
            this.status = this.formruleListingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            this.noDataMsg = formRuleListingData["msg"];
            this.showNoDataFound = true;
          }
          return formRuleListingData;
        })
      )
      .subscribe(
        (res) => {
          if (!res["data"]) {
            console.log("No data Found");
            this.showNoDataFound =true;
          }
          this.coreService.removeLoadingScreen();
          this.loading = false;
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          this.showNoDataFound =true;
          console.log("Error in getting form rule list data", err);
        }
      );
  }

  getRuleCodeListData(id: string) {
    this.getDecodedDataForListing(this.userData.userId);
  }

  viewFormRules(data: any) {
    this.router.navigate([
      "navbar",
      "form-rules",
      "addnewformrule",
      data.ruleCode,
      "edit",
    ]);
  }

  isLinked(id: any) {
    return this.linkedRuleCode.includes(id);
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    console.log("codeeeeee", status);
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
    console.log(reqStatus, this.linkedRuleCode, data["ruleCode"]);
    if (
      reqStatus == "Inactive" &&
      this.linkedRuleCode.includes(data["ruleCode"])
    ) {
      completeMsg =
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Rule Record: ${data["ruleCode"]}?`;
    } else {
      completeMsg =
        `Do you wish to ` + type + ` the Rule Record: ${data["ruleCode"]}?`;
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
    formData.append("ruleCode", data["ruleCode"]);
    formData.append("status", reqStatus);
    this.updateFormRuleStatus(formData, e.target, data);
    // }
  }

  updateFormRuleStatus(formData: any, sliderElm: any, ruleData: any) {
    this.formRuleService
      .updateFormRuleStatus(formData)
      .subscribe((res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Rule code: ${res["msg"]} ( ${ruleData["criteriaMap"]} ) to activate the current record.`;
          this.coreService.showWarningToast(message);
        } else {
          if (res["msg"]) {
            message = res["msg"];
            sliderElm.checked = sliderElm!.checked;
            this.getRuleCodeListData(this.userData.userId);
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
    this.router.navigate([
      "navbar",
      "form-rules",
      "addnewformrule",
      data.ruleCode,
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
