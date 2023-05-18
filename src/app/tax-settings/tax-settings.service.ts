import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TaxSettingsService {
  constructor(private http: HttpClient) {}

  getTaxCodeData(id: string) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxCodeList`,
      { headers: new HttpHeaders().set("userId", id) }
    );
  }
  updateTaxSettingsStatus(data: any) {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/updateTaxSettingsStatus`,
      data
    );
  }

  // getBanksRoutingForEdit(groupID: any) {
  //   return this.http.get(
  //     `/remittance/banksRoutingController/getBanksRoutingCriteriaForEdit`,
  //     { headers: new HttpHeaders().set("groupID", groupID) }
  //   );
  // }

  getAddTaxSettingsCriteriaData() {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/addTaxSettings`
    );
  }

  getCriteriaMasterData(formName: any, appName: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders()
          .set("formName", formName)
          .set("applicationName", appName),
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
          .set("displayName", displayName),
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
      { headers: new HttpHeaders().set("userId", id) }
    );
  }

  addNewTax(data): Observable<any> {
    return this.http.post(
      `/remittance/taxSettingCriteriaController/addCriteriaDetails`,
      data
    );
  }

  updateTaxSetting(userId, data): Observable<any> {
    return this.http.put(
      `/remittance/taxSettingCriteriaController/updateTaxSettingsCriteria`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
}
