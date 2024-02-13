import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RateServiceService {
  constructor(private http: HttpClient) {}
  getRateListingData(clientCode: any, licenseCountry: any): Observable<any> {
    return this.http.get(
      `/appControl/rateSettingsController/getRateSettingsList`,
      {
        headers: new HttpHeaders()
          .set("clientCode", clientCode)
          .set("licenseCountry", licenseCountry),
      }
    );
  }

  updateRateSettingsStatus(
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
  saveRateSettings(data: any, userId: any): Observable<any> {
    return this.http.post(
      `/appControl/rateSettingsController/saveRateSettings`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
  updateRateSettings(data: any, userId: any): Observable<any> {
    return this.http.put(
      `/appControl/rateSettingsController/updateRateSettings`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
}
