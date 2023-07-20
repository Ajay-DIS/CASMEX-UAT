import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";

import { BankRoutingService } from "../bank-routing.service";
import { Table } from "primeng/table";
import { map, take } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { Dropdown } from "primeng/dropdown";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-addnewroute",
  templateUrl: "./addnewroute.component.html",
  styleUrls: ["./addnewroute.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddnewrouteComponent2 implements OnInit {
  @ViewChild("table", { static: false }) table!: Table;
  @ViewChild("templatesDropdown") templatesDropdown: Dropdown;

  primaryColor = "var(--primary-color)";

  userId = "";
  routeID = "";
  mode = "add";
  formName = "Bank Routings";
  applicationName = "Web Application";
  moduleName = "Remittance";

  //
  appliedCriteriaData: any = [];
  appliedCriteriaDataOrg: any = [];
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  appliedCriteriaDataCols: any = [];
  objectKeys = Object.keys;
  isEditMode = false;
  //

  //
  formattedMasterData: any = [];
  //

  editBankRouteApiData: any = [];

  criteriaMasterData: any = {};
  criteriaDataDetailsJson: any = {};
  cmCriteriaMandatory = [];
  cmCriteriaDependency: any = {};
  cmCriteriaDataDetails: any = [];
  independantCriteriaArr: any = [];
  cmCriteriaSlabType: any = [];
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [];
  criteriaEqualsDdlOptions = [];
  correspondentDdlOptions = [];

  criteriaText: any[] = [];
  criteriaCodeText: any[] = [];

  savingCriteriaTemplateError = null;

  routeCode: any = "No Data";
  routeDescription: any = "";

  isBankRoutingLinked: boolean = false;

  inactiveData: boolean = false;
  isApplyCriteriaClicked: boolean = false;

  selectAppModule: any;
  searchApplicationOptions: any[] = [];
  searchModuleOptions: any[] = [];

  appModuleDataPresent: boolean = false;
  showContent: boolean = false;

  constructor(
    private bankRoutingService: BankRoutingService,
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private setCriteriaService: SetCriteriaService,
    private criteriaDataService: CriteriaDataService,
    private confirmationService: ConfirmationService,
    private fb: UntypedFormBuilder
  ) {}

  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;

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
      this.routeID = params.id;
    }

    this.bankRoutingService.getBanksRoutingAppModuleList().subscribe((res) => {
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
        if (
          !(
            this.bankRoutingService.applicationName ||
            this.bankRoutingService.moduleName
          )
        ) {
          if (this.mode != "add") {
            this.router.navigate([`navbar/bank-routing`]);
          } else {
            this.coreService.removeLoadingScreen();
          }
        } else {
          if (this.mode != "add") {
            this.appCtrl.setValue({
              name: this.bankRoutingService.applicationName,
              code: this.bankRoutingService.applicationName,
            });
            this.moduleCtrl.setValue({
              name: this.bankRoutingService.moduleName,
              code: this.bankRoutingService.moduleName,
            });
            this.appModuleDataPresent = true;
            this.appCtrl.disable();
            this.moduleCtrl.disable();
            this.searchAppModule();
          }
        }
      } else {
      }
    });
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

  onAppValueChange() {
    this.showContent = false;
    this.appModuleDataPresent = false;
    this.moduleCtrl.reset();
    this.moduleCtrl.enable();
  }

  searchAppModule() {
    this.appModuleDataPresent = true;
    this.showContent = false;
    this.getCriteriaMasterData();
    this.getAllTemplates();
  }

  getBanksRoutingForEditApi(routeCode: any, operation: any) {
    this.isEditMode = true;
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.bankRoutingService
      .getBanksRoutingForEdit(
        routeCode,
        operation,
        this.bankRoutingService.applicationName,
        this.bankRoutingService.moduleName,
        this.formName
      )
      .subscribe(
        (res) => {
          this.coreService.removeLoadingScreen();
          this.appModuleDataPresent = true;
          if (!res["msg"]) {
            this.editBankRouteApiData = res;
            console.log("edit data", res);

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
              this.editBankRouteApiData
            );

            this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
              this.criteriaCodeText,
              this.criteriaMasterData,
              this.cmCriteriaSlabType
            );

            this.routeCode = res["data"][0]["routeCode"];
            if (res["data"][0]["routeDesc"]) {
              this.routeDescription = res["data"][0]["routeDesc"];
            }
            this.isBankRoutingLinked = !res["criteriaUpdate"];

            this.appliedCriteriaDataOrg = [...res["data"]];
            this.appliedCriteriaData = [...res["data"]];
            this.setSelectedOptions();
            console.log(this.appliedCriteriaData);
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaDataCols = [...this.getColumns(res["column"])];
            this.showContent = true;
          } else {
            this.coreService.showWarningToast(res["msg"]);
            this.showContent = false;
            if (res["msg"].includes("No active")) {
              this.inactiveData = true;
              this.setCriteriaSharedComponent.criteriaCtrl.disable();
            }
            this.appliedCriteriaData = [];
            this.appliedCriteriaDataCols = [];
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in getBanksRoutingForEditApi", err);
        }
      );
  }

  getCriteriaMasterData() {
    if (this.mode == "add") {
      this.coreService.displayLoadingScreen();
    }
    forkJoin({
      criteriaMasterData: this.bankRoutingService.getCriteriaMasterData(
        this.formName,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code
      ),
      addBankRouteCriteriaData:
        this.bankRoutingService.getAddBankRouteCriteriaData(
          this.appCtrl.value.code,
          this.moduleCtrl.value.code,
          this.formName
        ),
    })
      .pipe(
        take(1),
        map((response) => {
          this.formatMasterData(response.criteriaMasterData);
          const criteriaMasterData = response.criteriaMasterData;
          this.criteriaDataDetailsJson = response.addBankRouteCriteriaData;
          this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
            (data) => {
              console.log(data["criteriaType"]);
              if (data["criteriaType"] == "Slab") {
                this.cmCriteriaSlabType.push(data["fieldName"]);
              }
            }
          );
          console.log(" Slabs fields", this.cmCriteriaSlabType);

          if (this.mode == "add") {
            this.routeCode = this.criteriaDataDetailsJson.data.routeCode;
            this.routeID = this.routeCode;
            this.routeDescription = this.criteriaDataDetailsJson.data.routeDesc;
          }

          this.cmCriteriaDataDetails = [
            ...this.criteriaDataDetailsJson.data.listCriteria
              .cmCriteriaDataDetails,
          ];
          console.log("this.cmCriteriaDataDetails", this.cmCriteriaDataDetails);

          this.cmCriteriaMandatory = this.criteriaDataDetailsJson.data.mandatory
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
          console.log(this.criteriaMapDdlOptions);
          return criteriaMasterData;
        })
      )
      .subscribe(
        (res) => {
          console.log(res);
          this.criteriaMasterData = res;
          if (this.mode == "edit") {
            if (
              !(
                this.bankRoutingService.applicationName ||
                this.bankRoutingService.moduleName
              )
            ) {
              this.appModuleDataPresent = false;
              this.showContent = false;
              this.router.navigate([`navbar/bank-routing`]);
            } else {
              this.getBanksRoutingForEditApi(this.routeID, "edit");
            }
          } else if (this.mode == "clone") {
            if (
              !(
                this.bankRoutingService.applicationName ||
                this.bankRoutingService.moduleName
              )
            ) {
              this.appModuleDataPresent = false;
              this.showContent = false;
              this.router.navigate([`navbar/bank-routing`]);
            } else {
              this.getBanksRoutingForEditApi(this.routeID, "clone");
            }
          } else {
            this.showContent = true;
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.showContent = false;
          this.coreService.removeLoadingScreen();
          console.log("Error in Initiating dropdown values", err);
        }
      );
  }

  formatMasterData(masterData: any) {
    const formattedMasterData = [].concat.apply([], Object.values(masterData));
    console.log(formattedMasterData);
    this.formattedMasterData = formattedMasterData;
  }

  getCorrespondentValues(
    fieldName: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.bankRoutingService
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
          this.coreService.removeLoadingScreen();
          console.log(res);
          if (res[fieldName]) {
            this.setCriteriaSharedComponent.valueCtrl.enable();
            this.setCriteriaSharedComponent.hideValuesDropdown = false;
            this.setCriteriaSharedComponent.showValueInput = false;

            console.log(res[fieldName]);
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
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in getting values", err);
          this.resetCriteriaDropdowns();
        }
      );
  }

  resetCriteriaDropdowns() {
    this.setCriteriaSharedComponent.resetCriteriaDropdowns();
  }

  applyCriteria(postDataCriteria: FormData) {
    postDataCriteria.append("routeCode", this.routeID);
    postDataCriteria.append("operation", this.mode);
    postDataCriteria.append("applications", this.applicationName);
    postDataCriteria.append("form", this.formName);
    postDataCriteria.append("moduleName", this.moduleName);
    this.isApplyCriteriaClicked = true;
    if (this.isBankRoutingLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "bankRoutingLinkedWarning",
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
      console.log("CANNNNOT UPDATE ITTT");
    } else {
      this.routeBankCriteriaSearchApi(postDataCriteria);
    }
  }

  routeBankCriteriaSearchApi(formData: any) {
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .postRouteBankCriteriaSearch(formData)
      .subscribe(
        (res) => {
          console.log("criteriasearch DATA", res);
          if (!res["msg"]) {
            if (!res["duplicate"]) {
              this.appliedCriteriaDataOrg = [...res["data"]];
              this.appliedCriteriaData = [...res["data"]];
              this.setSelectedOptions();
              console.log(this.appliedCriteriaData);
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              this.appliedCriteriaIsDuplicate = res["duplicate"];
              this.appliedCriteriaDataCols = [
                ...this.getColumns(res["column"]),
              ];
              this.coreService.showSuccessToast(
                `Criteria Applied Successfully`
              );
            } else {
              this.appliedCriteriaData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.appliedCriteriaDataCols = [];
              this.coreService.showWarningToast(
                "Applied criteria already exists."
              );
            }
          } else {
            this.coreService.showWarningToast(res["msg"]);
            this.appliedCriteriaData = [];
          }
        },
        (err) => {
          console.log("error in BankCriteriaSearchApi", err);
        }
      )
      .add(() => {
        setTimeout(() => {
          this.coreService.removeLoadingScreen();
        }, 250);
      });
  }

  saveCriteriaAsTemplate(templateFormData: any) {
    templateFormData.append("applications", this.appCtrl.value.code);
    templateFormData.append("form", this.formName);
    templateFormData.append("moduleName", this.moduleCtrl.value.code);
    this.coreService.displayLoadingScreen();
    this.bankRoutingService
      .currentCriteriaSaveAsTemplate(templateFormData)
      .subscribe(
        (response) => {
          this.coreService.removeLoadingScreen();
          if (response.msg == "Criteria Template already exists.") {
            this.savingCriteriaTemplateError =
              "Criteria Template already exists.";
          } else {
            this.savingCriteriaTemplateError = null;
            this.setCriteriaSharedComponent.selectedTemplate =
              this.setCriteriaSharedComponent.criteriaName;
            this.coreService.showSuccessToast(response.msg);
            this.setCriteriaSharedComponent.saveTemplateDialogOpen = false;
            this.setCriteriaSharedComponent.criteriaName = "";
            this.getAllTemplates();
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log(":: Error in saving criteria template", err);
        }
      );
  }

  getAllTemplates() {
    this.bankRoutingService
      .getAllCriteriaTemplates(
        this.userId,
        this.appCtrl.value.code,
        this.moduleCtrl.value.code,
        this.formName
      )
      .subscribe((response) => {
        if (response.data && response.data.length) {
          console.log("::templates", response);
          this.criteriaTemplatesDdlOptions = response.data;
          this.criteriaTemplatesDdlOptions.forEach((val) => {
            val["name"] = val["criteriaName"];
            val["code"] = val["criteriaName"];
          });
        } else {
          console.log(response.msg);
        }
      });
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }

  selectedColumn(column, value, index) {
    console.log(column, value, index);
    let selectedColField = column.split("Option")[0];
    this.appliedCriteriaData[index][selectedColField] = value["codeName"];
  }

  setSelectedOptions() {
    this.appliedCriteriaData.forEach((data) => {
      data["routeToBankNameOption"].filter((option) => {
        console.log(option["code"], data["routeToBankName"]);
        option["code"] == data["routeToBankName"];
      });
      if (data["routeToBankName"]) {
        data["routeToBankName"] = data["routeToBankNameOption"].filter(
          (option) => option["code"] == data["routeToBankName"]
        )[0]["codeName"];
      }

      if (data["routeToServiceCategory"]) {
        data["routeToServiceCategory"] = data[
          "routeToServiceCategoryOption"
        ].filter(
          (option) => option["code"] == data["routeToServiceCategory"]
        )[0]["codeName"];
      }

      if (data["routeToServiceType"]) {
        data["routeToServiceType"] = data["routeToServiceTypeOption"].filter(
          (option) => option["code"] == data["routeToServiceType"]
        )[0]["codeName"];
      }
    });
  }
  decodeSelectedOptions() {
    this.appliedCriteriaData.forEach((data) => {
      data["routeToBankName"] = data["routeToBankNameOption"].filter(
        (option) => option["codeName"] == data["routeToBankName"]
      )[0]["code"];
      data["routeToServiceCategory"] = data[
        "routeToServiceCategoryOption"
      ].filter(
        (option) => option["codeName"] == data["routeToServiceCategory"]
      )[0]["code"];
      data["routeToServiceType"] = data["routeToServiceTypeOption"].filter(
        (option) => option["codeName"] == data["routeToServiceType"]
      )[0]["code"];
    });
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  reset() {
    if (this.mode == "edit") {
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
    } else if (this.mode == "clone") {
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
          this.appliedCriteriaData = [];
          this.appliedCriteriaCriteriaMap = null;
          this.appliedCriteriaIsDuplicate = null;
          this.routeDescription = "";
          this.setCriteriaSharedComponent.resetSetCriteria();
          this.setHeaderSidebarBtn();
          this.appCtrl.reset();
          this.moduleCtrl.reset();
          this.moduleCtrl.disable();
          this.showContent = false;
          this.appModuleDataPresent = false;
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

  saveAddNewRoute(action) {
    console.log(this.setCriteriaSharedComponent.getCurrentCriteriaMap());
    console.log(this.appliedCriteriaCriteriaMap);

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
      this.appliedCriteriaData.forEach((element) => {
        element["routeDesc"] = this.routeDescription
          ? this.routeDescription.replace(/\s/g, "").length
            ? this.routeDescription
            : null
          : null;
        function isNullValue(arr) {
          return arr.some((el) => el == null);
        }
        console.log("::::", element);
        if (isNullValue(Object.values(element))) {
          isRequiredFields = true;
        }
      });
      if (isRequiredFields) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please fill required fields.");
      } else {
        let service;
        this.decodeSelectedOptions();
        if (this.mode == "edit") {
          let data = {
            data: this.appliedCriteriaData,
            duplicate: this.appliedCriteriaIsDuplicate,
            criteriaMap: this.appliedCriteriaCriteriaMap,
            routeCode: this.routeID,
          };
          service = this.bankRoutingService.updateRoute(
            this.userId,
            data,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formName
          );
          console.log("EDIT MODE - UPDATE CRITERIA SERVICE");
        } else {
          let data = {
            data: this.appliedCriteriaData,
            duplicate: this.appliedCriteriaIsDuplicate,
            criteriaMap: this.appliedCriteriaCriteriaMap,
          };
          service = this.bankRoutingService.addNewRoute(
            data,
            this.appCtrl.value.code,
            this.moduleCtrl.value.code,
            this.formName
          );
        }
        if (service) {
          service.subscribe(
            (res) => {
              if (res["msg"]) {
                this.coreService.showSuccessToast(res.msg);
                if (action == "save") {
                  this.router.navigate([`navbar/bank-routing`]);
                } else if (action == "saveAndAddNew") {
                  // this.reset();
                  this.router.navigate([`navbar/bank-routing/addnewroute`]);
                  // this.coreService.removeLoadingScreen();
                }
              }
            },
            (err) => {
              this.coreService.removeLoadingScreen();
              console.log("error in saveAddNewRoute", err);
            }
          );
        }
      }
    } else {
      this.coreService.showWarningToast("Applied criteria already exists.");
    }
  }
}
