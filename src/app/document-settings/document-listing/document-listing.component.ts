import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreService } from "src/app/core.service";
import { DocumentSettingsService } from "../document-settings.service";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { ConfirmationService, MessageService } from "primeng/api";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ConfirmDialog } from "primeng/confirmdialog";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { MultiSelect } from "primeng/multiselect";

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-document-listing",
  templateUrl: "./document-listing.component.html",
  styleUrls: ["./document-listing.component.scss"],
})
export class DocumentListingComponent implements OnInit {
  formName = "Document Settings";
  docListingData: any[] = [];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  cols: any[] = [
    { field: "documentCode", header: "Document Code", width: "10%" },
    { field: "documentDesc", header: "Document Description", width: "20%" },
    { field: "criteriaMap", header: "Criteria", width: "55%" },
    { field: "status", header: "Status", width: "7%" },
    { field: "operation", header: "Operations", width: "8%" },
  ];

  showdocumentCodeOptions: boolean = false;
  showdocumentDescOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  documentCode = [];
  documentDesc = [];
  criteriaMap = [];
  status = [];

  userData: any = {};
  selectedFilterdocumentCode: any[] = [];
  selectedFilterdocumentDesc: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  docListingApiData: any = {};
  loading: boolean = true;

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  noDataMsg: string = "doc Setting Data Not Available";

  linkeddocumentCode: any = [];

  apiData = {};

  fieldDisplayData = {};

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private documentService: DocumentSettingsService,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();

    const translationKey = "Home.Settings";
    this.coreService
      .translate(translationKey)
      .then((translatedTitle: string) => {
        this.coreService.setPageTitle(translatedTitle);
      });

    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.documentService.applicationName = null;
    this.documentService.moduleName = null;

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    //
    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));
    let defAppMod = JSON.parse(localStorage.getItem("defAppModule"));
    let currAppMod = JSON.parse(sessionStorage.getItem("doc"));

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
        defApp = JSON.parse(localStorage.getItem("applicationName"));
        defMod = JSON.parse(localStorage.getItem("moduleName"));
      }
    }

    if (defApp) {
      this.appCtrl.patchValue(defApp);
    }
    if (defMod) {
      this.moduleCtrl.patchValue(defMod);
    }
    if (this.appCtrl.value && this.moduleCtrl.value) {
      this.searchAppModule();
    } else {
      this.coreService.removeLoadingScreen();
    }
    //
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
    let currAppMod = {
      applicationName: this.appCtrl.value,
      moduleName: this.moduleCtrl.value,
    };
    sessionStorage.setItem("doc", JSON.stringify(currAppMod));
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.code,
      this.moduleCtrl.value.code
    );
  }
  getDecodedDataForListing(userId: any, appValue: any, moduleValue: any) {
    this.coreService.displayLoadingScreen();

    forkJoin({
      criteriaMasterData: this.documentService.getCriteriaMasterData(
        userId,
        this.formName,
        appValue,
        moduleValue
      ),
      docSettingListingData: this.documentService.getDocumentListData(
        userId,
        this.formName,
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
          const docSettingListingData = response.docSettingListingData;

          if (docSettingListingData["data"]) {
            this.docListingApiData = docSettingListingData;
            this.docListingApiData.data.forEach((doc) => {
              let beforeSplit = doc.criteriaMap.split("&&&&")[0];

              const sections = doc.criteriaMap.split("&&&&");

              // Initialize variables to store the formatted data
              let criteria = {};
              let amounts = "";
              let dates = "";
              let afterSplit = "";

              // Process each section
              sections.forEach((section) => {
                // if (section.includes("=")) {
                //   // Split section into key and value
                //   const [key, value] = section
                //     .split("=")
                //     .map((str) => str.trim());

                //   // Store the criteria in the object
                //   criteria[key] = value;
                // }
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
              // tax.criteriaMap = output;
              console.log("555", afterSplit);

              // console.log("444", formattedCriteria);
              if (beforeSplit.length) {
                let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                  criteriaMap: beforeSplit,
                });
                doc.criteriaMap = (
                  this.setCriteriaService.decodeFormattedCriteria(
                    criteriaCodeText,
                    criteriaMasterData,
                    this.fieldDisplayData
                  ) as []
                ).join(", ");
                if (afterSplit?.length) {
                  doc.criteriaMap = doc.criteriaMap + ", " + afterSplit;
                }
              } else {
                if (afterSplit?.length) {
                  doc.criteriaMap = afterSplit;
                }
              }
            });
            this.docListingData = [...this.docListingApiData.data];
            this.showNoDataFound = false;
            this.linkeddocumentCode = [
              ...this.docListingApiData.linkedDocumentCode,
            ];
            this.documentCode = this.docListingApiData.documentCode.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.documentDesc = this.docListingApiData.documentDesc.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.criteriaMap = this.docListingApiData.criteriaMap.map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.status = this.docListingApiData.status.map((code) => {
              return { label: code, value: code };
            });
          } else {
            if (docSettingListingData["msg"]) {
              this.coreService.showWarningToast(docSettingListingData["msg"]);
            }
            this.showNoDataFound = true;
            this.docListingData = [];
          }
          return docSettingListingData;
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
          this.docListingData = [];
          this.showNoDataFound = true;
          this.loading = false;
          console.log("Error in getting doc seting list data", err);
          this.coreService.showWarningToast(
            "Some Error in getting doc seting list data"
          );
        }
      );
  }

  viewDocDetails(data: any) {
    this.documentService.applicationName = this.appCtrl.value.code;
    this.documentService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "document-settings",
      "add-document",
      data.documentCode,
      "edit",
    ]);
    this.documentService.setData(data);
  }

  isLinked(id: any) {
    return this.linkeddocumentCode.includes(id);
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
      this.linkeddocumentCode.includes(data["documentCode"])
    ) {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        isLinkedMsg +
        `Do you wish to ` +
        type +
        ` the doc Record: ${data["documentCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Do you wish to ` +
        type +
        ` the doc Record: ${data["documentCode"]}?`;
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

  updateStatus(e: any, reqStatus: any, data: any) {
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userData.userId);
    formData.append("documentSettingsCode", data["documentCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.code);
    formData.append("moduleName", this.moduleCtrl.value.code);
    formData.append("form", this.formName);
    this.updateDocSettingStatus(formData, e.target, data);
  }

  updateDocSettingStatus(formData: any, sliderElm: any, docData: any) {
    this.documentService.updateDocumentStatus(formData).subscribe(
      (res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Document setting code: ${res["msg"]} ( ${docData["criteriaMap"]} ) to activate the current record.`;
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

  cloneDoc(data: any) {
    this.documentService.applicationName = this.appCtrl.value.code;
    this.documentService.moduleName = this.moduleCtrl.value.code;
    this.router.navigate([
      "navbar",
      "document-settings",
      "add-document",
      data.documentCode,
      "clone",
    ]);
  }

  addNewDocPage() {
    this.router.navigate(["navbar", "document-settings", "add-document"]);
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
