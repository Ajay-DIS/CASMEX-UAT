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

  apiData = {
    data: [
      {
        id: 35,
        documentId: null,
        documentCode: "D00011",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND&&&&;LCY Amount > 55",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "TestLCY2",
      },
      {
        id: 34,
        documentId: null,
        documentCode: "D00010",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND&&&&LCY Amount = 32",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "Test1",
      },
      {
        id: 33,
        documentId: null,
        documentCode: "D0009",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND&&&&LCY Amount = 10;LCY Amount > 55",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "TestLCY",
      },
      {
        id: 29,
        documentId: null,
        documentCode: "D0007",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND&&&&LCY Amount = 32",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "DOC5UI",
      },
      {
        id: 27,
        documentId: null,
        documentCode: "D0006",
        criteriaMap: "Country = IND;Customer Type = IND;Form = SignUp",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "DOC4UI",
      },
      {
        id: 25,
        documentId: null,
        documentCode: "D0005",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "DOC3UI",
      },
      {
        id: 23,
        documentId: null,
        documentCode: "D0004",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Inactive",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "DOC2UI",
      },
      {
        id: 22,
        documentId: null,
        documentCode: "D0003",
        criteriaMap:
          "Country = IND;Form = Customer Profile;Customer Type = IND",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Inactive",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "DOC1UI",
      },
      {
        id: 11,
        documentId: null,
        documentCode: "D0002",
        criteriaMap: "firstName = balu",
        criteriaMapSplit: null,
        customerType: null,
        document: null,
        documentNoType: null,
        lengthMinMax: null,
        gracePeriodDays: null,
        isMandatory: null,
        isDefault: null,
        issueCountry: null,
        frontSide: null,
        backSide: null,
        status: "Active",
        createdBy: null,
        createdDateTime: null,
        updatedBy: null,
        updatedDateTime: null,
        criteriaID: 0,
        linked: null,
        linkedWith: null,
        documentDesc: "test",
      },
    ],
    documentCode: [
      "D0002",
      "D0003",
      "D00011",
      "D0009",
      "D0004",
      "D0005",
      "D0006",
      "D00010",
      "D0007",
    ],
    documentDesc: [
      "Test1",
      "DOC4UI",
      "DOC5UI",
      "test",
      "TestLCY2",
      "DOC2UI",
      "DOC3UI",
      "TestLCY",
      "DOC1UI",
    ],
    criteriaMap: [
      "Country = IND;Form = Customer Profile;Customer Type = IND&&&&LCY Amount = 10;LCY Amount > 55",
      "Country = IND;Form = Customer Profile;Customer Type = IND&&&&;LCY Amount > 55",
      "firstName = balu",
      "Country = IND;Form = Customer Profile;Customer Type = IND&&&&LCY Amount = 32",
      "Country = IND;Customer Type = IND;Form = SignUp",
      "Country = IND;Form = Customer Profile;Customer Type = IND",
    ],
    linkedDocumentCode: [],
    status: ["Active", "Inactive"],
  };

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
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.documentService.applicationName = null;
    this.documentService.moduleName = null;

    this.userData = JSON.parse(localStorage.getItem("userData"));

    this.setSelectAppModule();

    this.documentService.getAppModuleList().subscribe(
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
          const criteriaMasterData = response.criteriaMasterData;
          const docSettingListingData = response.docSettingListingData;

          if (docSettingListingData["data"]) {
            this.docListingApiData = docSettingListingData;
            this.docListingApiData.data.forEach((doc) => {
              let criteriaCodeText = this.setCriteriaService.setCriteriaMap({
                criteriaMap: doc.criteriaMap.split("&&&&")[0],
              });
              doc.criteriaMap = (
                this.setCriteriaService.decodeFormattedCriteria(
                  criteriaCodeText,
                  criteriaMasterData,
                  [""]
                ) as []
              ).join(", ");
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
            this.noDataMsg = docSettingListingData["msg"];
            this.showNoDataFound = true;
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
          this.docListingData = null;
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
            message = "Something went wrong, Please try again later";
            this.coreService.showWarningToast(message);
          }
        }
      },
      (err) => {
        this.coreService.showWarningToast(
          "Something went wrong, Please try again later"
        );
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
}