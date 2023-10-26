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
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: "app-loyalty-program",
  templateUrl: "./loyalty-program.component.html",
  styleUrls: ["./loyalty-program.component.scss"],
})
export class LoyaltyProgramComponent implements OnInit {
  formName = "Loyalty Programs Manager";
  loyaltyListData: any[] = [];

  objectKeys = Object.keys;
  @ViewChild("cd") cd: ConfirmDialog;

  showNoDataFound: boolean = false;

  userData: any = {};

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  showprogramCodeOptions: boolean = false;
  showprogramTypeOptions: boolean = false;
  showprogramDescriptionOptions: boolean = false;
  showcriteriaMapOptions: boolean = false;
  showstatusOptions: boolean = false;

  programCode = [];
  programType = [];
  programDescription = [];
  criteriaMap = [];
  status = [];

  selectedFilterprogramCode: any[] = [];
  selectedFilterprogramType: any[] = [];
  selectedFilterprogramDescription: any[] = [];
  selectedFiltercriteriaMap: any[] = [];
  selectedFilterstatus: any[] = [];
  loyaltyApiData: any = {};
  loading: boolean = true;

  noDataMsg: string = "Loyalty program Data Not Available";

  linkedProgramCode: any = [];

  cols: any[] = [
    { field: "programCode", header: "Program Code", width: "8%" },
    {
      field: "programDescription",
      header: "Program Description",
      width: "18%",
    },
    { field: "programType", header: "Program Type", width: "8%" },
    { field: "criteriaMap", header: "Program Rules", width: "20%" },
    // { field: "rewardType", header: "Rewards", width: "8%" },
    { field: "createdOn", header: "Created On", width: "9%" },
    { field: "createdBy", header: "Created By", width: "8%" },
    { field: "expiryOn", header: "Expiry", width: "9%" },
    { field: "status", header: "Status", width: "5%" },
    { field: "operation", header: "Program Images", width: "7%" },
  ];

  uploadedfileData: any = [];

  uploadedfileDataCols: any = [
    {
      field: "imageOriginalName",
      header: "Image name",
    },
    {
      field: "action",
      header: "Action",
    },
  ];

  showFilesModal: boolean = false;

