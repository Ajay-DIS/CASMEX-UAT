import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, forkJoin, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class FormRuleService {
  constructor(private http: HttpClient) {}
  applicationName: any = null;
  moduleName: any = null;
  formName: any = null;

  private statusDataForEditForm: any = undefined;

  setData(data: any) {
    this.statusDataForEditForm = data;
  }

  getData(): any {
    return this.statusDataForEditForm;
  }

  getRuleCodeData(id: string, formName: any, appName: any, moduleName: any) {
    return this.http.get(`/appControl/formRulesController/getFormRuleList`, {
      headers: new HttpHeaders()
        .set("userId", id)
        .set("applications", String(appName))
        .set("moduleName", String(moduleName))
        .set("form", formName),
    });
  }
  updateFormRuleStatus(data: any) {
    return this.http.post(
      `/appControl/formRulesController/updateFormRuleStatus`,
      data
    );
  }

  getFormRulesAppModuleList() {
    return this.http.get(
      `/appControl/applicationSettingsController/criteriaTypes`
    );
  }

  getFormRuleForEdit(
    formRuleCode: any,
    operation: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(`/appControl/formRulesController/getFormRuleForEdit`, {
      headers: new HttpHeaders()
        .set("formRuleCode", formRuleCode)
        .set("operation", operation)
        .set("applications", String(appName))
        .set("moduleName", String(moduleName))
        .set("form", formName),
    });
  }

  getAddFormRuleCriteriaData(
    userId: any,
    formName: any,
    appName: any,
    moduleName: any
  ) {
    return this.http.get(`/appControl/formRulesController/addFormRules`, {
      headers: new HttpHeaders()
        .set("userId", userId)
        .set("applications", String(appName))
        .set("moduleName", String(moduleName))
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

  postFormRuleSearch(data: any) {
    return this.http.post(
      `/appControl/formRulesController/applyCriteriaSearch`,
      data
    );
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

  addNewFormRule(
    data,
    appName: any,
    moduleName: any,
    formName: any
  ): Observable<any> {
    return this.http.post(
      `/appControl/formRulesController/addCriteriaDetails`,
      data,
      {
        headers: new HttpHeaders()
          .set("applications", String(appName))
          .set("moduleName", String(moduleName))
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
      `/appControl/formRulesController/updateFormRule`,
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

  // formFieldsMasterData(formType: any) {
  //   if (formType == "Customer Profile Beneficiary_Form Rules") {
  //     return this.http.get(
  //       `/appControl/beneficiaryProfileController/getBeneficiaryProfileMaster`
  //     );
  //   } else {
  //     return this.http.get(
  //       `/appControl/corporateCustomerController/getCustomerProfileMasterData`
  //     );
  //   }
  // }

  // ! calling two api for customer master data
  getCustomerMasterDataFromAppControlAndRemittance(): Observable<any[]> {
    // Define API endpoints
    const appControlUrl =
      "/appControl/formRulesController/getCustomerProfileMasterDataAppControl";
    const remittanceUrl =
      "/remittance/corporateCustomerController/getCustomerProfileMasterDataRemittance";

    // Make HTTP requests to both APIs
    const appControlUrlRequest = this.http.get(appControlUrl);
    const remittanceUrlRequest = this.http.get(remittanceUrl);

    // Combine requests using forkJoin
    return forkJoin([appControlUrlRequest, remittanceUrlRequest]).pipe(
      catchError((error) => {
        // Handle errors if any API request fails
        console.error("Customer Master Data request failed:", error);
        return throwError("API request failed");
      })
    );
  }
  // ! calling two api for customer master data ends
}
