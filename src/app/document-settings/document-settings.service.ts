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

  private statusDataForEditForm: any = undefined;

  setData(data: any) {
    this.statusDataForEditForm = data;
  }

  getData(): any {
    return this.statusDataForEditForm;
  }
  // COMMON SERVICES
  getAppModuleList() {
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

  getDocumentListData(
    id: string,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(
      `/appControl/documentSettingsController/getDocumentSettingsList`,
      {
        headers: new HttpHeaders()
          .set("userId", id)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
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
      `/appControl/documentSettingsController/addDocSettings`,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  applyCriteriaSearch(data: any) {
    return this.http.post(
      `/appControl/documentSettingsController/applyCriteriaSearch`,
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
      `appControl/documentSettingsController/getDocumentSettingsForEdit`,
      {
        headers: new HttpHeaders()
          .set("documentSettingsCode", docCode)
          .set("operation", operation)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName),
      }
    );
  }

  updateDocumentStatus(data: any) {
    return this.http.post(
      `appControl/documentSettingsController/updateDocumentSettingsStatus`,
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
      `/appControl/documentSettingsController/saveDocumentSetting`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
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
      `appControl/documentSettingsController/updateDocumentSetting`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
          .set("form", formName)
          .set("operation", operation),
      }
    );
  }
}