  constructor(
    private router: Router,
    private coreService: CoreService,
    private route: ActivatedRoute,
    private setCriteriaService: SetCriteriaService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: UntypedFormBuilder,
    private loyaltyService: LoyaltyService,
    private http: HttpClient
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

          this.coreService.removeLoadingScreen();
        } else {
          if (!res["msg"]) {
            this.searchApplicationOptions = res["data"][
              "cmApplicationMaster"
            ].map((app) => {
              return { name: app.name, code: app.code };
            });
            this.searchModuleOptions = res["data"][
              "cmPrimaryModuleMasterDetails"
            ].map((app) => {
              return { name: app.codeName, code: app.code };
            });
            if (localStorage.getItem("applicationName")) {
              let defApplication = this.searchApplicationOptions.filter(
                (opt) => opt.code == localStorage.getItem("applicationName")
              )[0];
              console.log(defApplication);
              if (defApplication) {
                this.appCtrl.patchValue(defApplication);
              }
            }
            if (localStorage.getItem("moduleName")) {
              let defModule = this.searchModuleOptions.filter(
                (opt) => opt.code == localStorage.getItem("moduleName")
              )[0];
              if (defModule) {
                this.moduleCtrl.patchValue(defModule);
              }
            }

            if (this.appCtrl.value && this.moduleCtrl.value) {
              this.searchAppModule();
            } else {
              this.coreService.removeLoadingScreen();
            }
          } else {
            this.coreService.removeLoadingScreen();
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
    // save app & mod in localstorage
    localStorage.setItem(
      "applicationName",
      this.appCtrl.value ? this.appCtrl.value.code : "CASMEX_CORE"
    );
    localStorage.setItem(
      "moduleName",
      this.moduleCtrl.value ? this.moduleCtrl.value.code : "Remittance"
    );
    this.getDecodedDataForListing(
      this.userData.userId,
      this.appCtrl.value.name,
      this.moduleCtrl.value.name
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
              // let afterSplit = tax.criteriaMap.split("&&&&")[1];

              const sections = tax.criteriaMap.split("&&&&");
              let amounts = "";
              let dates = "";
              let afterSplit = "";

              // Process each section
              sections.forEach((section) => {
                if (section.includes("from") && section.includes("to")) {
                  // Extract the amounts
                  const amountsArray = section
                    .split("#")
                    .map((amountSection) => {
                      const [from, to] = amountSection
                        .split("::")
                        .map((part) => part.split(":")[1]);
                      return `Between ${from}-${to}`;
                    });
                  amounts = amountsArray.join(" & ");
                } else if (
                  section.startsWith("trnStartDate") &&
                  section.includes("trnEndDate")
                ) {
                  // Extract the dates
                  console.log(section);
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
              console.log("555", afterSplit);

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
                tax.criteriaMap = tax.criteriaMap + ", " + afterSplit;
                console.log(tax.criteriaMap, afterSplit);
              }
              // tax.criteriaMap = "HELLO";
            });
            this.loyaltyListData = [...this.loyaltyApiData.data];
            this.showNoDataFound = false;
            this.linkedProgramCode = [
              ...this.loyaltyApiData["linkedProgramCode"],
            ];
            this.programCode = this.loyaltyApiData["programCode"].map(
              (code) => {
                return { label: code, value: code };
              }
            );
            this.programType = this.loyaltyApiData["programType"].map(
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

            this.loyaltyListData.forEach((data) => {
              // %
              let amtSlabPresent = false;
              let dateSlabPresent = false;

              if (data["criteriaMap"].indexOf("from:") >= 0) {
                amtSlabPresent = true;
              }

              if (data["criteriaMap"].indexOf("trnStartDate:") >= 0) {
                dateSlabPresent = true;
              }
              let dateSlabs = null;
              if (amtSlabPresent && dateSlabPresent) {
                dateSlabs = data["criteriaMap"].split("&&&&")[2];
              } else {
                if (amtSlabPresent) {
                } else if (dateSlabPresent) {
                  dateSlabs = data["criteriaMap"].split("&&&&")[1];
                } else if (!amtSlabPresent && !dateSlabPresent) {
                }
              }
              data["expiryOn"] = dateSlabs
                ? dateSlabs.split("trnEndDate=").pop()
                : "-";
              data["isExpired"] = dateSlabs
                ? new Date(
                    dateSlabs
                      .split("trnEndDate=")
                      .pop()
                      .split(", ")[0]
                      .split("/")
                      .reverse()
                      .join("-")
                  ) < new Date()
                  ? true
                  : false
                : false;
              // %
              console.log(data["programType"]);
              data["createdOn"] = data["createdDateTime"]
                ? new Date(data["createdDateTime"]).toLocaleDateString("en-GB")
                : "-";
            });
          } else {
            console.log(loyaltyListingData);
          }
          return loyaltyListingData;
        })
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          this.loading = false;
          console.log(res);
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.showNoDataFound = true;
            this.loyaltyListData = [];
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (!res["data"]) {
              this.loyaltyListData = [];
              this.showNoDataFound = true;
              if (res["msg"]) this.noDataMsg = res["msg"];
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          this.loyaltyListData = null;
          this.showNoDataFound = true;
          this.loading = false;
          console.log("Error in getting loyalty program list data", err);
          this.coreService.showWarningToast(
            "Some Error in getting loyalty program list data"
          );
        }
      );
  }

  viewLoyaltyProgram(data: any) {
    this.loyaltyService.applicationName = this.appCtrl.value.name;
    this.loyaltyService.moduleName = this.moduleCtrl.value.name;
    this.router.navigate([
      "navbar",
      "loyalty-programs",
      "add-loyalty",
      data.programCode,
      "edit",
    ]);
  }

  showUploadedFilesModal() {
    this.showFilesModal = true;
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
  }

  closeDialog() {
    this.showFilesModal = false;
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }

  fileOperation(fileData: any, fileIndex: any, operation: any) {
    console.log(fileData, fileIndex, operation);
    if (operation == "view") {
      this.viewDoc(fileData?.imageName);
    } else if (operation == "download") {
      this.downloadDoc(fileData?.imageName);
    }
  }

  viewDoc(dbFileName: any) {
    this.coreService.displayLoadingScreen();
    let service;
    service = this.http.get(`/remittance/kycUpload/view/${dbFileName}`, {
      headers: new HttpHeaders().set("userId", this.userData.userId),
      responseType: "blob",
    });

    service.subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        const blobData = new Blob([res], { type: "image/jpeg" });
        const blobUrl = window.URL.createObjectURL(blobData);

        window.open(blobUrl, "_blank");
        window.URL.revokeObjectURL(blobUrl);
      },
      (err) => {
        if (err.status == 404) {
          this.coreService.showWarningToast("File not found");
        } else {
          this.coreService.showWarningToast(
            "Some error while fetching file, Try again in sometime"
          );
        }
        this.coreService.removeLoadingScreen();
      }
    );
  }
  downloadDoc(dbFileName: any) {
    this.coreService.displayLoadingScreen();
    let services = this.http.get(
      `/remittance/kycUpload/fileDownload/${dbFileName}`,
      {
        headers: new HttpHeaders().set("userId", this.userData.userId),
        observe: "response",
        responseType: "blob",
      }
    );

    services.subscribe(
      (res) => {
        this.coreService.removeLoadingScreen();
        let blob: Blob = res.body as Blob;
        let a = document.createElement("a");
        a.download = res.url && res.url.split("/").pop();
        const blobUrl = window.URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        this.coreService.showSuccessToast("File downloaded successfully");
      },
      (err) => {
        if (err.status == 404) {
          this.coreService.showWarningToast("File not found");
        } else {
          this.coreService.showWarningToast(
            "Some error while fetching file, Try again in sometime"
          );
        }
        this.coreService.removeLoadingScreen();
      }
    );
  }

  isLinked(id: any) {
    return this.linkedProgramCode.includes(id);
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
      this.linkedProgramCode.includes(data["programCode"])
    ) {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        isLinkedMsg +
        `This action will ` +
        type +
        ` the promotion: ${data["programCode"]}.` +
        `Would you like to proceed?`;
      // `Do you wish to ` +
      // type +
      // ` the Loyalty program: ${data["programCode"]}?`;
    } else {
      completeMsg =
        `<img src="../../../assets/warning.svg"><br/><br/>` +
        `Record Deactivation - This action will ` +
        type +
        ` the promotion: ${data["programCode"]}.` +
        "<br/>" +
        `Would you like to proceed?`;
      // +
      // `Do you wish to ` +
      // type +
      // ` the Loyalty program: ${data["programCode"]}?`;
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

  viewUploadedImg(data: any) {
    this.loyaltyService
      .getLoyaltyProgramForEdit(
        data["programCode"],
        "edit",
        this.userData.userId,
        this.appCtrl.value.name,
        this.moduleCtrl.value.name,
        this.formName
      )
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.coreService.removeLoadingScreen();
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(
                "Error in fetching Program Images"
              );
            }
          } else {
            if (res["data"]) {
              if (
                res["customerLoyaltyPromoImagesDto"] &&
                res["customerLoyaltyPromoImagesDto"].length
              ) {
                this.uploadedfileData = res["customerLoyaltyPromoImagesDto"];
                this.showUploadedFilesModal();
              } else {
                this.coreService.showWarningToast(
                  "No Images found for this program code"
                );
              }
              console.log(res);
            } else {
              if (res && res["msg"]) {
                this.coreService.showWarningToast(res["msg"]);
              } else {
                this.coreService.showWarningToast(
                  "Error in fetching Program Images"
                );
              }
              this.coreService.removeLoadingScreen();
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getTaxSettingForEditApi", err);
          this.coreService.showWarningToast(
            "Error in fetching Program Images, Please try again later"
          );
        }
      );
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
    formData.append("programCode", data["programCode"]);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.name);
    formData.append("moduleName", this.moduleCtrl.value.name);
    formData.append("form", this.formName);
    this.updateTaxCodeStatus(formData, e.target, data);
  }

  updateTaxCodeStatus(formData: any, sliderElm: any, taxData: any) {
    this.loyaltyService.updateTaxSettingsStatus(formData).subscribe(
      (res) => {
        let message = "";
        if (res["error"] == "true") {
          this.coreService.removeLoadingScreen();
          message = `Kindly deactivate the Loyalty program code: ${res["msg"]} ( ${taxData["criteriaMap"]} ) to activate the current record.`;
          this.coreService.showWarningToast(message);
        } else {
          if (res["msg"]) {
            message = res["msg"];
            sliderElm.checked = sliderElm!.checked;
            this.getDecodedDataForListing(
              this.userData.userId,
              this.appCtrl.value.name,
              this.moduleCtrl.value.name
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
