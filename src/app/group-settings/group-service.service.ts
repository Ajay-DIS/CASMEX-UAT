import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupServiceService {

  constructor(private http: HttpClient) { }
  getRoutingData(criteriaMap: any) {
    return this.http.get(
      `/remittance/banksRoutingController/getBankRouting`,
      { headers: new HttpHeaders().set("criteriaMap", criteriaMap) }
    );
  }
}
