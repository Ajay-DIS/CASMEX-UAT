import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CustomerFormService {
  constructor(private http: HttpClient) {}

  getCustomerMaster() {
    return this.http.get(
      `/remittance/corporateCustomerController/getCustomerProfileMasterData`
    );
  }

  getCausingCriteriaFields(
    id: string,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/remittance/commonUtilController/getLoyaltyProgramCriteriaFields`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getEmployeeDetailsByLetters(empType: any, typeLetters: any) {
    return this.http.get(
      `/remittance/corporateCustomerController/getEmployeeDetails`,
      {
        headers: new HttpHeaders()
          .set("customerType", empType)
          .set("employeeName", typeLetters),
      }
    );
  }

  getFormRuleDataByCritreriaMap(causingCriteriaMap: any) {
    return this.http.get(
      `/remittance/formRulesController/getFormRulesSetting`,
      {
        headers: new HttpHeaders()
          .set("criteriaMap", causingCriteriaMap)
          .set("form", "Customer Profile_Form Rules")
          .set("moduleName", "Remittance")
          .set("applications", "Casmex Core"),
      }
    );
  }

  getDocumentDataByCriteriaMap(causingCriteriaMap: any) {
    return this.http.get(
      `remittance/documentSettingsController/getDocumentSetting`,
      {
        headers: new HttpHeaders()
          .set("criteriaMap", causingCriteriaMap)
          .set("form", "Document Settings")
          .set("moduleName", "Remittance")
          .set("applications", "Casmex Core"),
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
      `/remittance/corporateCustomerController/saveCorporateCustomer`,
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
      `/remittance/corporateCustomerController/updateCorporateCustomer`,
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
      `/remittance/corporateCustomerController/getCorporateCustomerDetails/${customerId}`,
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
      `/remittance/corporateCustomerController/getCorporateCustomerDetailsList`,
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
}
