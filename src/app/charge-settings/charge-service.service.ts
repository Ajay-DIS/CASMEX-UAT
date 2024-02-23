import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChargeServiceService {
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
  getChargeSettingAppModuleList() {
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

  getChargeCodeData(id: string, formName: any, appName: any, moduleName: any) {
    return this.http.get(
      `/appControl/chargeSettingController/getChargeCodeList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  updateChargeSettingsStatus(data: any) {
    return this.http.post(
      `/appControl/chargeSettingController/updateChargeSettingsStatus`,
      data
    );
  }

  getChargeSettingForEdit(
    chargeCode: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/appControl/chargeSettingController/getChargeSettingCriteriaForEdit`,
      {
        headers: new HttpHeaders()
          .set("chargeCode", chargeCode)
          .set("operation", operation),
      }
    );
  }

  getAddChargeSettingsCriteriaData(
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/appControl/chargeSettingController/addChargeSettings`,
      {
        headers: new HttpHeaders()
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  postChargeCriteriaSearch(data: any) {
    return this.http.post(
      `/appControl/chargeSettingController/applyCriteriaSearch`,
      data
    );
  }

  addNewCharge(
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.post(
      `/appControl/chargeSettingController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  updateChargeSetting(
    userId,
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.put(
      `/appControl/chargeSettingController/updateChargeSettingsCriteria`,
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
