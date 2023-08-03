import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CustomerProfileService {
  applicationName: any = null;
  moduleName: any = null;
  constructor(private http: HttpClient) {}

  getCustomerIndividualData(id: string, type: any) {
    return this.http.get(
      `/remittance/individualCustomerController/getIndividualCustomerDetailsList`,
      {
        headers: new HttpHeaders().set("userId", id).set("individual", type),
      }
    );
  }

  getCustomerCorporateData(id: string, type: any) {
    return this.http.get(
      `/remittance/cooperateCustomerController/getCooperateCustomerDetailsList`,
      {
        headers: new HttpHeaders().set("userId", id).set("cooperate", type),
      }
    );
  }

  updateCustomerIndividualStatus(userId: any, status: any, id: any) {
    return this.http.get(
      `/remittance/individualCustomerController/updateIndividualStatus`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("status", status)
          .set("id", id),
      }
    );
  }
  updateCustomerCorporateStatus(userId: any, status: any, id: any) {
    return this.http.get(
      `/remittance/cooperateCustomerController/updateCorperateStatus`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("status", status)
          .set("id", id),
      }
    );
  }
}
