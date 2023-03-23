import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class CriteriaSettingsService {
  constructor(private http: HttpClient) {}

  getCriteriaSettingListing() {
    return this.http.get(`/applicationSettings/getListOfCriteria`);
  }

  // criteria details
  getCriteriaAppFormsList() {
    return this.http.get(`/applicationSettings/criteriaTypes`);
  }

  getCriteriaFieldsExecuteQueries() {
    return this.http.get(`/applicationSettings/executeQueries`);
  }

  postCriteriaFieldsToSave(data: any) {
    return this.http.post(`/applicationSettings/saveCriteria`, data);
  }
}
