import { Component } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { take } from "rxjs/operators";
import { SetCriteriaService } from "../../components/set-criteria/set-criteria.service";
import { CoreService } from "src/app/core.service";

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
    public config: DynamicDialogConfig,
    private setCriteriaService: SetCriteriaService,
    private coreService: CoreService
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

    this.ref.onClose.pipe(take(1)).subscribe((res) => {
      if (this.isTxnCriteriaRangesSaved) {
        this.coreService.showSuccessToast("Amount Range Saved");
      } else {
        if (this.isFormDataChanged) {
          this.coreService.showWarningToast("Amount Ranges Not Saved Properly");
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
    if (!(e.value > 9999999999)) {
      if (this.txnCriteriaRange.controls) {
        (this.txnCriteriaRange.controls[i] as UntypedFormGroup)?.controls[
          "to"
        ].setValue(e.value);
      }
    }
  }
  changeFrom(e: any, i: any) {
    if (!(e.value > 9999999999)) {
      if (this.txnCriteriaRange.controls) {
        (this.txnCriteriaRange.controls[i] as UntypedFormGroup)?.controls[
          "from"
        ].setValue(e.value);
      }
    }
  }

  addTxnCriteriaRange(): void {
    if (this.txnCriteriaRange?.length >= 10) {
      this.isAnyErrorInRangeMsg = "Maximum 10 Amount Ranges Can Be Added";
      setTimeout(() => {
        this.isAnyErrorInRangeMsg = "";
      }, 1500);
    } else {
      this.checkConditions();
      if (this.isRangeValueLessThanZero) {
        this.isAnyErrorInRangeMsg = "Range Value Should Be Positive";
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
          "Amount From value should be less than Amount To value";
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

  deleteRange(i) {
    this.txnCriteriaRange = this.txnCriteriaRangeForm.get(
      "txnCriteriaRange"
    ) as UntypedFormArray;
    this.txnCriteriaRange.removeAt(i);
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
        "Amount From value should be less than Amount To value";
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
        this.setCriteriaService.setTransactionCriteriaRange(
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
