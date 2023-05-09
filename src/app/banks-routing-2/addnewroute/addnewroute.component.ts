import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";

import { BankRoutingService } from "../bank-routing.service";
import { Table } from "primeng/table";
import { map, take } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { ConfirmDialog } from "primeng/confirmdialog";
import { Dropdown } from "primeng/dropdown";
import { SetCriteriaService } from "src/app/shared/components/set-criteria/set-criteria.service";
import { SetCriteriaComponent } from "src/app/shared/components/set-criteria/set-criteria.component";

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
  groupID = "";
  mode = "add";
  formName = "Bank Routings";
  applicationName = "Web Application";

  //
  appliedCriteriaData: any = [];
  appliedCriteriaDataOrg: any = [];
  appliedCriteriaCriteriaMap: any = null;
  appliedCriteriaIsDuplicate: any = null;
  appliedCriteriaDataCols: any = [];
  objectKeys = Object.keys;
  isEditMode = false;
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

  constructor(
    private bankRoutingService: BankRoutingService,
    private activatedRoute: ActivatedRoute,
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private setCriteriaService: SetCriteriaService
  ) {}

  @ViewChild("cd") cd: ConfirmDialog;
  @ViewChild("addCriteriaBtn") addCriteriaBtn: ElementRef;

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
  }

  getBanksRoutingForEditApi(groupID: any) {
    this.isEditMode = true;
    this.appliedCriteriaData = [];
    this.appliedCriteriaDataCols = [];
    this.bankRoutingService
      .getBanksRoutingForEdit(groupID)
      .subscribe(
        (res) => {
          if (!res["msg"]) {
            this.editBankRouteApiData = res;
            console.log("edit data", res);

            this.criteriaCodeText = this.setCriteriaService.setCriteriaMap(
              this.editBankRouteApiData
            );

            this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
              this.criteriaCodeText,
              this.cmCriteriaDataDetails,
              this.criteriaMasterData,
              this.cmCriteriaSlabType
            );

            this.appliedCriteriaDataOrg = [...res["data"]];
            this.appliedCriteriaData = [...res["data"]];
            this.appliedCriteriaCriteriaMap = res["criteriaMap"];
            this.appliedCriteriaDataCols = [...this.getColumns(res["column"])];
          } else {
            this.ngxToaster.warning(res["msg"]);
            this.appliedCriteriaData = [];
            this.appliedCriteriaDataCols = [];
          }
        },
        (err) => {
          console.log("Error in getBanksRoutingForEditApi", err);
        }
      )
      .add(() => {
        setTimeout(() => {
          this.coreService.removeLoadingScreen();
        }, 1000);
      });
  }

  getCriteriaMasterData() {
    this.coreService.displayLoadingScreen();
    forkJoin({
      criteriaMasterData: this.bankRoutingService.getCriteriaMasterData(
        this.formName,
        this.applicationName
      ),
      addBankRouteCriteriaData:
        this.bankRoutingService.getAddBankRouteCriteriaData(),
    })
      .pipe(
        take(1),
        map((response) => {
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

          let crArr = [];
          this.criteriaMapDdlOptions = crArr;

          this.cmCriteriaDataDetails.forEach((element) => {
            let isMandatory = false;
            let isDependent = false;
            let dependencyList = "";
            let dependenceObj = this.criteriaDataDetailsJson.data.dependance;

            if (
              this.cmCriteriaMandatory &&
              this.cmCriteriaMandatory.indexOf(element.fieldName) >= 0
            ) {
              isMandatory = true;
            }
            if (
              Object.keys(dependenceObj).length &&
              dependenceObj[element.fieldName] &&
              dependenceObj[element.fieldName] != "null"
            ) {
              isDependent = true;
              dependencyList = dependenceObj[element.fieldName];
            } else {
              this.independantCriteriaArr.push(element.fieldName);
            }

            if (!isDependent) {
              let selectedKeys = [];
              let allChildDependants = [];

              let childDependants = [element.fieldName];

              let obj: any = {};

              while (childDependants.length) {
                selectedKeys = [];
                selectedKeys = [...childDependants];
                childDependants = [];
                selectedKeys.forEach((selcCrit) => {
                  let filteredKeys = Object.keys(
                    this.cmCriteriaDependency
                  ).filter((key) => this.cmCriteriaDependency[key] == selcCrit);

                  console.log(filteredKeys);
                  let depValues = [];
                  filteredKeys.forEach((filtKey) => {
                    depValues.push(filtKey);
                    childDependants.push(filtKey);
                    obj[this.cmCriteriaDependency[filtKey]] = depValues;
                    allChildDependants.push(selcCrit);
                  });
                });
              }

              let crElm = {
                label: element.fieldName,
                data: element.displayName,
                isMandatory: isMandatory,
                isDependent: isDependent,
                dependencyList: dependencyList,
                children: null,
              };
              crArr.push(crElm);

              if (Object.keys(obj).length) {
                for (const [key, value] of Object.entries(obj)) {
                  let childArr = [];
                  console.log(key, value);
                  (value as []).forEach((deps) => {
                    let isMandatoryC = false;
                    let isDependentC = false;
                    let dependencyListC = "";
                    let dependenceObjC =
                      this.criteriaDataDetailsJson.data.dependance;

                    if (
                      this.cmCriteriaMandatory &&
                      this.cmCriteriaMandatory.indexOf(deps) >= 0
                    ) {
                      isMandatoryC = true;
                    }
                    if (
                      Object.keys(dependenceObjC).length &&
                      dependenceObjC[deps] &&
                      dependenceObjC[deps] != "null"
                    ) {
                      isDependentC = true;
                      dependencyListC = dependenceObjC[deps];
                    }

                    if (
                      this.cmCriteriaDataDetails.filter(
                        (data: { displayName: string; fieldName: string }) => {
                          return data["fieldName"] == deps;
                        }
                      ).length
                    ) {
                      let fieldName = deps;
                      // let displayName = this.cmCriteriaDataDetails.filter(
                      //   (data: { displayName: string; fieldName: string }) => {
                      //     return data["fieldName"] == deps;
                      //   }
                      // )[0]["displayName"];
                      let displayName = null;

                      displayName = Object.keys(criteriaMasterData).filter(
                        (data) => {
                          return data == deps;
                        }
                      )[0];
                      if (!displayName) {
                        if (this.cmCriteriaSlabType.includes(deps)) {
                          displayName = this.cmCriteriaSlabType[0];
                        }
                      }

                      let crElmChild = {
                        label: fieldName,
                        data: displayName,
                        isMandatory: isMandatoryC,
                        isDependent: isDependentC,
                        dependencyList: dependencyListC,
                        children: null,
                      };
                      childArr.push(crElmChild);
                    }
                  });

                  console.log(":::::", childArr);
                  if (childArr.length) {
                    this.findNestedObj(crArr, "label", key)["children"] =
                      childArr;
                  }
                }
              }
            }
          });
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
            this.getBanksRoutingForEditApi(params.id);
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

  findNestedObj(entireObj, keyToFind, valToFind) {
    let foundObj;
    JSON.stringify(entireObj, (_, nestedValue) => {
      if (nestedValue && nestedValue[keyToFind] === valToFind) {
        foundObj = nestedValue;
      }
      return nestedValue;
    });
    return foundObj;
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

  applyCriteria(postDataCriteria: any) {
    this.routeBankCriteriaSearchApi(postDataCriteria);
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
        }, 1000);
      });
  }

  saveCriteriaAsTemplate(templateFormData: any) {
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
    this.bankRoutingService
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

  getColumns(colData: any) {
    let tableCols = [];
    Object.entries(colData).forEach(([key, value], index) => {
      let tableCol = {};
      let stringType = false;
      let selectType = false;
      let formatVal = "";
      let maxWidth = null;
      let minWidth = null;
      if ((value as string).includes("::")) {
        formatVal = (value as string).split("::")[0];
        stringType = false;
        selectType =
          (value as string).split("::")[1] == "select" ? true : false;
        maxWidth = "145px";
        minWidth = "145px";
      } else {
        formatVal = value as string;
        stringType = true;
        selectType = false;
      }
      tableCol = {
        field: formatVal,
        header: key,
        isString: stringType,
        isSelect: selectType,
        minWidth: minWidth ? minWidth : "125px",
      };
      if (maxWidth) {
        tableCol["maxWidth"] = maxWidth;
      }
      tableCols.push(tableCol);
    });
    return tableCols;
  }

  selectedColumn(column, value, index) {
    console.log(column, value, index);
    let selectedColField = column + "Option";
    this.appliedCriteriaData[index][selectedColField] = value["codeName"];
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  reset() {
    this.appliedCriteriaData = [];
    this.appliedCriteriaCriteriaMap = null;
    this.appliedCriteriaIsDuplicate = null;

    this.setCriteriaSharedComponent.resetSetCriteria();
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
      this.ngxToaster.warning("Please Select required fields.");
    } else {
      let service;
      if (this.groupID != "") {
        let data = {
          data: this.appliedCriteriaData,
          duplicate: this.appliedCriteriaIsDuplicate,
          criteriaMap: this.appliedCriteriaCriteriaMap,
          groupID: this.groupID,
        };
        service = this.bankRoutingService.updateRoute(this.userId, data);
        console.log("EDIT MODE - UPDATE CRITERIA SERVICE");
      } else {
        let data = {
          data: this.appliedCriteriaData,
          duplicate: this.appliedCriteriaIsDuplicate,
          criteriaMap: this.appliedCriteriaCriteriaMap,
        };
        service = this.bankRoutingService.addNewRoute(data);
      }

      if (service) {
        service.subscribe(
          (res) => {
            if (res["msg"]) {
              this.ngxToaster.success(res.msg);
              if (action == "save") {
                this.router.navigate([`navbar/bank-routing`]);
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
}
