import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { forkJoin } from "rxjs";
import { map, take } from "rxjs/operators";
import { CoreService } from "src/app/core.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { TaxSettingsService } from "../tax-settings.service";
import { CriteriaDataService } from "src/app/shared/services/criteria-data.service";

@Component({
  selector: "app-add-new-tax",
  templateUrl: "./add-new-tax.component.html",
  styleUrls: ["./add-new-tax.component.scss"],
  providers: [DialogService, MessageService],
})
export class AddNewTaxComponent implements OnInit {
  primaryColor = "var(--primary-color)";

  userId = "";
  groupID = "";
  mode = "add";
  formName = "Tax Settings";
  applicationName = "Web Application";

  taxCode = "No Data";
  taxDescription = "";

  isTaxSettingLinked: boolean = false;

  appliedCriteriaDataOrg: any = [];
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;

  editTaxSettingApiData: any = [];

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

  inactiveData: boolean = false;
  isApplyCriteriaClicked: boolean = false;

  // suresh Work start -->
  appliedCriteriaDataCols = [];
  appliedCriteriaData: any = [];
  taxMin = 0;
  taxPerMax = 100;
  taxAmountMax = 100000;

  appliedCriteriaDatajson: any = {};
  // suresh Work end -->

  constructor(
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private setCriteriaService: SetCriteriaService,
    private taxSettingsService: TaxSettingsService,
    private criteriaDataService: CriteriaDataService
  ) {}

  @ViewChild(SetCriteriaComponent)
  setCriteriaSharedComponent!: SetCriteriaComponent;

