import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CustomfieldServiceService {
  constructor(private http: HttpClient) {}
  getTaxSettingData(
    criteriaMap: any,
    appName: any,
    moduleName: any,
    formName: any
  ) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxSetting`,
      {
        headers: new HttpHeaders()
          .set("criteriaMap", criteriaMap)
          .set("applications", appName)
          .set("moduleName", moduleName)
          .set("form", formName),
      }
    );
  }

  getCriteriaMasterData(
    formName: any,
    appName: any,
    moduleName: any,
    userId: any
  ) {
    return this.http.get(
      `/remittance/formRulesController/getCriteriaMasterData`,
      {
        headers: new HttpHeaders()
          .set("userId", String(userId))
          .set("formName", formName)
          .set("applicationName", appName)
          .set("moduleName", moduleName),
      }
    );
  }
}
