import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CriteriaTemplateData } from "src/app/banks-routing-2/banks-routing.model";
import { CoreService } from "src/app/core.service";
import { SetCriteriaService } from "./set-criteria.service";
import { TransactionCriteriaModal } from "../../modals/transaction-criteria-modal/transaction-criteria-modal";

@Component({
  selector: "app-set-criteria",
  templateUrl: "./set-criteria.component.html",
  styleUrls: ["./set-criteria.component.scss"],
})
export class SetCriteriaComponent implements OnInit {
  @Input("criteriaMasterData") criteriaMasterData: any;
  @Input("cmCriteriaDataDetails") cmCriteriaDataDetails: any;
  @Input("criteriaDataDetailsJson") criteriaDataDetailsJson: any = {};
  @Input("cmCriteriaSlabType") cmCriteriaSlabType: any = [];
  @Input("cmCriteriaMandatory") cmCriteriaMandatory: any;
  @Input("cmCriteriaDependency") cmCriteriaDependency: any;
  @Input("independantCriteriaArr") independantCriteriaArr: any;
  @Input("criteriaMapDdlOptions") criteriaMapDdlOptions: any;
  @Input("criteriaEqualsDdlOptions") criteriaEqualsDdlOptions: any;
  @Input("correspondentDdlOptions") correspondentDdlOptions: any;
  @Input("criteriaTemplatesDdlOptions") criteriaTemplatesDdlOptions: any = [];
  @Input("savingCriteriaTemplateError") savingCriteriaTemplateError: any = null;
  @Input("saveTemplateDialogOpen") saveTemplateDialogOpen: boolean = false;
  @Input("criteriaText") criteriaText: any = [];
  @Input("criteriaCodeText") criteriaCodeText: any = [];

  @Output() getCorrespondentValues = new EventEmitter<{
    fieldName: any;
    displayName: any;
    criteriaCodeText: any;
  }>();

  @Output() postDataCriteria = new EventEmitter<any>();
  @Output() saveCriteriaAsTemplate = new EventEmitter<any>();

  criteriaName = "";
  lcySlab = null;
  hideValuesDropdown = false;
  showValueInput = false;
  isSlabControlSelected = false;
  finalCriteriaCodeText: any[] = [];
  userId = "";

  savedSlabs = false;
  isSlabsCriteria = false;

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;

  selectCriteriaForm: any;
  validCriteria = false;
  validSlabAmount = false;

  removeAddCriteriaListener: any;
  AddCriteriaClickListener: boolean = false;

  $oninitSlabFormSubscription: any;

  selectedTemplate = this.criteriaTemplatesDdlOptions.length
    ? "Select Template"
    : "No saved templates";

  constructor(
    private ngxToaster: ToastrService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private fb: UntypedFormBuilder,
    private renderer: Renderer2,
    private coreService: CoreService,
    private confirmationService: ConfirmationService,
    private setCriteriaService: SetCriteriaService
  ) {}

  @ViewChild("cd") cd: ConfirmDialog;
  @ViewChild("addCriteriaBtn") addCriteriaBtn: ElementRef;