  ngOnInit(): void {
    this.mode = "add";
    this.getCriteriaMasterData();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });
    this.getAllTemplates();
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.mode = this.activatedRoute.snapshot.routeConfig.path.substring(
        this.activatedRoute.snapshot.routeConfig.path.lastIndexOf("/") + 1
      );
      // this.mode = "edit";
      this.groupID = params.id;
    }
    console.log(this.mode);
  }

  getTaxSettingForEditApi(taxCode: any, operation: any) {
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.taxSettingsService
      .getTaxSettingForEdit(taxCode, operation)
      .subscribe(
        (res) => {
          if (!res["msg"]) {
            this.editTaxSettingApiData = res;
            console.log("edit data", res);

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
              this.editTaxSettingApiData
            );

            this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
              this.criteriaCodeText,
              this.criteriaMasterData,
              this.cmCriteriaSlabType
            );

            this.taxCode = res["data"][0]["taxCode"];
            if (res["data"][0]["taxCodeDesc"]) {
              this.taxDescription = res["data"][0]["taxCodeDesc"];
            }
            this.isTaxSettingLinked = !res["criteriaUpdate"];

            this.appliedCriteriaDataOrg = [...res["data"]];
            this.appliedCriteriaData = [...res["data"]];
            this.setSelectedOptions();
            this.appliedCriteriaData.forEach((element) => {
              element["invalidTaxAmount"] = false;
            });
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaDataCols = [...this.getColumns(res["column"])];
          } else {
            this.coreService.showWarningToast(res["msg"]);
            if (res["msg"].includes("No active")) {
              this.inactiveData = true;
              this.setCriteriaSharedComponent.criteriaCtrl.disable();
            }
            this.appliedCriteriaData = [];
            this.appliedCriteriaDataCols = [];
          }
        },
        (err) => {
          console.log("Error in getTaxSettingForEditApi", err);
        }
      )
      .add(() => {
        setTimeout(() => {
          this.coreService.removeLoadingScreen();
        }, 250);
      });
  }

  getCriteriaMasterData() {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.taxSettingsService.getCriteriaMasterData(
        this.formName,
        this.applicationName
      ),
      addBankRouteCriteriaData:
        this.taxSettingsService.getAddTaxSettingsCriteriaData(),
    })
      .pipe(
        take(1),
        map((response) => {
          const criteriaMasterData = response.criteriaMasterData;
          this.criteriaDataDetailsJson = response.addBankRouteCriteriaData;
          this.criteriaDataDetailsJson.data.listCriteria.cmCriteriaDataDetails.forEach(
            (data) => {
              if (data["criteriaType"] == "Slab") {
                this.cmCriteriaSlabType.push(data["fieldName"]);
              }
            }
          );
          console.log(" Slabs fields", this.cmCriteriaSlabType);

          if (this.mode == "add") {
            this.taxCode = this.criteriaDataDetailsJson.data.taxCode;
            this.taxDescription = this.criteriaDataDetailsJson.data.taxCodeDesc;
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
            this.getTaxSettingForEditApi(this.groupID, "edit");
          } else if (this.mode == "clone") {
            this.getTaxSettingForEditApi(this.groupID, "clone");
          } else {
            this.coreService.removeLoadingScreen();
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log("Error in Initiating dropdown values", err);
        }
      );
  }

  getCorrespondentValues(
    fieldName: any,
    displayName: any,
    criteriaCodeText: any
  ) {
    let criteriaMapValue = criteriaCodeText.join(";");

    this.coreService.displayLoadingScreen();
    this.taxSettingsService
      .getCorrespondentValuesData(
        this.formName,
        this.applicationName,
        criteriaMapValue,
        fieldName,
        displayName
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
    this.isApplyCriteriaClicked = true;
    if (this.isTaxSettingLinked && this.mode != "clone") {
      this.coreService.setSidebarBtnFixedStyle(false);
      this.coreService.setHeaderStickyStyle(false);
      this.confirmationService.confirm({
        message: `You can not edit the current criteria, as it is already used in transaction.<br/> Kindly disable the current record and add new.`,
        key: "taxSettingLinkedWarning",
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
      this.taxCriteriaSearchApi(postDataCriteria);
    }
  }

  taxCriteriaSearchApi(formData: any) {
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.coreService.displayLoadingScreen();
    this.taxSettingsService
      .postTaxCriteriaSearch(formData)
      .subscribe(
        (res) => {
          console.log("criteriasearch DATA", res);
          if (!res["msg"]) {
            if (!res["duplicate"]) {
              this.appliedCriteriaDataOrg = [...res["data"]];
              this.appliedCriteriaData = [...res["data"]];
              this.setSelectedOptions();
              this.appliedCriteriaData.forEach((element) => {
                element["invalidTaxAmount"] = false;
              });
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
    this.coreService.displayLoadingScreen();
    this.taxSettingsService
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
    this.taxSettingsService
      .getAllCriteriaTemplates(this.userId)
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

  saveAddNewTax(action) {
    if (
      this.mode != "clone" ||
      (this.mode == "clone" && this.isApplyCriteriaClicked)
    ) {
      this.coreService.displayLoadingScreen();
      let isRequiredFields = false;
      let invalidTaxAmount = false;
      this.appliedCriteriaData.forEach((element) => {
        if (element["invalidTaxAmount"]) {
          invalidTaxAmount = true;
        }
        element["taxCodeDesc"] = this.taxDescription
          ? this.taxDescription
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
        this.coreService.showWarningToast("Please Fill required fields.");
      } else if (invalidTaxAmount) {
        this.coreService.removeLoadingScreen();
        this.coreService.showWarningToast("Please Enter Valid Tax Amount.");
      } else {
        let service;
        this.decodeSelectedOptions();
        if (this.mode == "edit") {
          let data = {
            data: this.appliedCriteriaData,
            duplicate: this.appliedCriteriaIsDuplicate,
            criteriaMap: this.appliedCriteriaCriteriaMap,
            taxCode: this.groupID,
          };
          service = this.taxSettingsService.updateTaxSetting(this.userId, data);
          console.log("EDIT MODE - UPDATE TAX SERVICE");
        } else {
          let data = {
            data: this.appliedCriteriaData,
            duplicate: this.appliedCriteriaIsDuplicate,
            criteriaMap: this.appliedCriteriaCriteriaMap,
          };
          console.log("ADD MODE - ADD NEW TAX SERVICE");
          service = this.taxSettingsService.addNewTax(data);
        }

        if (service) {
          service.subscribe(
            (res) => {
              if (res["msg"]) {
                this.coreService.showSuccessToast(res.msg);
                if (action == "save") {
                  this.router.navigate([`navbar/tax-settings`]);
                } else if (action == "saveAndAddNew") {
                  this.reset();
                  this.coreService.removeLoadingScreen();
                }
              }
            },
            (err) => {
              this.coreService.removeLoadingScreen();
              console.log("error in saveAddNewTax", err);
            }
          );
        }
      }
    } else {
      this.coreService.showWarningToast("Applied criteria already exists.");
    }
  }

  reset() {
    this.coreService.setSidebarBtnFixedStyle(false);
    this.coreService.setHeaderStickyStyle(false);
    this.confirmationService.confirm({
      message: "Are you sure, you want to clear all the fields ?",
      key: "resetTaxDataConfirmation",
      accept: () => {
        this.appliedCriteriaData = [];
        this.appliedCriteriaCriteriaMap = null;
        this.appliedCriteriaIsDuplicate = null;
        this.taxDescription = "";

        this.setCriteriaSharedComponent.resetSetCriteria();
        this.setHeaderSidebarBtn();
      },
      reject: () => {
        this.confirmationService.close;
        this.setHeaderSidebarBtn();
      },
    });
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

  setSelectedOptions() {
    this.appliedCriteriaData.forEach((data) => {
      if (data["taxTypeOption"]) {
        data["taxTypeOption"] = data["taxType"].filter(
          (option) => option["code"] == data["taxTypeOption"]
        )[0]["codeName"];
      }

      if (data["setAsOption"]) {
        data["setAsOption"] = data["setAs"].filter(
          (option) => option["code"] == data["setAsOption"]
        )[0]["codeName"];
      }
    });
  }
  decodeSelectedOptions() {
    this.appliedCriteriaData.forEach((data) => {
      data["taxTypeOption"] = data["taxType"].filter(
        (option) => option["codeName"] == data["taxTypeOption"]
      )[0]["code"];
      data["setAsOption"] = data["setAs"].filter(
        (option) => option["codeName"] == data["setAsOption"]
      )[0]["code"];
    });
  }

  // suresh Work start -->
  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  getColumns(colData: any) {
    return this.criteriaDataService.getAppliedCriteriaTableColumns(colData);
  }
  selectedColumn(selectCol: any, value: any, index: any) {
    console.log(selectCol, value, index);
    if (selectCol == "setAs" && value["code"] == "Percentage") {
      this.appliedCriteriaData[index]["tax"] = 0;
    } else {
      this.appliedCriteriaData[index]["tax"] = Number(
        this.appliedCriteriaData[index].lcyAmountFrom
      )
        ? Number(this.appliedCriteriaData[index].lcyAmountFrom)
        : 0;
    }
    this.appliedCriteriaData[index][selectCol + "Option"] = value.codeName;
    console.log("this.appliedCriteriaData", this.appliedCriteriaData[index]);
  }

  changeValueInput(
    selectCol: any,
    inputCol: any,
    event: any,
    index: any,
    valueInputElm: any
  ) {
    this.appliedCriteriaData[index]["invalidTaxAmount"] = false;
    console.log(
      "selectCol",
      event,
      "valueInputElm",
      valueInputElm,
      this.appliedCriteriaData[index][selectCol + "Option"],
      this.appliedCriteriaData[index].lcyAmountFrom
    );
    let max = 0;
    let min = 0;
    if (this.appliedCriteriaData[index][selectCol + "Option"] == "Percentage") {
      max = 100;
    } else if (
      this.appliedCriteriaData[index][selectCol + "Option"] == "Amount"
    ) {
      if (
        Number(this.appliedCriteriaData[index].lcyAmountFrom) > 0 &&
        Number(this.appliedCriteriaData[index].lcyAmountTo) > 0
      ) {
        min = Number(this.appliedCriteriaData[index].lcyAmountFrom);
        max = Number(this.appliedCriteriaData[index].lcyAmountTo);
      } else {
        max = 1000000;
      }
    }

    if (event.value <= max) {
      this.appliedCriteriaData[index][inputCol] = event.value;
    } else {
      let lastValueEntered = valueInputElm.lastValue;
      valueInputElm.input.nativeElement.value = lastValueEntered;
    }
    let isDisplayError = false;
    if (event.value < min || event.value > max) {
      isDisplayError = true;
      this.appliedCriteriaData[index]["invalidTaxAmount"] = true;
      this.coreService.showWarningToast(
        "Please enter tax between " + min + " to " + max
      );
      return false;
    }
  }

  TaxValidation() {}

  checkOperation(operation: any, index: any, selectRow: any, fieldName: any) {
    if (operation == "delete") {
      this.delete(index);
    } else if (operation == "clone") {
      this.clone(index, selectRow, fieldName);
    } else {
      console.log("Nor Clone neither Delete");
    }
  }

  clone(index: any, selectRow: any, fieldName: any) {
    console.log("clone", index, selectRow);
    let clonedRow = {
      ...selectRow,
    };
    clonedRow[fieldName] = "clone,delete";
    console.log(clonedRow);
    this.appliedCriteriaData.splice(index + 1, 0, clonedRow);
    setTimeout(() => {
      console.log(this.appliedCriteriaData[index]);
      console.log(this.appliedCriteriaData[index + 1]);
    }, 100);
  }
  delete(index: any) {
    this.appliedCriteriaData.splice(index, 1);
    console.log("delete", index);
  }
  // suresh Work end -->
}
