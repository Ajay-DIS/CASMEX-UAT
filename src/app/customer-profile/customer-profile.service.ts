import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CustomerProfileService {
  applicationName: any = null;
  moduleName: any = null;

  constructor(private http: HttpClient) {}
  // getCustomerIndividualData(
  //   id: string,
  //   criteriaMap: any,
  //   pageNumber: any,
  //   pageSize: any
  // ) {
  //   return this.http.get(
  //     `/remittance/individualCustomerController/getIndividualCustomerDetailsList`,
  //     {
  //       headers: new HttpHeaders()
  //         .set("userId", id)
  //         .set("criteriaMap", criteriaMap)
  //         .set("pageNumber", pageNumber)
  //         .set("pageSize", pageSize),
  //     }
  //   );
  // }

  getCustomerCorporateData(
    id: string,
    criteriaMap: any,
    pageNumber: any,
    pageSize: any,
    custType: any
  ) {
    return this.http.get(
      `/remittance/corporateCustomerController/getCorporateCustomerDetailsList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("criteriaMap", criteriaMap)
          .set("pageNumber", pageNumber)
          .set("pageSize", pageSize)
          .set("customerType", custType),
      }
    );
  }
  getDataForsearchCriteria(
    id: string,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/remittance/corporateCustomerController/getCustomerSearchSetting`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applicationName", appName)
          .set("moduleName", moduleName)
          .set("formName", formName),
      }
    );
  }
  // updateCustomerIndividualStatus(userId: any, status: any, id: any) {
  //   return this.http.get(
  //     `/remittance/individualCustomerController/updateIndividualStatus`,
  //     {
  //       headers: new HttpHeaders()
  //         .set("userId", userId)
  //         .set("status", status)
  //         .set("id", id),
  //     }
  //   );
  // }
  updateCustomerCorporateStatus(
    userId: any,
    status: any,
    id: any,
    custType: any
  ) {
    return this.http.get(
      `/remittance/corporateCustomerController/updateCorporateStatus`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("status", status)
          .set("id", id)
          .set("customerType", custType),
      }
    );
  }
}
