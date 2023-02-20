import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PaymentModeService } from "../payment-mode-service.service";

@Component({
  selector: "app-view-payment-mode",
  templateUrl: "./view-payment-mode.component.html",
  styleUrls: ["./view-payment-mode.component.css"],
})
export class ViewPaymentModeComponent implements OnInit {
  selectedPaymentData: any;
  criteriaOperations: any[] = [];
  getdata: any[] = [];
  response: any;
  criteriaText: any[] = [];
  testData: any[] = [];
  criteriaSetData: any[] = [];
  paymodeData: any[] = [];
  payCateData: any[] = [];
  selectedPaymentMode = "";
  selectedPaymentCategory = "";

  constructor(
    private paymentModeService: PaymentModeService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.params;
    if (params && params.id) {
      this.paymentModeService
        .getPaymentModeByCriteriaId(params.id)
        .subscribe((response: any) => {
          console.log(response);
          const co =
            response.cmCriteriaData?.cmCriteriaDataDetails[0]?.operations.split(
              ","
            );
          this.criteriaOperations = co;
          response.cmCriteriaData.cmCriteriaDataDetails.map((item: any) => {
            this.testData.push(item);
          });

          response.paymentMode.map((pMode: any) => {
            this.paymodeData.push(pMode);
          });

          response.paymentCategory.map((pCate: any) => {
            this.payCateData.push(pCate);
            console.log(this.payCateData);
          });
          response.data.map((item: any) => {
            item.cmPaymentApplicable.map((payment: any) => {
              const test = payment.paymentModeDetails.split(":");
              payment.payment = test[0];
              payment.paymentMethod = test[1];
              this.getdata.push(payment);
            });
            this.criteriaText = item.criteriaMap.split(";");
          });
        });
    }
  }
  onPaymentModeAdd() {
    if (this.selectedPaymentCategory && this.selectedPaymentMode) {
      if (
        !this.criteriaText.includes(this.selectedPaymentCategory) ||
        !this.criteriaText.includes(this.selectedPaymentMode)
      ) {
        this.getdata.push({
          paymentMethod: this.selectedPaymentMode,
          payment: this.selectedPaymentCategory,
        });
      }
    }
  }
  changeCriteriaFields(criteriaName: any) {
    const criteria = this.testData.find(
      (item) => item.displayName === criteriaName
    );
    this.criteriaOperations = criteria.operations.split(",");
  }
  ondeletecriteria(i) {
    this.criteriaText.splice(i, 1);
  }
}
// const paymentData = localStorage.getItem('clickedPaymetData');
// if(paymentData){
//   this.selectedPaymentData = JSON.parse(paymentData);
//   this.criteriaText = this.selectedPaymentData.criteriaMap.split(';');
//   this.selectedPaymentData.cmPaymentApplicable.map((payment: any) =>{
//     const test = payment.paymentModeDetails.split(':');
//     payment.payment = test[0];
//     payment.paymentMethod = test[1];
//     this.getdata.push(payment);
//   });
// }
