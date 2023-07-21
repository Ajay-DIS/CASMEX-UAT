import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FormRuleService {
  constructor(private http: HttpClient) {}
  applicationName: any = null;
  moduleName: any = null;

  getRuleCodeData(id: string, formName: any, appName: any, moduleName: any) {
    return this.http.get(`/remittance/formRulesController/getFormRuleList`, {
      headers: new HttpHeaders()
        .set("userId", id)
        .set("applications", appName)
        .set("moduleName", moduleName)
        .set("form", formName),
    });
  }
  updateFormRuleStatus(data: any) {
    return this.http.post(
      `/remittance/formRulesController/updateFormRuleStatus`,
      data
    );
  }

  getFormRulesAppModuleList() {
    return this.http.get(`/remittance/banksRoutingController/criteriaTypes`);
  }

  getFormRuleForEdit(
    formRuleCode: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(`/remittance/formRulesController/getFormRuleForEdit`, {
      headers: new HttpHeaders()
        .set("formRuleCode", formRuleCode)
        .set("operation", operation)
        .set("applications", appName)
        .set("moduleName", moduleName)
        .set("form", formName),
    });
  }

  getAddFormRuleCriteriaData(
    userId: any,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(`/remittance/formRulesController/addFormRules`, {
      headers: new HttpHeaders()
        .set("userId", userId)
        .set("applications", appName)
        .set("moduleName", moduleName)
        .set("form", formName),
    });
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

  postFormRuleSearch(data: any) {
    return this.http.post(
      `/remittance/formRulesController/applyCriteriaSearch`,
      data
    );
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

  addNewFormRule(
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.post(
      `/remittance/formRulesController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  updateFormRule(
    userId,
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.put(
      `/remittance/formRulesController/updateFormRule`,
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
