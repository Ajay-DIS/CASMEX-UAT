import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { BankRoutingService } from "../bank-routing.service";

@Component({
  templateUrl: "./transaction-criteria-modal.html",
  styleUrls: ["./transaction-criteria-modal.css"],
})
export class TransactionCriteriaModal {
  txnCriteriaRangeForm: FormGroup = new FormGroup({
    txnCriteriaRange: new FormArray([]),
  });
  txnCriteriaRange: FormArray = new FormArray([]);

  showError: boolean = false;
  rangesOverlapping = false;
  isTxnCriteriaRangesSaved = false;
  isAnyRangeOverlappingErrMsg = "";
  isRangeEmpty = false;
  isOrderIncorrect = false;
  TransactionCriteriaRange = [];
  isFormDataChanged = true;

  constructor(
    private formBuilder: FormBuilder,
    private ref: DynamicDialogRef,
    private ngxToaster: ToastrService,
    public config: DynamicDialogConfig,
    private bankRoutingService: BankRoutingService
  ) {}

  get allTxnCriteriaRange(): FormArray {
    return this.txnCriteriaRangeForm.get("txnCriteriaRange") as FormArray;
  }

  ngOnInit() {
    this.txnCriteriaRangeForm.valueChanges.subscribe((x) => {
      // this.txnCriteriaRange = new FormArray([]);
      // this.allTxnCriteriaRange = new FormArray([])

      // this.allTxnCriteriaRange.value.forEach((range) => {
      //   this.txnCriteriaRange.push(
      //     this.createTxnCriteriaRange(range.from, range.to)
      //   );
      //   this.allTxnCriteriaRange.push(
      //     this.createTxnCriteriaRange(range.from, range.to)
      //   );
      // });

      let savedData = JSON.stringify(this.config.data.txnCriteriaRange);
      let formData = JSON.stringify(x);
      if (savedData == formData) {
        this.isFormDataChanged = false;
      } else {
        this.isFormDataChanged = true;
      }
    });

    if (Object.keys(this.config.data.txnCriteriaRange).length) {
      console.log(this.config.data.txnCriteriaRange);
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

  createTxnCriteriaRange(from: number, to: number): FormGroup {
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
    if (this.txnCriteriaRange && this.txnCriteriaRange?.length) {
      this.txnCriteriaRange.controls.forEach((range) => {
        if (range.value) {
          if (range.value.from == null || range.value.to == null) {
            this.isRangeEmpty = true;
          } else if (range.value.from > range.value.to) {
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
    console.log("changed", e);
    if (this.txnCriteriaRange.controls) {
      (this.txnCriteriaRange.controls[i] as FormGroup)?.controls["to"].setValue(
        e
      );
    }
  }
  changeFrom(e: any, i: any) {
    if (e >= 0) {
      if (this.txnCriteriaRange.controls) {
        (this.txnCriteriaRange.controls[i] as FormGroup)?.controls[
          "from"
        ].setValue(e);
      }
    } else {
      if (this.txnCriteriaRange.controls) {
        (this.txnCriteriaRange.controls[i] as FormGroup)?.controls[
          "from"
        ].patchValue(0);
      }
    }
    console.log("changed", e);
  }

  addTxnCriteriaRange(): void {
    if (this.txnCriteriaRange?.length >= 10) {
      this.isAnyRangeOverlappingErrMsg =
        "Maximum 10 Transaction ranges can be added";
      setTimeout(() => {
        this.isAnyRangeOverlappingErrMsg = "";
      }, 1500);
    } else {
      this.checkConditions();
      if (this.rangesOverlapping) {
        this.isAnyRangeOverlappingErrMsg =
          "Overlapping criteria range found, please update";
        setTimeout(() => {
          this.isAnyRangeOverlappingErrMsg = "";
        }, 1500);
      } else if (this.isRangeEmpty) {
        console.log(
          "slabformdata",
          this.txnCriteriaRangeForm.get("txnCriteriaRange") as FormArray
        );
        this.isAnyRangeOverlappingErrMsg =
          "Empty range found, please fill it first";
        setTimeout(() => {
          this.isAnyRangeOverlappingErrMsg = "";
        }, 1500);
      } else if (this.isOrderIncorrect) {
        console.log(
          "slabformdata",
          this.txnCriteriaRangeForm.get("txnCriteriaRange") as FormArray
        );
        this.isAnyRangeOverlappingErrMsg =
          "LCY amount From value cannot exceed LCY amount To value";
        setTimeout(() => {
          this.isAnyRangeOverlappingErrMsg = "";
        }, 1500);
      } else {
        this.isTxnCriteriaRangesSaved = false;
        this.txnCriteriaRange = this.txnCriteriaRangeForm.get(
          "txnCriteriaRange"
        ) as FormArray;
        this.txnCriteriaRange.push(this.createTxnCriteriaRange(null, null));
      }
    }
  }

  saveTxnCriteriaRanges() {
    this.checkConditions();
    console.log("::rangeOverlap", this.rangesOverlapping);
    console.log("::empty", this.isRangeEmpty);
    if (this.rangesOverlapping) {
      this.isAnyRangeOverlappingErrMsg =
        "Overlapping criteria range found, please update";
      setTimeout(() => {
        this.isAnyRangeOverlappingErrMsg = "";
      }, 1500);
    } else if (this.isOrderIncorrect) {
      console.log(
        "slabformdata",
        this.txnCriteriaRangeForm.get("txnCriteriaRange") as FormArray
      );
      this.isAnyRangeOverlappingErrMsg =
        "LCY amount From value cannot exceed LCY amount To value";
      setTimeout(() => {
        this.isAnyRangeOverlappingErrMsg = "";
      }, 1500);
    } else {
      if (this.isRangeEmpty) {
        this.isAnyRangeOverlappingErrMsg =
          "Empty range found, please fill it first";
        setTimeout(() => {
          this.isAnyRangeOverlappingErrMsg = "";
        }, 1500);
      } else {
        this.isTxnCriteriaRangesSaved = true;
        console.log("form value", this.txnCriteriaRangeForm.value);

        this.txnCriteriaRangeForm.value.txnCriteriaRange.forEach((range, i) => {
          if (
            i > 0 &&
            Object.values(range).filter((rng) => rng == null).length
          ) {
            console.log("null", range, Object.values(range));
            this.txnCriteriaRangeForm.value.txnCriteriaRange.splice(i, 1);
          }
        });

        this.TransactionCriteriaRange = this.txnCriteriaRangeForm.value;

        console.log("::slabform", this.TransactionCriteriaRange);
        console.log("::setting form");
        this.bankRoutingService.setTransactionCriteriaRange(
          this.TransactionCriteriaRange
        );
      }
    }
  }

  closeModal() {
    this.saveTxnCriteriaRanges();
    if (this.isTxnCriteriaRangesSaved && !this.isRangeEmpty) {
      console.log("closing");
      // this.ref.close(this.txnCriteriaRangeForm.value);
      this.ref.close(this.TransactionCriteriaRange);
    }
  }
}
