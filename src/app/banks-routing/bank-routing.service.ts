import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import {
  BankRoutingApiData,
  UpdateBankRouteStatusApiRequest,
  UserData,
} from "./banks-routing.model";

@Injectable({
  providedIn: "root",
})
export class BankRoutingService {
  constructor(private http: HttpClient) {}

  // initialUser = { useRole: "", userGroup: "", userId: "", userName: "" };

  // $userData = new BehaviorSubject<UserData>(this.initialUser);

  // setUserData(user: UserData) {
  //   this.$userData.next(user);
  // }

  // getUserData(user: UserData) {
  //   return this.$userData;
  // }

  $TransactionCriteriaRange = new BehaviorSubject<any>({
    txnCriteriaRange: [{ from: null, to: null }],
  });

  setTransactionCriteriaRange(value: any) {
    this.$TransactionCriteriaRange.next(value);
  }
  getTransactionCriteriaRange() {
    return this.$TransactionCriteriaRange;
  }

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

  getBanksRoutingForEdit(routeCode: any) {
    return this.http.get(
      `/remittance/banksRoutingController/getBanksRoutingForEdit`,
      { headers: new HttpHeaders().set("routeCode", routeCode) }
    );
  }

  getAddBankRouteCriteriaData() {
    return this.http.get(`/remittance/banksRoutingController/addBankRoute`);
  }

  postRouteBankCriteriaSearch(data: any) {
    return this.http.post(
      `/remittance/banksRoutingController/routeBankCriteriaSearch`,
      data
    );
  }

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

  addNewRoute(data): Observable<any> {
    return this.http.post(
      `/remittance/banksRoutingController/saveBanksRoutings`,
      data
    );
  }

  updateRoute(routeCode, userId, data): Observable<any> {
    return this.http.put(
      `/remittance/banksRoutingController/updateBanksRoutingsDeatils/`,
      data,
      {
        headers: new HttpHeaders()
          .set("userId", userId)
          .set("routeCode", routeCode),
      }
    );
  }
}
