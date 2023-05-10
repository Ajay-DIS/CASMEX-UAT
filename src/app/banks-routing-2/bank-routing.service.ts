import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BankRoutingService {
  constructor(private http: HttpClient) {}

  getBankRoutingData(id: string) {
    return this.http.get(
      `/remittance/banksRoutingController/getBanksRoutingList`,
      { headers: new HttpHeaders().set("userId", id) }
    );
  }
  updateBankRouteStatus(data: any) {
    return this.http.post(
      `/remittance/banksRoutingController/updateBanksRoutingStatus`,
      data
    );
  }

  // getBanksRoutingForEdit(routeCode: any) {
  //   return this.http.get(
  //     `/remittance/banksRoutingController/getBanksRoutingForEdit`,
  //     { headers: new HttpHeaders().set("routeCode", routeCode) }
  //   );
  // }

  getBanksRoutingForEdit(groupID: any) {
    return this.http.get(
      `/remittance/banksRoutingController/getBanksRoutingCriteriaForEdit`,
      { headers: new HttpHeaders().set("groupID", groupID) }
    );
  }

  getAddBankRouteCriteriaData() {
    return this.http.get(`/remittance/banksRoutingController/addBankRoute`);
  }

  getCriteriaMasterData(formName: any, appName: any) {
    return this.http.get(
      `/remittance/banksRoutingController/getCriteriaMasterData`,
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
    return this.http.get(`/remittance/banksRoutingController/getCriteriaData`, {
      headers: new HttpHeaders()
        .set("formName", formName)
        .set("applicationName", appName)
        .set("criteriaMap", criteriaMap)
        .set("fieldName", fieldName)
        .set("displayName", displayName),
    });
  }

  postRouteBankCriteriaSearch(data: any) {
    return this.http.post(
      `/remittance/banksRoutingController/applyCriteriaSearch`,
      data
    );
  }
  // postRouteBankCriteriaSearch(data: any) {
  //   return this.http.post(
  //     `/remittance/banksRoutingController/routeBankCriteriaSearch`,
  //     data
  //   );
  // }

  currentCriteriaSaveAsTemplate(data: any): Observable<any> {
    return this.http.post(
      `remittance/banksRoutingController/saveBanksRoutingCriteria`,
      data
    );
  }

  getAllCriteriaTemplates(id: string): Observable<any> {
    return this.http.get(
      `remittance/banksRoutingController/getExistingCriteriaList`,
      { headers: new HttpHeaders().set("userId", id) }
    );
  }

  // addNewRoute(data): Observable<any> {
  //   return this.http.post(
  //     `/remittance/banksRoutingController/saveBanksRoutings`,
  //     data
  //   );
  // }

  addNewRoute(data): Observable<any> {
    return this.http.post(
      `/remittance/banksRoutingController/addCriteriaDetails`,
      data
    );
  }

  // updateRoute(routeCode, userId, data): Observable<any> {
  //   return this.http.put(
  //     `/remittance/banksRoutingController/updateBanksRoutingsDeatils/`,
  //     data,
  //     {
  //       headers: new HttpHeaders()
  //         .set("userId", userId)
  //         .set("routeCode", routeCode),
  //     }
  //   );
  // }
  updateRoute(userId, data): Observable<any> {
    return this.http.put(
      `/remittance/banksRoutingController/updateBanksRoutingsCriteria`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
      }
    );
  }
}
