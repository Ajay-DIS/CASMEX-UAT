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
import { ConfirmationService, MessageService } from "primeng/api";
import { ConfirmDialog } from "primeng/confirmdialog";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CriteriaTemplateData } from "src/app/banks-routing-2/banks-routing.model";
import { CoreService } from "src/app/core.service";
import { SetCriteriaService } from "./set-criteria.service";
import { TransactionCriteriaModal } from "../../modals/transaction-criteria-modal/transaction-criteria-modal";
import { TransactionDateModal } from "../../modals/transaction-date-modal/transaction-date-modal";

@Component({
  selector: "app-set-criteria",
  templateUrl: "./set-criteria.component.html",
  styleUrls: ["./set-criteria.component.scss"],
})
export class SetCriteriaComponent implements OnInit {
  @Input("criteriaMasterData") criteriaMasterData: any;
  @Input("cmCriteriaDataDetails") cmCriteriaDataDetails: any;
  @Input("criteriaDataDetailsJson") criteriaDataDetailsJson: any = {};
  @Input("cmCriteriaSlabType") cmCriteriaSlabType: any = {};
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
  @Input("inactiveData") inactiveData: boolean = false;

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
  showDateInput = false;
  isSlabControlSelected = false;
  finalCriteriaCodeText: any[] = [];
  userId = "";

  selectedCriteria: any = { criteriaType: "SQL" };

  savedSlabs = false;
  isSlabsCriteria = false;

  savedDates = false;
  isDatesCriteria = false;

  ref: DynamicDialogRef;
  txnCriteriaRangeFormData: any;
  dateRangeFormData: any;

  selectCriteriaForm: any;
  validCriteria = false;
  validSlabAmount = false;

  removeAddCriteriaListener: any;
  AddCriteriaClickListener: boolean = false;

  removeAddDateListener: any;
  AddDateClickListener: boolean = false;

  $oninitSlabFormSubscription: any;
  $oninitDateFormSubscription: any;

  selectedTemplate = this.criteriaTemplatesDdlOptions.length
    ? "Select Template"
    : "No saved templates";

  emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  slabTypeCM: any = {
    Slab: "LCY Amount",
    date: "Transaction Date",
  };

