import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UsersPermissionService {
  http: any;

  constructor() {}

  updateSystemUsersStatus(
    clientCode: any,
    licenseCountry: any,
    currencyCode: any,
    status: any
  ): Observable<any> {
    return this.http.post(
      `/appControl/rateSettingsController/updateRateSettingsStatus`,
      null,
      {
        headers: new HttpHeaders()
          .set("clientCode", clientCode)
          .set("licenseCountry", licenseCountry)
          .set("currencyCode", currencyCode)
          .set("status", status),
      }
    );
  }
}
