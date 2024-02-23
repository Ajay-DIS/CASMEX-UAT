import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, forkJoin, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CustomerFormService {
  constructor(private http: HttpClient) {}

  applicationName = JSON.parse(localStorage.getItem("applicationName"));
  moduleName = JSON.parse(localStorage.getItem("moduleName"));

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

  getCustomerMaster() {
    return this.http.get(
      `/appControl/corporateCustomerController/getCustomerProfileMasterData`
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

  getEmployeeDetailsByLetters(empType: any, typeLetters: any) {
    return this.http.get(
      `/appControl/corporateCustomerController/getEmployeeDetails`,
      {
        headers: new HttpHeaders()
          .set("customerType", empType)
          .set("employeeName", typeLetters),
      }
    );
  }

  getFormRuleDataByCritreriaMap(causingCriteriaMap: any) {
    return this.http.get(
      `/appControl/formRulesController/getFormRulesSetting`,
      {
        headers: new HttpHeaders()
          .set("criteriaMap", causingCriteriaMap)
          .set("form", "Customer Profile_Form Rules")
          .set("moduleName", this.moduleName["code"])
          .set("applications", this.applicationName["code"]),
      }
    );
  }

  getDocumentDataByCriteriaMap(causingCriteriaMap: any) {
    return this.http.get(
      `appControl/documentSettingsController/getDocumentSetting`,
      {
        headers: new HttpHeaders()
          .set("criteriaMap", causingCriteriaMap)
          .set("form", "Document Settings")
          .set("moduleName", this.moduleName["code"])
          .set("applications", this.applicationName["code"]),
      }
    );
  }

  saveCustomerFormData(
    customerData: any,
    userId: any,
    customerType: any,
    isConfirmedCustomer: any,
    duplicateCheckFields: any,
    relatedPartyTypeCode: any
  ) {
    return this.http.post(
      `/appControl/corporateCustomerController/saveCorporateCustomer`,
      customerData,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set(
            "customerType",
            customerType == "IND" ? "Individual" : "Corporate"
          )
          .set("isConfirmedCustomer", isConfirmedCustomer)
          .set(
            "duplicateCheck",
            duplicateCheckFields.length ? duplicateCheckFields.join(",") : "NA"
          )
          .set("relatedParty", relatedPartyTypeCode),
      }
    );
  }
  updateCustomerFormData(
    customerData: any,
    userId: any,
    customerType: any,
    isConfirmedCustomer: any,
    duplicateCheckFields: any,
    relatedPartyTypeCode: any
  ) {
    return this.http.put(
      `/appControl/corporateCustomerController/updateCorporateCustomer`,
      customerData,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set(
            "customerType",
            customerType == "IND" ? "Individual" : "Corporate"
          )
          .set("isConfirmedCustomer", isConfirmedCustomer)
          .set(
            "duplicateCheck",
            duplicateCheckFields.length ? duplicateCheckFields.join(",") : "NA"
          )
          .set("relatedParty", relatedPartyTypeCode),
      }
    );
  }

  getCustomerFormDataForEdit(customerId: any, userId: any, customerType: any) {
    return this.http.get(
      `/appControl/corporateCustomerController/getCorporateCustomerDetails/${customerId}`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set(
            "customerType",
            customerType == "IND" ? "Individual" : "Corporate"
          ),
      }
    );
  }

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

  // customer-search-related

  getCustomerListDataOnSearch(
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
}
