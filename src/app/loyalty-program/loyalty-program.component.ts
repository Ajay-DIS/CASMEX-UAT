import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "../core.service";
import { SetCriteriaService } from "../shared/components/set-criteria/set-criteria.service";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ConfirmDialog } from "primeng/confirmdialog";
import { LoyaltyService } from "./loyalty.service";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { MultiSelect } from "primeng/multiselect";

@Component({
  selector: "app-loyalty-program",
  templateUrl: "./loyalty-program.component.html",
  styleUrls: ["./loyalty-program.component.scss"],
})
export class LoyaltyProgramComponent implements OnInit {
  formName = "Loyalty Programs";
  applicationName = "Web Application";
  loyaltyListData: any[];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  userData: any = {};

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  showprogramCodeOptions: boolean = false;
  showprogramDescriptionOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  programCode = [];
  programDescription = [];
  criteriaMap = [];
  status = [];

  selectedFilterprogramCode: any[] = [];
  selectedFilterprogramDescription: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  loyaltyApiData: any = {};
  loading: boolean = true;

  noDataMsg: string = "Tax Setting Data Not Available";

  linkedprogramCode: any = [];

  cols: any[] = [
    { field: "programCode", header: "Program Code", width: "10%" },
    {
      field: "programDescription",
      header: "Program Description",
      width: "10%",
    },
    { field: "programType", header: "Program Type", width: "8%" },
    { field: "criteriaMap", header: "Program Rules", width: "26%" },
    { field: "rewardType", header: "Rewards", width: "8%" },
    { field: "createdDateTime", header: "Created On", width: "8%" },
    { field: "createdBy", header: "Created By", width: "8%" },
    { field: "criteriaTransactionAmountTo", header: "Expiry", width: "8%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Program Images", width: "7%" },
  ];

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder,
    private loyaltyService: LoyaltyService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.loyaltyService.applicationName = null;
    this.loyaltyService.moduleName = null;

    this.setSelectAppModule();

    this.loyaltyService.getTaxSettingAppModuleList().subscribe(
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
            this.searchApplicationOptions = res["data"][
              "cmApplicationMaster"
            ].map((app) => {
              return { name: app.name, code: app.name };
            });
            this.searchModuleOptions = res["data"][
              "cmPrimaryModuleMasterDetails"
            ].map((app) => {
              return { name: app.codeName, code: app.codeName };
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
    });
  }

  get appCtrl() {
    return this.selectAppModule.get("applications");
  }
  get moduleCtrl() {
    return this.selectAppModule.get("modules");
  }

  searchAppModule() {
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.code,
      this.moduleCtrl.value.code
    );
  }

  getDecodedDataForListing(userId: any, appValue: any, moduleValue: any) {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.loyaltyService.getCriteriaMasterData(
        this.userData.userId,
        this.formName,
        appValue,
        moduleValue
      ),
      loyaltyListingData: this.loyaltyService.getLoyaltyProgramData(
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
          const loyaltyListingData = response.loyaltyListingData;

          if (loyaltyListingData["data"]) {
            console.log("loyaltyListingData", loyaltyListingData);
            this.loyaltyApiData = loyaltyListingData;
            this.loyaltyApiData.data.forEach((tax) => {
              let beforeSplit = tax.criteriaMap.split("&&&&")[0];
              let afterSplit = tax.criteriaMap.split("&&&&")[1];

              let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                criteriaMap: beforeSplit,
              });
              tax.criteriaMap = (
                this.setCriteriaService.decodeFormattedCriteria(
                  criteriaCodeText,
                  criteriaMasterData,
                  [""]
                ) as []
              ).join(", ");
              if (afterSplit?.length) {
                tax.criteriaMap = tax.criteriaMap + "&&&&" + afterSplit;
              }
            });
            this.loyaltyListData = [...this.loyaltyApiData.data];
            console.log("loyaltyListData", this.loyaltyListData);
            console.log("loyaltyListData", this.loyaltyApiData);
            this.showNoDataFound = false;
            // this.linkedprogramCode = [
            //   ...this.loyaltyApiData?.linkedprogramCode,
            // ];
            this.programCode = this.loyaltyApiData["programCode "].map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.programDescription = this.loyaltyApiData.programDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.criteriaMap = this.loyaltyApiData.criteriaMap.map((code) => {
              return { label: code, value: code };
            });
            this.status = this.loyaltyApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            this.noDataMsg = loyaltyListingData["msg"];
            this.showNoDataFound = true;
          }
          return loyaltyListingData;
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
          this.loyaltyListData = null;
          this.showNoDataFound = true;
          this.loading = false;
          console.log("Error in getting tax seting list data", err);
          this.coreService.showWarningToast(
            "Some Error in getting tax seting list data"
          );
        }
      );
  }

  viewLoyaltyProgram(data: any) {
    this.loyaltyService.applicationName = this.appCtrl.value.code;
    this.loyaltyService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "loyalty-programs",
      "add-loyalty",
      data.programCode,
      "edit",
    ]);
  }

  isLinked(id: any) {
    return this.linkedprogramCode.includes(id);
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
      this.linkedprogramCode.includes(data["taxCode"])
    ) {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the Tax Record: ${data["taxCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the Tax Record: ${data["taxCode"]}?`;
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
    formData.append("taxCode", data["taxCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.code);
    formData.append("moduleName", this.moduleCtrl.value.code);
    formData.append("form", this.formName);
    this.updateTaxCodeStatus(formData, e.target, data);
  }

  updateTaxCodeStatus(formData: any, sliderElm: any, taxData: any) {
    this.loyaltyService.updateTaxSettingsStatus(formData).subscribe(
      (res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Tax code: ${res["msg"]} ( ${taxData["criteriaMap"]} ) to activate the current record.`;
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
            message = "Error in fetching data, Please try again later";
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

  addNewLoyaltyPage() {
    this.router.navigate(["navbar", "loyalty-programs", "add-loyalty"]);
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
}