  constructor(
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

    if (Object.keys(this.cmCriteriaSlabType).length) {
      this.slabTypeCM = this.cmCriteriaSlabType;
    }

    if (Object.keys(this.slabTypeCM).length) {
      this.setCriteriaService.RangeTypeCriteria = this.slabTypeCM;
    } else {
      this.setCriteriaService.RangeTypeCriteria = {};
    }

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
    this.$oninitDateFormSubscription = this.setCriteriaService
      .getDateRange()
      .subscribe((res) => {
        this.dateRangeFormData = res;
        if (!!Object.keys(this.dateRangeFormData).length) {
          this.dateRangeFormData["dateRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              this.savedDates = true;
            } else {
              this.savedDates = false;
            }
          });
        } else {
          this.savedDates = false;
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

  openRangeModal(crt: any) {
    if (this.getRangeType(crt) == "Slab") {
      this.showTransCriteriaModal();
    } else if (this.getRangeType(crt) == "date") {
      this.showDateModal();
    }
  }

  getRangeType(crt: any) {
    if (crt && Object.values(this.slabTypeCM).includes(crt.split(" = ")[0])) {
      let rangeType = Object.keys(this.slabTypeCM).find(
        (key) => this.slabTypeCM[key] === crt.split(" = ")[0]
      );
      return rangeType;
    }
  }

  isRangeCrt(crt: any) {
    if (
      crt &&
      Object.values(this.slabTypeCM).includes(crt.split(" = ")[0]) &&
      crt.split(" = ")[1] == "Slab"
    ) {
      return true;
    } else {
      return false;
    }
  }

  isRangeCrtWithoutSlab(crt: any) {
    if (
      Object.values(this.slabTypeCM).includes(crt.split(" = ")[0]) &&
      !(crt.split(" = ")[1] == "Slab")
    ) {
      return true;
    } else {
      return false;
    }
  }

  // addCriteriaMap() {
  //   let value = "";
  //   let valueCode = "";

  //   if (
  //     this.cmCriteriaSlabType.includes(this.criteriaCtrl.value.label) ||
  //     this.selectedCriteria.criteriaType != "SQL"
  //   ) {
  //     if (this.operationCtrl.value.name == "Slab") {
  //       value = "Slab";
  //       valueCode = "Slab";
  //     } else {
  //       value = this.valueCtrl.value;
  //       valueCode = this.valueCtrl.value;
  //     }
  //   } else {
  //     value = this.valueCtrl.value.name;
  //     valueCode = this.valueCtrl.value.code;
  //   }

  //   let criteria =
  //     this.criteriaCtrl.value.label +
  //     " " +
  //     this.operationCtrl.value.code +
  //     " " +
  //     value;
  //   let criteriaCode =
  //     this.criteriaCtrl.value.label +
  //     " " +
  //     this.operationCtrl.value.code +
  //     " " +
  //     valueCode;
  //   let index = this.criteriaText.indexOf(criteria);
  //   //validations
  //   if (this.criteriaText.length && index != -1) {
  //     this.coreService.showWarningToast(
  //       criteria + " already added, please add different case"
  //     );
  //   } else if (this.criteriaText.length) {
  //     this.validCriteria = true;
  //     this.validSlabAmount = true;
  //     let splitdata;
  //     if (criteria.includes("!=")) {
  //       splitdata = criteria.replace(/[!=]/g, "");
  //     } else if (criteria.includes("<=")) {
  //       splitdata = criteria.replace(/[<=]/g, "");
  //     } else if (criteria.includes(">=")) {
  //       splitdata = criteria.replace(/[>=]/g, "");
  //     } else if (criteria.includes("<")) {
  //       splitdata = criteria.replace(/[<]/g, "");
  //     } else if (criteria.includes(">")) {
  //       splitdata = criteria.replace(/[>]/g, "");
  //     } else {
  //       splitdata = criteria.replace(/[=]/g, "");
  //     }

  //     if (
  //       criteria.includes("<=") ||
  //       criteria.includes(">=") ||
  //       criteria.includes("<") ||
  //       criteria.includes(">")
  //     ) {
  //       this.validCriteria = true;
  //       this.validSlabAmount = true;
  //       this.criteriaText.every((element) => {
  //         let splitText;
  //         if (criteria.includes("!=")) {
  //           splitText = element.replace(/[!=]/g, "");
  //         } else if (element.includes("<=")) {
  //           splitText = element.replace(/[<=]/g, "");
  //         } else if (element.includes(">=")) {
  //           splitText = element.replace(/[>=]/g, "");
  //         } else if (element.includes("<")) {
  //           splitText = element.replace(/[<]/g, "");
  //         } else if (element.includes(">")) {
  //           splitText = element.replace(/[>]/g, "");
  //         } else {
  //           splitText = element.replace(/[=]/g, "");
  //         }

  //         if (
  //           splitText.split("  ")[0] == splitdata.split("  ")[0] &&
  //           splitdata.split("  ")[1] == "Slab"
  //         ) {
  //           this.coreService.showWarningToast(
  //             "Please delete existing criteria " +
  //               element +
  //               ", then add " +
  //               criteria
  //           );
  //           this.validCriteria = false;
  //           this.validSlabAmount = false;

  //           return false;
  //         } else if (
  //           splitText.split("  ")[0] == splitdata.split("  ")[0] &&
  //           splitText.split("  ")[1] == "Slab"
  //         ) {
  //           this.coreService.showWarningToast(
  //             "Please delete existing criteria " +
  //               element +
  //               ", then add " +
  //               criteria
  //           );
  //           this.validCriteria = false;
  //           this.validSlabAmount = false;
  //           return false;
  //         } else if (
  //           splitText.split("  ")[0] == splitdata.split("  ")[0] &&
  //           this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
  //         ) {
  //           this.validCriteria = true;
  //           return true;
  //         } else {
  //           return true;
  //         }
  //       });
  //     } else {
  //       let isCurrentCriteriaNotEqualCondition = false;
  //       let isCurrentCriteriaEqualCondition = false;

  //       if (criteria.includes("!=")) {
  //         isCurrentCriteriaNotEqualCondition = true;
  //       } else {
  //         isCurrentCriteriaEqualCondition = true;
  //       }

  //       this.criteriaText.every((element) => {
  //         let splitText;
  //         if (element.includes("!=")) {
  //           splitText = element.replace(/[!=]/g, "");
  //         } else if (element.includes("<=")) {
  //           splitText = element.replace(/[<=]/g, "");
  //         } else if (element.includes(">=")) {
  //           splitText = element.replace(/[>=]/g, "");
  //         } else if (element.includes("<")) {
  //           splitText = element.replace(/[<]/g, "");
  //         } else if (element.includes(">")) {
  //           splitText = element.replace(/[>]/g, "");
  //         } else {
  //           splitText = element.replace(/[=]/g, "");
  //         }

  //         if (splitText.split("  ")[0] == splitdata.split("  ")[0]) {
  //           if (splitText.split("  ")[1] == splitdata.split("  ")[1]) {
  //             this.coreService.showWarningToast(
  //               " Please select different criteria for " +
  //                 splitdata.split("  ")[0]
  //             );
  //             this.validCriteria = false;
  //             return false;
  //           } else {
  //             if (
  //               splitdata.split("  ")[1] == "Slab" &&
  //               this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
  //             ) {
  //               this.coreService.showWarningToast(
  //                 "Please delete existing criteria " +
  //                   element +
  //                   ", then add " +
  //                   criteria
  //               );
  //               this.validCriteria = false;
  //               return false;
  //             }

  //             let isAlreadyCriteriaNotEqualCondition = false;
  //             let isAlreadyCriteriaEqualCondition = false;

  //             if (element.includes("!=")) {
  //               isAlreadyCriteriaNotEqualCondition = true;
  //             } else if (element.includes(" = ")) {
  //               isAlreadyCriteriaEqualCondition = true;
  //             }

  //             if (
  //               isCurrentCriteriaEqualCondition &&
  //               isAlreadyCriteriaEqualCondition
  //             ) {
  //               this.coreService.showWarningToast(
  //                 "Please delete existing criteria " +
  //                   element +
  //                   ", then add " +
  //                   criteria
  //               );
  //               this.validCriteria = false;
  //               return false;
  //             } else if (
  //               isAlreadyCriteriaEqualCondition ==
  //                 !isCurrentCriteriaEqualCondition &&
  //               isAlreadyCriteriaNotEqualCondition ==
  //                 !isCurrentCriteriaNotEqualCondition
  //             ) {
  //               if (
  //                 this.cmCriteriaSlabType.includes(splitdata.split("  ")[0])
  //               ) {
  //                 this.coreService.showWarningToast(
  //                   "Please delete existing criteria " +
  //                     element +
  //                     ", then add " +
  //                     criteria
  //                 );
  //                 this.validCriteria = false;
  //                 return false;
  //               }
  //             } else {
  //               if (
  //                 !(
  //                   splitText.split("  ")[1] != "Any" &&
  //                   splitdata.split("  ")[1] != "Any"
  //                 )
  //               ) {
  //                 this.coreService.showWarningToast(
  //                   "Please delete existing criteria " +
  //                     element +
  //                     ", then add " +
  //                     criteria
  //                 );
  //                 this.validCriteria = false;
  //                 return false;
  //               } else {
  //                 return true;
  //               }
  //             }
  //           }
  //         } else {
  //           return true;
  //         }
  //       });
  //     }
  //     if (this.validCriteria) {
  //       this.checkSlabCriteria(criteria, criteriaCode);
  //     }
  //   } else {
  //     this.checkSlabCriteria(criteria, criteriaCode);
  //   }
  // }

  // addCriteriaMap() {
  //   let value = "";
  //   let valueCode = "";
  //   if (
  //     this.selectedCriteria.criteriaType == "Slab" ||
  //     this.selectedCriteria.criteriaType != "SQL"
  //   ) {
  //     if (this.operationCtrl.value.name == "Slab") {
  //       value = "Slab";
  //       valueCode = "Slab";
  //     } else {
  //       if (this.selectedCriteria.criteriaType == "date") {
  //         value = new Date(this.valueCtrl.value)
  //           .toLocaleDateString("en-UK")
  //           .split("/")
  //           .join("-");
  //         valueCode = new Date(this.valueCtrl.value)
  //           .toLocaleDateString("en-UK")
  //           .split("/")
  //           .join("-");
  //       } else {
  //         value = this.valueCtrl.value;
  //         valueCode = this.valueCtrl.value;
  //       }
  //     }
  //   } else {
  //     value = this.valueCtrl.value.name;
  //     valueCode = this.valueCtrl.value.code;
  //   }

  //   let criteria =
  //     this.criteriaCtrl.value.label +
  //     " " +
  //     this.operationCtrl.value.code +
  //     " " +
  //     value;
  //   let criteriaCode =
  //     this.criteriaCtrl.value.label +
  //     " " +
  //     this.operationCtrl.value.code +
  //     " " +
  //     valueCode;

  //   let index = this.criteriaText.indexOf(criteria);
  //   //validations
  //   if (this.criteriaText.length) {
  //     if (index != -1) {
  //       this.coreService.showWarningToast(
  //         criteria + " already added, please add different case"
  //       );
  //     } else {
  //       this.validCriteria = true;
  //       this.validSlabAmount = true;
  //       let splitdata;
  //       let currOpr;
  //       if (criteria.includes("!=")) {
  //         splitdata = criteria.replace(/[!=]/g, "");
  //         currOpr = "!=";
  //       } else if (criteria.includes(">=")) {
  //         splitdata = criteria.replace(/[>=]/g, "");
  //         currOpr = ">=";
  //       } else if (criteria.includes("<=")) {
  //         splitdata = criteria.replace(/[<=]/g, "");
  //         currOpr = "<=";
  //       } else if (criteria.includes("<")) {
  //         splitdata = criteria.replace(/[<]/g, "");
  //         currOpr = "<";
  //       } else if (criteria.includes(">")) {
  //         splitdata = criteria.replace(/[>]/g, "");
  //         currOpr = ">";
  //       } else {
  //         splitdata = criteria.replace(/[=]/g, "");
  //         currOpr = "=";
  //       }

  //       if (
  //         criteria.includes("<=") ||
  //         criteria.includes(">=") ||
  //         criteria.includes("<") ||
  //         criteria.includes(">")
  //       ) {
  //         this.validCriteria = true;
  //         this.validSlabAmount = true;
  //         this.criteriaText.every((element) => {
  //           let splitText;
  //           let ExistOpr;
  //           if (element.includes("!=")) {
  //             splitText = element.replace(/[!=]/g, "");
  //             ExistOpr = "!=";
  //           } else if (element.includes(">=")) {
  //             splitText = element.replace(/[>=]/g, "");
  //             ExistOpr = ">=";
  //           } else if (element.includes("<=")) {
  //             splitText = element.replace(/[<=]/g, "");
  //             ExistOpr = "<=";
  //           } else if (element.includes("<")) {
  //             splitText = element.replace(/[<]/g, "");
  //             ExistOpr = "<";
  //           } else if (element.includes(">")) {
  //             splitText = element.replace(/[>]/g, "");
  //             ExistOpr = ">";
  //           } else {
  //             splitText = element.replace(/[=]/g, "");
  //             ExistOpr = "=";
  //           }

  //           if (splitText.split("  ")[0] == splitdata.split("  ")[0]) {
  //             if (
  //               splitText.split("  ")[0] == splitdata.split("  ")[0] &&
  //               splitdata.split("  ")[1] == "Slab"
  //             ) {
  //               this.coreService.showWarningToast(
  //                 "Please delete existing criteria " +
  //                   element +
  //                   ", then add " +
  //                   criteria
  //               );
  //               this.validCriteria = false;
  //               this.validSlabAmount = false;

  //               return false;
  //             } else if (
  //               splitText.split("  ")[0] == splitdata.split("  ")[0] &&
  //               splitText.split("  ")[1] == "Slab"
  //             ) {
  //               this.coreService.showWarningToast(
  //                 "Please delete existing criteria " +
  //                   element +
  //                   ", then add " +
  //                   criteria
  //               );
  //               this.validCriteria = false;
  //               this.validSlabAmount = false;
  //               return false;
  //             } else if (
  //               splitText.split("  ")[0] == splitdata.split("  ")[0] &&
  //               (this.selectedCriteria?.criteriaType == "Slab" ||
  //                 this.selectedCriteria?.criteriaType == "date")
  //             ) {
  //               if (currOpr == ">" || currOpr == ">=") {
  //                 if (ExistOpr == ">" || ExistOpr == ">=") {
  //                   this.coreService.showWarningToast(
  //                     "Please delete existing criteria " +
  //                       element +
  //                       ", then add " +
  //                       criteria
  //                   );
  //                   this.validCriteria = false;
  //                   if (this.selectedCriteria?.criteriaType == "Slab") {
  //                     this.validSlabAmount = false;
  //                   }
  //                   return false;
  //                 } else if (ExistOpr == "<" || ExistOpr == "<=") {
  //                   if (this.selectedCriteria?.criteriaType == "Slab") {
  //                     if (ExistOpr == "<") {
  //                       if (
  //                         +splitdata.split("  ")[1] >= +splitText.split("  ")[1]
  //                       ) {
  //                         this.coreService.showWarningToast(
  //                           "Please delete existing criteria " +
  //                             element +
  //                             ", then add " +
  //                             criteria
  //                         );
  //                         this.validCriteria = false;
  //                         this.validSlabAmount = false;
  //                         return false;
  //                       } else {
  //                         return true;
  //                       }
  //                     } else if (ExistOpr == "<=") {
  //                       if (currOpr == ">") {
  //                         if (
  //                           +splitdata.split("  ")[1] >
  //                           +splitText.split("  ")[1]
  //                         ) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       } else if (currOpr == ">=") {
  //                         if (
  //                           +splitdata.split("  ")[1] >
  //                           +splitText.split("  ")[1]
  //                         ) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       }
  //                     }
  //                   } else if (this.selectedCriteria?.criteriaType == "date") {
  //                     let currY = splitdata.split("  ")[1]?.split("-")[2];
  //                     let currM = splitdata.split("  ")[1]?.split("-")[1];
  //                     let currD = splitdata.split("  ")[1]?.split("-")[0];
  //                     let existY = splitText.split("  ")[1]?.split("-")[2];
  //                     let existM = splitText.split("  ")[1]?.split("-")[1];
  //                     let existD = splitText.split("  ")[1]?.split("-")[0];

  //                     let currDate = currM + "-" + currD + "-" + currY;

  //                     let existDate = existM + "-" + existD + "-" + existY;

  //                     if (ExistOpr == "<") {
  //                       if (Date.parse(currDate) >= Date.parse(existDate)) {
  //                         this.coreService.showWarningToast(
  //                           "Please delete existing criteria " +
  //                             element +
  //                             ", then add " +
  //                             criteria
  //                         );
  //                         this.validCriteria = false;
  //                         this.validSlabAmount = false;
  //                         return false;
  //                       } else {
  //                         return true;
  //                       }
  //                     } else if (ExistOpr == "<=") {
  //                       if (currOpr == ">") {
  //                         if (Date.parse(currDate) > Date.parse(existDate)) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       } else if (currOpr == ">=") {
  //                         if (Date.parse(currDate) > Date.parse(existDate)) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       }
  //                     }
  //                   }
  //                 } else {
  //                   return true;
  //                 }
  //               } else if (currOpr == "<" || currOpr == "<=") {
  //                 if (ExistOpr == "<" || ExistOpr == "<=") {
  //                   this.coreService.showWarningToast(
  //                     "Please delete existing criteria " +
  //                       element +
  //                       ", then add " +
  //                       criteria
  //                   );
  //                   this.validCriteria = false;
  //                   if (this.selectedCriteria?.criteriaType == "Slab") {
  //                     this.validSlabAmount = false;
  //                   }
  //                   return false;
  //                 } else if (ExistOpr == ">" || ExistOpr == ">=") {
  //                   if (this.selectedCriteria?.criteriaType == "Slab") {
  //                     if (ExistOpr == ">") {
  //                       if (
  //                         +splitdata.split("  ")[1] <= +splitText.split("  ")[1]
  //                       ) {
  //                         this.coreService.showWarningToast(
  //                           "Please delete existing criteria " +
  //                             element +
  //                             ", then add " +
  //                             criteria
  //                         );
  //                         this.validCriteria = false;
  //                         this.validSlabAmount = false;
  //                         return false;
  //                       } else {
  //                         return true;
  //                       }
  //                     } else if (ExistOpr == ">=") {
  //                       if (currOpr == "<") {
  //                         if (
  //                           +splitdata.split("  ")[1] <=
  //                           +splitText.split("  ")[1]
  //                         ) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       } else if (currOpr == "<=") {
  //                         if (
  //                           +splitdata.split("  ")[1] <
  //                           +splitText.split("  ")[1]
  //                         ) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       }
  //                     }
  //                   } else if (this.selectedCriteria?.criteriaType == "date") {
  //                     let currY = splitdata.split("  ")[1]?.split("-")[2];
  //                     let currM = splitdata.split("  ")[1]?.split("-")[1];
  //                     let currD = splitdata.split("  ")[1]?.split("-")[0];
  //                     let existY = splitText.split("  ")[1]?.split("-")[2];
  //                     let existM = splitText.split("  ")[1]?.split("-")[1];
  //                     let existD = splitText.split("  ")[1]?.split("-")[0];

  //                     let currDate = currM + "-" + currD + "-" + currY;
  //                     let existDate = existM + "-" + existD + "-" + existY;
  //                     if (ExistOpr == ">") {
  //                       if (Date.parse(currDate) <= Date.parse(existDate)) {
  //                         this.coreService.showWarningToast(
  //                           "Please delete existing criteria " +
  //                             element +
  //                             ", then add " +
  //                             criteria
  //                         );
  //                         this.validCriteria = false;
  //                         this.validSlabAmount = false;
  //                         return false;
  //                       } else {
  //                         return true;
  //                       }
  //                     } else if (ExistOpr == ">=") {
  //                       if (currOpr == "<") {
  //                         if (Date.parse(currDate) <= Date.parse(existDate)) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       } else if (currOpr == "<=") {
  //                         if (Date.parse(currDate) < Date.parse(existDate)) {
  //                           this.coreService.showWarningToast(
  //                             "Please delete existing criteria " +
  //                               element +
  //                               ", then add " +
  //                               criteria
  //                           );
  //                           this.validCriteria = false;
  //                           this.validSlabAmount = false;
  //                           return false;
  //                         } else {
  //                           return true;
  //                         }
  //                       }
  //                     }
  //                   }
  //                 } else {
  //                   return true;
  //                 }
  //               }
  //             } else {
  //               return true;
  //             }
  //           } else {
  //             return true;
  //           }
  //         });
  //       } else {
  //         let isCurrentCriteriaNotEqualCondition = false;
  //         let isCurrentCriteriaEqualCondition = false;

  //         if (criteria.includes("!=")) {
  //           isCurrentCriteriaNotEqualCondition = true;
  //         } else {
  //           isCurrentCriteriaEqualCondition = true;
  //         }

  //         this.criteriaText.every((element) => {
  //           let splitText;
  //           if (element.includes("!=")) {
  //             splitText = element.replace(/[!=]/g, "");
  //           } else if (element.includes("<=")) {
  //             splitText = element.replace(/[<=]/g, "");
  //           } else if (element.includes(">=")) {
  //             splitText = element.replace(/[>=]/g, "");
  //           } else if (element.includes("<")) {
  //             splitText = element.replace(/[<]/g, "");
  //           } else if (element.includes(">")) {
  //             splitText = element.replace(/[>]/g, "");
  //           } else {
  //             splitText = element.replace(/[=]/g, "");
  //           }

  //           if (splitText.split("  ")[0] == splitdata.split("  ")[0]) {
  //             if (splitText.split("  ")[1] == splitdata.split("  ")[1]) {
  //               this.coreService.showWarningToast(
  //                 " Please select different value for " +
  //                   splitdata.split("  ")[0]
  //               );
  //               this.validCriteria = false;
  //               return false;
  //             } else {
  //               if (
  //                 splitdata.split("  ")[1] == "Slab" &&
  //                 this.selectedCriteria.criteriaType == "Slab"
  //               ) {
  //                 this.coreService.showWarningToast(
  //                   "Please delete existing criteria " +
  //                     element +
  //                     ", then add " +
  //                     criteria
  //                 );
  //                 this.validCriteria = false;
  //                 return false;
  //               }

  //               let isAlreadyCriteriaNotEqualCondition = false;
  //               let isAlreadyCriteriaEqualCondition = false;

  //               if (element.includes("!=")) {
  //                 isAlreadyCriteriaNotEqualCondition = true;
  //               } else if (element.includes(" = ")) {
  //                 isAlreadyCriteriaEqualCondition = true;
  //               }

  //               if (
  //                 isCurrentCriteriaEqualCondition &&
  //                 isAlreadyCriteriaEqualCondition
  //               ) {
  //                 this.coreService.showWarningToast(
  //                   "Please delete existing criteria " +
  //                     element +
  //                     ", then add " +
  //                     criteria
  //                 );
  //                 this.validCriteria = false;
  //                 return false;
  //               } else if (
  //                 isAlreadyCriteriaEqualCondition ==
  //                   !isCurrentCriteriaEqualCondition &&
  //                 isAlreadyCriteriaNotEqualCondition ==
  //                   !isCurrentCriteriaNotEqualCondition
  //               ) {
  //                 // if (this.selectedCriteria?.criteriaType == "Slab") {
  //                 //   this.coreService.showWarningToast(
  //                 //     "Please delete existing criteria " +
  //                 //       element +
  //                 //       ", then add " +
  //                 //       criteria
  //                 //   );
  //                 //   this.validCriteria = false;
  //                 //   return false;
  //                 // }
  //               } else {
  //                 if (
  //                   !(
  //                     splitText.split("  ")[1] != "Any" &&
  //                     splitdata.split("  ")[1] != "Any"
  //                   )
  //                 ) {
  //                   this.coreService.showWarningToast(
  //                     "Please delete existing criteria " +
  //                       element +
  //                       ", then add " +
  //                       criteria
  //                   );
  //                   this.validCriteria = false;
  //                   return false;
  //                 } else {
  //                   return true;
  //                 }
  //               }
  //             }
  //           } else {
  //             return true;
  //           }
  //         });
  //       }
  //       if (this.validCriteria) {
  //         this.checkSlabCriteria(criteria, criteriaCode);
  //       }
  //     }
  //   } else {
  //     this.checkSlabCriteria(criteria, criteriaCode);
  //   }
  // }

  addCriteriaMap() {
    let value = "";
    let valueCode = "";
    if (this.selectedCriteria.criteriaType != "SQL") {
      if (this.operationCtrl.value.name == "Slab") {
        value = "Slab";
        valueCode = "Slab";
      } else {
        if (this.selectedCriteria.criteriaType == "date") {
          value = new Date(this.valueCtrl.value).toLocaleString("en-GB");
          valueCode = new Date(this.valueCtrl.value).toLocaleString("en-GB");
        } else {
          value = this.valueCtrl.value;
          valueCode = this.valueCtrl.value;
        }
      }
    } else {
      value = this.valueCtrl.value.name;
      valueCode = this.valueCtrl.value.code;
    }

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

    //validations
    if (this.criteriaText.length) {
      let index = this.criteriaText.indexOf(criteria);
      if (index != -1) {
        this.coreService.showWarningToast(
          criteria + " already added, please add different case"
        );
      } else {
        this.validCriteria = true;
        let splitdata;
        let currOpr;
        if (criteria.includes("!=")) {
          splitdata = criteria.replace(/[!=]/g, "");
          currOpr = "!=";
        } else if (criteria.includes(">=")) {
          splitdata = criteria.replace(/[>=]/g, "");
          currOpr = ">=";
        } else if (criteria.includes("<=")) {
          splitdata = criteria.replace(/[<=]/g, "");
          currOpr = "<=";
        } else if (criteria.includes("<")) {
          splitdata = criteria.replace(/[<]/g, "");
          currOpr = "<";
        } else if (criteria.includes(">")) {
          splitdata = criteria.replace(/[>]/g, "");
          currOpr = ">";
        } else {
          splitdata = criteria.replace(/[=]/g, "");
          currOpr = "=";
        }

        if (
          criteria.includes("<=") ||
          criteria.includes(">=") ||
          criteria.includes("<") ||
          criteria.includes(">")
        ) {
          this.validCriteria = true;
          this.criteriaText.every((element) => {
            let splitText;
            let ExistOpr;
            if (element.includes("!=")) {
              splitText = element.replace(/[!=]/g, "");
              ExistOpr = "!=";
            } else if (element.includes(">=")) {
              splitText = element.replace(/[>=]/g, "");
              ExistOpr = ">=";
            } else if (element.includes("<=")) {
              splitText = element.replace(/[<=]/g, "");
              ExistOpr = "<=";
            } else if (element.includes("<")) {
              splitText = element.replace(/[<]/g, "");
              ExistOpr = "<";
            } else if (element.includes(">")) {
              splitText = element.replace(/[>]/g, "");
              ExistOpr = ">";
            } else {
              splitText = element.replace(/[=]/g, "");
              ExistOpr = "=";
            }

            if (splitText.split("  ")[0] == splitdata.split("  ")[0]) {
              if (
                splitText.split("  ")[0] == splitdata.split("  ")[0] &&
                splitdata.split("  ")[1] == "Slab"
              ) {
                this.coreService.showWarningToast(
                  "Please delete existing criteria " +
                    element +
                    ", then add " +
                    criteria
                );
                this.validCriteria = false;

                return false;
              } else if (
                splitText.split("  ")[0] == splitdata.split("  ")[0] &&
                splitText.split("  ")[1] == "Slab"
              ) {
                this.coreService.showWarningToast(
                  "Please delete existing criteria " +
                    element +
                    ", then add " +
                    criteria
                );
                this.validCriteria = false;
                return false;
              } else if (
                splitText.split("  ")[0] == splitdata.split("  ")[0] &&
                (this.selectedCriteria?.criteriaType == "Slab" ||
                  this.selectedCriteria?.criteriaType == "date")
              ) {
                if (currOpr == ">" || currOpr == ">=") {
                  if (ExistOpr == ">" || ExistOpr == ">=") {
                    this.coreService.showWarningToast(
                      "Please delete existing criteria " +
                        element +
                        ", then add " +
                        criteria
                    );
                    this.validCriteria = false;
                    if (this.selectedCriteria?.criteriaType == "Slab") {
                    }
                    return false;
                  } else if (ExistOpr == "<" || ExistOpr == "<=") {
                    if (this.selectedCriteria?.criteriaType == "Slab") {
                      if (ExistOpr == "<") {
                        if (
                          +splitdata.split("  ")[1] >= +splitText.split("  ")[1]
                        ) {
                          this.coreService.showWarningToast(
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
                      } else if (ExistOpr == "<=") {
                        if (currOpr == ">") {
                          if (
                            +splitdata.split("  ")[1] >
                            +splitText.split("  ")[1]
                          ) {
                            this.coreService.showWarningToast(
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
                        } else if (currOpr == ">=") {
                          if (
                            +splitdata.split("  ")[1] >
                            +splitText.split("  ")[1]
                          ) {
                            this.coreService.showWarningToast(
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
                    } else if (this.selectedCriteria?.criteriaType == "date") {
                      let currY = splitdata.split("  ")[1]?.split("-")[2];
                      let currM = splitdata.split("  ")[1]?.split("-")[1];
                      let currD = splitdata.split("  ")[1]?.split("-")[0];
                      let existY = splitText.split("  ")[1]?.split("-")[2];
                      let existM = splitText.split("  ")[1]?.split("-")[1];
                      let existD = splitText.split("  ")[1]?.split("-")[0];

                      let currDate = currM + "-" + currD + "-" + currY;

                      let existDate = existM + "-" + existD + "-" + existY;

                      if (ExistOpr == "<") {
                        if (Date.parse(currDate) >= Date.parse(existDate)) {
                          this.coreService.showWarningToast(
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
                      } else if (ExistOpr == "<=") {
                        if (currOpr == ">") {
                          if (Date.parse(currDate) > Date.parse(existDate)) {
                            this.coreService.showWarningToast(
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
                        } else if (currOpr == ">=") {
                          if (Date.parse(currDate) > Date.parse(existDate)) {
                            this.coreService.showWarningToast(
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
                    }
                  } else {
                    return true;
                  }
                } else if (currOpr == "<" || currOpr == "<=") {
                  if (ExistOpr == "<" || ExistOpr == "<=") {
                    this.coreService.showWarningToast(
                      "Please delete existing criteria " +
                        element +
                        ", then add " +
                        criteria
                    );
                    this.validCriteria = false;
                    if (this.selectedCriteria?.criteriaType == "Slab") {
                    }
                    return false;
                  } else if (ExistOpr == ">" || ExistOpr == ">=") {
                    if (this.selectedCriteria?.criteriaType == "Slab") {
                      if (ExistOpr == ">") {
                        if (
                          +splitdata.split("  ")[1] <= +splitText.split("  ")[1]
                        ) {
                          this.coreService.showWarningToast(
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
                      } else if (ExistOpr == ">=") {
                        if (currOpr == "<") {
                          if (
                            +splitdata.split("  ")[1] <=
                            +splitText.split("  ")[1]
                          ) {
                            this.coreService.showWarningToast(
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
                        } else if (currOpr == "<=") {
                          if (
                            +splitdata.split("  ")[1] <
                            +splitText.split("  ")[1]
                          ) {
                            this.coreService.showWarningToast(
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
                    } else if (this.selectedCriteria?.criteriaType == "date") {
                      let currY = splitdata.split("  ")[1]?.split("-")[2];
                      let currM = splitdata.split("  ")[1]?.split("-")[1];
                      let currD = splitdata.split("  ")[1]?.split("-")[0];
                      let existY = splitText.split("  ")[1]?.split("-")[2];
                      let existM = splitText.split("  ")[1]?.split("-")[1];
                      let existD = splitText.split("  ")[1]?.split("-")[0];

                      let currDate = currM + "-" + currD + "-" + currY;
                      let existDate = existM + "-" + existD + "-" + existY;
                      if (ExistOpr == ">") {
                        if (Date.parse(currDate) <= Date.parse(existDate)) {
                          this.coreService.showWarningToast(
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
                      } else if (ExistOpr == ">=") {
                        if (currOpr == "<") {
                          if (Date.parse(currDate) <= Date.parse(existDate)) {
                            this.coreService.showWarningToast(
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
                        } else if (currOpr == "<=") {
                          if (Date.parse(currDate) < Date.parse(existDate)) {
                            this.coreService.showWarningToast(
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
                    }
                  } else {
                    return true;
                  }
                }
              } else {
                return true;
              }
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
                this.coreService.showWarningToast(
                  " Please select different value for " +
                    splitdata.split("  ")[0]
                );
                this.validCriteria = false;
                return false;
              } else {
                if (
                  splitdata.split("  ")[1] == "Slab" &&
                  this.selectedCriteria.criteriaType == "Slab"
                ) {
                  this.coreService.showWarningToast(
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
                  this.coreService.showWarningToast(
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
                  // if (this.selectedCriteria?.criteriaType == "Slab") {
                  //   this.coreService.showWarningToast(
                  //     "Please delete existing criteria " +
                  //       element +
                  //       ", then add " +
                  //       criteria
                  //   );
                  //   this.validCriteria = false;
                  //   return false;
                  // }
                } else {
                  if (
                    !(
                      splitText.split("  ")[1] != "Any" &&
                      splitdata.split("  ")[1] != "Any"
                    )
                  ) {
                    this.coreService.showWarningToast(
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
        this.txnCriteriaRangeFormData = res;

        if (!!Object.keys(res).length) {
          res["txnCriteriaRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              this.savedSlabs = true;
            } else {
              this.savedSlabs = false;
            }
          });
        } else {
          this.savedSlabs = false;
        }

        if (this.savedSlabs) {
          let txnCriteriaName = this.slabTypeCM["Slab"];
          if (
            !this.criteriaText.filter(
              (criteria) => criteria == `${txnCriteriaName} = Slab`
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
      });
    } else if (this.isDatesCriteria) {
      if (this.$oninitDateFormSubscription) {
        this.$oninitDateFormSubscription.unsubscribe();
      }

      this.setCriteriaService.getDateRange().subscribe((res) => {
        this.dateRangeFormData = res;

        if (!!Object.keys(res).length) {
          res["dateRange"].forEach((range) => {
            if (Object.values(range).filter((rng) => rng == null).length == 0) {
              this.savedDates = true;
            } else {
              this.savedDates = false;
            }
          });
        } else {
          this.savedDates = false;
        }

        if (this.savedDates) {
          let dateCriteriaName = this.slabTypeCM["date"];
          if (
            !this.criteriaText.filter(
              (criteria) => criteria == `${dateCriteriaName} = Slab`
            ).length
          ) {
            this.criteriaText.push(criteria);
            this.criteriaCodeText.push(criteriaCode);
            this.resetCriteriaDropdowns();
            this.removeAddDateListener();
            this.AddDateClickListener = false;
          } else {
            this.removeAddDateListener();
            this.AddDateClickListener = false;
          }
        } else {
          if (!this.AddDateClickListener) {
            this.removeAddDateListener = this.renderer.listen(
              this.addCriteriaBtn.nativeElement,
              "click",
              (evt) => {
                this.showDateModal();
              }
            );
            this.AddDateClickListener = true;
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

    if (Object.keys(this.cmCriteriaDependency).includes(event["label"])) {
      if (
        formattedCriteriaArr.includes(this.cmCriteriaDependency[event["label"]])
      ) {
        if (formattedCriteriaArr.includes(event["label"])) {
          return true;
        } else {
          return true;
        }
      } else {
        this.coreService.showWarningToast(
          `${event["label"]} is dependant on ${
            this.cmCriteriaDependency[event["label"]]
          }, Select it first.`
        );
        return false;
      }
    } else {
      if (
        formattedCriteriaArr.includes(
          this.cmCriteriaDependency[event["label"]]
        ) ||
        formattedCriteriaArr.includes(event["label"])
      ) {
        return true;
      }
      return true;
    }
  }

  onCriteriaSelect(event: any) {
    this.selectedCriteria = event;
    // this.hideValuesDropdown = false;
    // this.showValueInput = false;
    this.valueCtrl.reset();
    this.operationCtrl.reset();
    if (this.isCriteriaSelectable(event)) {
      this.onChange("criteria", event);
    } else {
      this.resetCriteriaDropdowns();
    }
  }

  resetCriteriaDropdowns() {
    this.criteriaCtrl.reset();
    this.selectedCriteria = { criteriaType: "SQL" };
    this.operationCtrl.reset();
    this.valueCtrl.reset();
    this.valueCtrl.disable();
    this.operationCtrl.disable();
    this.correspondentDdlOptions = [];
    if (this.AddCriteriaClickListener) {
      this.removeAddCriteriaListener();
      this.AddCriteriaClickListener = false;
    }
    if (this.AddDateClickListener) {
      this.removeAddDateListener();
      this.AddDateClickListener = false;
    }
  }

  onChange(controlId, event) {
    switch (controlId) {
      case "criteria":
        let selectedCorrespondent = this.cmCriteriaDataDetails.filter(
          (x) => event.data == x.fieldName
        );
        console.log(selectedCorrespondent, Object.values(this.slabTypeCM));
        let operations;
        this.hideValuesDropdown = false;
        this.showValueInput = false;
        this.showDateInput = false;
        if (selectedCorrespondent.length) {
          if (
            // this.cmCriteriaSlabType.includes(
            //   selectedCorrespondent[0].fieldName
            // ) ||
            // selectedCorrespondent[0]?.criteriaType == "Slab"
            Object.values(this.slabTypeCM).includes(
              selectedCorrespondent[0].fieldName
            )
          ) {
            this.isSlabControlSelected = true;
            operations = selectedCorrespondent[0].operations.split(",");
            this.valueCtrl.reset();
            this.valueCtrl.disable();
            this.correspondentDdlOptions = [];
          } else {
            this.isSlabControlSelected = false;
            this.correspondentDdlOptions = [];
            this.valueCtrl.patchValue("");
            if (selectedCorrespondent[0]?.criteriaType == "SQL") {
              this.getCorrespondentValues.emit({
                fieldName: event.label,
                displayName: event.data,
                criteriaCodeText: this.criteriaCodeText,
              });
            } else {
              this.hideValuesDropdown = true;
              if (selectedCorrespondent[0]?.criteriaType == "number") {
                this.showValueInput = true;
              }
              if (selectedCorrespondent[0]?.criteriaType == "date") {
                this.showDateInput = true;
              }
            }
            operations = selectedCorrespondent[0].operations.split(",");
          }
          this.criteriaEqualsDdlOptions = [];
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
        } else {
          this.operationCtrl.enable();
          this.valueCtrl.enable();
          this.criteriaEqualsDdlOptions = [];
          this.correspondentDdlOptions = [];
        }
        break;

      case "condition":
        // this.hideValuesDropdown = false;
        // this.showValueInput = false;
        let currCriteriaName = "";
        if (this.selectedCriteria?.criteriaType == "Slab") {
        } else if (this.selectedCriteria?.criteriaType == "date") {
        }
        console.log("::selectedCrit", this.selectedCriteria);
        if (event.name == "Slab") {
          if (
            !this.criteriaText.filter(
              (criteria) => criteria == `${this.selectedCriteria.data} = Slab`
            ).length
          ) {
            if (
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
                return splitText.split("  ")[0] == this.selectedCriteria.data;
              }).length
            ) {
              this.hideValuesDropdown = true;
              if (this.selectedCriteria?.criteriaType == "Slab") {
                if (this.AddCriteriaClickListener) {
                  this.removeAddCriteriaListener();
                  this.AddCriteriaClickListener = false;
                }
                this.isSlabsCriteria = true;
              } else if (this.selectedCriteria?.criteriaType == "date") {
                if (this.AddDateClickListener) {
                  this.removeAddDateListener();
                  this.AddDateClickListener = false;
                }
                this.isDatesCriteria = true;
              }
            } else {
              this.valueCtrl.disable();
              this.hideValuesDropdown = true;
              this.showValueInput = false;
              this.showDateInput = false;
              if (this.selectedCriteria?.criteriaType == "Slab") {
                if (this.AddDateClickListener) {
                  this.removeAddDateListener();
                  this.AddDateClickListener = false;
                }
                this.isDatesCriteria = false;

                this.isSlabsCriteria = true;
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
              } else if (this.selectedCriteria?.criteriaType == "date") {
                if (this.AddCriteriaClickListener) {
                  this.removeAddCriteriaListener();
                  this.AddCriteriaClickListener = false;
                }
                this.isSlabsCriteria = false;

                this.isDatesCriteria = true;
                if (!this.AddDateClickListener) {
                  this.removeAddDateListener = this.renderer.listen(
                    this.addCriteriaBtn.nativeElement,
                    "click",
                    (evt) => {
                      this.showDateModal();
                    }
                  );
                  this.AddDateClickListener = true;
                }
              }
            }
          } else {
            this.valueCtrl.disable();
            this.hideValuesDropdown = true;
            this.showValueInput = false;
            this.showDateInput = false;
            if (this.AddCriteriaClickListener) {
              this.removeAddCriteriaListener();
              this.AddCriteriaClickListener = false;
            }
            if (this.AddDateClickListener) {
              this.removeAddDateListener();
              this.AddDateClickListener = false;
            }
            if (this.selectedCriteria?.criteriaType == "Slab") {
              this.isSlabsCriteria = true;
            } else if (this.selectedCriteria?.criteriaType == "date") {
              this.isDatesCriteria = true;
            }
          }
        } else if (this.isSlabControlSelected) {
          this.valueCtrl.enable();
          this.hideValuesDropdown = true;

          if (this.selectedCriteria?.criteriaType == "Slab") {
            this.showValueInput = true;
            if (this.AddCriteriaClickListener) {
              this.removeAddCriteriaListener();
              this.AddCriteriaClickListener = false;
            }
            this.isSlabsCriteria = false;
          } else if (this.selectedCriteria?.criteriaType == "date") {
            this.showDateInput = true;
            if (this.AddDateClickListener) {
              this.removeAddDateListener();
              this.AddDateClickListener = false;
            }
            this.isDatesCriteria = false;
          }
        } else if (this.selectedCriteria?.criteriaType == "SQL") {
          this.hideValuesDropdown = false;
          if (this.AddCriteriaClickListener) {
            this.removeAddCriteriaListener();
            this.AddCriteriaClickListener = false;
          }
          this.isSlabsCriteria = false;
          if (this.AddDateClickListener) {
            this.removeAddDateListener();
            this.AddDateClickListener = false;
          }
          this.isDatesCriteria = false;
        } else {
          this.valueCtrl.enable();
          this.hideValuesDropdown = true;
          if (this.selectedCriteria?.criteriaType == "Slab") {
            this.showValueInput = true;
          } else if (this.selectedCriteria?.criteriaType == "date") {
            this.showDateInput = true;
          }
          this.isSlabsCriteria = false;
          this.isDatesCriteria = false;
        }

        // if (
        //   event.name == "Slab" &&
        //   !this.criteriaText.filter(
        //     (criteria) => criteria == `${this.cmCriteriaSlabType[0]} = Slab`
        //   ).length
        // ) {
        //   if (
        //     event.name == "Slab" &&
        //     this.criteriaText.filter((criteria) => {
        //       let splitText;
        //       if (criteria.includes("!=")) {
        //         splitText = criteria.replace(/[!=]/g, "");
        //       } else if (criteria.includes("<=")) {
        //         splitText = criteria.replace(/[<=]/g, "");
        //       } else if (criteria.includes(">=")) {
        //         splitText = criteria.replace(/[>=]/g, "");
        //       } else if (criteria.includes("<")) {
        //         splitText = criteria.replace(/[<]/g, "");
        //       } else if (criteria.includes(">")) {
        //         splitText = criteria.replace(/[>]/g, "");
        //       } else {
        //         splitText = criteria.replace(/[=]/g, "");
        //       }
        //       return this.cmCriteriaSlabType.includes(splitText.split("  ")[0]);
        //     }).length
        //   ) {
        //     this.hideValuesDropdown = true;
        //     if (this.AddCriteriaClickListener) {
        //       this.removeAddCriteriaListener();
        //       this.AddCriteriaClickListener = false;
        //     }
        //     this.isSlabsCriteria = true;
        //   } else {
        //     this.isSlabsCriteria = true;
        //     this.valueCtrl.disable();
        //     this.hideValuesDropdown = true;
        //     this.showValueInput = false;
        //     if (!this.AddCriteriaClickListener) {
        //       this.removeAddCriteriaListener = this.renderer.listen(
        //         this.addCriteriaBtn.nativeElement,
        //         "click",
        //         (evt) => {
        //           this.showTransCriteriaModal();
        //         }
        //       );
        //       this.AddCriteriaClickListener = true;
        //     }
        //   }
        // } else if (event.name == "Slab") {
        //   if (this.AddCriteriaClickListener) {
        //     this.removeAddCriteriaListener();
        //     this.AddCriteriaClickListener = false;
        //   }
        //   this.isSlabsCriteria = true;
        //   this.valueCtrl.disable();
        //   this.hideValuesDropdown = true;
        //   this.showValueInput = false;
        // } else if (this.isSlabControlSelected) {
        //   this.valueCtrl.enable();
        //   this.hideValuesDropdown = true;
        //   this.showValueInput = true;
        //   if (this.AddCriteriaClickListener) {
        //     this.removeAddCriteriaListener();
        //     this.AddCriteriaClickListener = false;
        //   }
        //   this.isSlabsCriteria = false;
        // } else if (this.selectedCriteria?.criteriaType == "SQL") {
        //   this.hideValuesDropdown = false;
        //   if (this.AddCriteriaClickListener) {
        //     this.removeAddCriteriaListener();
        //     this.AddCriteriaClickListener = false;
        //   }
        //   this.isSlabsCriteria = false;
        // } else {
        //   this.valueCtrl.enable();
        //   this.hideValuesDropdown = true;
        //   this.showValueInput = true;
        //   this.isSlabsCriteria = false;
        // }
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
    if (this.AddDateClickListener) {
      this.removeAddDateListener();
      this.AddDateClickListener = false;
    }

    let rangeType = Object.keys(this.cmCriteriaSlabType).find(
      (key) => criteria == `${this.cmCriteriaSlabType[key]} = Slab`
    );

    if (rangeType) {
      if (rangeType == "Slab") {
        this.savedSlabs = false;
        this.setCriteriaService.setTransactionCriteriaRange({
          txnCriteriaRange: [{ from: null, to: null }],
        });
      } else if (rangeType == "date") {
        this.savedDates = false;
        this.setCriteriaService.setDateRange({
          dateRange: [{ trnStartDate: null, trnEndDate: null }],
        });
      }
    }

    let arr2 = [...this.criteriaText];
    let arr1 = [...this.independantCriteriaArr];
    let independantIndexes = [];

    arr2.forEach((arr2Item, i) => {
      arr1.forEach((arr1Item) => {
        if (arr1Item.includes(arr2Item.split(" ")[0])) {
          independantIndexes.push(i);
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

    if (
      Object.values(this.cmCriteriaDependency).includes(
        formatCrt.split("  ")[0]
      )
    ) {
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
        let displayName = null;

        //% this needs to be updated when displayName fieldName point arises

        displayName = Object.keys(this.criteriaMasterData).filter((data) => {
          return data == formatCrt.split("  ")[0];
        })[0];
        if (!displayName) {
          let rangeType = Object.keys(this.cmCriteriaSlabType).find(
            (key) => this.cmCriteriaSlabType[key] === formatCrt.split("  ")[0]
          );

          if (rangeType) {
            displayName = formatCrt.split("  ")[0];
            if (deps == displayName) {
              if (rangeType == "Slab") {
                this.setCriteriaService.setTransactionCriteriaRange({
                  txnCriteriaRange: [{ from: null, to: null }],
                });
              } else if (rangeType == "date") {
                this.setCriteriaService.setDateRange({
                  dateRange: [{ trnStartDate: null, trnEndDate: null }],
                });
              }
            }
          }
        }

        // let fieldNames = this.cmCriteriaDataDetails.map((critData) => {
        //   return critData["fieldName"];
        // });

        // if (fieldNames.includes(formatCrt.split("  ")[0])) {
        //   displayName = this.cmCriteriaDataDetails.filter(
        //     (data: { displayName: string; fieldName: string }) => {
        //       return data["fieldName"] == formatCrt.split("  ")[0];
        //     }
        //   )[0]["displayName"];
        // } else {
        //   displayName = formatCrt.split("  ")[0];
        // }
        //% this needs to be updated when displayName fieldName point arises ENDS

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

    this.coreService.showWarningToast(
      `All dependent values of ${criteria} has been removed`
    );
  }

  checkMandatoryCondition(formattedCriteriaArr: any) {
    if (
      this.cmCriteriaMandatory &&
      this.cmCriteriaMandatory.length &&
      this.cmCriteriaMandatory[0].length
    ) {
      if (
        this.cmCriteriaMandatory.every((r) => formattedCriteriaArr.includes(r))
      ) {
        let finalFormattedCriteriaObj = this.createFormattedCriteriaMap();
        return finalFormattedCriteriaObj;
      } else {
        this.coreService.showWarningToast(
          `Please add all mandatory criteria for applying the criteria. Mandatory criteria are ${this.cmCriteriaMandatory.join(
            ", "
          )}`
        );
        return false;
      }
    } else {
      let finalFormattedCriteriaObj = this.createFormattedCriteriaMap();
      return finalFormattedCriteriaObj;
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
          } else {
            dependencyCheckPassed = false;
            this.coreService.showWarningToast(
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

    console.log(formattedCriteriaArr);

    let finalCriteriaObj;

    if (this.checkMandatoryCondition(formattedCriteriaArr)) {
      finalCriteriaObj = this.checkMandatoryCondition(formattedCriteriaArr);
      console.log(finalCriteriaObj);
      if (this.checkDependanceCondition(formattedCriteriaArr)) {
        const postDataCriteria = new FormData();

        let criteriaMap = finalCriteriaObj.criteriaMap;
        let slabText = null;
        let dateText = null;
        let lcyOpr = null;
        let dateOpr = null;

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
          criteriaMap = criteriaMap + "&&&&" + slabText;
        } else if (finalCriteriaObj.lcyOpr) {
          lcyOpr = finalCriteriaObj.lcyOpr;
          criteriaMap = criteriaMap + "&&&&" + lcyOpr;
        }

        if (finalCriteriaObj.dates) {
          let dates = finalCriteriaObj.dates;
          let dateArr = [];
          dates.forEach((date) => {
            let rngArr = [];
            Object.entries(date).forEach((rng) => {
              rng[1] =
                typeof rng[1] == "string"
                  ? rng[1]
                  : (rng[1] as Date).toLocaleString("en-GB");
              rngArr.push(rng.join("="));
            });
            dateArr.push(rngArr.join("::"));
          });
          dateText = dateArr.join("#");
          criteriaMap = criteriaMap + "&&&&" + dateText;
        } else if (finalCriteriaObj.dateOpr) {
          dateOpr = finalCriteriaObj.dateOpr;
          criteriaMap = criteriaMap + "&&&&" + dateOpr;
        }

        console.log("finalcrtmap", criteriaMap);
        postDataCriteria.append("criteriaMap", criteriaMap);
        postDataCriteria.append("userId", this.userId);
        this.postDataCriteria.emit(postDataCriteria);
      }
    }
  }

  getCurrentCriteriaMap() {
    let formattedCriteriaArr = this.createFormattedCriteria();

    let finalCriteriaObj: any = this.createFormattedCriteriaMap();

    if (this.checkDependanceCondition(formattedCriteriaArr)) {
      let criteriaMap = finalCriteriaObj["criteriaMap"];
      let slabText = null;
      let dateText = null;
      let lcyOpr = null;
      let dateOpr = null;

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
        criteriaMap = criteriaMap + "&&&&" + slabText;
      } else if (finalCriteriaObj.lcyOpr) {
        lcyOpr = finalCriteriaObj.lcyOpr;
        criteriaMap = criteriaMap + "&&&&" + lcyOpr;
      }

      if (finalCriteriaObj.dates) {
        let dates = finalCriteriaObj.dates;
        let dateArr = [];
        dates.forEach((date) => {
          let rngArr = [];
          Object.entries(date).forEach((rng) => {
            rng[1] =
              typeof rng[1] == "string"
                ? rng[1]
                : (rng[1] as Date).toLocaleString("en-GB");
            rngArr.push(rng.join("="));
          });
          dateArr.push(rngArr.join("::"));
        });
        dateText = dateArr.join("#");
        criteriaMap = criteriaMap + "&&&&" + dateText;
      } else if (finalCriteriaObj.dateOpr) {
        dateOpr = finalCriteriaObj.dateOpr;
        criteriaMap = criteriaMap + "&&&&" + dateOpr;
      }

      return criteriaMap;
    } else {
      return false;
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
  showDateModal() {
    this.ref = this.dialogService.open(TransactionDateModal, {
      width: "40%",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
      styleClass: "txn-criteria-modal",
      data: { dateRange: this.dateRangeFormData },
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.dateRangeFormData = data;
      }
    });
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
    this.setCriteriaService.setDateRange({
      dateRange: [{ trnStartDate: null, trnEndDate: null }],
    });
  }

  createFormattedCriteriaMap() {
    let criteriaObj = {};
    criteriaObj["slabs"] = null;
    criteriaObj["dates"] = null;
    criteriaObj["lcyOpr"] = null;
    criteriaObj["dateOpr"] = null;
    if (
      this.finalCriteriaCodeText.filter((criteria) => this.isRangeCrt(criteria))
        .length
    ) {
      this.finalCriteriaCodeText
        .filter((crt) => this.isRangeCrt(crt))
        .forEach((criteria) => {
          if (this.getRangeType(criteria) == "Slab") {
            criteriaObj["slabs"] =
              this.txnCriteriaRangeFormData["txnCriteriaRange"];
          } else if (this.getRangeType(criteria) == "date") {
            criteriaObj["dates"] = this.dateRangeFormData["dateRange"];
          }
        });
    } else if (
      this.finalCriteriaCodeText.filter((criteria) =>
        this.isRangeCrtWithoutSlab(criteria)
      ).length
    ) {
      let lcyOprArr = [];
      let dateOprArr = [];

      this.finalCriteriaCodeText
        .filter((crt) => this.isRangeCrtWithoutSlab(crt))
        .forEach((criteria) => {
          if (this.getRangeType(criteria) == "Slab") {
            lcyOprArr.push(criteria);
          } else if (this.getRangeType(criteria) == "date") {
            dateOprArr.push(criteria);
          }
        });
    }

    criteriaObj["criteriaMap"] = this.finalCriteriaCodeText
      .filter((criteria) => !this.isRangeCrt(criteria))
      .join(";");

    return criteriaObj;
  }

  createFormattedCriteria() {
    this.finalCriteriaCodeText = [];
    let formattedCriteriaArr = this.criteriaText.map((crt) => {
      if (!crt) return;
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
    if (this.criteriaName.replace(/\s/g, "").length == 0) {
      this.savingCriteriaTemplateError =
        "Name of Criteria Template cannot be Empty";
    } else {
      this.savingCriteriaTemplateError = null;
      let formattedCriteriaArr = this.createFormattedCriteria();
      let finalCriteriaMapObj: any = this.createFormattedCriteriaMap();
      this.lcySlab = null;

      let criteriaMap = finalCriteriaMapObj.criteriaMap;
      let slabText = null;
      let dateText = null;
      let lcyOpr = null;
      let dateOpr = null;

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
        criteriaMap = criteriaMap + "&&&&" + slabText;
      } else if (finalCriteriaMapObj.lcyOpr) {
        lcyOpr = finalCriteriaMapObj.lcyOpr;
        criteriaMap = criteriaMap + "&&&&" + lcyOpr;
      }

      if (finalCriteriaMapObj.dates) {
        let dates = finalCriteriaMapObj.dates;
        let dateArr = [];
        dates.forEach((date) => {
          let rngArr = [];
          Object.entries(date).forEach((rng) => {
            rng[1] =
              typeof rng[1] == "string"
                ? rng[1]
                : (rng[1] as Date).toLocaleString("en-GB");
            rngArr.push(rng.join("="));
          });
          dateArr.push(rngArr.join("::"));
        });
        dateText = dateArr.join("#");
        criteriaMap = criteriaMap + "&&&&" + dateText;
      } else if (finalCriteriaMapObj.dateOpr) {
        dateOpr = finalCriteriaMapObj.dateOpr;
        criteriaMap = criteriaMap + "&&&&" + dateOpr;
      }

      const formData = new FormData();
      formData.append("userId", this.userId);
      formData.append("criteriaName", this.criteriaName.trim());
      formData.append("criteriaMap", criteriaMap);

      formData.append("lcySlab", this.lcySlab);
      this.saveCriteriaAsTemplate.emit(formData);
    }
  }

  selectCriteriaTemplate(item: any) {
    this.resetCriteriaDropdowns();
    let selectedData: CriteriaTemplateData =
      this.criteriaTemplatesDdlOptions.filter((x: { criteriaName: any }) => {
        return x.criteriaName == item.criteriaName;
      })[0];

    this.criteriaCodeText =
      this.setCriteriaService.setCriteriaMap(selectedData);
    console.log(this.criteriaCodeText);
    this.criteriaText = this.setCriteriaService.decodeFormattedCriteria(
      this.criteriaCodeText,
      this.criteriaMasterData,
      this.cmCriteriaSlabType
    );
  }

  saveCriteriaTemplateLink() {
    if (this.criteriaText.length) {
      this.coreService.setHeaderStickyStyle(false);
      this.coreService.setSidebarBtnFixedStyle(false);
      this.saveTemplateDialogOpen = true;
    } else {
      this.coreService.showWarningToast("Please add criteria.");
    }
  }
}
