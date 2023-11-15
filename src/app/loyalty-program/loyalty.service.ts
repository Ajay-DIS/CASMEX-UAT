import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoyaltyService {
  constructor(private http: HttpClient) {}

  applicationName = "Casmex Core";
  moduleName = "Remittance";

  private statusDataForEditForm: any = undefined;

  setData(data: any) {
    this.statusDataForEditForm = data;
  }

  getData(): any {
    return this.statusDataForEditForm;
  }

  // COMMON SERVICES
  getAppModuleList() {
    return this.http.get(`/remittance/banksRoutingController/criteriaTypes`);
  }

  getCriteriaMasterData(
    userId: any,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(
      `/remittance/formRulesController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("form", formName)
          .set("applications", appName)
          .set("moduleName", moduleName),
      }
    );
  }

  getCorrespondentValuesData(
    formName: any,
    appName: any,
    criteriaMap: any,
    fieldName: any,
    displayName: any,
    moduleName: any
  ) {
    return this.http.get(`/remittance/formRulesController/getCriteriaData`, {
      headers: new HttpHeaders()
        .set("form", formName)
        .set("applications", appName)
        .set("criteriaMap", criteriaMap)
        .set("fieldName", fieldName)
        .set("displayName", displayName)
        .set("moduleName", moduleName),
    });
  }

  currentCriteriaSaveAsTemplate(data: any): Observable<any> {
    return this.http.post(
      `remittance/formRulesController/saveFormRuleCriteria`,
      data
    );
  }

  getAllCriteriaTemplates(
    id: string,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.get(
      `remittance/formRulesController/getExistingFormRuleList
      `,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }
  // COMMON SERVICES END

  getProgramTypeData() {
    return this.http.get(`/remittance/loyaltyProgramController/getProgramType`);
  }
  getPromoCodeData(promoLength: any) {
    return this.http.get(`/remittance/loyaltyProgramController/getPromocode`, {
      headers: new HttpHeaders().set("length", promoLength),
    });
  }

  getLoyaltyProgramData(
    id: string,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(
      `/remittance/loyaltyProgramController/getLoyaltyProgramList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getCustomerLoyaltyDetailsData(
    id: string,
    criteriaMap: any,
    pageNumber: any,
    pageSize: any,
    sortBy: any,
    orderBy: any
  ) {
    return this.http.get(
      `/remittance/loyaltyProgramController/getCustomerLoyaltyRedeemDetailsList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("criteriaMap", criteriaMap)
          .set("pageNumber", pageNumber)
          .set("pageSize", pageSize)
          .set("sortBy", sortBy)
          .set("orderBy", orderBy),
      }
    );
  }

  updateLoyaltyStatus(data: any) {
    return this.http.post(
      `/remittance/loyaltyProgramController/updateLoyaltyProgramStatus`,
      data
    );
  }

  getLoyaltyProgramForEdit(
    programCode: any,
    operation: any,
    id: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/remittance/loyaltyProgramController/getLoyaltyProgramEdit`,
      {
        headers: new HttpHeaders()
          .set("programCode", programCode)
          .set("operation", operation)
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getAddLoyaltyProgramCriteriaData(
    id: string,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/remittance/loyaltyProgramController/addLoyaltyProgram`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  postLoyaltyProgramCriteriaSearch(data: any) {
    return this.http.post(
      `/remittance/loyaltyProgramController/applyCriteriaSearch`,
      data
    );
  }

  addNewLoyaltyProgram(
    userId: any,
    data: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.post(
      `/remittance/loyaltyProgramController/saveLoyaltyProgram`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("operation", operation)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  updateLoyaltyProgram(
    userId: any,
    data: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any,
    reset: any
  ): Observable<any> {
    return this.http.post(
      `/remittance/loyaltyProgramController/updateLoyaltyProgram`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("operation", operation)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName)
          .set("reset", reset),
      }
    );
  }
}
