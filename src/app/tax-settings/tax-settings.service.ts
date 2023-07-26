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

  getTaxCodeData(id: string,formName: any, appName: any, moduleName: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxCodeList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getTaxSettingAppModuleList() {
    return this.http.get(`/remittance/banksRoutingController/criteriaTypes`);
  }

  updateTaxSettingsStatus(data: any) {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/updateTaxSettingsStatus`,
      data
    );
  }

  getTaxSettingForEdit(taxCode: any,  
    operation: any,
    appName: any,
    moduleName: any,
    formName: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxSettingCriteriaForEdit`,
      {
        headers: new HttpHeaders()
          .set("taxCode", taxCode)
          .set("operation", operation),
      }
    );
  }

  getAddTaxSettingsCriteriaData(appName:any, moduleName: any,formName:any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/addTaxSettings`,
      {
        headers: new HttpHeaders()
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getCriteriaMasterData(formName: any, appName: any, moduleName: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders()
          .set("formName", formName)
          .set("applicationName", appName)
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
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getCriteriaData`,
      {
        headers: new HttpHeaders()
          .set("formName", formName)
          .set("applicationName", appName)
          .set("criteriaMap", criteriaMap)
          .set("fieldName", fieldName)
          .set("displayName", displayName)
          .set("moduleName", moduleName),
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

  getAllCriteriaTemplates( id: string,
    appName: any,
    moduleName: any,
    formName: any): Observable<any> {
    return this.http.get(
      `remittance/taxSettingCriteriaController/getTaxSettingCriteriaTemplateList
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

  addNewTax( data,
    appName: any,
    moduleName: any,
    formName: any): Observable<any> {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  updateTaxSetting(userId,
    data,
    appName: any,
    moduleName: any,
    formName: any): Observable<any> {
    return this.http.put(
      `/remittance/taxSettingCriteriaController/updateTaxSettingsCriteria`,
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
