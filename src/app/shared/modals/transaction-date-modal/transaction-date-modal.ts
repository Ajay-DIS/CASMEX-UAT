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
  templateUrl: "./transaction-date-modal.html",
  styleUrls: ["./transaction-date-modal.scss"],
})
export class TransactionDateModal {
  dateRangeForm: UntypedFormGroup = new UntypedFormGroup({
    dateRange: new UntypedFormArray([]),
  });
  dateRange: UntypedFormArray = new UntypedFormArray([]);

  showError: boolean = false;
  rangesOverlapping = false;
  isDateRangesSaved = false;
  isAnyErrorInRangeMsg = "";
  isRangeEmpty = false;
  isOrderIncorrect = false;
  DateRange = [];
  isFormDataChanged = true;
  isRangeValueLessThanZero = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private setCriteriaService: SetCriteriaService,
    private coreService: CoreService
  ) {}

  get allDateRange(): UntypedFormArray {
    return this.dateRangeForm.get("dateRange") as UntypedFormArray;
  }

  ngOnInit() {
    this.dateRangeForm.valueChanges.subscribe((x) => {
      let savedData = JSON.stringify(this.config.data.dateRange);
      let formData = JSON.stringify(x);
      if (savedData == formData) {
        this.isFormDataChanged = false;
      } else {
        this.isFormDataChanged = true;
      }
    });

    if (Object.keys(this.config.data.dateRange).length) {
      this.config.data.dateRange.dateRange.forEach((range) => {
        console.log(range);
        this.dateRange.push(
          this.createDateRange(range.trnStartDate, range.trnEndDate)
        );
        this.allDateRange.push(
          this.createDateRange(range.trnStartDate, range.trnEndDate)
        );
      });
    } else {
      this.addDateRange();
    }

    console.log(this.dateRange);
    console.log(this.allDateRange);

    this.ref.onClose.pipe(take(1)).subscribe((res) => {
      if (this.isDateRangesSaved) {
        this.coreService.showSuccessToast("Date ranges saved");
      } else {
        if (this.isFormDataChanged) {
          this.coreService.showWarningToast("Date ranges not saved properly");
        }
      }
    });
  }

  areOverlapping = (a: any, b: any) =>
    b.trnStartDate <= a.trnStartDate
      ? b.trnEndDate >= a.trnStartDate &&
        typeof b.trnEndDate == typeof a.trnStartDate
      : b.trnStartDate <= a.trnEndDate &&
        typeof a.trnEndDate == typeof b.trnStartDate;

  createDateRange(trnStartDate: any, trnEndDate: any): UntypedFormGroup {
    return this.formBuilder.group({
      trnStartDate: trnStartDate,
      trnEndDate: trnEndDate,
    });
  }

  checkConditions() {
    let rangesArr = [];
    this.rangesOverlapping = false;
    this.isRangeEmpty = false;
    this.isOrderIncorrect = false;
    this.isRangeValueLessThanZero = false;
    if (this.dateRange && this.dateRange?.length) {
      this.dateRange.controls.forEach((range) => {
        if (range.value) {
          if (
            range.value.trnStartDate == null ||
            range.value.trnEndDate == null
          ) {
            this.isRangeEmpty = true;
          } else if (
            range.value.trnStartDate < 0 ||
            range.value.trnEndDate < 0
          ) {
            this.isRangeValueLessThanZero = true;
          } else if (range.value.trnStartDate >= range.value.trnEndDate) {
            console.log(range.value.trnStartDate, range.value.trnEndDate);
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
    console.log(e.toLocaleDateString("en-GB"), typeof e, new Date(e));
    if (this.dateRange.controls) {
      (this.dateRange.controls[i] as UntypedFormGroup)?.controls[
        "trnEndDate"
      ].setValue(e);
    }
  }
  changeFrom(e: any, i: any) {
    console.log(e, typeof e);
    if (this.dateRange.controls) {
      (this.dateRange.controls[i] as UntypedFormGroup)?.controls[
        "trnStartDate"
      ].setValue(e);
    }
  }

  addDateRange(): void {
    if (this.dateRange?.length >= 10) {
      this.isAnyErrorInRangeMsg = "Maximum 10 Date ranges can be added";
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
          "Overlapping date range found, please update";
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
          "Date From value should be less than Date To value";
        setTimeout(() => {
          this.isAnyErrorInRangeMsg = "";
        }, 1500);
      } else {
        this.isRangeValueLessThanZero = false;
        this.isDateRangesSaved = false;
        this.dateRange = this.dateRangeForm.get(
          "dateRange"
        ) as UntypedFormArray;
        this.dateRange.push(this.createDateRange(null, null));
      }
    }
  }

  deleteRange(i) {
    this.dateRange = this.dateRangeForm.get("dateRange") as UntypedFormArray;
    this.dateRange.removeAt(i);
  }

  saveDateRanges() {
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
        "Date From value should be less than Date To value";
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
        this.isDateRangesSaved = true;

        this.dateRangeForm.value.dateRange.forEach((range, i) => {
          if (
            i > 0 &&
            Object.values(range).filter((rng) => rng == null).length
          ) {
            this.dateRangeForm.value.dateRange.splice(i, 1);
          }
        });

        this.DateRange = this.dateRangeForm.value;
        this.setCriteriaService.setDateRange(this.DateRange);
      }
    }
  }

  closeModal() {
    this.saveDateRanges();
    if (this.isDateRangesSaved && !this.isRangeEmpty) {
      this.ref.close(this.DateRange);
    }
  }
}
