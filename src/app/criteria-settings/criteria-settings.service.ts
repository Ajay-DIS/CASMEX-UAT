import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CriteriaSettingsService {
  constructor(private http: HttpClient) {}

  getCriteriaSettingListing() {
    return this.http.get(
      `/appControl/applicationSettingsController/getListOfCriteria`
    );
  }

  getCriteriaAppFormsList() {
    return this.http.get(
      `/appControl/applicationSettingsController/criteriaTypes`
    );
  }

  getCriteriaFieldsExecuteQueries() {
    return this.http.get(
      `/appControl/applicationSettingsController/executeQueries`
    );
  }

  getCriteriaCloneData(criteriaId: any) {
    return this.http.get(
      `/appControl/applicationSettingsController/getCriteriaClone/${criteriaId}`
    );
  }
  postCriteriaFieldsToSave(data: any) {
    return this.http.post(
      `/appControl/applicationSettingsController/saveCriteria`,
      data
    );
  }
}
