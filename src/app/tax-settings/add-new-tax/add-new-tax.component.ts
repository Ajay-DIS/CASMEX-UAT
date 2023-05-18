import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { MessageService } from "primeng/api";
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

  appliedCriteriaDataOrg: any = [];
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;

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
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
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
    // suresh Work start -->
    // this.appliedCriteriaData = this.appliedCriteriaDatajson.data;
    // this.appliedCriteriaDataCols = [
    //   ...this.getColumns(this.appliedCriteriaDatajson.column),
    // ];
    // suresh Work end -->
  }

  // getBanksRoutingForEditApi(groupID: any) {
  //   // this.isEditMode = true;
  //   // this.appliedCriteriaData = [];
  //   // this.appliedCriteriaDataCols = [];
  //   this.taxSettingsService
  //     .getBanksRoutingForEdit(groupID)
  //     .subscribe(
  //       (res) => {
  //         if (!res["msg"]) {
  //           this.editBankRouteApiData = res;
  //           console.log("edit data", res);

  //           this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
  //             this.editBankRouteApiData
  //           );

  //           this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
  //             this.criteriaCodeText,
  //             this.criteriaMasterData,
  //             this.cmCriteriaSlabType
  //           );

  //           // this.appliedCriteriaDataOrg = [...res["data"]];
  //           // this.appliedCriteriaData = [...res["data"]];
  //           // this.appliedCriteriaCriteriaMap = res["criteriaMap"];
  //           // this.appliedCriteriaDataCols = [...this.getColumns(res["column"])];
  //         } else {
  //           this.ngxToaster.warning(res["msg"]);
  //           // this.appliedCriteriaData = [];
  //           // this.appliedCriteriaDataCols = [];
  //         }
  //       },
  //       (err) => {
  //         console.log("Error in getBanksRoutingForEditApi", err);
  //       }
  //     )
  //     .add(() => {
  //       setTimeout(() => {
  //         this.coreService.removeLoadingScreen();
  //       }, 250);
  //     });
  // }

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

          this.taxCode = this.criteriaDataDetailsJson.data.taxCode;
          this.taxDescription = this.criteriaDataDetailsJson.data.taxCodeDesc;

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
          const params = this.activatedRoute.snapshot.params;
          if (params && params.id) {
            this.mode = "edit";
            // this.getBanksRoutingForEditApi(params.id);
            this.groupID = params.id;
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
              this.ngxToaster.warning(res["message"]);
              this.resetCriteriaDropdowns();
            } else {
              this.ngxToaster.warning("Criteria Map is not proper");
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
    this.taxCriteriaSearchApi(postDataCriteria);
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
              this.appliedCriteriaCriteriaMap = res["criteriaMap"];
              this.appliedCriteriaIsDuplicate = res["duplicate"];
              this.appliedCriteriaDataCols = [
                ...this.getColumns(res["column"]),
              ];
              this.ngxToaster.success(`Criteria Applied Successfully`);
            } else {
              this.appliedCriteriaData = [];
              this.appliedCriteriaCriteriaMap = null;
              this.appliedCriteriaIsDuplicate = null;
              this.appliedCriteriaDataCols = [];
              this.ngxToaster.warning("Applied criteria already exists.");
            }
          } else {
            this.ngxToaster.warning(res["msg"]);
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
            this.ngxToaster.success(response.msg);
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

  saveAddNewRoute(action) {
    this.coreService.displayLoadingScreen();
    let isRequiredFields = false;
    this.appliedCriteriaData.forEach((element) => {
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
      this.ngxToaster.warning("Please Fill required fields.");
    } else {
      let service;
      this.appliedCriteriaData.forEach((element) => {
        element["taxCodeDesc"] = this.taxDescription ? this.taxDescription : "";
      });
      if (this.groupID != "") {
        let data = {
          data: this.appliedCriteriaData,
          duplicate: this.appliedCriteriaIsDuplicate,
          criteriaMap: this.appliedCriteriaCriteriaMap,
          groupID: this.groupID,
        };
        // service = this.taxSettingsService.updateRoute(this.userId, data);
        console.log("EDIT MODE - UPDATE CRITERIA SERVICE");
      } else {
        let data = {
          data: this.appliedCriteriaData,
          duplicate: this.appliedCriteriaIsDuplicate,
          criteriaMap: this.appliedCriteriaCriteriaMap,
        };
        service = this.taxSettingsService.addNewTax(data);
      }

      if (service) {
        service.subscribe(
          (res) => {
            if (res["msg"]) {
              this.ngxToaster.success(res.msg);
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
            console.log("error in saveAddNewRoute", err);
          }
        );
      }
    }
  }

  reset() {
    this.appliedCriteriaData = [];
    this.appliedCriteriaCriteriaMap = null;
    this.appliedCriteriaIsDuplicate = null;
    this.taxDescription = "";

    this.setCriteriaSharedComponent.resetSetCriteria();
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
    this.appliedCriteriaData[index]["tax"] = 0;
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
    console.log(
      "selectCol",
      this.appliedCriteriaData[index][selectCol + "Option"]
    );
    let max = 0;
    let min = 0;
    if (this.appliedCriteriaData[index][selectCol + "Option"] == "Percentage") {
      max = 100;
    } else if (
      this.appliedCriteriaData[index][selectCol + "Option"] == "Amount"
    ) {
      max = 1000000;
    }
    if (event.value <= max) {
      this.appliedCriteriaData[index][inputCol] = event.value;
    } else {
      let lastValueEntered = valueInputElm.lastValue;
      valueInputElm.input.nativeElement.value = lastValueEntered;
    }
  }

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
