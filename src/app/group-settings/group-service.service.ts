import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupServiceService {
  constructor(private http: HttpClient) { }
  getRoutingData(criteriaMap: any,appName: any, moduleName: any,formName: any) {
    return this.http.get(
      `/remittance/banksRoutingController/getBankRouting`,
      { headers: new HttpHeaders().set("criteriaMap", criteriaMap)
      .set("applications", appName)
      .set("moduleName", moduleName)
      .set("form", formName) }
    );
  }
}
