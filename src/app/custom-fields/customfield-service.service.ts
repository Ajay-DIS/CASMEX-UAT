import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomfieldServiceService {

  constructor(private http: HttpClient) { }
  getTaxSettingData(criteriaMap: any) {
    return this.http.get(
      `/remittance/taxSettingCriteriaController/getTaxSetting`,
      { headers: new HttpHeaders().set("criteriaMap", criteriaMap) }
    );
  }
}