  ngOnInit(): void {
    this.setSelectAppForm1();

    this.$oninitSlabFormSubscription = this.setCriteriaService
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
        console.log(":::::", this.criteriaText);
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
              "greater less condition not slab already slab not present",
              element
            );
            this.validCriteria = true;
            return true;
          } else {
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

      this.setCriteriaService.getTransactionCriteriaRange().subscribe((res) => {
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
            // this.addCriteriaText.emit(criteria);
            // this.addCriteriaCodeText.emit(criteriaCode);
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
      // this.addCriteriaText.emit(criteria);
      // this.addCriteriaCodeText.emit(criteriaCode);
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
        console.log(event, this.cmCriteriaDataDetails, selectedCorrespondent);
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
          this.getCorrespondentValues.emit({
            fieldName: event.label,
            displayName: event.data,
            criteriaCodeText: this.criteriaCodeText,
          });
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
            console.log(":::::selected slab but already LCY that is not slab");
            this.hideValuesDropdown = true;
            if (this.AddCriteriaClickListener) {
              this.removeAddCriteriaListener();
              this.AddCriteriaClickListener = false;
            }
            this.isSlabsCriteria = true;
          } else {
            console.log(":::::selected slab but already slab not present");
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
          console.log(":::::slab but already LCY");
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

      this.setCriteriaService.setTransactionCriteriaRange({
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
      // this.deleteCriteriaText.emit(i);
      // this.deleteCriteriaCodeText.emit(i);
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
        // let displayName = this.cmCriteriaDataDetails.filter((data) => {
        //   return data["fieldName"] == formatCrt.split("  ")[0];
        // })[0]["displayName"];

        let displayName = null;

        displayName = Object.keys(this.criteriaMasterData).filter((data) => {
          return data == formatCrt.split("  ")[0];
        })[0];
        if (!displayName) {
          if (this.cmCriteriaSlabType.includes(deps)) {
            displayName = this.cmCriteriaSlabType[0];
          }
        }

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

    // this.updateCriteriaText.emit(
    //   this.criteriaText.filter((el) => {
    //     return !removeCrit.includes(el);
    //   })
    // );
    // this.updateCriteriaCodeText.emit(
    //   this.criteriaCodeText.filter((el) => {
    //     return !removeCodeCrit.includes(el);
    //   })
    // );

    console.log("::to remove crit", removeCrit);

    console.log("::remaining crit ", this.criteriaText);

    this.ngxToaster.warning(
      `All dependent values of ${criteria} has been removed`
    );
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

  applyCriteria() {
    this.resetCriteriaDropdowns();

    let formattedCriteriaArr = this.createFormattedCriteria();

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
        postDataCriteria.append("criteriaMap", NEWcriteriaMap);
        postDataCriteria.append("userId", this.userId);
        this.postDataCriteria.emit(postDataCriteria);
      } else {
        // this.appliedCriteriaData = [];
      }
    }
  }

  showTransCriteriaModal() {
    this.ref = this.dialogService.open(TransactionCriteriaModal, {
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

  closeDialog() {
    this.coreService.displayLoadingScreen();
    setTimeout(() => {
      this.coreService.setHeaderStickyStyle(true);
      this.coreService.setSidebarBtnFixedStyle(true);
    }, 500);
    setTimeout(() => {
      this.coreService.removeLoadingScreen();
    }, 1000);
    this.criteriaName = "";
    this.savingCriteriaTemplateError = null;
  }

  resetSetCriteria() {
    this.setSelectAppForm1();
    this.resetCriteriaDropdowns();
    this.criteriaCodeText = [];
    this.criteriaText = [];
    this.selectedTemplate = "";
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }

    this.setCriteriaService.setTransactionCriteriaRange({
      txnCriteriaRange: [{ from: null, to: null }],
    });
  }

  // Need to update for shared comp

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

  savingCriteriaTemplate() {
    if (this.criteriaName == "") {
      this.savingCriteriaTemplateError =
        "Name of Criteria Template cannot be Empty";
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

      formData.append("lcySlab", this.lcySlab);

      this.saveCriteriaAsTemplate.emit(formData);
    }
  }

  selectCriteriaTemplate(item: any) {
    this.resetCriteriaDropdowns();
    console.log("::selectedItem", item);
    let selectedData: CriteriaTemplateData =
      this.criteriaTemplatesDdlOptions.filter((x: { criteriaName: any }) => {
        return x.criteriaName == item.criteriaName;
      })[0];

    this.criteriaCodeText =
      this.setCriteriaService.setCriteriaMap(selectedData);
    console.log(":::::", this.criteriaCodeText);
    this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
      this.criteriaCodeText,
      this.cmCriteriaDataDetails,
      this.criteriaMasterData,
      this.cmCriteriaSlabType
    );
    console.log(":::::", this.criteriaText);
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
}
