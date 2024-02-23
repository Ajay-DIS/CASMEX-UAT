import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, forkJoin, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CustomerProfileService {
  applicationName = JSON.parse(localStorage.getItem("applicationName"));
  moduleName = JSON.parse(localStorage.getItem("moduleName"));

  constructor(private http: HttpClient) {}
  // getCustomerIndividualData(
  //   id: string,
  //   criteriaMap: any,
  //   pageNumber: any,
  //   pageSize: any
  // ) {
  //   return this.http.get(
  //     `/appControl/individualCustomerController/getIndividualCustomerDetailsList`,
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
    custType: any,
    sortBy: any,
    orderBy: any
  ) {
    return this.http.get(
      `/appControl/corporateCustomerController/getCorporateCustomerDetailsList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("criteriaMap", criteriaMap)
          .set("pageNumber", pageNumber)
          .set("pageSize", pageSize)
          .set("sortBy", sortBy)
          .set("orderBy", orderBy)
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
      `/appControl/corporateCustomerController/getCustomerSearchSetting`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applicationName", String(appName))
          .set("moduleName", String(moduleName))
          .set("formName", formName),
      }
    );
  }
  // updateCustomerIndividualStatus(userId: any, status: any, id: any) {
  //   return this.http.get(
  //     `/appControl/individualCustomerController/updateIndividualStatus`,
  //     {
  //       headers: new HttpHeaders()
  //         .set("userId", userId)
  //         .set("status", status)
  //         .set("id", id),
  //     }
  //   );
  // }

  // getCustomerMaster() {
  //   return this.http.get(
  //     `/appControl/corporateCustomerController/getCustomerProfileMasterData`
  //   );
  // }

  // ! calling two api for customer master data
  getCustomerMasterDataFromAppControlAndRemittance(): Observable<any[]> {
    // Define API endpoints
    const appControlUrl =
      "/appControl/formRulesController/getCustomerProfileMasterDataAppControl";
    const remittanceUrl =
      "/remittance/corporateCustomerController/getCustomerProfileMasterDataRemittance";

    // Make HTTP requests to both APIs
    const appControlUrlRequest = this.http.get(appControlUrl);
    const remittanceUrlRequest = this.http.get(remittanceUrl);

    // Combine requests using forkJoin
    return forkJoin([appControlUrlRequest, remittanceUrlRequest]).pipe(
      catchError((error) => {
        // Handle errors if any API request fails
        console.error("Customer Master Data request failed:", error);
        return throwError("API request failed");
      })
    );
  }
  // ! calling two api for customer master data ends

  updateCustomerCorporateStatus(
    userId: any,
    status: any,
    id: any,
    custType: any
  ) {
    return this.http.get(
      `/appControl/corporateCustomerController/updateCorporateStatus`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("status", status)
          .set("id", id)
          .set("customerType", custType),
      }
    );
  }
  updateBeneficiaryStatusApi(userId: any, status: any, id: any, custType: any) {
    return this.http.get(
      `/appControl/beneficiaryProfileController/updateBeneficiaryProfileStatus`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("status", status)
          .set("id", id)
          .set("customerType", custType),
      }
    );
  }

  getCausingCriteriaFields(
    id: string,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/appControl/commonUtilController/getLoyaltyProgramCriteriaFields`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }
}
