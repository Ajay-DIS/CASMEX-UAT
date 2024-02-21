import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CompanySettingsServiceService {
  constructor(private http: HttpClient) {}
  getAccountingMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getAccountingMasterData`
    );
  }
  getAuthenticationTypeMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getAuthenticationTypeMasterData`
    );
  }
  getDateFormatMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getDateFormatMasterData`
    );
  }
  getNumberFormatMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getNumberFormatMasterData`
    );
  }
  getAutoRoutingTypeMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getAutoRoutingTypeMasterData`
    );
  }
  getSystemCurrencyMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getSystemCurrencyMasterData`
    );
  }
  getSystemLanguageMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getSystemLanguageMasterData`
    );
  }
  getYesNoMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getYesNoMasterData`
    );
  }
  getSystemCountryMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getSystemCountryMasterData`
    );
  }
  getSystemThemeMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getSystemThemeMasterData`
    );
  }
  getPasswordSpecialCharacterMasterData() {
    return this.http.get(
      `/appControl/masterSettingsController/getPasswordSpecialCharacterMasterData`
    );
  }
  getCompanySettings() {
    return this.http.get(
      `/appControl/companySettingController/getCompanySettings/CMX000091`
    );
  }
  saveCompanySettings(data, userId: any): Observable<any> {
    return this.http.post(
      `/appControl/companySettingController/saveCompanySettings`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
  updateCompanySettings(data, userId: any): Observable<any> {
    return this.http.put(
      `/appControl/companySettingController/updateCompanySettings`,
      data,
      {
        headers: new HttpHeaders().set("userId", userId),
      }
    );
  }
}
