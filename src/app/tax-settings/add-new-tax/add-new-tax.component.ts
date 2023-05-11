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
  appliedTaxCriteriaDataCols = [];
  appliedTaxCriteriaData = [];

  appliedTaxCriteriaDatajson = {
    data: [
      {
        country: "India",
        taxCode: "T0001",
        state: "Andhra",
        to: "100",
        from: "1",
        tax: "250",
        action: "clone",
        taxType: [
          {
            id: 1,
            code: "GST",
            routeFrom: 1,
            codeName: "GST",
            status: "A",
          },
          {
            id: 2,
            code: "VAT",
            routeFrom: 1,
            codeName: "VAT",
            status: "A",
          },
          {
            id: 3,
            code: "SGST",
            routeFrom: 1,
            codeName: "SGST",
            status: "A",
          },
        ],
        setAs: [
          {
            id: 1,
            code: "Percentage",
            codeName: "Percentage",
            status: "A",
          },
          {
            id: 2,
            code: "Amount",
            codeName: "Amount",
            status: "A",
          },
        ],
        taxTypeOption: "VAT",
        setAsOption: "Amount",
        userId: "yogeshm",
      },
      {
        country: "India",
        taxCode: "T0001",
        state: "Andhra",
        to: "100",
        from: "1",
        tax: "15",
        action: "clone,delete",
        taxType: [
          {
            id: 1,
            code: "GST",
            routeFrom: 1,
            codeName: "GST",
            status: "A",
          },
          {
            id: 2,
            code: "VAT",
            routeFrom: 1,
            codeName: "VAT",
            status: "A",
          },
          {
            id: 3,
            code: "SGST",
            routeFrom: 1,
            codeName: "SGST",
            status: "A",
          },
        ],
        setAs: [
          {
            id: 1,
            code: "Percentage",
            codeName: "Percentage",
            status: "A",
          },
          {
            id: 2,
            code: "Amount",
            codeName: "Amount",
            status: "A",
          },
        ],
        taxTypeOption: "GST",
        setAsOption: "Percentage",
        userId: "yogeshm",
      },
    ],
    column: {
      Country: "country",
      State: "state",
      From: "from",
      To: "to",
      "Tax Type": "taxType::select",
      "Set As": "setAs::select",
      Tax: "tax::input",
      Action: "action::button",
    },
    lcySlab: "LCY Amount",
    criteriaMap:
      "Country = IND;Organization = SBI;Service Category = Bank;Service Type = Any&&&&from:1::to:3#from:4::to:6",
  };
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
    private taxSettingsService: TaxSettingsService
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
    // // this.appliedTaxCriteriaData = this.appliedTaxCriteriaDatajson.data;
    // // this.appliedTaxCriteriaDataCols = [
    // //   ...this.getColumns(this.appliedTaxCriteriaDatajson.column),
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
  //             this.cmCriteriaDataDetails,
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
    postDataCriteria.forEach((val, key) => {
      console.log(key + " : " + val);
    });
    console.log(this.taxDescription);
    this.appliedTaxCriteriaData = this.appliedTaxCriteriaDatajson.data;
    this.appliedTaxCriteriaDataCols = [
      ...this.getColumns(this.appliedTaxCriteriaDatajson.column),]
    
    // this.routeBankCriteriaSearchApi(postDataCriteria);
  }

  // routeBankCriteriaSearchApi(formData: any) {
  //   // this.appliedCriteriaData = [];
  //   // this.appliedCriteriaDataCols = [];
  //   this.coreService.displayLoadingScreen();
  //   this.taxSettingsService
  //     .postRouteBankCriteriaSearch(formData)
  //     .subscribe(
  //       (res) => {
  //         console.log("criteriasearch DATA", res);
  //         if (!res["msg"]) {
  //           if (!res["duplicate"]) {
  //             // this.appliedCriteriaDataOrg = [...res["data"]];
  //             // this.appliedCriteriaData = [...res["data"]];
  //             // this.appliedCriteriaCriteriaMap = res["criteriaMap"];
  //             // this.appliedCriteriaIsDuplicate = res["duplicate"];
  //             // this.appliedCriteriaDataCols = [
  //             //   ...this.getColumns(res["column"]),
  //             // ];
  //             this.ngxToaster.success(`Criteria Applied Successfully`);
  //           } else {
  //             // this.appliedCriteriaData = [];
  //             // this.appliedCriteriaCriteriaMap = null;
  //             // this.appliedCriteriaIsDuplicate = null;
  //             // this.appliedCriteriaDataCols = [];
  //             this.ngxToaster.warning("Applied criteria already exists.");
  //           }
  //         } else {
  //           this.ngxToaster.warning(res["msg"]);
  //           // this.appliedCriteriaData = [];
  //         }
  //       },
  //       (err) => {
  //         console.log("error in BankCriteriaSearchApi", err);
  //       }
  //     )
  //     .add(() => {
  //       setTimeout(() => {
  //         this.coreService.removeLoadingScreen();
  //       }, 250);
  //     });
  // }

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

  // suresh Work start -->
  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
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
      let buttonType = false;
      let inputType = false;
      if ((value as string).includes("::")) {
        formatVal = (value as string).split("::")[0];
        stringType = false;
        selectType =
          (value as string).split("::")[1] == "select" ? true : false;
        inputType = (value as string).split("::")[1] == "input" ? true : false;
        buttonType =
          (value as string).split("::")[1] == "button" ? true : false;
        maxWidth = "145px";
        minWidth = "145px";
      } else {
        formatVal = value as string;
        stringType = true;
        selectType = false;
        inputType = false;
        buttonType = false;
      }
      tableCol = {
        field: formatVal,
        header: key,
        isString: stringType,
        isSelect: selectType,
        isInput: inputType,
        isButton: buttonType,
        minWidth: minWidth ? minWidth : "125px",
      };
      if (maxWidth) {
        tableCol["maxWidth"] = maxWidth;
      }
      tableCols.push(tableCol);
    });
    console.log(tableCols);
    return tableCols;
  }
  selectedColumn(inputCol, value, index) {
    console.log(inputCol, value, index);
    this.appliedTaxCriteriaData[index][inputCol] = 0;
  }
  // suresh Work end -->
}
