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
  // constructor(public ref: DynamicDialogRef, private fb: FormBuilder) {}

  // txnAmountRangesForm = this.fb.group({
  //   txnAmountRanges: new FormArray([
  //     this.fb.group({
  //       from: [2, Validators.required],
  //       to: [5, Validators.required],
  //     }),
  //     this.fb.group({
  //       from: [10, Validators.required],
  //       to: [20, Validators.required],
  //     }),
  //   ]),
  // });

  // showError: boolean = false;

  // get txnAmountRanges() {
  //   return this.txnAmountRangesForm.controls["txnAmountRanges"] as FormArray;
  // }

  // get txnAmountRangeForm() {
  //   return this.txnAmountRanges.controls as unknown as FormGroup;
  // }

  // ngOnInit() {
  //   console.log("::range", this.txnAmountRanges);
  // }

  // addTxnRange() {
  //   if (this.txnAmountRanges.length >= 10) {
  //     this.showError = true;
  //     setTimeout(() => {
  //       this.showError = false;
  //     }, 1500);
  //   } else {
  //     const txnAmountRangeForm = this.fb.group({
  //       from: [null, Validators.required],
  //       to: [null, Validators.required],
  //     });

  //     this.txnAmountRanges.push(txnAmountRangeForm);
  //   }
  // }

  // saveTxnAmountRanges() {
  //   console.log(this.txnAmountRangesForm.value);
  // }

  // dsffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

  orderForm: FormGroup;
  items: FormArray;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.orderForm = new FormGroup({
      items: new FormArray([]),
    });
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      name: "",
      description: "",
      price: "",
    });
  }

  addItem(): void {
    this.items = this.orderForm.get("items") as FormArray;
    this.items.push(this.createItem());
  }

  save() {
    console.log(this.orderForm.value);
  }
}
