import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  templateUrl: "./transaction-criteria-modal.html",
  styleUrls: ["./transaction-criteria-modal.css"],
})
export class TransactionCriteriaModal {
  showError: boolean = false;
  txnCriteriaRangeForm: FormGroup;
  txnCriteriaRange: FormArray;

  constructor(private formBuilder: FormBuilder, private ref: DynamicDialogRef) {
    this.txnCriteriaRangeForm = new FormGroup({
      txnCriteriaRange: new FormArray([]),
    });
  }

  ngOnInit() {
    this.addTxnCriteriaRange();
  }

  createTxnCriteriaRange(): FormGroup {
    return this.formBuilder.group({
      from: null,
      to: null,
    });
  }

  addTxnCriteriaRange(): void {
    if (this.txnCriteriaRange?.length >= 10) {
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 1500);
    } else {
      this.txnCriteriaRange = this.txnCriteriaRangeForm.get(
        "txnCriteriaRange"
      ) as FormArray;
      this.txnCriteriaRange.push(this.createTxnCriteriaRange());
    }
  }

  saveTxnCriteriaRanges() {
    console.log(this.txnCriteriaRangeForm.value);
  }
  
  closeModal() {
    this.saveTxnCriteriaRanges()
    this.ref.close(this.txnCriteriaRangeForm.value);

  }
}
