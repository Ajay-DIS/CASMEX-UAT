import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DocumentSettingsService {
  constructor(private http: HttpClient) {}
  applicationName: any = null;
  moduleName: any = null;

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

  getDocumentListData(
    id: string,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(
      `/remittance/documentSettingsController/getDocumentSettingsList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getAddDocumentCriteriaData(
    userId: any,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(
      `/remittance/documentSettingsController/addDocSettings`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  applyCriteriaSearch(data: any) {
    return this.http.post(
      `/remittance/documentSettingsController/applyCriteriaSearch`,
      data
    );
  }

  getDocumentForEdit(
    docCode: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `remittance/documentSettingsController/getDocumentSettingsForEdit`,
      {
        headers: new HttpHeaders()
          .set("documentSettingsCode", docCode)
          .set("operation", operation)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  updateDocumentStatus(data: any) {
    return this.http.post(
      `remittance/documentSettingsController/updateDocumentSettingsStatus`,
      data
    );
  }

  saveNewDocument(
    userId: any,
    data: any,
    appName: any,
    moduleName: any,
    formName: any,
    operation: any
  ): Observable<any> {
    return this.http.post(
      `/remittance/documentSettingsController/saveDocumentSetting`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName)
          .set("operation", operation),
      }
    );
  }

  updateDocument(
    userId: any,
    data: any,
    appName: any,
    moduleName: any,
    formName: any,
    operation: any
  ): Observable<any> {
    return this.http.post(
      `remittance/documentSettingsController/updateDocumentSetting`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName)
          .set("operation", operation),
      }
    );
  }
}
