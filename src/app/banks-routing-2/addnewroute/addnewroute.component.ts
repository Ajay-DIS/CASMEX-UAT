import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CoreService } from "src/app/core.service";

import { BankRoutingService } from "../bank-routing.service";
import { TransactionCriteriaModal2 } from "../transaction-criteria-modal/transaction-criteria-modal";
import { Table } from "primeng/table";
import { CriteriaTemplateData } from "../banks-routing.model";
import { map, take } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { ConfirmDialog } from "primeng/confirmdialog";
import { Dropdown } from "primeng/dropdown";
import { Tooltip } from "primeng/tooltip";

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
  bankRoutesData: any = [];
  editBankRouteApiData: any = [];

  lcySlab = null;
  isSelectedRouteToBankName = false;
  isSelectedRouteToServiceCategory = false;
  apiResponse: any = {};
  hideValuesDropdown = false;
  showValueInput = false;
  isSlabControlSelected = false;
  criteriaText: any[] = [];
  criteriaCodeText: any[] = [];
  finalCriteriaCodeText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  criteriaOperations: any[] = [];
  saveTemplateDialogOpen = false;
  userId = "";
  criteriaName = "";
  criteriaTemplatesDdlOptions: any = [];
  criteriaMapDdlOptions = [];
  criteriaEqualsDdlOptions = [];
  correspondentDdlOptions = [];
  selectedRowColumn: {
    routeToBankName: boolean;
    routeToServiceCategory: boolean;
    routeToServiceType: boolean;
  }[] = [];

  criteriaDataDetailsJson: any = {};

  cmCriteriaDataDetails: any = [];
  cmCriteriaSlabType: any = [];

  cmCriteriaMandatory = [];

  savedSlabs = false;
  nullRange = true;
  isSlabsCriteria = false;

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;

  selectCriteriaForm: any;
  validCriteria = false;
  validSlabAmount = false;

  removeAddCriteriaListener: any;
  AddCriteriaClickListener: boolean = false;

  routeToBankNameOption = [];
  routeToServiceCategoryOption = [];
  routeToServiceTypeOption = [];
  groupID = "";

  $oninitSlabFormSubscription: any;
  mode = "add";

  selectedTemplate = this.criteriaTemplatesDdlOptions.length
    ? "Select Template"
    : "No saved templates";

  criteriaMasterData: any = {};
  cmCriteriaDependency: any = {};

  independantCriteriaArr: any = [];

  savingCriteriaTemplateError = null;

  constructor(
    private bankRoutingService: BankRoutingService,
    private activatedRoute: ActivatedRoute,
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private fb: UntypedFormBuilder,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private confirmationService: ConfirmationService
  ) {}

  @ViewChild("cd") cd: ConfirmDialog;
  @ViewChild("addCriteriaBtn") addCriteriaBtn: ElementRef;

  ngOnInit(): void {
    this.mode = "add";
    this.getCriteriaMasterData();
    this.setSelectAppForm1();
    this.route.data.subscribe((data) => {
      this.coreService.setBreadCrumbMenu(Object.values(data));
    });

    this.$oninitSlabFormSubscription = this.bankRoutingService
      .getTransactionCriteriaRange()
      .subscribe((res) => {
        this.txnCriteriaRangeFormData = res;
        if (!!Object.keys(this.txnCriteriaRangeFormData).length) {
          this.txnCriteriaRangeFormData["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              this.savedSlabs = true;
            } else {
              this.savedSlabs = false;
            }
          });
        } else {
          this.savedSlabs = false;
        }
      });
    this.userId = JSON.parse(localStorage.getItem("userData"))["userId"];
    this.getAllTemplates();
  }
  setSelectAppForm1() {
    this.selectCriteriaForm = this.fb.group({
      criteria: new UntypedFormControl({ value: "", disabled: false }, [
        Validators.required,
      ]),
      operation: new UntypedFormControl(
        { value: "", disabled: !this.criteriaEqualsDdlOptions.length },
        [Validators.required]
      ),
      value: new UntypedFormControl(
        { value: "", disabled: !this.correspondentDdlOptions.length },
        [Validators.required]
      ),
    });
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

            this.criteriaCodeText = this.setCriteriaMap(
              this.editBankRouteApiData
            );

            this.criteriaText = this.decodeFormattedCriteria(
              this.criteriaCodeText
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
        }, 250);
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

  get criteriaCtrl() {
    return this.selectCriteriaForm.get("criteria");
  }
  get operationCtrl() {
    return this.selectCriteriaForm.get("operation");
  }
  get valueCtrl() {
    return this.selectCriteriaForm.get("value");
  }

  addCriteriaMap() {
    console.log(this.operationCtrl.value);
    let value = "";
    let valueCode = "";
    if (this.cmCriteriaSlabType.includes(this.criteriaCtrl.value.label)) {
      if (this.operationCtrl.value.name == "Slab") {
        value = "Slab";
        valueCode = "Slab";
      } else {
        value = this.valueCtrl.value;
        valueCode = this.valueCtrl.value;
      }
    } else {
      value = this.valueCtrl.value.name;
      valueCode = this.valueCtrl.value.code;
    }

    console.log(value, valueCode);
    let criteria =
      this.criteriaCtrl.value.label +
      " " +
      this.operationCtrl.value.code +
      " " +
      value;
    let criteriaCode =
      this.criteriaCtrl.value.label +
      " " +
      this.operationCtrl.value.code +
      " " +
      valueCode;
    let index = this.criteriaText.indexOf(criteria);
    //validations
    if (this.criteriaText.length && index != -1) {
      this.ngxToaster.warning(
        criteria + " already added, please add different case"
      );
    } else if (this.criteriaText.length) {
      this.validCriteria = true;
      this.validSlabAmount = true;
      let splitdata;
      if (criteria.includes("!=")) {
        splitdata = criteria.replace(/[!=]/g, "");
      } else if (criteria.includes("<=")) {
        splitdata = criteria.replace(/[<=]/g, "");
      } else if (criteria.includes(">=")) {
        splitdata = criteria.replace(/[>=]/g, "");
      } else if (criteria.includes("<")) {
        splitdata = criteria.replace(/[<]/g, "");
      } else if (criteria.includes(">")) {
        splitdata = criteria.replace(/[>]/g, "");
      } else {
        splitdata = criteria.replace(/[=]/g, "");
      }

      if (
        criteria.includes("<=") ||
        criteria.includes(">=") ||
        criteria.includes("<") ||
        criteria.includes(">")
      ) {
        this.validCriteria = true;
        this.validSlabAmount = true;
        this.criteriaText.every((element) => {
          let splitText;
          if (criteria.includes("!=")) {
            splitText = element.replace(/[!=]/g, "");
          } else if (element.includes("<=")) {
            splitText = element.replace(/[<=]/g, "");
          } else if (element.includes(">=")) {
            splitText = element.replace(/[>=]/g, "");
          } else if (element.includes("<")) {
            splitText = element.replace(/[<]/g, "");
          } else if (element.includes(">")) {
            splitText = element.replace(/[>]/g, "");
          } else {
            splitText = element.replace(/[=]/g, "");
          }

          console.log("greater less condition", splitText);
          if (
            splitText.split("  ")[0] == splitdata.split("  ")[0] &&
            splitdata.split("  ")[1] == "Slab"
          ) {
            console.log("greater less condition slab");
            this.ngxToaster.warning(
              "Please delete existing criteria " +
                element +
                ", then add " +
                criteria
            );
            this.validCriteria = false;
            this.validSlabAmount = false;

            return false;
          } else if (
            splitText.split("  ")[0] == splitdata.split("  ")[0] &&
            splitText.split("  ")[1] == "Slab"
          ) {
            console.log("greater less condition not slab but slab present");
            this.ngxToaster.warning(
              "Please delete existing criteria " +
                element +
                ", then add " +
                criteria
            );
            this.validCriteria = false;
            this.validSlabAmount = false;
            return false;
          } else if (
            splitText.split("  ")[0] == splitdata.split("  ")[0] &&
            this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
          ) {
            console.log(
              "greater less condition not slab but slab not present",
              element
            );
            this.validCriteria = true;
            return true;
          }
          else {
            return true;
          }
        });
      } else {
        let isCurrentCriteriaNotEqualCondition = false;
        let isCurrentCriteriaEqualCondition = false;

        if (criteria.includes("!=")) {
          isCurrentCriteriaNotEqualCondition = true;
        } else {
          isCurrentCriteriaEqualCondition = true;
        }

        this.criteriaText.every((element) => {
          let splitText;
          if (element.includes("!=")) {
            splitText = element.replace(/[!=]/g, "");
          } else if (element.includes("<=")) {
            splitText = element.replace(/[<=]/g, "");
          } else if (element.includes(">=")) {
            splitText = element.replace(/[>=]/g, "");
          } else if (element.includes("<")) {
            splitText = element.replace(/[<]/g, "");
          } else if (element.includes(">")) {
            splitText = element.replace(/[>]/g, "");
          } else {
            splitText = element.replace(/[=]/g, "");
          }

          if (splitText.split("  ")[0] == splitdata.split("  ")[0]) {
            if (splitText.split("  ")[1] == splitdata.split("  ")[1]) {
              this.ngxToaster.warning(
                " Please select different criteria for " +
                  splitdata.split("  ")[0]
              );
              this.validCriteria = false;
              return false;
            } else {
              if (
                splitdata.split("  ")[1] == "Slab" &&
                this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
              ) {
                console.log("adding one slab but lcy other than slab present ");
                this.ngxToaster.warning(
                  "Please delete existing criteria " +
                    element +
                    ", then add " +
                    criteria
                );
                this.validCriteria = false;
                return false;
              }

              let isAlreadyCriteriaNotEqualCondition = false;
              let isAlreadyCriteriaEqualCondition = false;

              if (element.includes("!=")) {
                isAlreadyCriteriaNotEqualCondition = true;
              } else if (element.includes(" = ")) {
                isAlreadyCriteriaEqualCondition = true;
              }

              if (
                isCurrentCriteriaEqualCondition &&
                isAlreadyCriteriaEqualCondition
              ) {
                console.log("adding one more equal crit ");
                this.ngxToaster.warning(
                  "Please delete existing criteria " +
                    element +
                    ", then add " +
                    criteria
                );
                this.validCriteria = false;
                return false;
              } else if (
                isAlreadyCriteriaEqualCondition ==
                  !isCurrentCriteriaEqualCondition &&
                isAlreadyCriteriaNotEqualCondition ==
                  !isCurrentCriteriaNotEqualCondition
              ) {
                if (
                  this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
                ) {
                  this.ngxToaster.warning(
                    "Please delete existing criteria " +
                      element +
                      ", then add " +
                      criteria
                  );
                  this.validCriteria = false;
                  return false;
                } else {
                  console.log("::new validation passed");
                }
              } else {
                if (
                  !(
                    splitText.split("  ")[1] != "Any" &&
                    splitdata.split("  ")[1] != "Any"
                  )
                ) {
                  this.ngxToaster.warning(
                    "Please delete existing criteria " +
                      element +
                      ", then add " +
                      criteria
                  );
                  this.validCriteria = false;
                  return false;
                } else {
                  return true;
                }
              }
            }
          } else {
            return true;
          }
        });
      }
      if (this.validCriteria) {
        this.checkSlabCriteria(criteria, criteriaCode);
      }
    } else {
      this.checkSlabCriteria(criteria, criteriaCode);
    }
  }

  checkSlabCriteria(criteria: any, criteriaCode: any) {
    if (this.isSlabsCriteria) {
      if (this.$oninitSlabFormSubscription) {
        this.$oninitSlabFormSubscription.unsubscribe();
      }

      this.bankRoutingService.getTransactionCriteriaRange().subscribe((res) => {
        console.log("::::getTransactionRange called in checking", res);
        this.txnCriteriaRangeFormData = res;

        if (!!Object.keys(res).length) {
          console.log("rng data present");
          res["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              console.log("rng data present not null");
              this.savedSlabs = true;
            } else {
              console.log("rng data present null");
              this.savedSlabs = false;
            }
          });
        } else {
          console.log("rng data absent");
          this.savedSlabs = false;
        }

        if (this.savedSlabs) {
          console.log("lcy present");
          if (
            !this.criteriaText.filter(
              (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
            ).length
          ) {
            this.criteriaText.push(criteria);
            this.criteriaCodeText.push(criteriaCode);
            this.resetCriteriaDropdowns();
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          } else {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
        } else {
          console.log(
            "lcy absent",
            this.removeAddCriteriaListener,
            this.AddCriteriaClickListener
          );
          if (!this.AddCriteriaClickListener) {
            console.log("eventlistener absent");
            this.removeAddCriteriaListener = this.renderer.listen(
              this.addCriteriaBtn.nativeElement,
              "click",
              (evt) => {
                this.showTransCriteriaModal();
              }
            );
            this.AddCriteriaClickListener = true;
          }
        }
      });
    } else {
      this.criteriaText.push(criteria);
      this.criteriaCodeText.push(criteriaCode);
      this.resetCriteriaDropdowns();
    }
  }

  isCriteriaSelectable(event: any) {
    let formattedCriteriaArr = [];
    formattedCriteriaArr = this.criteriaCodeText.map((crt) => {
      let formatCrt;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
      } else {
        formatCrt = crt.replace(/[=]/g, "");
      }
      return formatCrt.split("  ")[0];
    });

    console.log(
      formattedCriteriaArr,
      this.cmCriteriaDependency,
      event["label"]
    );

    if (Object.keys(this.cmCriteriaDependency).includes(event["label"])) {
      console.log(
        formattedCriteriaArr,
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["label"]])
      );
      if (
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["label"]])
      ) {
        if (formattedCriteriaArr.includes(event["label"])) {
          console.log("Dependant, same criteria present");
          return true;
        } else {
          return true;
        }
      } else {
        this.ngxToaster.warning(
          `${event["label"]} is dependant on ${
            this.cmCriteriaDependency[event["label"]]
          }, Select it first.`
        );
        return false;
      }
    } else {
      console.log(
        formattedCriteriaArr.includes(event["label"]),
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["label"]])
      );
      if (
        formattedCriteriaArr.includes(
          this.cmCriteriaDependency[event["label"]]
        ) ||
        formattedCriteriaArr.includes(event["label"])
      ) {
        console.log("Indepandant, same criteria present");
        return true;
      }
      return true;
    }
  }

  onCriteriaSelect(event: any) {
    console.log("::criteria", event, this.cmCriteriaDependency);
    this.hideValuesDropdown = false;
    this.showValueInput = false;
    if (this.isCriteriaSelectable(event)) {
      this.onChange("criteria", event);
    } else {
      this.resetCriteriaDropdowns();
    }
  }

  getCorrespondentValues(fieldName: any, displayName: any) {
    // let criteriaMapValue = "Country = IND;Organization = SBI;State = Any;State != MH";
    let criteriaMapValue = this.criteriaCodeText.join(";");

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
            this.valueCtrl.enable();
            this.hideValuesDropdown = false;
            this.showValueInput = false;

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
    this.criteriaCtrl.reset();
    this.operationCtrl.reset();
    this.valueCtrl.reset();
    this.valueCtrl.disable();
    this.operationCtrl.disable();
    this.correspondentDdlOptions = [];
    if (this.AddCriteriaClickListener) {
      this.removeAddCriteriaListener();
      this.AddCriteriaClickListener = false;
    }
  }

  onChange(controlId, event) {
    switch (controlId) {
      case "criteria":
        let selectedCorrespondent = this.cmCriteriaDataDetails.filter(
          (x) => event.data == x.fieldName
        );
        let operations;
        this.hideValuesDropdown = false;
        this.showValueInput = false;
        if (
          this.cmCriteriaSlabType.includes(selectedCorrespondent[0].fieldName)
        ) {
          this.isSlabControlSelected = true;
          console.log("LCY control selected", this.isSlabControlSelected);
          operations = selectedCorrespondent[0].operations.split(",");
          this.valueCtrl.reset();
          this.valueCtrl.disable();
          this.correspondentDdlOptions = [];
        } else {
          console.log(
            "other control selected, is LCY",
            this.isSlabControlSelected
          );
          this.isSlabControlSelected = false;
          this.correspondentDdlOptions = [];
          this.valueCtrl.patchValue("");
          this.getCorrespondentValues(event.label, event.data);
          operations = selectedCorrespondent[0].operations.split(",");
        }
        this.criteriaEqualsDdlOptions = [];
        console.log("corres", selectedCorrespondent);
        this.operationCtrl.patchValue("");
        if (operations.length) {
          this.operationCtrl.enable();
          operations.forEach((opr) => {
            let oprCode = "=";
            switch (opr) {
              case "Is Equal To":
                oprCode = "=";
                break;
              case "Is Not Equal To":
                oprCode = "!=";
                break;
              case "Is Greater Than":
                oprCode = ">";
                break;
              case "Is Greater Than Equal To":
                oprCode = ">=";
                break;
              case "Is Less Than":
                oprCode = "<";
                break;
              case "Is Less Than Equal To":
                oprCode = "<=";
                break;
              case "Slab":
                oprCode = "=";
                break;
            }
            this.criteriaEqualsDdlOptions.push({
              name: opr,
              code: oprCode,
            });
          });
        } else {
          this.operationCtrl.disable();
        }
        break;

      case "condition":
        this.hideValuesDropdown = false;
        this.showValueInput = false;
        if (
          event.name == "Slab" &&
          !this.criteriaText.filter(
            (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
          ).length
        ) {
          if (
            event.name == "Slab" &&
            this.criteriaText.filter((criteria) => {
              let splitText;
              if (criteria.includes("!=")) {
                splitText = criteria.replace(/[!=]/g, "");
              } else if (criteria.includes("<=")) {
                splitText = criteria.replace(/[<=]/g, "");
              } else if (criteria.includes(">=")) {
                splitText = criteria.replace(/[>=]/g, "");
              } else if (criteria.includes("<")) {
                splitText = criteria.replace(/[<]/g, "");
              } else if (criteria.includes(">")) {
                splitText = criteria.replace(/[>]/g, "");
              } else {
                splitText = criteria.replace(/[=]/g, "");
              }
              return this.cmCriteriaSlabType.includes(splitText.split("  ")[0]);
            }).length
          ) {
            console.log("selected slab but already LCY that is not slab");
            this.hideValuesDropdown = true;
            if (this.AddCriteriaClickListener) {
              this.removeAddCriteriaListener();
              this.AddCriteriaClickListener = false;
            }
            this.isSlabsCriteria = true;
          } else {
            this.isSlabsCriteria = true;
            this.valueCtrl.disable();
            this.hideValuesDropdown = true;
            this.showValueInput = false;
            if (!this.AddCriteriaClickListener) {
              this.removeAddCriteriaListener = this.renderer.listen(
                this.addCriteriaBtn.nativeElement,
                "click",
                (evt) => {
                  this.showTransCriteriaModal();
                }
              );
              this.AddCriteriaClickListener = true;
            }
          }
        } else if (event.name == "Slab") {
          console.log("slab but already LCY");
          console.log("listner", this.AddCriteriaClickListener);
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = true;
          this.valueCtrl.disable();
          this.hideValuesDropdown = true;
          this.showValueInput = false;
        } else if (this.isSlabControlSelected) {
          console.log("Insert Input Text for Value");
          this.valueCtrl.enable();
          this.hideValuesDropdown = true;
          this.showValueInput = true;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = false;
        } else {
          this.hideValuesDropdown = false;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = false;
        }
        break;
      default:
        break;
    }
  }

  ondeletecriteria(i: any, criteria: any) {
    if (this.AddCriteriaClickListener) {
      this.removeAddCriteriaListener();
      this.AddCriteriaClickListener = false;
    }
    if (criteria == `${this.cmCriteriaSlabType[0]} = Slab`) {
      this.savedSlabs = false;

      this.bankRoutingService.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
    }

    let arr2 = [...this.criteriaText];
    let arr1 = [...this.independantCriteriaArr];
    let independantIndexes = [];

    arr2.forEach((arr2Item, i) => {
      arr1.forEach((arr1Item) => {
        if (arr1Item.includes(arr2Item.split(" ")[0])) {
          independantIndexes.push(i);
          console.log(arr2Item, arr1Item, i);
        }
      });
    });

    let formatCrt;

    if (this.criteriaText[i].includes("!=")) {
      formatCrt = this.criteriaText[i].replace(/[!=]/g, "");
    } else if (this.criteriaText[i].includes(">=")) {
      formatCrt = this.criteriaText[i].replace(/[>=]/g, "");
    } else if (this.criteriaText[i].includes("<=")) {
      formatCrt = this.criteriaText[i].replace(/[<=]/g, "");
    } else if (this.criteriaText[i].includes("<")) {
      formatCrt = this.criteriaText[i].replace(/[<]/g, "");
    } else if (this.criteriaText[i].includes(">")) {
      formatCrt = this.criteriaText[i].replace(/[>]/g, "");
    } else {
      formatCrt = this.criteriaText[i].replace(/[=]/g, "");
    }

    console.log(
      Object.values(this.cmCriteriaDependency),
      formatCrt.split("  ")[0],
      independantIndexes
    );

    if (
      Object.values(this.cmCriteriaDependency).includes(
        formatCrt.split("  ")[0]
      )
    ) {
      console.log("dependant");
      this.confirmationService.confirm({
        message: `All dependant criteria will be deleted, you want to delete ?`,
        key: "criteriaDeleteConfirm",
        accept: () => {
          this.deleteCriteria(formatCrt, criteria);
        },
      });
    } else {
      this.criteriaText.splice(i, 1);
      this.criteriaCodeText.splice(i, 1);
    }

    console.log(this.independantCriteriaArr, this.criteriaText);

    this.resetCriteriaDropdowns();
  }

  deleteCriteria(formatCrt, criteria) {
    let applicableKeys = [...Object.keys(this.cmCriteriaDependency)];
    let selectedKeys = [];
    let allChildDependants = [];

    let childDependants = [formatCrt.split("  ")[0]];

    while (childDependants.length) {
      selectedKeys = [];
      selectedKeys = [...childDependants];
      childDependants = [];
      selectedKeys.forEach((selcCrit) => {
        applicableKeys.forEach((applCrit) => {
          if (this.cmCriteriaDependency[applCrit] === selcCrit) {
            childDependants.push(applCrit);
            allChildDependants.push(applCrit);
          }
        });
      });
    }

    let critTxt = [...this.criteriaText];
    let critCodeTxt = [...this.criteriaCodeText];
    let removeCrit = [];
    let removeCodeCrit = [];

    allChildDependants = [
      ...Array.from(new Set(allChildDependants)),
      formatCrt.split("  ")[0],
    ];

    critTxt.forEach((crtTxt) => {
      let formatCrt;

      if (crtTxt.includes("!=")) {
        formatCrt = crtTxt.replace(/[!=]/g, "");
      } else if (crtTxt.includes(">=")) {
        formatCrt = crtTxt.replace(/[>=]/g, "");
      } else if (crtTxt.includes("<=")) {
        formatCrt = crtTxt.replace(/[<=]/g, "");
      } else if (crtTxt.includes("<")) {
        formatCrt = crtTxt.replace(/[<]/g, "");
      } else if (crtTxt.includes(">")) {
        formatCrt = crtTxt.replace(/[>]/g, "");
      } else {
        formatCrt = crtTxt.replace(/[=]/g, "");
      }

      formatCrt = formatCrt.split("  ")[0];
      allChildDependants.forEach((deps) => {
        let displayName = this.cmCriteriaDataDetails.filter((data) => {
          return data["fieldName"] == formatCrt.split("  ")[0];
        })[0]["displayName"];
        if (deps == displayName) {
          removeCrit.push(crtTxt);
        }
      });
    });

    critCodeTxt.forEach((crtCodeTxt) => {
      let formatCrt;

      if (crtCodeTxt.includes("!=")) {
        formatCrt = crtCodeTxt.replace(/[!=]/g, "");
      } else if (crtCodeTxt.includes(">=")) {
        formatCrt = crtCodeTxt.replace(/[>=]/g, "");
      } else if (crtCodeTxt.includes("<=")) {
        formatCrt = crtCodeTxt.replace(/[<=]/g, "");
      } else if (crtCodeTxt.includes("<")) {
        formatCrt = crtCodeTxt.replace(/[<]/g, "");
      } else if (crtCodeTxt.includes(">")) {
        formatCrt = crtCodeTxt.replace(/[>]/g, "");
      } else {
        formatCrt = crtCodeTxt.replace(/[=]/g, "");
      }

      formatCrt = formatCrt.split("  ")[0];
      allChildDependants.forEach((deps) => {
        if (deps == formatCrt) {
          removeCodeCrit.push(crtCodeTxt);
        }
      });
    });

    this.criteriaText = this.criteriaText.filter((el) => {
      return !removeCrit.includes(el);
    });
    this.criteriaCodeText = this.criteriaCodeText.filter((el) => {
      return !removeCodeCrit.includes(el);
    });

    console.log("::to remove crit", removeCrit);

    console.log("::remaining crit ", this.criteriaText);

    this.ngxToaster.warning(
      `All dependent values of ${criteria} has been removed`
    );
  }

  saveCriteriaTemplateLink() {
    if (this.criteriaText.length) {
      this.coreService.setHeaderStickyStyle(false);
      this.coreService.setSidebarBtnFixedStyle(false);
      this.saveTemplateDialogOpen = true;
    } else {
      this.ngxToaster.warning("Please add criteria.");
    }
  }

  checkMandatoryCondition(formattedCriteriaArr: any) {
    console.log(formattedCriteriaArr);
    if (
      this.cmCriteriaMandatory.every((r) => formattedCriteriaArr.includes(r))
    ) {
      let finalFormattedCriteriaObj = this.createFormattedCriteriaMap();
      return finalFormattedCriteriaObj;
    } else {
      this.ngxToaster.warning(
        `Please add all mandatory criteria for applying the criteria. Mandatory criteria are ${this.cmCriteriaMandatory.join(
          ", "
        )}`
      );
      return false;
    }
  }

  createFormattedCriteriaMap() {
    console.log(this.finalCriteriaCodeText);
    let criteriaObj = {};
    criteriaObj["slabs"] = null;
    criteriaObj["lcyOpr"] = null;
    if (
      this.finalCriteriaCodeText.filter(
        (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
      ).length
    ) {
      criteriaObj["slabs"] = this.txnCriteriaRangeFormData["txnCriteriaRange"];
    } else if (
      this.finalCriteriaCodeText.filter((criteria) => {
        return (
          criteria.includes(this.cmCriteriaSlabType[0]) &&
          !(criteria == `${this.cmCriteriaSlabType[0]} = Slab`)
        );
      }).length
    ) {
      let lcyOprArr = [];
      this.finalCriteriaCodeText.forEach((criteria) => {
        if (
          criteria.includes(this.cmCriteriaSlabType[0]) &&
          !(criteria == `${this.cmCriteriaSlabType[0]} = Slab`)
        ) {
          lcyOprArr.push(criteria);
        }
      });
      if (lcyOprArr.length) {
        criteriaObj["lcyOpr"] = lcyOprArr.join(";");
      }
    }

    criteriaObj["criteriaMap"] = this.finalCriteriaCodeText
      .filter((criteria) => {
        return !criteria.includes(this.cmCriteriaSlabType[0]);
      })
      .join(";");

    return criteriaObj;
  }

  checkDependanceCondition(formattedCriteriaArr: any) {
    let dependencyCheckPassed = true;

    let containsAll = (arr1, arr2) =>
      arr2.every((arr2Item) => arr1.includes(arr2Item));

    Object.keys(this.criteriaDataDetailsJson.data.dependance).forEach(
      (dependantCrt) => {
        if (
          formattedCriteriaArr.includes(dependantCrt) &&
          this.criteriaDataDetailsJson.data.dependance[dependantCrt] != "null"
        ) {
          if (
            containsAll(
              formattedCriteriaArr,
              this.criteriaDataDetailsJson.data.dependance[dependantCrt].split(
                ","
              )
            )
          ) {
            console.log(
              "And its dependant is also present",
              this.criteriaDataDetailsJson.data.dependance[dependantCrt]
            );
          } else {
            dependencyCheckPassed = false;
            this.ngxToaster.warning(
              `${dependantCrt} is dependant on ${this.criteriaDataDetailsJson.data.dependance[dependantCrt]}, Please select that also`
            );
            return dependencyCheckPassed;
          }
        }
      }
    );
    return dependencyCheckPassed;
  }

  createFormattedCriteria() {
    this.finalCriteriaCodeText = [];
    let formattedCriteriaArr = this.criteriaText.map((crt) => {
      let formatCrt;
      let opr;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
        opr = "!=";
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
        opr = ">=";
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
        opr = "<=";
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
        opr = "<";
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
        opr = ">";
      } else {
        formatCrt = crt.replace(/[=]/g, "");
        opr = "=";
      }

      let formatCodeText;
      if (
        Object.keys(this.criteriaMasterData).includes(formatCrt.split("  ")[0])
      ) {
        Object.keys(this.criteriaMasterData).forEach((field) => {
          if (field == formatCrt.split("  ")[0]) {
            this.criteriaMasterData[field].forEach((val) => {
              if (formatCrt.split("  ")[1] == "Any") {
                formatCodeText =
                  formatCrt.split("  ")[0] +
                  " " +
                  opr +
                  " " +
                  formatCrt.split("  ")[1];
              } else if (val["codeName"] == formatCrt.split("  ")[1]) {
                formatCodeText =
                  formatCrt.split("  ")[0] + " " + opr + " " + val["code"];
              }
            });
          }
        });
      } else {
        formatCodeText =
          formatCrt.split("  ")[0] + " " + opr + " " + formatCrt.split("  ")[1];
      }
      if (formatCodeText) {
        this.finalCriteriaCodeText.push(formatCodeText);
      }
      return formatCrt.split("  ")[0];
    });

    return formattedCriteriaArr;
  }

  decodeFormattedCriteria(criteriaCodeText: any) {
    let decodedFormattedCriteriaArr = criteriaCodeText.map((crt) => {
      let formatCrt;
      let opr;
      if (crt.includes("!=")) {
        formatCrt = crt.replace(/[!=]/g, "");
        opr = "!=";
      } else if (crt.includes(">=")) {
        formatCrt = crt.replace(/[>=]/g, "");
        opr = ">=";
      } else if (crt.includes("<=")) {
        formatCrt = crt.replace(/[<=]/g, "");
        opr = "<=";
      } else if (crt.includes("<")) {
        formatCrt = crt.replace(/[<]/g, "");
        opr = "<";
      } else if (crt.includes(">")) {
        formatCrt = crt.replace(/[>]/g, "");
        opr = ">";
      } else {
        formatCrt = crt.replace(/[=]/g, "");
        opr = "=";
      }

      let decodeCriteriaText;
      let displayName = null;

      displayName = Object.keys(this.criteriaMasterData).filter((data) => {
        return data == formatCrt.split("  ")[0];
      })[0];
      if (!displayName) {
        if (this.cmCriteriaSlabType.includes(formatCrt.split("  ")[0])) {
          displayName = this.cmCriteriaSlabType[0];
        }
      }
      if (
        Object.keys(this.criteriaMasterData).includes(formatCrt.split("  ")[0])
      ) {
        Object.keys(this.criteriaMasterData).forEach((field) => {
          if (field == formatCrt.split("  ")[0]) {
            this.criteriaMasterData[field].forEach((val) => {
              if (formatCrt.split("  ")[1] == "Any") {
                decodeCriteriaText =
                  displayName + " " + opr + " " + formatCrt.split("  ")[1];
              } else if (val["code"] == formatCrt.split("  ")[1]) {
                decodeCriteriaText =
                  displayName + " " + opr + " " + val["codeName"];
              }
            });
          }
        });
      } else {
        decodeCriteriaText =
          displayName + " " + opr + " " + formatCrt.split("  ")[1];
      }
      return decodeCriteriaText;
    });
    return decodedFormattedCriteriaArr;
  }

  applyCriteria() {
    this.resetCriteriaDropdowns();

    let formattedCriteriaArr = this.createFormattedCriteria();

    console.log("::: criteriaMasterData", this.criteriaMasterData);
    console.log("::: formattedCriteriaArr", formattedCriteriaArr);
    console.log("::: criteriaText", this.criteriaText);
    console.log("::: finalCriteriaCodeText", this.finalCriteriaCodeText);

    let finalCriteriaObj;

    if (this.checkMandatoryCondition(formattedCriteriaArr)) {
      finalCriteriaObj = this.checkMandatoryCondition(formattedCriteriaArr);
      console.log(
        "mandatory passed",
        this.checkMandatoryCondition(formattedCriteriaArr)
      );
      if (this.checkDependanceCondition(formattedCriteriaArr)) {
        console.log("mandatory and dependance passed");
        const postDataCriteria = new FormData();

        let criteriaMap = finalCriteriaObj.criteriaMap;
        let slabText = null;
        let lcyOpr = null;
        let NEWcriteriaMap = null;

        if (finalCriteriaObj.slabs) {
          let slabs = finalCriteriaObj.slabs;
          let slabArr = [];
          slabs.forEach((slab) => {
            let rngArr = [];
            Object.entries(slab).forEach((rng) => {
              rngArr.push(rng.join(":"));
            });
            slabArr.push(rngArr.join("::"));
          });
          slabText = slabArr.join("#");
          NEWcriteriaMap = criteriaMap + "&&&&" + slabText;
        } else if (finalCriteriaObj.lcyOpr) {
          lcyOpr = finalCriteriaObj.lcyOpr;
          NEWcriteriaMap = criteriaMap + "&&&&" + lcyOpr;
        } else {
          NEWcriteriaMap = criteriaMap;
        }

        // postDataCriteria.append(
        //   "criteriaMap",
        //   "Country = IND;Organization = SBI;Currency = Rupee;Service Category = Bank;Service Type = NEFT;State = MH;City = MUM;Branch = B1&&&&LCY Amount = 20;LCY Amount != 200"
        // );
        // postDataCriteria.append(
        //   "criteriaMap",
        //   "Country = IND;Organization = SBI;Currency = Rupee;Service Category = Bank;Service Type = NEFT;State = MH;City = MUM;Branch = B1&&&&from:1::to:5#from:6::to:8#from:9::to:10"
        // );
        postDataCriteria.append("criteriaMap", NEWcriteriaMap);
        postDataCriteria.append("userId", this.userId);

        // this.lcySlab = slabText;
        // postDataCriteria.set("lcySlab", slabText);
        this.routeBankCriteriaSearchApi(postDataCriteria);
      } else {
        this.appliedCriteriaData = [];
      }
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

  saveCriteriaAsTemplate() {
    if (this.criteriaName == "") {
      // this.ngxToaster.warning("Name of Criteria Template cannot be Empty");
      this.savingCriteriaTemplateError =
        "Name of Criteria Template cannot be Empty";
      // return;
    } else {
      this.savingCriteriaTemplateError = null;
      let formattedCriteriaArr = this.createFormattedCriteria();
      console.log("::: finalCriteriaCodeText", this.finalCriteriaCodeText);
      let finalCriteriaMapObj: any = this.createFormattedCriteriaMap();

      console.log(finalCriteriaMapObj);

      let criteriaMap = finalCriteriaMapObj.criteriaMap;
      let slabText = null;
      let lcyOpr = null;
      let NEWcriteriaMap = null;
      this.lcySlab = null;

      if (finalCriteriaMapObj.slabs) {
        let slabs = finalCriteriaMapObj.slabs;
        let slabArr = [];
        slabs.forEach((slab) => {
          let rngArr = [];
          Object.entries(slab).forEach((rng) => {
            rngArr.push(rng.join(":"));
          });
          slabArr.push(rngArr.join("::"));
        });
        slabText = slabArr.join("#");
        NEWcriteriaMap = criteriaMap + "&&&&" + slabText;
        this.lcySlab = this.cmCriteriaSlabType[0];
      } else if (finalCriteriaMapObj.lcyOpr) {
        lcyOpr = finalCriteriaMapObj.lcyOpr;
        NEWcriteriaMap = criteriaMap + "&&&&" + lcyOpr;
      } else {
        NEWcriteriaMap = criteriaMap;
      }

      const formData = new FormData();
      formData.append("userId", this.userId);
      formData.append("criteriaName", this.criteriaName);
      formData.append("criteriaMap", NEWcriteriaMap);

      console.log("userId", this.userId);
      console.log("criteriaName", this.criteriaName);
      console.log("criteriaMap", NEWcriteriaMap);

      formData.append("lcySlab", this.lcySlab);

      this.coreService.displayLoadingScreen();
      this.bankRoutingService.currentCriteriaSaveAsTemplate(formData).subscribe(
        (response) => {
          this.coreService.removeLoadingScreen();
          if (response.msg == "Criteria Template already exists.") {
            // this.saveTemplateDialogOpen = false;
            // this.criteriaName = "";
            // this.ngxToaster.warning(response.msg);
            this.savingCriteriaTemplateError =
              "Criteria Template already exists.";
          } else {
            this.savingCriteriaTemplateError = null;
            this.selectedTemplate = this.criteriaName;
            this.ngxToaster.success(response.msg);
            this.saveTemplateDialogOpen = false;
            this.criteriaName = "";
            this.getAllTemplates();
          }
        },
        (err) => {
          this.coreService.removeLoadingScreen();
          console.log(":: Error in saving criteria template", err);
        }
      );
    }
  }

  selectCriteriaTemplate(item: any) {
    this.resetCriteriaDropdowns();
    console.log("::selectedItem", item);
    let selectedData: CriteriaTemplateData =
      this.criteriaTemplatesDdlOptions.filter((x: { criteriaName: any }) => {
        return x.criteriaName == item.criteriaName;
      })[0];

    this.criteriaCodeText = this.setCriteriaMap(selectedData);

    this.criteriaText = this.decodeFormattedCriteria(this.criteriaCodeText);
  }

  setCriteriaMap(criteriaData: any) {
    let criteriaMapFirstSplit = null;
    let criteriaMapSecSplit = null;

    if (criteriaData["criteriaMap"].includes("&&&&")) {
      criteriaMapFirstSplit = criteriaData["criteriaMap"].split("&&&&")[0];
      criteriaMapSecSplit = criteriaData["criteriaMap"].split("&&&&")[1];

      if (criteriaMapSecSplit.includes("from:")) {
        let lcySlabForm = {};
        let lcySlabArr = [];
        criteriaMapSecSplit.split("#").forEach((rngTxt) => {
          let fromVal = rngTxt.split("::")[0].split(":")[1];
          let toVal = rngTxt.split("::")[1].split(":")[1];
          lcySlabArr.push({
            from: +fromVal,
            to: +toVal,
          });
        });
        lcySlabForm = {
          txnCriteriaRange: lcySlabArr,
        };
        console.log("::setting form LCYYYYYYYY", lcySlabForm);
        this.bankRoutingService.setTransactionCriteriaRange(lcySlabForm);

        criteriaMapFirstSplit += `;${criteriaData["lcySlab"]} = Slab`;
      } else {
        criteriaMapFirstSplit += `;${criteriaMapSecSplit}`;
      }
    } else {
      criteriaMapFirstSplit = criteriaData["criteriaMap"];

      this.bankRoutingService.setTransactionCriteriaRange({
        txnCriteriaRange: [{ from: null, to: null }],
      });
    }

    return criteriaMapFirstSplit.split(";");
  }

  showTransCriteriaModal() {
    this.ref = this.dialogService.open(TransactionCriteriaModal2, {
      width: "40%",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
      styleClass: "txn-criteria-modal",
      data: { txnCriteriaRange: this.txnCriteriaRangeFormData },
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.txnCriteriaRangeFormData = data;
      }
    });
  }

  selectedColumn(column, value, index) {
    console.log(column, value, index);
    let selectedColField = column + "Option";
    this.appliedCriteriaData[index][selectedColField] = value["codeName"];
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
                this.router.navigate([`navbar/bank-routing/addnewroute`]);
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

  getSlabCriteriaText(slabs: any[]) {
    let slabArr = [];
    let slabText = null;
    slabs.forEach((slab) => {
      let rngArr = [];
      Object.entries(slab).forEach((rng) => {
        rngArr.push(rng.join(":"));
      });
      slabArr.push(rngArr.join("::"));
    });
    slabText = slabArr.join("#");
    return slabText;
  }

  checkArrSimilarity(arr1: any[], arr2: any[]) {
    console.log(arr1, arr2);
    const containsAll = (arr1, arr2) =>
      arr2.every((arr2Item) => arr1.includes(arr2Item));

    const sameMembers = (arr1, arr2) =>
      containsAll(arr1, arr2) && containsAll(arr2, arr1);

    return sameMembers(arr1, arr2);
  }

  getTooltip(isMandatory, isDependent, dependencyList) {
    let tooltip = `${isMandatory ? "Mandatory Criteria \n" : ""} ${
      isDependent ? "Dependent on " + dependencyList : ""
    }`;
    if (isMandatory || isDependent) {
      return tooltip;
    } else {
      return "";
    }
  }

  changeValueInput(e: any) {
    if (!(e.value > 9999999999)) {
      this.valueCtrl.setValue(e.value);
    }
  }

  isMandatoryCol(heading: any) {
    return heading.includes("*") ? true : false;
  }

  closeDialog() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 250);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 250);
    this.criteriaName = "";
    this.savingCriteriaTemplateError = null;
  }

  reset() {
    this.appliedCriteriaData = [];
    this.setSelectAppForm1();
    this.resetCriteriaDropdowns();
    this.criteriaText = [];
    this.criteriaCodeText = [];
    this.appliedCriteriaCriteriaMap = null;
    this.appliedCriteriaIsDuplicate = null;
    this.selectedTemplate = "";
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }

    this.bankRoutingService.setTransactionCriteriaRange({
      txnCriteriaRange: [{ from: null, to: null }],
    });
  }
}
