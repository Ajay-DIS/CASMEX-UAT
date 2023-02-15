import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentModeServiceService } from '../payment-mode-service.service';

@Component({
  selector: 'app-payment-mode',
  templateUrl: './payment-mode.component.html',
  styleUrls: ['./payment-mode.component.css']
})
export class PaymentModeComponent implements OnInit {
  paymentData: any[] = [];
  constructor(
    private paymentModeService: PaymentModeServiceService,
    private router: Router
  ) { }



  ngOnInit(): void {
    this.paymentModeService.getData()
      .subscribe(
        (response: any) => {
          console.log("responsemmmmm", response);
          if (response && response.data && response.data.length > 0) {
            response.data.map(item => {
              const test = [];
              item.cmPaymentApplicable.map((payment: any) => {
                test.push(payment.paymentModeDetails);
              });
              item.paymentModeDetails = test.join(',');
            });
            this.paymentData = response.data;
            // this.paymentData = this.data
            console.log(this.paymentData)
          }
        }
      )
  }
  navigateToViewPayment(data: any) {
      // localStorage.setItem('clickedPaymetData',JSON.stringify(data));
    this.router.navigate([`navbar/view-payment-mode/${data.id}`,]);
  }

}
