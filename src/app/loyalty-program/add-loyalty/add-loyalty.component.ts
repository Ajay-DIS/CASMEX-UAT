import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { Dropdown } from "primeng/dropdown";
import { DialogService } from "primeng/dynamicdialog";
import { Table } from "primeng/table";
import { forkJoin, of } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import { LoyaltyService } from "../loyalty.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import _lodashClone from "lodash-es/cloneDeep";

@Component({
  selector: "app-add-loyalty",
  templateUrl: "./add-loyalty.component.html",
  styleUrls: ["./add-loyalty.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddLoyaltyComponent implements OnInit {
  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;
  @ViewChild("inpFile") fileInput: ElementRef;

  primaryColor = "var(--primary-color)";

  today = new Date();

  userId = "";
  loyaltyID = "";
  mode = "add";
  formName = "Loyalty Programs Manager";

  deactivated: boolean = false;
  statusData: any = [];

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  programCode = "No Data";
  programDescription = "";
  programType = "";
  loyaltyType = "";
  loyaltyValue = "";
  rewardsAs = "";
  criteriaId = "0";
  criteriaTransactionAmountFrom = "0";
  criteriaTransactionAmountTo = "0";

  fileUploadLable: boolean = false;
  fileUploadValue: string[] = [];
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

  isLoyaltyProgramLinked: boolean = false;

  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  objectKeys = Object.keys;
  isEditMode = false;

  criteriaMasterData: any = {};
  criteriaDataDetailsJson: any = {};
  cmCriteriaMandatory = [];
  cmCriteriaDependency: any = {};
  cmCriteriaDataDetails: any = [];
  independantCriteriaArr: any = [];
  cmCriteriaSlabType: any = { Slab: "LCY Amount", date: "Transaction Date" };
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [];
  criteriaEqualsDdlOptions = [];
  correspondentDdlOptions = [];

  criteriaText: any[] = [];
  criteriaCodeText: any[] = [];

  savingCriteriaTemplateError = null;

  inactiveData: boolean = false;
  isApplyCriteriaClicked: boolean = false;

  applyCriteriaResponse: any[] = [];
  isLcyFieldPresent = false;
  applyCriteriaDataTableColumns: any[] = [];
  columnsCopy: any[] = [
    // {
    //   field: "criteriaTransactionDateFrom",
    //   header: "Transaction From Date&Time",
    //   fieldType: "text",
    //   frozen: false,
    //   info: null,
    // },
    // {
    //   field: "criteriaTransactionDateTo",
    //   header: "Transaction To Date&Time",
    //   fieldType: "text",
    //   frozen: false,
    //   info: null,
    // },
    {
      field: "rewardsAs",
      header: "Reward As",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "discountAs",
      header: "Discount As",
      fieldType: "dropdown",
      frozen: false,
      info: "Select reward as 'Discount' to enable it",
    },
    {
      field: "loyaltyType",
      header: "Loyalty Type",
      fieldType: "dropdown",
      frozen: false,
      info: null,
    },
    {
      field: "loyaltyValue",
      header: "Loyalty Value",
      fieldType: "input",
      frozen: false,
      info: null,
    },
    {
      field: "isActive",
      header: "Status",
      frozen: false,
      info: null,
    },
  ];
  applyCriteriaFormattedData: any[] = [];

  rewardsAsOption: any[] = [];
  discountAsOption: any[] = [];
  loyaltyTypeOption: any[] = [];
  programTypeOptions: any[] = [];

  appliedCriteriaDatajson: any = {};

  formattedMasterData: any = [];

  Emailchecked: boolean = false;
  Msgchecked: boolean = false;
  promoCodeLength = null;
  promoCode = "";
  criteriaTransactionDateFrom: Date;
  criteriaTransactionDateTo: Date;

  showFilesModal: boolean = false;

  editingFileIndex = null;

  validPromoCodeLength = false;

  resetParam = false;

  fieldDisplayData = {};

  setCriteriaName = "loyalty";

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private setCriteriaService: SetCriteriaService,
    private http: HttpClient,
    private criteriaDataService: CriteriaDataService,
    private fb: UntypedFormBuilder,
    private loyaltyService: LoyaltyService
  ) {}

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.mode = "add";
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.setSelectAppModule();
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];

    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      this.loyaltyID = params.id;
    }

    //
    this.searchApplicationOptions = JSON.parse(
      localStorage.getItem("appAccess")
    );
    this.searchModuleOptions = JSON.parse(localStorage.getItem("modAccess"));

    if (localStorage.getItem("applicationName")) {
      let defApplication = JSON.parse(localStorage.getItem("applicationName"));
      console.log(defApplication);
      if (defApplication) {
        this.appCtrl.patchValue(defApplication);
      }
    }
    if (localStorage.getItem("moduleName")) {
      let defModule = this.searchModuleOptions.filter(
        (opt) => opt.name == "Loyalty Programs"
      )[0];
      if (defModule) {
        this.moduleCtrl.patchValue(defModule);
        this.moduleCtrl.enable();
      }
    }

    if (this.appCtrl.value && this.moduleCtrl.value) {
      this.appModuleDataPresent = true;
      this.searchAppModule();
    } else {
      this.coreService.showWarningToast("No Access to Loyalty Module");
    }
    //

    // set promocodelength to 8 and fetch promocode

    if (this.mode == "add") {
      this.promoCodeLength = 8;
      this.onPromoCodeLength({
        target: {
          value: 8,
        },
      });
    }

    this.loyaltyService.getProgramTypeData().subscribe(
      (res) => {
        if (
          res["status"] &&
          typeof res["status"] == "string" &&
          (res["status"] == "400" || res["status"] == "500")
        ) {
          // this.coreService.removeLoadingScreen();
          if (res["error"]) {
            this.coreService.showWarningToast(res["error"]);
          } else {
            this.coreService.showWarningToast("Some error in fetching data");
          }
        } else {
          // this.coreService.removeLoadingScreen();
          this.programTypeOptions = res["data"]["cmProgramTypeMaster"].map(
            (val) => {
              return { name: val["codeName"], code: val["codeName"] };
            }
          );
          console.log("program", this.programTypeOptions);
        }
      },
      (err) => {
        // this.coreService.removeLoadingScreen();
        console.log("Error in getting values", err);
        this.coreService.showWarningToast("Some error in fetching data");
      }
    );

    this.statusData = this.loyaltyService.getData();
    console.log("status", this.statusData);
    if (this.statusData && this.statusData["status"] == "Inactive") {
      this.deactivated = true;
    }
  }
  onPromoCodeLength(e) {
    console.log("promocode", e.target.value);
    console.log("promocode", e.value);
    if (
      e.target.value &&
      !isNaN(e.target.value) &&
      Number(e.target.value) >= 5 &&
      Number(e.target.value) <= 10
    ) {
      this.validPromoCodeLength = true;
      this.loyaltyService.getPromoCodeData(String(e.target.value)).subscribe(
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
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            this.coreService.removeLoadingScreen();
            console.log("promo", res);
            this.promoCode = res["data"];

            console.log("promCode", this.promoCode);
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
    } else {
      this.validPromoCodeLength = false;
      this.promoCode = "";
    }
    // this.promoCodeLength = "";
  }

  setSelectAppModule() {
    this.selectAppModule = this.fb.group({
      applications: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      modules: new UntypedFormControl({ value: "", disabled: true }, [
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

  copyInputMessage(inputElement) {
    console.log(inputElement.value);
    // inputElement.select();
    // document.execCommand("copy");
    // inputElement.setSelectionRange(0, 0);
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = inputElement.value;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  }

  showUploadedFilesModal() {
    this.showFilesModal = true;
    this.coreService.setHeaderStickyStyle(false);
    this.coreService.setSidebarBtnFixedStyle(false);
  }

  fileUploadChange(e: any) {
    console.log(e.target.files[0]);
    if (
      !(
        e.target.files[0]?.type == "image/jpeg" ||
        e.target.files[0]?.type == "image/png" ||
        e.target.files[0]?.type == "image/svg+xml"
      )
    ) {
      this.coreService.showWarningToast("Valid formats are JPEG, PNG, SVG.");
    } else if (e.target.files[0]?.size > 2097152) {
      this.coreService.showWarningToast("Please upload file less than 2MB.");
    } else {
      if (e.target.files[0]) {
        if (this.editingFileIndex != null) {
          this.uploadedfileData[this.editingFileIndex]["imageOriginalName"] =
            e.target.files[0]?.name;
          this.uploadedfileData[this.editingFileIndex]["promoImage"] =
            e.target.files[0];
          this.uploadedfileData[this.editingFileIndex]["operation"] = "edit";
          this.coreService.showSuccessToast("Image updated.");
        } else {
          if (
            this.uploadedfileData.filter(
              (file) => file["operation"] != "delete"
            ).length >= 5
          ) {
            this.coreService.showWarningToast(
              "Maximum 5 files can be uploaded."
            );
          } else {
            this.uploadedfileData.push({
              id: null,
              imageOriginalName: e.target.files[0]?.name,
              imageName: null,
              promoImage: e.target.files[0],
              operation: "add",
              programCode: this.programCode,
            });
            this.coreService.showSuccessToast(
              "Image added, check uploaded Images"
            );
          }
        }
      }
    }

    this.editingFileIndex = null;
    console.log(this.uploadedfileData);
  }

  fileOperation(fileData: any, fileIndex: any, operation: any) {
    console.log(fileData, fileIndex, operation);
    if (operation == "delete") {
      if (fileData?.id) {
        this.uploadedfileData[fileIndex]["operation"] = "delete";
      } else {
        this.uploadedfileData.splice(fileIndex, 1);
      }
    } else if (operation == "download") {
      if (fileData?.id) {
        this.downloadDoc(fileData?.imageName);
      } else {
        const file = fileData?.promoImage;
        file.arrayBuffer().then((arrayBuffer) => {
          const blob = new Blob([new Uint8Array(arrayBuffer)], {
            type: file.type,
          });
          const blobUrl = window.URL.createObjectURL(blob);

          let a = document.createElement("a");
          a.download = file?.name;
          a.href = blobUrl;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
        });
      }
    } else if (operation == "edit") {
      this.editingFileIndex = fileIndex;
      this.fileInput.nativeElement.click();
    }
  }

  get getUploadedImgData() {
    return this.uploadedfileData.filter(
      (file) => file["operation"] != "delete"
    );
  }

  downloadDoc(dbFileName: any) {
    this.coreService.displayLoadingScreen();
    let services = this.http.get(
      `/appControl/kycUpload/fileDownload/${dbFileName}`,
      {
        headers: new HttpHeaders().set("userId", this.userId),
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
            "Some error while downloading file, Try again in sometime"
          );
        }
        this.coreService.removeLoadingScreen();
      }
    );
  }

  onAppValueChange() {
    this.showContent = false;
    this.appModuleDataPresent = false;
    this.moduleCtrl.reset();
    this.moduleCtrl.enable();
  }

  searchAppModule() {
    this.applyCriteriaFormattedData = [];
    this.criteriaText = [];
    this.criteriaCodeText = [];
    this.appModuleDataPresent = true;
    this.showContent = false;
    this.getCriteriaMasterData();
    this.getAllTemplates();
    // console.log(
    //   "criteriaTransactionDateFrom",
    //   this.criteriaTransactionDateFrom
    // );
    // let promoCodeFrom = new Date(
    //   this.criteriaTransactionDateFrom
    // ).toLocaleString("en-GB");
    // console.log("promoCodeFrom", promoCodeFrom);
  }

  getLoyaltyProgramForEditApi(programCode: any, operation: any) {
    console.log("HERE");
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.loyaltyService
      .getLoyaltyProgramForEdit(
        programCode,
        operation,
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
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
            this.showContent = false;
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            if (res["data"]) {
              this.showContent = true;

              this.criteriaCodeText =
                this.setCriteriaService.setCriteriaMap(res);

              this.criteriaText =
                this.setCriteriaService.decodeFormattedCriteria(
                  this.criteriaCodeText,
                  this.criteriaMasterData,
                  this.fieldDisplayData
                );

              this.programCode = res["programCode"];
              if (res["loyaltyProgramDesc"]) {
                this.programDescription = res["loyaltyProgramDesc"];
              }
              // if (res["criteriaTransactionDateFrom"]) {
              //   let formatDate =
              //     res["criteriaTransactionDateFrom"]
              //       .split(", ")[0]
              //       .split("/")
              //       .reverse()
              //       .join("-") +
              //     "T" +
              //     res["criteriaTransactionDateFrom"].split(", ")[1];
              //   this.criteriaTransactionDateFrom = new Date(formatDate);
              // }
              // if (res["criteriaTransactionDateTo"]) {
              //   let formatDate =
              //     res["criteriaTransactionDateTo"]
              //       .split(", ")[0]
              //       .split("/")
              //       .reverse()
              //       .join("-") +
              //     "T" +
              //     res["criteriaTransactionDateTo"].split(", ")[1];
              //   this.criteriaTransactionDateTo = new Date(formatDate);
              // }
              if (res["promoCode"]) {
                this.promoCode = res["promoCode"];
              }
              if (res["promoCodeLength"]) {
                this.promoCodeLength = res["promoCodeLength"];
                if (
                  Number(this.promoCodeLength) >= 5 &&
                  Number(this.promoCodeLength) <= 10
                ) {
                  this.validPromoCodeLength = true;
                } else {
                  this.validPromoCodeLength = false;
                }
              }
              if (res["programType"]) {
                this.programType = res["programType"];
              }
              this.isLoyaltyProgramLinked = !res["criteriaUpdate"];
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];

              this.loyaltyTypeOption = res["loyaltyTypeOption"].map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );
              this.rewardsAsOption = res["rewardsAsOption"].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });

              this.discountAsOption = res["discountAsOption"].map((option) => {
                return { code: option.code, codeName: option.codeName };
              });

              this.uploadedfileData = [];
              if (
                res["customerLoyaltyPromoImagesDto"] &&
                res["customerLoyaltyPromoImagesDto"].length
              ) {
                res["customerLoyaltyPromoImagesDto"].forEach((imgData) => {
                  let imgUploadedData = {};
                  imgUploadedData["id"] = imgData["id"];
                  imgUploadedData["imageOriginalName"] =
                    imgData["imageOriginalName"];
                  imgUploadedData["imageName"] = imgData["imageName"];
                  imgUploadedData["promoImage"] = "";
                  imgUploadedData["operation"] = imgData["operation"];
                  imgUploadedData["programCode"] = imgData["programCode"];
                  this.uploadedfileData.push(imgUploadedData);
                });
              }

              let amtSlabPresent = false;
              let dateSlabPresent = false;

              if (res["criteriaMap"].indexOf("from:") >= 0) {
                amtSlabPresent = true;
              }

              if (res["criteriaMap"].indexOf("trnStartDate=") >= 0) {
                dateSlabPresent = true;
              }

              if (amtSlabPresent && dateSlabPresent) {
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateTo",
                  header: "Date To",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });

                this.applyCriteriaFormattedData = [];
              } else {
                if (amtSlabPresent) {
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = [];
                } else if (dateSlabPresent) {
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "dateFrom",
                    header: "Date From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "dateTo",
                    header: "Date To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = [];
                } else if (!amtSlabPresent && !dateSlabPresent) {
                  this.applyCriteriaFormattedData = [];
                }
              }
              this.applyCriteriaFormattedData = res["data"];
              this.applyCriteriaFormattedData.forEach((data) => {
                let mapSplit = data["criteriaMapSplit"];

                let criteriaMapFirstSplit = null;
                let criteriaMapSecSplit = null;
                let criteriaMapThirdSplit = null;

                if (mapSplit && mapSplit.includes("&&&&")) {
                  if (mapSplit.split("&&&&").length == 3) {
                    criteriaMapFirstSplit = mapSplit.split("&&&&")[0];
                    criteriaMapSecSplit = mapSplit.split("&&&&")[1];
                    criteriaMapThirdSplit = mapSplit.split("&&&&")[2];

                    if (criteriaMapSecSplit.includes("from:")) {
                      data["lcyAmountFrom"] = criteriaMapSecSplit
                        .split("::")[0]
                        .split(":")[1];
                      data["lcyAmountTo"] = criteriaMapSecSplit
                        .split("::")[1]
                        .split(":")[1];
                    }

                    if (criteriaMapThirdSplit.includes("trnStartDate=")) {
                      data["dateFrom"] = criteriaMapThirdSplit
                        .split("::")[0]
                        .split("=")[1];
                      data["dateTo"] = criteriaMapThirdSplit
                        .split("::")[1]
                        .split("=")[1];
                    }
                  } else if (mapSplit.split("&&&&").length == 2) {
                    criteriaMapFirstSplit = mapSplit.split("&&&&")[0];
                    criteriaMapSecSplit = mapSplit.split("&&&&")[1];

                    if (criteriaMapSecSplit.includes("from:")) {
                      data["lcyAmountFrom"] = criteriaMapSecSplit
                        .split("::")[0]
                        .split(":")[1];
                      data["lcyAmountTo"] = criteriaMapSecSplit
                        .split("::")[1]
                        .split(":")[1];
                    } else if (criteriaMapSecSplit.includes("trnStartDate=")) {
                      data["dateFrom"] = criteriaMapSecSplit
                        .split("::")[0]
                        .split("=")[1];
                      data["dateTo"] = criteriaMapSecSplit
                        .split("::")[1]
                        .split("=")[1];
                    }
                  }
                } else {
                }
              });

              // %LCYPARTTTTTTT
              // if (res["criteriaMap"].indexOf("&&&&") >= 0) {
              //   this.isLcyFieldPresent = true;
              // }

              // if (!this.isLcyFieldPresent) {
              //   this.applyCriteriaFormattedData = res["data"];
              // } else {
              //   if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
              //     this.applyCriteriaDataTableColumns.splice(-5, 0, {
              //       field: "lcyAmount",
              //       header: "LCY Amount",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaFormattedData = res["data"];

              //     this.applyCriteriaFormattedData.forEach((data) => {
              //       let split = data["criteriaMapSplit"];
              //       if (split) {
              //         data["lcyAmount"] = split.includes("&&&&")
              //           ? split.split("&&&&").pop()
              //           : split;
              //         data["criteriaMapSplit"] = split.includes("&&&&")
              //           ? split.split("&&&&").pop()
              //           : split;
              //       }
              //     });
              //   } else if (res["criteriaMap"].indexOf("from") >= 0) {
              //     this.applyCriteriaDataTableColumns.splice(-5, 0, {
              //       field: "lcyAmountFrom",
              //       header: "Amount From",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaDataTableColumns.splice(-5, 0, {
              //       field: "lcyAmountTo",
              //       header: "Amount To",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaFormattedData = res["data"];
              //     console.log("::", this.applyCriteriaFormattedData);
              //     this.applyCriteriaFormattedData.forEach((data) => {
              //       let split = data["criteriaMapSplit"];
              //       if (split) {
              //         data["lcyAmountFrom"] = split?.includes("&&&&")
              //           ? split.split("&&&&").pop().split("::")[0].split(":")[1]
              //           : split?.split("::")[0]?.split(":")[1];
              //         data["lcyAmountTo"] = split?.includes("&&&&")
              //           ? split.split("&&&&").pop().split("::")[1].split(":")[1]
              //           : split?.split("::")[1]?.split(":")[1];
              //         data["criteriaMapSplit"] = split?.includes("&&&&")
              //           ? split.split("&&&&").pop()
              //           : split;
              //       }
              //     });
              //   }
              // }
              // %LCYPARTTTTTTT ENDS

              this.applyCriteriaFormattedData.forEach((data) => {
                delete data.id;
                // data["criteriaTransactionDateFrom"] =
                //   res["criteriaTransactionDateFrom"];
                // data["criteriaTransactionDateTo"] =
                //   res["criteriaTransactionDateTo"];
                data["programType"] = res["programType"];
                data["loyaltyTypeOption"] = this.loyaltyTypeOption;
                data["rewardsAsOption"] = this.rewardsAsOption;
                data["discountAsOption"] = this.discountAsOption;
                data["invalidLoyaltyValue"] = false;
                data["status"] = "Active";
              });
              // this.setSelectedOptions();

              console.log("::", this.applyCriteriaFormattedData);
              // console.log("::", this.applyCriteriaDataTableColumns);

              this.coreService.showSuccessToast(
                `Loyalty program data fetched Successfully`
              );
              this.coreService.removeLoadingScreen();
            } else {
              this.applyCriteriaFormattedData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.applyCriteriaDataTableColumns = [];
              if (res && res["msg"]) {
                this.coreService.showWarningToast(res["msg"]);
              } else {
                this.coreService.showWarningToast(
                  "No active data found for this Loyalty Program."
                );
              }
              this.coreService.removeLoadingScreen();
            }
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getLoyaltyForEditApi", err);
          this.coreService.showWarningToast(
            "Something went wrong, Please try again later"
          );
        }
      );
  }

  onActive(data: any) {
    this.confirmLoyaltyEditStatus();
  }
  confirmLoyaltyEditStatus() {
    let type = "";
    let reqStatus = "";
    if (this.deactivated == true) {
      reqStatus = "Active";
      type = "activate";
    } else {
      reqStatus = "Inactive";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the Loyalty Record: ${this.programCode}?`;

    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatusLoyalty",
      accept: () => {
        this.updateStatus(reqStatus);
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
  }
  updateStatus(reqStatus: any) {
    this.coreService.displayLoadingScreen();

    const formData = new FormData();
    formData.append("userId", this.userId);
    formData.append("programCode", this.programCode);
    formData.append("status", reqStatus);
    formData.append("applications", this.appCtrl.value.code);
    formData.append("moduleName", this.moduleCtrl.value.code);
    formData.append("form", this.formName);
    this.updateLoyaltyStatus(formData);
  }

  updateLoyaltyStatus(formData: any) {
    this.loyaltyService.updateLoyaltyStatus(formData).subscribe(
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
        } else {
          let message = "";
          if (res["error"] == "true") {
            this.coreService.removeLoadingScreen();
            this.coreService.showWarningToast(message);
          } else {
            if (res["msg"]) {
              message = res["msg"];
              this.deactivated = !this.deactivated;
              this.coreService.showSuccessToast(message);
            } else {
              this.coreService.removeLoadingScreen();
              message = "Error in fetching data, Please try again later";
              this.coreService.showWarningToast(message);
            }
          }
        }
      },
      (err) => {
        console.log("Error in updateBankRouteStatus", err);
        this.coreService.removeLoadingScreen();
      }
    );
  }

  getCriteriaMasterData() {
    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
    }
    forkJoin({
      criteriaMasterData: this.loyaltyService.getCriteriaMasterData(
        this.userId,
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addBankRouteCriteriaData:
        this.loyaltyService.getAddLoyaltyProgramCriteriaData(
          this.userId,
          this.appCtrl.value.code,
          this.moduleCtrl.value.code,
          this.formName
        ),
    })
      .pipe(
        take(1),
        map((response) => {
          this.formatMasterData(response.criteriaMasterData);
          let criteriaMasterJson = _lodashClone(response.criteriaMasterData);
          delete criteriaMasterJson["fieldDisplay"];
          this.fieldDisplayData = response.criteriaMasterData["fieldDisplay"];
          const criteriaMasterData = criteriaMasterJson;
          this.criteriaDataDetailsJson = response.addBankRouteCriteriaData;
          if (this.criteriaDataDetailsJson.data.listCriteria) {
            this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
              (data) => {
                if (data["criteriaType"] == "Slab") {
                  this.cmCriteriaSlabType["Slab"] = data["fieldName"];
                }
                if (data["criteriaType"] == "date") {
                  this.cmCriteriaSlabType["date"] = data["fieldName"];
                }
              }
            );

            if (this.mode == "add") {
              this.programCode = this.criteriaDataDetailsJson.data.programCode;
              this.loyaltyID = this.programCode;
              this.programDescription =
                this.criteriaDataDetailsJson.data.programDescription;
            }

            this.cmCriteriaDataDetails = [
              ...this.criteriaDataDetailsJson.data.listCriteria
                .cmCriteriaDataDetails,
            ];

            this.cmCriteriaMandatory =
              this.criteriaDataDetailsJson.data.mandatory
                .replace(/["|\[|\]]/g, "")
                .split(", ");

            this.cmCriteriaDependency =
              this.criteriaDataDetailsJson.data.dependance;

            let criteriaDependencyTreeData =
              this.criteriaDataService.setDependencyTree(
                this.criteriaDataDetailsJson,
                this.cmCriteriaDataDetails,
                criteriaMasterData,
                this.cmCriteriaMandatory,
                this.cmCriteriaDependency,
                this.cmCriteriaSlabType
              );

            this.criteriaMapDdlOptions =
              criteriaDependencyTreeData["criteriaMapDdlOptions"];
            this.independantCriteriaArr =
              criteriaDependencyTreeData["independantCriteriaArr"];
            return criteriaMasterData;
          } else {
            throw new Error("No data found");
          }
        })
      )
      .subscribe(
        (res) => {
          console.log(res);
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            this.coreService.removeLoadingScreen();
            this.showContent = false;
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            this.criteriaMasterData = res;
            if (this.mode == "edit") {
              if (!(this.appCtrl.value.code || this.moduleCtrl.value.code)) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/loyalty-programs`]);
              } else {
                this.getLoyaltyProgramForEditApi(this.loyaltyID, "edit");
              }
            } else if (this.mode == "clone") {
              if (!(this.appCtrl.value.code || this.moduleCtrl.value.code)) {
                this.appModuleDataPresent = false;
                this.showContent = false;
                this.router.navigate([`navbar/loyalty-programs`]);
              } else {
                this.getLoyaltyProgramForEditApi(this.loyaltyID, "clone");
              }
            } else {
              this.showContent = true;
              this.coreService.removeLoadingScreen();
            }
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in Initiating dropdown values", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }
  formatMasterData(masterData: any) {
    const formattedMasterData = [].concat.apply([], Object.values(masterData));
    this.formattedMasterData = formattedMasterData;
  }
  getCorrespondentValues(
    fieldName: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.loyaltyService
      .getCorrespondentValuesData(
        this.formName,
        this.appCtrl.value.code,
        criteriaMapValue,
        fieldName,
        displayName,
        this.moduleCtrl.value.code
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
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            this.coreService.removeLoadingScreen();
            if (res[fieldName]) {
              this.setCriteriaSharedComponent.valueCtrl.enable();
              this.setCriteriaSharedComponent.hideValuesDropdown = false;
              this.setCriteriaSharedComponent.showValueInput = false;

              this.correspondentDdlOptions = res[fieldName].map((val) => {
                return { name: val["codeName"], code: val["code"] };
              });
            } else {
              if (res["message"]) {
                this.coreService.showWarningToast(res["message"]);
                this.resetCriteriaDropdowns();
              } else {
                this.coreService.showWarningToast("Criteria Map is not proper");
                this.resetCriteriaDropdowns();
              }
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.coreService.showWarningToast("Some error in fetching data");
          this.resetCriteriaDropdowns();
        }
      );
  }

  resetCriteriaDropdowns() {
    this.setCriteriaSharedComponent.resetCriteriaDropdowns();
  }

  applyCriteria(postDataCriteria: FormData) {
    postDataCriteria.append("programCode", this.loyaltyID);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.appCtrl.value.code);
    postDataCriteria.append("form", this.formName);
    postDataCriteria.append("moduleName", this.moduleCtrl.value.code);
    this.isApplyCriteriaClicked = true;
    if (this.isLoyaltyProgramLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "linkedWarning",
        accept: () => {
          this.coreService.displayLoadingScreen();
          setTimeout(() => {
            this.coreService.setHeaderStickyStyle(true);
            this.coreService.setSidebarBtnFixedStyle(true);
          }, 500);
          setTimeout(() => {
            this.coreService.removeLoadingScreen();
          }, 1000);
        },
      });
    } else {
      // if (
      //   this.criteriaTransactionDateFrom &&
      //   this.criteriaTransactionAmountTo
      // ) {
      this.LoyaltyProgramSearchApi(postDataCriteria);
      // } else {
      //   this.coreService.showWarningToast(
      //     "Please select transaction date range."
      //   );
      // }
    }
  }

  LoyaltyProgramSearchApi(loyaltyFormdata: any) {
    this.applyCriteriaFormattedData = [];
    this.applyCriteriaDataTableColumns = [];
    this.coreService.displayLoadingScreen();
    // let promoCodeFrom = new Date(
    //   this.criteriaTransactionDateFrom
    // ).toLocaleString("en-GB");
    // let promoCodeTo = new Date(this.criteriaTransactionDateTo).toLocaleString(
    //   "en-GB"
    // );

    this.applyCriteriaDataTableColumns = JSON.parse(
      JSON.stringify(this.columnsCopy)
    );

    this.loyaltyService
      .postLoyaltyProgramCriteriaSearch(loyaltyFormdata)
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
              this.coreService.showWarningToast("Some error in fetching data");
            }
          } else {
            this.coreService.removeLoadingScreen();
            if (!res["duplicate"]) {
              this.applyCriteriaResponse = JSON.parse(JSON.stringify(res));
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              this.appliedCriteriaIsDuplicate = res["duplicate"];
              let reqData =
                this.criteriaDataService.decodeCriteriaMapIntoTableFields(res);

              let crtfields = this.setCriteriaService.decodeFormattedCriteria(
                reqData.critMap,
                this.criteriaMasterData,
                this.fieldDisplayData
              );
              this.loyaltyTypeOption = res["data"].loyaltyTypeOption?.map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );
              this.rewardsAsOption = res["data"].rewardsAsOption.map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );
              this.discountAsOption = res["data"].discountAsOption.map(
                (option) => {
                  return { code: option.code, codeName: option.codeName };
                }
              );

              let amtSlabPresent = false;
              let dateSlabPresent = false;

              let baseCriteriaMap = res["criteriaMap"].split("&&&&")[0];

              if (res["criteriaMap"].indexOf("from:") >= 0) {
                amtSlabPresent = true;
              }

              if (res["criteriaMap"].indexOf("trnStartDate=") >= 0) {
                dateSlabPresent = true;
              }

              if (amtSlabPresent && dateSlabPresent) {
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateFrom",
                  header: "Date From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "dateTo",
                  header: "Date To",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountFrom",
                  header: "Amount From",
                  fieldType: "text",
                });
                this.applyCriteriaDataTableColumns.splice(-5, 0, {
                  field: "lcyAmountTo",
                  header: "Amount To",
                  fieldType: "text",
                });

                this.applyCriteriaFormattedData = [];

                let dateSlabFields = reqData.dateSlabArr;
                let lcySlabFields = reqData.lcySlabArr;

                dateSlabFields.forEach((fieldDate) => {
                  console.log(lcySlabFields);
                  lcySlabFields.forEach((fieldAmt) => {
                    let apiData = JSON.parse(
                      JSON.stringify(res["data"]["Loyalty Program"])
                    );
                    console.log(fieldAmt);
                    apiData["dateFrom"] = fieldDate.trnStartDate;
                    apiData["dateTo"] = fieldDate.trnEndDate;
                    apiData["lcyAmountFrom"] = fieldAmt.from;
                    apiData["lcyAmountTo"] = fieldAmt.to;

                    apiData[
                      "criteriaMapSplit"
                    ] = `${baseCriteriaMap}&&&&from:${fieldAmt["from"]}::to:${fieldAmt["to"]}&&&&trnStartDate=${fieldDate["trnStartDate"]}::trnEndDate=${fieldDate["trnEndDate"]}`;
                    this.applyCriteriaFormattedData.push(apiData);
                  });
                });
              } else {
                if (amtSlabPresent) {
                  let lcySlabFields = reqData.lcySlabArr;
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "lcyAmountFrom",
                    header: "Amount From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "lcyAmountTo",
                    header: "Amount To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = [];
                  lcySlabFields.forEach((field) => {
                    let apiData = JSON.parse(
                      JSON.stringify(res["data"]["Loyalty Program"])
                    );
                    apiData["lcyAmountFrom"] = field.from;
                    apiData["lcyAmountTo"] = field.to;
                    apiData[
                      "criteriaMapSplit"
                    ] = `${baseCriteriaMap}&&&&from:${field["from"]}::to:${field["to"]}`;
                    this.applyCriteriaFormattedData.push(apiData);
                  });
                } else if (dateSlabPresent) {
                  let dateSlabFields = reqData.dateSlabArr;
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "dateFrom",
                    header: "Date From",
                    fieldType: "text",
                  });
                  this.applyCriteriaDataTableColumns.splice(-5, 0, {
                    field: "dateTo",
                    header: "Date To",
                    fieldType: "text",
                  });
                  this.applyCriteriaFormattedData = [];
                  dateSlabFields.forEach((field) => {
                    let apiData = JSON.parse(
                      JSON.stringify(res["data"]["Loyalty Program"])
                    );
                    apiData["dateFrom"] = field.trnStartDate;
                    apiData["dateTo"] = field.trnEndDate;
                    apiData[
                      "criteriaMapSplit"
                    ] = `${baseCriteriaMap}&&&&trnStartDate=${field["trnStartDate"]}::trnEndDate=${field["trnEndDate"]}`;
                    this.applyCriteriaFormattedData.push(apiData);
                  });
                } else if (!amtSlabPresent && !dateSlabPresent) {
                  this.applyCriteriaFormattedData = [
                    res["data"]["Loyalty Program"],
                  ];
                  this.applyCriteriaFormattedData.forEach((data) => {
                    data["criteriaMapSplit"] = baseCriteriaMap;
                  });
                }
              }

              // % LCYTYOPEE

              // if (res["criteriaMap"].indexOf("&&&&") >= 0) {
              //   this.isLcyFieldPresent = true;
              // } else {
              //   this.isLcyFieldPresent = false;
              // }

              // if (!this.isLcyFieldPresent) {
              //   this.applyCriteriaFormattedData = [
              //     res["data"]["Loyalty Program"],
              //   ];
              //   this.applyCriteriaFormattedData.forEach((data) => {
              //     data["criteriaMapSplit"] = null;
              //   });
              //   console.log(this.applyCriteriaFormattedData);
              // } else {
              //   if (res["criteriaMap"].indexOf("LCY Amount") >= 0) {
              //     let lcyOprFields = crtfields.filter((crt) => {
              //       return crt.includes("LCY Amount");
              //     });
              //     this.applyCriteriaDataTableColumns.splice(-5, 0, {
              //       field: "lcyAmount",
              //       header: "LCY Amount",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaFormattedData = [];
              //     lcyOprFields.forEach((field) => {
              //       let apiData = JSON.parse(
              //         JSON.stringify(res["data"]["Loyalty Program"])
              //       );
              //       apiData["lcyAmount"] = field;
              //       apiData["criteriaMapSplit"] = field;
              //       this.applyCriteriaFormattedData.push(apiData);
              //     });
              //   } else if (res["criteriaMap"].indexOf("from") >= 0) {
              //     let lcySlabFields = reqData.lcySlabArr;
              //     this.applyCriteriaDataTableColumns.splice(-5, 0, {
              //       field: "lcyAmountFrom",
              //       header: "Amount From",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaDataTableColumns.splice(-5, 0, {
              //       field: "lcyAmountTo",
              //       header: "Amount To",
              //       fieldType: "text",
              //     });
              //     this.applyCriteriaFormattedData = [];
              //     lcySlabFields.forEach((field) => {
              //       let apiData = JSON.parse(
              //         JSON.stringify(res["data"]["Loyalty Program"])
              //       );
              //       apiData["lcyAmountFrom"] = field.from;
              //       apiData["lcyAmountTo"] = field.to;
              //       apiData[
              //         "criteriaMapSplit"
              //       ] = `from:${field["from"]}::to:${field["to"]}`;
              //       this.applyCriteriaFormattedData.push(apiData);
              //     });
              //   }
              // }

              // % LCYTYOPEE end

              this.applyCriteriaFormattedData.forEach((data) => {
                delete data.id;
                data["loyaltyTypeOption"] = this.loyaltyTypeOption;
                data["rewardsAsOption"] = this.rewardsAsOption;
                data["discountAsOption"] = this.discountAsOption;
                data["criteriaMap"] = this.appliedCriteriaCriteriaMap;
                data["invalidLoyaltyValue"] = false;
                data["status"] = "Active";
                data["userID"] = this.userId;
                data["programCode"] = this.programCode;
                data["programDescription"] = this.programDescription;
                data["programType"] = this.programType;
                data["promoCode"] = this.promoCode;
                data["promoCodeLength"] = this.promoCodeLength;
                // data["criteriaTransactionDateFrom"] = promoCodeFrom;
                // data["criteriaTransactionDateTo"] = promoCodeTo;
              });
              // this.setSelectedOptions();
              console.log("::", this.applyCriteriaFormattedData);

              this.coreService.showSuccessToast(
                `Criteria Applied Successfully`
              );
              this.coreService.removeLoadingScreen();
            } else {
              this.applyCriteriaFormattedData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.applyCriteriaDataTableColumns = [];
              this.coreService.showWarningToast(
                "Applied criteria already exists."
              );
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("error in Loyalty Program Apply API", err);
          this.coreService.showWarningToast("Some error in fetching data");
        }
      );
  }

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.loyaltyService
      .currentCriteriaSaveAsTemplate(templateFormData)
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
                "Some error in saving template"
              );
            }
          } else {
            this.coreService.removeLoadingScreen();
            if (res.msg == "Criteria Template already exists.") {
              // this.savingCriteriaTemplateError =
              //   "Criteria Template already exists.";
              this.savingCriteriaTemplateError = true;
              console.log(this.savingCriteriaTemplateError);
            } else {
              this.savingCriteriaTemplateError = false;
              this.setCriteriaSharedComponent.selectedTemplate =
                this.setCriteriaSharedComponent.criteriaName;
              this.coreService.showSuccessToast(res.msg);
              this.setCriteriaSharedComponent.saveTemplateDialogOpen = false;
              this.setCriteriaSharedComponent.criteriaName = "";
              this.getAllTemplates();
            }
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log(":: Error in saving criteria template", err);
          this.coreService.showWarningToast("Some error in saving template");
        }
      );
  }

  getAllTemplates() {
    this.loyaltyService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
        this.formName
      )
      .subscribe(
        (res) => {
          if (
            res["status"] &&
            typeof res["status"] == "string" &&
            (res["status"] == "400" || res["status"] == "500")
          ) {
            if (res["error"]) {
              this.coreService.showWarningToast(res["error"]);
            } else {
              this.coreService.showWarningToast(
                "Some error in saving template"
              );
            }
          } else {
            if (res.data && res.data.length) {
              this.criteriaTemplatesDdlOptions = res.data;
              this.criteriaTemplatesDdlOptions.forEach((val) => {
                val["name"] = val["criteriaName"];
                val["code"] = val["criteriaName"];
              });
            } else {
              console.log(res.msg);
            }
          }
        },
        (err) => {
          console.log(":: Error in getting template list", err);
          this.coreService.showWarningToast(
            "Some error in getting template list"
          );
        }
      );
  }

  saveAddNewLoyalty() {
    console.log(
      "applyCriteriaFormattedData",
      JSON.stringify(this.applyCriteriaFormattedData, null, 2)
    );

    let formData = new FormData();
    let fileService = null;
    if (this.uploadedfileData.length) {
      for (let i = 0; i < this.uploadedfileData.length; i++) {
        for (let key in this.uploadedfileData[i]) {
          if (key == "promoImage") {
            let file =
              this.uploadedfileData[i][key] &&
              this.uploadedfileData[i][key] != ""
                ? this.uploadedfileData[i][key]
                : "";
            if (file != "") {
              formData.append(
                `customerLoyaltyPromoImagesDto[${i}].${key}`,
                file
              );
            }
          } else {
            if (this.uploadedfileData[i]["operation"] == "add") {
              if (!(key == "id")) {
                formData.append(
                  `customerLoyaltyPromoImagesDto[${i}].${key}`,
                  this.uploadedfileData[i][key]
                );
              }
            } else {
              formData.append(
                `customerLoyaltyPromoImagesDto[${i}].${key}`,
                this.uploadedfileData[i][key]
              );
            }
          }
        }
      }
      fileService = this.http.post(
        `/appControl/loyaltyProgramController/${
          this.mode == "add" ? "savePromoImages" : "updatePromoImages"
        }`,
        formData,
        {
          headers: new HttpHeaders()
            .set("userId", this.userId)
            .set("operation", this.mode)
            .set("applications", this.appCtrl.value.code)
            .set("moduleName", this.moduleCtrl.value.code)
            .set("form", this.formName),
        }
      );
    }

    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    console.log(this.uploadedfileData);

    // % CALL FILE UPLOAD API

    if (
      this.setCriteriaSharedComponent.getCurrentCriteriaMap() !=
      this.appliedCriteriaCriteriaMap
    ) {
      this.coreService.showWarningToast(
        "Recent changes in Criteria map has not been applied, Saving last applied data"
      );
    }

    if (
      this.mode != "clone" ||
      (this.mode == "clone" && this.isApplyCriteriaClicked)
    ) {
      this.coreService.displayLoadingScreen();
      let isRequiredFields = false;
      let invalidLoyaltyValue = false;
      let loyaltyTypeMissing = false;
      let rewardsAsMissing = false;
      let loyaltyValueMissing = false;
      let discountAsMissing = false;

      this.applyCriteriaFormattedData.forEach((data) => {
        if (data["isActive"] == "N") {
          data["programDescription"] = this.programDescription.toUpperCase()
            ? this.programDescription.replace(/\s/g, "").length
              ? this.programDescription.toUpperCase()
              : null
            : null;
          if (data["loyaltyValue"] == "null" || data["loyaltyValue"] == null) {
            data["loyaltyValue"] = "";
          }
        }
      });
      let activeData = this.applyCriteriaFormattedData.filter(
        (d) => d["isActive"] == "Y"
      );

      activeData.forEach((element) => {
        console.log(element);

        if (element["invalidLoyaltyValue"]) {
          invalidLoyaltyValue = true;
        }
        element["programDescription"] = this.programDescription.toUpperCase()
          ? this.programDescription.replace(/\s/g, "").length
            ? this.programDescription.toUpperCase()
            : null
          : null;
        element["programType"] = this.programType
          ? this.programType.replace(/\s/g, "").length
            ? this.programType
            : null
          : null;
        element["promoCodeLength"] = this.promoCodeLength
          ? this.promoCodeLength
          : null;

        if (
          !(
            element["programDescription"] &&
            element["programType"] &&
            element["promoCodeLength"]
          )
        ) {
          isRequiredFields = true;
        }
        if (!element["loyaltyType"] || element["loyaltyType"] == "null") {
          loyaltyTypeMissing = true;
        }
        if (!element["rewardsAs"] || element["rewardsAs"] == "null") {
          rewardsAsMissing = true;
        }
        if (!element["loyaltyValue"] && element["loyaltyValue"] != "0") {
          loyaltyValueMissing = true;
        }
        if (
          element["rewardsAs"] == "Discount" &&
          (!element["discountAs"] || element["discountAs"] == "null")
        ) {
          discountAsMissing = true;
        }
      });
      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill required fields.");
      } else if (loyaltyTypeMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Loyalty Type.");
      } else if (rewardsAsMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Reward As.");
      } else if (loyaltyValueMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Fill loyalty value.");
      } else if (discountAsMissing) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Select Discount As.");
      } else if (invalidLoyaltyValue) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid loyalty Value.");
      } else if (!this.validPromoCodeLength) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast(
          "Please Enter Valid Promo Code Length."
        );
      } else {
        let service;
        // this.decodeSelectedOptions();
        if (this.mode == "edit") {
          service = this.loyaltyService.updateLoyaltyProgram(
            this.userId,
            this.applyCriteriaFormattedData,
            this.mode,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formName,
            this.resetParam ? "yes" : "no"
          );
        } else {
          service = this.loyaltyService.addNewLoyaltyProgram(
            this.userId,
            this.applyCriteriaFormattedData,
            this.mode,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formName
          );
        }

        if (service) {
          service
            .pipe(
              switchMap((data) => {
                if (data["msg"] && fileService) {
                  return fileService.pipe(
                    catchError((fileError) => {
                      return of({ fileError });
                    })
                  );
                } else {
                  return of({ dataError: !data["msg"] });
                }
              })
            )
            .subscribe(
              (result) => {
                if (result.dataError) {
                  this.coreService.removeLoadingScreen();
                  console.log("Data service returned an error.");
                  this.coreService.showWarningToast(
                    "Loyalty program data not saved properly, Please try again in sometime"
                  );
                } else if (result.fileError) {
                  console.log(
                    "Data saved successfully, but there was an issue with files."
                  );
                  this.coreService.showSuccessToast(
                    "Loyalty program data saved successfully, But some issue in saving program images, Please try editing the Program"
                  );
                  this.router.navigate([`navbar/loyalty-programs`]);
                } else {
                  this.router.navigate([`navbar/loyalty-programs`]);
                  if (this.mode == "add") {
                    this.coreService.showSuccessToast(
                      "Program data saved successfully"
                    );
                  } else {
                    this.coreService.showSuccessToast(
                      "Program data updated successfully"
                    );
                  }
                  console.log("Data and files saved successfully.");
                }
              },
              (err) => {
                console.log("Error", err);
                this.coreService.removeLoadingScreen();
              }
            );

          // service.subscribe(
          //   (res) => {
          //     if (
          //       res["status"] &&
          //       typeof res["status"] == "string" &&
          //       (res["status"] == "400" || res["status"] == "500")
          //     ) {
          //       this.coreService.removeLoadingScreen();
          //       if (res["error"]) {
          //         this.coreService.showWarningToast(res["error"]);
          //       } else {
          //         this.coreService.showWarningToast(
          //           "Something went wrong, Please try again later"
          //         );
          //       }
          //     } else {
          //       if (res["msg"]) {
          //         this.coreService.showSuccessToast(res.msg);

          //         this.loyaltyService.applicationName = null;
          //         this.loyaltyService.moduleName = null;
          //         this.router.navigate([`navbar/loyalty-programs`]);
          //       }
          //     }
          //   },
          //   (err) => {
          //     this.coreService.removeLoadingScreen();
          //     console.log("error in saveAddNewLoyalty", err);
          //     this.coreService.showWarningToast(
          //       "Something went wrong, Please try again later"
          //     );
          //   }
          // );
        }
      }
    } else {
      this.coreService.showWarningToast("Applied criteria already exists.");
    }
  }

  confirmStatus(e: any, data: any) {
    e.preventDefault();
    let type = "";
    let reqStatus = "";
    if (e.target.checked) {
      reqStatus = "Y";
      type = "activate";
    } else {
      reqStatus = "N";
      type = "deactivate";
    }
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    let completeMsg = "";
    completeMsg =
      `<img src="../../../assets/warning.svg"><br/><br/>` +
      `Do you wish to ` +
      type +
      ` the loyalty Record?`;
    this.confirmationService.confirm({
      message: completeMsg,
      key: "activeDeactiveStatus",
      accept: () => {
        data["isActive"] = reqStatus;
        this.setHeaderSidebarBtn();
        console.log("accepting", reqStatus);
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
        console.log("reject");
      },
    });
  }

  reset() {
    if (this.mode == "edit") {
      this.coreService.setHeaderStickyStyle(false);
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetDataConfirmation",
        accept: () => {
          this.coreService.displayLoadingScreen();
          // this.getCriteriaMasterData();
          // this.getAllTemplates();
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.programDescription = "";
          this.programType = "";
          this.resetParam = true;

          this.uploadedfileData = [];
          this.promoCode = "";
          this.promoCodeLength = null;
          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
          // this.coreService.setHeaderStickyStyle(true);
          // this.coreService.setSidebarBtnFixedStyle(true);
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn();
        },
      });
    } else if (this.mode == "clone") {
      this.coreService.setHeaderStickyStyle(false);
      this.coreService.setSidebarBtnFixedStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear applied changes ?",
        key: "resetDataConfirmation",
        accept: () => {
          this.coreService.displayLoadingScreen();
          this.getCriteriaMasterData();
          this.getAllTemplates();
          this.coreService.setHeaderStickyStyle(true);
          this.coreService.setSidebarBtnFixedStyle(true);
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn();
        },
      });
    } else {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: "Are you sure, you want to clear all the fields ?",
        key: "resetDataConfirmation",
        accept: () => {
          this.applyCriteriaFormattedData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.programDescription = "";
          this.programType = "";

          this.uploadedfileData = [];
          this.promoCode = "";
          this.promoCodeLength = null;

          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
          // this.appCtrl.reset();
          // this.moduleCtrl.reset();
          // this.moduleCtrl.disable();
          // this.showContent = false;
          // this.appModuleDataPresent = false;
        },
        reject: () => {
          this.confirmationService.close;
          this.setHeaderSidebarBtn();
        },
      });
    }
  }

  setHeaderSidebarBtn() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
  }

  // setSelectedOptions() {
  //   this.applyCriteriaFormattedData.forEach((data) => {
  //     if (data["loyaltyType"]) {
  //       data["loyaltyType"] = data["loyaltyTypeOption"].filter(
  //         (option) => option["code"] == data["loyaltyType"]
  //       )[0]["codeName"];
  //     }

  //     if (data["rewardsAs"]) {
  //       data["rewardsAs"] = data["rewardsAsOption"].filter(
  //         (option) => option["code"] == data["rewardsAs"]
  //       )[0]["codeName"];
  //     }
  //   });
  // }
  // decodeSelectedOptions() {
  //   this.applyCriteriaFormattedData.forEach((data) => {
  //     data["loyaltyType"] = data["loyaltyTypeOption"].filter(
  //       (option) => option["codeName"] == data["loyaltyType"]
  //     )[0]["code"];
  //     data["rewardsAs"] = data["rewardsAsOption"].filter(
  //       (option) => option["codeName"] == data["rewardsAs"]
  //     )[0]["code"];
  //   });
  // }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }
  selectedColumn(selectCol: any, value: any, index: any) {
    if (selectCol == "rewardsAs") {
      this.rewardsAs = value.codeName;
      if (value.codeName == "Discount") {
        this.applyCriteriaFormattedData[index]["discountAsOption"] = [];
        this.applyCriteriaFormattedData[index]["discountAsOption"] =
          this.discountAsOption;
      } else {
        this.applyCriteriaFormattedData[index]["discountAsOption"] = [];
        this.applyCriteriaFormattedData[index]["discountAsOption"].unshift({
          code: null,
          codeName: "Select",
        });
      }
      this.applyCriteriaFormattedData[index]["discountAs"] = null;
    }
    if (selectCol == "discountAs") {
    }
    if (selectCol == "loyaltyType") {
      this.loyaltyType = value.codeName;
      if (selectCol == "loyaltyType" && value["code"] == "Percentage") {
        this.applyCriteriaFormattedData[index]["loyaltyValue"] = 0;
        this.applyCriteriaFormattedData[index]["invalidLoyaltyValue"] = true;
        // this.coreService.showWarningToast(
        //   "Please enter loyalty value greater than zero"
        // );
      } else {
        if (Number(this.applyCriteriaFormattedData[index].lcyAmountFrom)) {
          this.applyCriteriaFormattedData[index]["loyaltyValue"] = Number(
            this.applyCriteriaFormattedData[index].lcyAmountFrom
          );
        } else {
          if (this.applyCriteriaFormattedData[index].lcyAmount) {
            let lcyAmountNum =
              this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[3];
            let lcyAmountOpr =
              this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[2];
            if (lcyAmountOpr == ">=") {
              console.log(lcyAmountNum);
              this.applyCriteriaFormattedData[index]["loyaltyValue"] =
                Number(lcyAmountNum);
            } else if (lcyAmountOpr == ">") {
              this.applyCriteriaFormattedData[index]["loyaltyValue"] =
                Number(lcyAmountNum) + 1;
            } else if (lcyAmountOpr == "=") {
              this.applyCriteriaFormattedData[index]["loyaltyValue"] =
                Number(lcyAmountNum);
            } else {
              this.applyCriteriaFormattedData[index]["loyaltyValue"] = 0;
            }
          } else {
            this.applyCriteriaFormattedData[index]["loyaltyValue"] = 0;
          }
        }
      }
    }
    this.applyCriteriaFormattedData[index][selectCol] = value.codeName;
  }

  changeValueInput(
    selectCol: any,
    inputCol: any,
    event: any,
    index: any,
    valueInputElm: any
  ) {
    console.log(
      selectCol,
      inputCol,
      event,
      this.applyCriteriaFormattedData[index]
    );
    this.applyCriteriaFormattedData[index]["invalidLoyaltyValue"] = false;
    let max = 1000000;
    let min = 0;
    if (this.applyCriteriaFormattedData[index][selectCol] == "Percentage") {
      max = 100;
    } else if (this.applyCriteriaFormattedData[index].lcyAmount?.length) {
      let lcyAmountNum =
        this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[3];
      let lcyAmountOpr =
        this.applyCriteriaFormattedData[index].lcyAmount.split(" ")[2];

      if (this.applyCriteriaFormattedData[index][selectCol] == "Percentage") {
        max = 100;
      } else if (
        this.applyCriteriaFormattedData[index][selectCol] == "Amount"
      ) {
        if (
          Number(this.applyCriteriaFormattedData[index].lcyAmountFrom) > 0 &&
          Number(this.applyCriteriaFormattedData[index].lcyAmountTo) > 0
        ) {
          min = Number(this.applyCriteriaFormattedData[index].lcyAmountFrom);
          max = Number(this.applyCriteriaFormattedData[index].lcyAmountTo);
        } else if (lcyAmountOpr == "=") {
          min = Number(lcyAmountNum);
          max = Number(lcyAmountNum);
        } else if (lcyAmountOpr == ">=") {
          min = Number(lcyAmountNum);
          max = 1000000;
        } else if (lcyAmountOpr == ">") {
          min = Number(lcyAmountNum) + 1;
          max = 1000000;
        } else if (lcyAmountOpr == "<=") {
          min = 0;
          max = Number(lcyAmountNum);
        } else if (lcyAmountOpr == "<") {
          min = 0;
          max = Number(lcyAmountNum) - 1;
        } else {
          max = 1000000;
        }
      }
    } else if (
      this.applyCriteriaFormattedData[index].lcyAmountFrom?.length ||
      this.applyCriteriaFormattedData[index].lcyAmountTo?.length
    ) {
      min = Number(this.applyCriteriaFormattedData[index].lcyAmountFrom);
      max = Number(this.applyCriteriaFormattedData[index].lcyAmountTo);
    }

    let isDisplayError = false;
    if (event.value == 0) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidLoyaltyValue"] = true;
      // this.coreService.showWarningToast(
      //   "Please enter loyalty greater than zero"
      // );
      return false;
    } else if (event.value < min || event.value > max) {
      isDisplayError = true;
      this.applyCriteriaFormattedData[index]["invalidLoyaltyValue"] = true;
      this.coreService.showWarningToast(
        "Please enter loyalty between " + min + " to " + max
      );
      if (event.value <= max && event.value >= min) {
        this.applyCriteriaFormattedData[index][inputCol] = event.value;
        this.applyCriteriaFormattedData[index]["invalidLoyaltyValue"] = false;
      } else if (event.value > max) {
        let lastValueEntered = valueInputElm.lastValue;
        valueInputElm.input.nativeElement.value = lastValueEntered;
        this.applyCriteriaFormattedData[index]["invalidLoyaltyValue"] = false;
      } else if (event.value < min) {
      }
      return false;
    }

    this.loyaltyValue = event.value;
  }

  checkOperation(operation: any, index: any, selectRow: any, fieldName: any) {
    if (operation == "delete") {
      this.delete(index);
    } else if (operation == "clone") {
      this.clone(index, selectRow, fieldName);
    }
  }

  clone(index: any, selectRow: any, fieldName: any) {
    let clonedRow = {
      ...selectRow,
    };
    clonedRow[fieldName] = "clone,delete";
    clonedRow["linked"] = "N";
    clonedRow["isActive"] = "Y";
    this.applyCriteriaFormattedData.splice(index + 1, 0, clonedRow);
  }
  delete(index: any) {
    this.applyCriteriaFormattedData.splice(index, 1);
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
}
