import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FormRuleService {
  constructor(private http: HttpClient) {}
  getRuleCodeData(id: string) {
    return this.http.get(`/remittance/formRulesController/getFormRuleList`, {
      headers: new HttpHeaders().set("userId", id),
    });
  }
  updateFormRuleStatus(data: any) {
    return this.http.post(
      `/remittance/formRulesController/updateFormRuleStatus`,
      data
    );
  }

  getFormRuleForEdit(formRuleCode: any, operation: any) {
    return this.http.get(`/remittance/formRulesController/getFormRuleForEdit`, {
      headers: new HttpHeaders()
        .set("formRuleCode", formRuleCode)
        .set("operation", operation),
    });
  }

  getAddFormRuleCriteriaData(userId: any) {
    return this.http.get(`/remittance/formRulesController/addFormRules`, {
      headers: new HttpHeaders().set("userId", userId),
    });
  }

  getCriteriaMasterData(userId: any) {
    return this.http.get(
      `/remittance/formRulesController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }

  getCorrespondentValuesData(
    formName: any,
    appName: any,
    criteriaMap: any,
    fieldName: any,
    displayName: any
  ) {
    return this.http.get(`/remittance/formRulesController/getCriteriaData`, {
      headers: new HttpHeaders()
        .set("formName", formName)
        .set("applicationName", appName)
        .set("criteriaMap", criteriaMap)
        .set("fieldName", fieldName)
        .set("displayName", displayName),
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

  getAllCriteriaTemplates(id: string): Observable<any> {
    return this.http.get(
      `remittance/formRulesController/getExistingFormRuleList
      `,
      { headers: new HttpHeaders().set("userId", id) }
    );
  }

  addNewFormRule(data): Observable<any> {
    return this.http.post(
      `/remittance/formRulesController/addCriteriaDetails`,
      data
    );
  }

  updateFormRule(userId, data): Observable<any> {
    return this.http.put(
      `/remittance/formRulesController/updateFormRule`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
}
