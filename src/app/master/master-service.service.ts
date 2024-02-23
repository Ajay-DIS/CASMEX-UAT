import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MasterServiceService {
  constructor(private http: HttpClient) {}

  getMasterlistData(formName: any) {
    return this.http.get(`/appControl/masterController/masterDataList`, {
      headers: new HttpHeaders().set("formName", formName),
    });
  }

  updateMasterStatus(masterId: any, status: any, formName: any) {
    return this.http.post(
      `/appControl/masterController/updateMasterStatus`,
      {},
      {
        headers: new HttpHeaders()
          .set("id", masterId)
          .set("status", status)
          .set("formName", formName),
      }
    );
  }

  getMasterForEdit(masterId: any, formName: any) {
    return this.http.get(`/appControl/masterController/getMasterData`, {
      headers: new HttpHeaders().set("id", masterId).set("formName", formName),
    });
  }

  getAddMasterData(formName: any) {
    return this.http.get(`/appControl/masterController/addNew`, {
      headers: new HttpHeaders().set("formName", formName),
    });
  }

  updateNewMaster(data, formName: any): Observable<any> {
    return this.http.post(`/appControl//masterController/updateMaster`, data, {
      headers: new HttpHeaders().set("formName", formName),
    });
  }

  addNewMaster(data, formName: any): Observable<any> {
    return this.http.post(`/appControl/masterController/saveMaster`, data, {
      headers: new HttpHeaders().set("formName", formName),
    });
  }
}
