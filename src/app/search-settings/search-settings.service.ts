import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SearchSettingsService {
  constructor(private http: HttpClient) {}

  getSearchSettingListing() {
    return this.http.get(`/appControl/searchSettings/getListOfCriteria`);
  }

  updateSearchSettingStatus(data: any) {
    return this.http.post(
      `/appControl/searchSettings/updateSearchSettingStatus`,
      data
    );
  }

  getSearchAppFormsList() {
    return this.http.get(`/appControl/searchSettings/criteriaTypes`);
  }

  getSearchFieldsExecuteQueries(data: any) {
    return this.http.post(`/appControl/searchSettings/executeQueries`, data);
  }

  getSearchCloneData(searchId: any) {
    return this.http.get(
      `/appControl/searchSettings/getCriteriaClone/${searchId}`
    );
  }
  postSearchFieldsToSave(data: any, operation: any, userId: any) {
    return this.http.post(`/appControl/searchSettings/saveCriteria`, data, {
      headers: new HttpHeaders()
        .set("userId", userId)
        .set("operation", operation),
    });
  }
}
