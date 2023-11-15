import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BankRoutingService {
  constructor(private http: HttpClient) {}
  applicationName: any = null;
  moduleName: any = null;

  private statusDataForEditForm: any = undefined;

  setData(data: any) {
    this.statusDataForEditForm = data;
  }

  getData(): any {
    return this.statusDataForEditForm;
  }

  // COMMON SERVICES

  getBanksRoutingAppModuleList() {
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

  getBankRoutingData(id: string, formName: any, appName: any, moduleName: any) {
    return this.http.get(
      `/remittance/banksRoutingController/getBanksRoutingList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }
  updateBankRouteStatus(data: any) {
    return this.http.post(
      `/remittance/banksRoutingController/updateBanksRoutingStatus`,
      data
    );
  }

  getBanksRoutingForEdit(
    routeCode: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/remittance/banksRoutingController/getBanksRoutingCriteriaForEdit`,
      {
        headers: new HttpHeaders()
          .set("routeCode", routeCode)
          .set("operation", operation)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getAddBankRouteCriteriaData(appName: any, moduleName: any, formName: any) {
    return this.http.get(`/remittance/banksRoutingController/addBankRoute`, {
      headers: new HttpHeaders()
        .set("applications", appName)
        .set("moduleName", moduleName)
        .set("form", formName),
    });
  }

  postRouteBankCriteriaSearch(data: any) {
    return this.http.post(
      `/remittance/banksRoutingController/applyCriteriaSearch`,
      data
    );
  }

  addNewRoute(
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.post(
      `/remittance/banksRoutingController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  updateRoute(
    userId,
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.put(
      `/remittance/banksRoutingController/updateBanksRoutingsCriteria`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }
}
