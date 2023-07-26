import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class PaymentModeService {
  private token = localStorage.token;
  constructor(private http: HttpClient) {}

  getData() {
    return this.http.get(
      `/remittance/paymentModeSettings/getPaymentModeSettings`
    );
  }
  getPaymentModeByCriteriaId(id: string) {
    return this.http.get(
      `/remittance/paymentModeSettings/getPaymentModeCriteriaById/${id}`
    );
  }
}
