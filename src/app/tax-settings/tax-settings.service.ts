import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TaxSettingsService {
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
  getTaxSettingAppModuleList() {
    return this.http.get(
      `/appControl/applicationSettingsController/criteriaTypes`
    );
  }

  getCriteriaMasterData(
    userId: any,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(
      `/appControl/formRulesController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("form", formName)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName)),
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
    return this.http.get(`/appControl/formRulesController/getCriteriaData`, {
      headers: new HttpHeaders()
        .set("form", formName)
        .set("applications", String(appName))
        .set("criteriaMap", criteriaMap)
        .set("fieldName", fieldName)
        .set("displayName", displayName)
        .set("moduleName", String(moduleName)),
    });
  }

  currentCriteriaSaveAsTemplate(data: any): Observable<any> {
    return this.http.post(
      `appControl/formRulesController/saveFormRuleCriteria`,
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
      `appControl/formRulesController/getExistingFormRuleList
      `,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }
  // COMMON SERVICES END

  getTaxCodeData(id: string, formName: any, appName: any, moduleName: any) {
    return this.http.get(
      `/appControl/taxSettingCriteriaController/getTaxCodeList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  updateTaxSettingsStatus(data: any) {
    return this.http.post(
      `/appControl/taxSettingCriteriaController/updateTaxSettingsStatus`,
      data
    );
  }

  getTaxSettingForEdit(
    taxCode: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/appControl/taxSettingCriteriaController/getTaxSettingCriteriaForEdit`,
      {
        headers: new HttpHeaders()
          .set("taxCode", taxCode)
          .set("operation", operation),
      }
    );
  }

  getAddTaxSettingsCriteriaData(appName: any, moduleName: any, formName: any) {
    return this.http.get(
      `/appControl/taxSettingCriteriaController/addTaxSettings`,
      {
        headers: new HttpHeaders()
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  postTaxCriteriaSearch(data: any) {
    return this.http.post(
      `/appControl/taxSettingCriteriaController/applyCriteriaSearch`,
      data
    );
  }

  addNewTax(
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.post(
      `/appControl/taxSettingCriteriaController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  updateTaxSetting(
    userId,
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.put(
      `/appControl/taxSettingCriteriaController/updateTaxSettingsCriteria`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }
}
