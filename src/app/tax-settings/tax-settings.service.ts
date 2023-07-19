import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TaxSettingsService {
  constructor(private http: HttpClient) {}

  appName = "Web Application";
  moduleName = "Remittance";
  formName = "Tax Settings";

  getTaxCodeData(id: string) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxCodeList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", this.appName)
          .set("moduleName", this.moduleName)
          .set("form", this.formName),
      }
    );
  }
  updateTaxSettingsStatus(data: any) {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/updateTaxSettingsStatus`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", this.appName)
          .set("moduleName", this.moduleName)
          .set("form", this.formName),
      }
    );
  }

  getTaxSettingForEdit(taxCode: any, operation: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxSettingCriteriaForEdit`,
      {
        headers: new HttpHeaders()
          .set("taxCode", taxCode)
          .set("operation", operation),
      }
    );
  }

  getAddTaxSettingsCriteriaData() {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/addTaxSettings`,
      {
        headers: new HttpHeaders()
          .set("applications", this.appName)
          .set("moduleName", this.moduleName)
          .set("form", this.formName),
      }
    );
  }

  getCriteriaMasterData(formName: any, appName: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders()
          .set("formName", formName)
          .set("applicationName", appName)
          .set("moduleName", this.moduleName),
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
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getCriteriaData`,
      {
        headers: new HttpHeaders()
          .set("formName", formName)
          .set("applicationName", appName)
          .set("criteriaMap", criteriaMap)
          .set("fieldName", fieldName)
          .set("displayName", displayName)
          .set("moduleName", this.moduleName),
      }
    );
  }

  postTaxCriteriaSearch(data: any) {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/applyCriteriaSearch`,
      data
    );
  }

  currentCriteriaSaveAsTemplate(data: any): Observable<any> {
    return this.http.post(
      `remittance/taxSettingCriteriaController/saveTaxSettingCriteriaTemplate`,
      data
    );
  }

  getAllCriteriaTemplates(id: string): Observable<any> {
    return this.http.get(
      `remittance/taxSettingCriteriaController/getTaxSettingCriteriaTemplateList
      `,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", this.appName)
          .set("moduleName", this.moduleName)
          .set("form", this.formName),
      }
    );
  }

  addNewTax(data): Observable<any> {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", this.appName)
          .set("moduleName", this.moduleName)
          .set("form", this.formName),
      }
    );
  }

  updateTaxSetting(userId, data): Observable<any> {
    return this.http.put(
      `/remittance/taxSettingCriteriaController/updateTaxSettingsCriteria`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", this.appName)
          .set("moduleName", this.moduleName)
          .set("form", this.formName),
      }
    );
  }
}
