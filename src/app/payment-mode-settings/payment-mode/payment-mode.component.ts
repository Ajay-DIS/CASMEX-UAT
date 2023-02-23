import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Table } from "primeng/table";

import { cmPaymentApplicable } from "../payment-mode-settings.model";
import { PaymentModeService } from "../payment-mode-service.service";
import { CoreService } from "src/app/core.service";

@Component({
  selector: "app-payment-mode",
  templateUrl: "./payment-mode.component.html",
  styleUrls: ["./payment-mode.component.css"],
})
export class PaymentModeComponent implements OnInit {
  @ViewChild("dt") table: Table;
  paymentData: any[] = [];
  paymentApplicableArr: any[] = [];
  constructor(
    private paymentModeService: PaymentModeService,
    private router: Router,
    private coreService: CoreService
  ) {}

  data = [
    {
      id: 23,
      paymentModeName: "SBI",
      criteriaMap: "Correspodent=SBI;Country=India;Currency=INR",
      createdBy: "Yogesh Mishra",
      createdById: "CMU12434",
      createdDate: "2023-01-18T08:45:32.727+00:00",
      status: "A",
      criteriaID: 48,
      cmPaymentApplicable: [
        {
          id: 49,
          paymentModeDetails: "Cash:Cash",
          status: "A",
        },
        {
          id: 47,
          paymentModeDetails: "POS:Credit Card,Debit Card",
          status: "A",
        },
        {
          id: 48,
          paymentModeDetails: "Cheque:Cheque-Group Cheque",
          status: "A",
        },
      ],
    },
    {
      id: 25,
      paymentModeName: "TAX setting",
      criteriaMap: "Country=India:State=st1",
      createdBy: "Yogesh Mishra",
      createdById: "CMU12434",
      createdDate: "2023-01-18T09:10:38.590+00:00",
      status: "A",
      criteriaID: 48,
      cmPaymentApplicable: [
        {
          id: 51,
          paymentModeDetails: "40",
          status: "A",
        },
      ],
    },
    {
      id: 26,
      paymentModeName: "SBI",
      criteriaMap: "Correspodent=SBI;Country=India",
      createdBy: "Yogesh Mishra",
      createdById: "CMU12434",
      createdDate: "2023-01-19T14:01:32.389+00:00",
      status: "A",
      criteriaID: 52,
      cmPaymentApplicable: [
        {
          id: 53,
          paymentModeDetails: "POS:Credit Card,Debit Card",
          status: "A",
        },
        {
          id: 54,
          paymentModeDetails: "Cheque:Cheque-Group Cheque",
          status: "A",
        },
        {
          id: 52,
          paymentModeDetails: "Cash:Cash",
          status: "A",
        },
      ],
    },
    {
      id: 27,
      paymentModeName: "SBI1111",
      criteriaMap: "Correspodent=BOI",
      createdBy: "Yogesh Mishra",
      createdById: "CMU12434",
      createdDate: "2023-01-19T14:01:33.978+00:00",
      status: "A",
      criteriaID: 48,
      cmPaymentApplicable: [
        {
          id: 57,
          paymentModeDetails: "POS:Credit Card,Debit Card",
          status: "A",
        },
        {
          id: 55,
          paymentModeDetails: "Cash:Cash",
          status: "A",
        },
        {
          id: 56,
          paymentModeDetails: "Cheque:Cheque-Group Cheque",
          status: "A",
        },
      ],
    },
    {
      id: 24,
      paymentModeName: "TAX setting",
      criteriaMap: "Country=India",
      createdBy: "Yogesh Mishra",
      createdById: "CMU12434",
      createdDate: "2023-01-18T09:06:49.013+00:00",
      status: "A",
      criteriaID: 48,
      cmPaymentApplicable: [
        {
          id: 50,
          paymentModeDetails: "30",
          status: "A",
        },
      ],
    },
    {
      id: 41,
      paymentModeName: "ICICI",
      criteriaMap: "Correspodent=Any;Country=India;Currency=INR",
      createdBy: "Yogesh Mishra",
      createdById: "CMU12434",
      createdDate: "2023-01-25T05:05:12.019+00:00",
      status: "A",
      criteriaID: 52,
      cmPaymentApplicable: [
        {
          id: 61,
          paymentModeDetails: "Cash:Cash",
          status: "A",
        },
      ],
    },
  ];

  ngOnInit(): void {
    this.coreService.displayLoadingScreen();
    this.paymentModeService
      .getData()
      .subscribe(
        (response: any) => {
          if (response && response.data && response.data.length > 0) {
            response.data.map((item) => {
              item["cmPaymentApplicableString"] = this.getApplicableString(
                item.cmPaymentApplicable as cmPaymentApplicable[]
              );
            });
            this.paymentData = response.data;
            console.log(":: Payment data from API : ", this.paymentData);
          }
        },
        (err) => {
          console.log("Error", err.message);
        }
      )
      .add(() => {
        this.coreService.removeLoadingScreen();
      });
  }
  navigateToViewPayment(data: any) {
    // localStorage.setItem('clickedPaymetData',JSON.stringify(data));
    this.router.navigate([`navbar/view-payment-mode/${data.id}`]);
  }

  getApplicableString(payApplicable: cmPaymentApplicable[]) {
    const test = [];
    payApplicable.map((payment: any) => {
      test.push(payment.paymentModeDetails);
    });
    return test.join(",");
  }
}
