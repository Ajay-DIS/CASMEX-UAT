import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SearchSettingsService {
  constructor(private http: HttpClient) {}

  getSearchSettingListing() {
    return this.http.get(
      `/applicationSettings/searchSettings/getListOfCriteria`
    );
  }

  updateSearchSettingStatus(data: any) {
    return this.http.post(
      `/applicationSettings/searchSettings/updateSearchSettingStatus`,
      data
    );
  }

  getSearchAppFormsList() {
    return this.http.get(`/applicationSettings/searchSettings/criteriaTypes`);
  }

  getSearchFieldsExecuteQueries(data: any) {
    return this.http.post(
      `/applicationSettings/searchSettings/executeQueries`,
      data
    );
  }

  getSearchCloneData(searchId: any) {
    return this.http.get(
      `/applicationSettings/searchSettings/getCriteriaClone/${searchId}`
    );
  }
  postSearchFieldsToSave(data: any, operation: any, userId: any) {
    return this.http.post(
      `/applicationSettings/searchSettings/saveCriteria`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("operation", operation),
      }
    );
  }
}
