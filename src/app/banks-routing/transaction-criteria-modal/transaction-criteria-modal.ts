import { Component, OnInit } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { BankRoutingService } from "../bank-routing.service";

@Component({
  templateUrl: "./transaction-criteria-modal.html",
  styleUrls: ["./transaction-criteria-modal.scss"],
})
export class TransactionCriteriaModal {
  txnCriteriaRangeForm: UntypedFormGroup = new UntypedFormGroup({
    txnCriteriaRange: new UntypedFormArray([]),
  });
  txnCriteriaRange: UntypedFormArray = new UntypedFormArray([]);

  showError: boolean = false;
  rangesOverlapping = false;
  isTxnCriteriaRangesSaved = false;
  isAnyErrorInRangeMsg = "";
  isRangeEmpty = false;
  isOrderIncorrect = false;
  TransactionCriteriaRange = [];
  isFormDataChanged = true;
  isRangeValueLessThanZero = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ref: DynamicDialogRef,
    private ngxToaster: ToastrService,
    public config: DynamicDialogConfig,
    private bankRoutingService: BankRoutingService
  ) {}

  get allTxnCriteriaRange(): UntypedFormArray {
    return this.txnCriteriaRangeForm.get(
      "txnCriteriaRange"
    ) as UntypedFormArray;
  }

  ngOnInit() {
    this.txnCriteriaRangeForm.valueChanges.subscribe((x) => {
      let savedData = JSON.stringify(this.config.data.txnCriteriaRange);
      let formData = JSON.stringify(x);
      if (savedData == formData) {
        this.isFormDataChanged = false;
      } else {
        this.isFormDataChanged = true;
      }
    });

    if (Object.keys(this.config.data.txnCriteriaRange).length) {
      this.config.data.txnCriteriaRange.txnCriteriaRange.forEach((range) => {
        this.txnCriteriaRange.push(
          this.createTxnCriteriaRange(range.from, range.to)
        );
        this.allTxnCriteriaRange.push(
          this.createTxnCriteriaRange(range.from, range.to)
        );
      });
    } else {
      this.addTxnCriteriaRange();
    }

    this.ref.onClose.subscribe((res) => {
      if (this.isTxnCriteriaRangesSaved) {
        this.ngxToaster.success("Transaction ranges saved");
      } else {
        if (this.isFormDataChanged) {
          this.ngxToaster.warning("Transaction ranges not saved properly");
        }
      }
    });
  }

  areOverlapping = (a: any, b: any) =>
    b.from <= a.from
      ? b.to >= a.from && typeof b.to == typeof a.from
      : b.from <= a.to && typeof a.to == typeof b.from;

  createTxnCriteriaRange(from: number, to: number): UntypedFormGroup {
    return this.formBuilder.group({
      from: from,
      to: to,
    });
  }

  checkConditions() {
    let rangesArr = [];
    this.rangesOverlapping = false;
    this.isRangeEmpty = false;
    this.isOrderIncorrect = false;
    this.isRangeValueLessThanZero = false;
    if (this.txnCriteriaRange && this.txnCriteriaRange?.length) {
      this.txnCriteriaRange.controls.forEach((range) => {
        if (range.value) {
          if (range.value.from == null || range.value.to == null) {
            this.isRangeEmpty = true;
          } else if (range.value.from < 0 || range.value.to < 0) {
            this.isRangeValueLessThanZero = true;
          } else if (range.value.from >= range.value.to) {
            this.isOrderIncorrect = true;
          }
          rangesArr.push(range.value);
        }
      });

      rangesArr.forEach((range, i) => {
        if (i < rangesArr.length - 1) {
          if (this.areOverlapping(range, rangesArr[rangesArr.length - 1])) {
            this.rangesOverlapping = true;
          }
        }
      });
    }
  }

  changeTo(e: any, i: any) {
    if (this.txnCriteriaRange.controls) {
      (this.txnCriteriaRange.controls[i] as UntypedFormGroup)?.controls[
        "to"
      ].setValue(e);
    }
  }
  changeFrom(e: any, i: any) {
    if (this.txnCriteriaRange.controls) {
      (this.txnCriteriaRange.controls[i] as UntypedFormGroup)?.controls[
        "from"
      ].setValue(e);
    }
  }

  addTxnCriteriaRange(): void {
    if (this.txnCriteriaRange?.length >= 10) {
      this.isAnyErrorInRangeMsg = "Maximum 10 Transaction ranges can be added";
      setTimeout(() => {
        this.isAnyErrorInRangeMsg = "";
      }, 1500);
    } else {
      this.checkConditions();
      if (this.isRangeValueLessThanZero) {
        this.isAnyErrorInRangeMsg = "Range Value should be positive";
        setTimeout(() => {
          this.isAnyErrorInRangeMsg = "";
        }, 1500);
      } else if (this.rangesOverlapping) {
        this.isAnyErrorInRangeMsg =
          "Overlapping criteria range found, please update";
        setTimeout(() => {
          this.isAnyErrorInRangeMsg = "";
        }, 1500);
      } else if (this.isRangeEmpty) {
        this.isAnyErrorInRangeMsg = "Empty range found, please fill it first";
        setTimeout(() => {
          this.isAnyErrorInRangeMsg = "";
        }, 1500);
      } else if (this.isOrderIncorrect) {
        this.isAnyErrorInRangeMsg =
          "LCY amount From value should be less than LCY amount To value";
        setTimeout(() => {
          this.isAnyErrorInRangeMsg = "";
        }, 1500);
      } else {
        this.isRangeValueLessThanZero = false;
        this.isTxnCriteriaRangesSaved = false;
        this.txnCriteriaRange = this.txnCriteriaRangeForm.get(
          "txnCriteriaRange"
        ) as UntypedFormArray;
        this.txnCriteriaRange.push(this.createTxnCriteriaRange(null, null));
      }
    }
  }

  saveTxnCriteriaRanges() {
    this.checkConditions();
    if (this.isRangeValueLessThanZero) {
      this.isAnyErrorInRangeMsg = "Range Value should be positive";
      setTimeout(() => {
        this.isAnyErrorInRangeMsg = "";
      }, 1500);
    } else if (this.rangesOverlapping) {
      this.isAnyErrorInRangeMsg =
        "Overlapping criteria range found, please update";
      setTimeout(() => {
        this.isAnyErrorInRangeMsg = "";
      }, 1500);
    } else if (this.isOrderIncorrect) {
      this.isAnyErrorInRangeMsg =
        "LCY amount From value should be less than LCY amount To value";
      setTimeout(() => {
        this.isAnyErrorInRangeMsg = "";
      }, 1500);
    } else {
      if (this.isRangeEmpty) {
        this.isAnyErrorInRangeMsg = "Empty range found, please fill it first";
        setTimeout(() => {
          this.isAnyErrorInRangeMsg = "";
        }, 1500);
      } else {
        this.isTxnCriteriaRangesSaved = true;

        this.txnCriteriaRangeForm.value.txnCriteriaRange.forEach((range, i) => {
          if (
            i > 0 &&
            Object.values(range).filter((rng) => rng == null).length
          ) {
            this.txnCriteriaRangeForm.value.txnCriteriaRange.splice(i, 1);
          }
        });

        this.TransactionCriteriaRange = this.txnCriteriaRangeForm.value;
        this.bankRoutingService.setTransactionCriteriaRange(
          this.TransactionCriteriaRange
        );
      }
    }
  }

  closeModal() {
    this.saveTxnCriteriaRanges();
    if (this.isTxnCriteriaRangesSaved && !this.isRangeEmpty) {
      this.ref.close(this.TransactionCriteriaRange);
    }
  }
}
