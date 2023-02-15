import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bank-routing',
  templateUrl: './bank-routing.component.html',
  styleUrls: ['./bank-routing.component.css'],
})
export class BankRoutingComponent implements OnInit {
  constructor(private router: Router) {}

  bankRoutingData: BankRouting[] = [
    {
      routeCode: 'R0001',

      country: 'India',

      routeBankName: 'HDFC',

      serviceCategoryFrom: 'Cash',

      serviceTypeFrom: 'Cash',

      isCorrespondent: 'Yes',

      routeTo: 'HDFC',

      serviceCategoryTo: 'Cash',

      serviceTypeTo: 'Cash',

      status: 'Active',
    },
    {
      routeCode: 'R0002',

      country: 'Sri Lanka',

      routeBankName: 'Axis Bank',

      serviceCategoryFrom: 'Bank',

      serviceTypeFrom: 'NEFT',

      isCorrespondent: 'No',

      routeTo: 'HDFC',

      serviceCategoryTo: 'Bank',

      serviceTypeTo: 'NEFT',

      status: 'Active',
    },
    {
      routeCode: 'R0003',

      country: 'India',

      routeBankName: 'SBI',

      serviceCategoryFrom: 'Bank',

      serviceTypeFrom: 'Account transfer',

      isCorrespondent: 'Yes',

      routeTo: 'SBI',

      serviceCategoryTo: 'Bank',

      serviceTypeTo: 'Account transfer',

      status: 'Deactive',
    },
  ]

  ngOnInit(): void {}

  viewBankRouting(data: any){
    this.router.navigate([`navbar/view-bank-routing/${data.id}`,]);
  }
}

interface BankRouting {
  routeCode: string;

  country: string;

  routeBankName: string;

  serviceCategoryFrom: string;

  serviceTypeFrom: string;

  isCorrespondent: string;

  routeTo: string;

  serviceCategoryTo: string;

  serviceTypeTo: string;

  status: string;
}
