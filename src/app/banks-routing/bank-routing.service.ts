import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
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

  getBankRoutingData(id: string) {
    return this.http.get(
      `/remittance/banksRoutingController/getBanksRoutingList/${id}`
    );
  }
  updateBankRouteStatus(data: any) {
    return this.http.post(
      `/remittance/banksRoutingController/updateBanksRoutingStatus`,
      data
    );
  }
}
