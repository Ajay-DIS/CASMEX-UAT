import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TreeNode } from 'primeng/api';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentModeServiceService {
  private token = localStorage.token;
  constructor(private http: HttpClient) { }


  // getData() {
  //   return this.http.get(`${environment.baseUrl}/remittance/paymentModeSettings/getPaymentModeSettings`)
  // }
  // getPaymentModeDescription() {
  //   return this.http.get(`${environment.baseUrl}/remittance/paymentModeSettings/getPaymentModeCriteriaById/23`)
  // }
  // getPaymentModeByCriteriaId(id: string) {
  //   return this.http.get(`${environment.baseUrl}/remittance/paymentModeSettings/getPaymentModeCriteriaById/${id}`);
  // }

  getData() {
    return this.http.get(`/remittance/paymentModeSettings/getPaymentModeSettings`)
  }
  getPaymentModeDescription() {
    return this.http.get(`/remittance/paymentModeSettings/getPaymentModeCriteriaById/23`)
  }
  getPaymentModeByCriteriaId(id: string) {
    return this.http.get(`/remittance/paymentModeSettings/getPaymentModeCriteriaById/${id}`);
  }
  getFiles() {
    return this.http.get<any>('assets/files.json')
      .toPromise()
      .then(res => <TreeNode[]>res.data);
  }
}
